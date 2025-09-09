const express = require('express');
const router = express.Router();
const roleService = require('../services/roleService');
const { checkJwt } = require('../config/auth0');
const { requireAdmin, requireViewer, injectUserInfo } = require('../middleware/permissions');
const { body, param, validationResult } = require('express-validator');

/**
 * Validaciones
 */
const assignRoleValidation = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('ID de usuario debe ser un número válido'),
  body('roleId')
    .isInt({ min: 1 })
    .withMessage('ID de rol debe ser un número válido'),
  body('assignedBy')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID del asignador debe ser un número válido'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Fecha de expiración debe ser una fecha válida')
];

const removeRoleValidation = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('ID de usuario debe ser un número válido'),
  param('roleId')
    .isInt({ min: 1 })
    .withMessage('ID de rol debe ser un número válido')
];

/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del rol
 *         name:
 *           type: string
 *           description: Nombre del rol
 *         description:
 *           type: string
 *           description: Descripción del rol
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *           description: Permisos del rol
 *         isActive:
 *           type: boolean
 *           description: Si el rol está activo
 *     UserRole:
 *       type: object
 *       properties:
 *         userId:
 *           type: integer
 *         roleId:
 *           type: integer
 *         assignedBy:
 *           type: integer
 *         assignedAt:
 *           type: string
 *           format: date-time
 *         expiresAt:
 *           type: string
 *           format: date-time
 *         isActive:
 *           type: boolean
 */

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Obtiene todos los roles activos
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de roles obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 roles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Role'
 *       401:
 *         description: Token de acceso inválido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', checkJwt, injectUserInfo(), async (req, res) => {
  try {
    const roles = await roleService.getAllRoles();
    
    res.json({
      success: true,
      roles: roles
    });

  } catch (error) {
    console.error('Error al obtener roles:', error);
    
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /roles/{roleId}:
 *   get:
 *     summary: Obtiene un rol específico por ID
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del rol
 *     responses:
 *       200:
 *         description: Rol obtenido exitosamente
 *       401:
 *         description: Token de acceso inválido
 *       404:
 *         description: Rol no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:roleId', checkJwt, injectUserInfo(), async (req, res) => {
  try {
    const { roleId } = req.params;
    
    const role = await roleService.getRoleById(parseInt(roleId));
    
    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'Rol no encontrado'
      });
    }

    res.json({
      success: true,
      role: role
    });

  } catch (error) {
    console.error('Error al obtener rol:', error);
    
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /roles/user/{userId}:
 *   get:
 *     summary: Obtiene los roles de un usuario específico
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Roles del usuario obtenidos exitosamente
 *       401:
 *         description: Token de acceso inválido
 *       403:
 *         description: Permisos insuficientes
 *       500:
 *         description: Error interno del servidor
 */
router.get('/user/:userId', checkJwt, requireViewer(), async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userRoles = await roleService.getUserRolesById(parseInt(userId));
    const userPermissions = await roleService.getUserPermissionsById(parseInt(userId));

    res.json({
      success: true,
      userId: parseInt(userId),
      roles: userRoles,
      permissions: userPermissions
    });

  } catch (error) {
    console.error('Error al obtener roles del usuario:', error);
    
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /roles/assign/{userId}:
 *   post:
 *     summary: Asigna un rol a un usuario
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleId
 *             properties:
 *               roleId:
 *                 type: integer
 *                 description: ID del rol a asignar
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de expiración (opcional)
 *     responses:
 *       201:
 *         description: Rol asignado exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: Token de acceso inválido
 *       403:
 *         description: Permisos insuficientes
 *       409:
 *         description: El usuario ya tiene este rol
 *       500:
 *         description: Error interno del servidor
 */
router.post('/assign/:userId', 
  checkJwt, 
  requireAdmin(), 
  assignRoleValidation, 
  async (req, res) => {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Datos de entrada inválidos',
          details: errors.array()
        });
      }

      const { userId } = req.params;
      const { roleId, expiresAt } = req.body;

      // Obtener el ID del usuario asignador desde Auth0
      const authService = require('../services/authService');
      const assignerProfile = await authService.getUserProfile(req.user.sub);
      
      const result = await roleService.assignRoleToUser(
        parseInt(userId), 
        parseInt(roleId), 
        assignerProfile.id,
        expiresAt ? new Date(expiresAt) : null
      );

      res.status(201).json({
        success: true,
        message: 'Rol asignado exitosamente',
        assignment: result
      });

    } catch (error) {
      console.error('Error al asignar rol:', error);
      
      if (error.message.includes('ya tiene este rol')) {
        return res.status(409).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
);

/**
 * @swagger
 * /roles/remove/{userId}/{roleId}:
 *   delete:
 *     summary: Remueve un rol de un usuario
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del rol
 *     responses:
 *       200:
 *         description: Rol removido exitosamente
 *       401:
 *         description: Token de acceso inválido
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Asignación de rol no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/remove/:userId/:roleId', 
  checkJwt, 
  requireAdmin(), 
  removeRoleValidation, 
  async (req, res) => {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Datos de entrada inválidos',
          details: errors.array()
        });
      }

      const { userId, roleId } = req.params;

      const success = await roleService.removeRoleFromUser(
        parseInt(userId), 
        parseInt(roleId)
      );

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Asignación de rol no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Rol removido exitosamente'
      });

    } catch (error) {
      console.error('Error al remover rol:', error);
      
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
);

/**
 * @swagger
 * /roles/permissions/{userId}:
 *   get:
 *     summary: Obtiene todos los permisos de un usuario
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Permisos obtenidos exitosamente
 *       401:
 *         description: Token de acceso inválido
 *       403:
 *         description: Permisos insuficientes
 *       500:
 *         description: Error interno del servidor
 */
router.get('/permissions/:userId', checkJwt, requireViewer(), async (req, res) => {
  try {
    const { userId } = req.params;
    
    const permissions = await roleService.getUserPermissionsById(parseInt(userId));

    res.json({
      success: true,
      userId: parseInt(userId),
      permissions: permissions
    });

  } catch (error) {
    console.error('Error al obtener permisos del usuario:', error);
    
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /roles/initialize:
 *   post:
 *     summary: Inicializa los roles por defecto en la base de datos
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roles inicializados exitosamente
 *       401:
 *         description: Token de acceso inválido
 *       403:
 *         description: Permisos insuficientes (solo administradores)
 *       500:
 *         description: Error interno del servidor
 */
router.post('/initialize', checkJwt, requireAdmin(), async (req, res) => {
  try {
    await roleService.initializeDefaultRoles();

    res.json({
      success: true,
      message: 'Roles por defecto inicializados exitosamente'
    });

  } catch (error) {
    console.error('Error al inicializar roles:', error);
    
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
