const roleService = require('../services/roleService');

/**
 * Maneja errores comunes de verificación de permisos
 */
function handlePermissionError(error, res) {
  console.error('Error en verificación de permisos:', error);
  
  // Si el error es "Usuario no encontrado", devolver 403 con mensaje específico
  if (error.message === 'Usuario no encontrado') {
    return res.status(403).json({
      success: false,
      error: 'Usuario no registrado en el sistema',
      message: 'Tu cuenta de Auth0 es válida, pero necesitas completar el registro en nuestra plataforma',
      code: 'USER_NOT_REGISTERED',
      action: 'Por favor, completa el proceso de registro'
    });
  }
  
  return res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    code: 'INTERNAL_ERROR'
  });
}

/**
 * Middleware para verificar permisos basado en roles
 */
class PermissionMiddleware {
  
  /**
   * Verifica si el usuario tiene un permiso específico
   * @param {string} permission - Permiso requerido
   * @returns {Function} Middleware de Express
   */
  static requirePermission(permission) {
    return async (req, res, next) => {
      try {
        const auth0Id = req.user?.sub;

        if (!auth0Id) {
          return res.status(401).json({
            success: false,
            error: 'Token de acceso requerido',
            code: 'UNAUTHORIZED'
          });
        }

        // Verificar si el usuario tiene el permiso
        const hasPermission = await roleService.userHasPermission(auth0Id, permission);

        if (!hasPermission) {
          return res.status(403).json({
            success: false,
            error: `Permiso insuficiente. Se requiere: ${permission}`,
            code: 'FORBIDDEN',
            requiredPermission: permission
          });
        }

        // Agregar información de permisos al request
        req.userPermissions = await roleService.getUserPermissions(auth0Id);
        
        next();

      } catch (error) {
        return handlePermissionError(error, res);
      }
    };
  }

  /**
   * Verifica si el usuario tiene al menos uno de los permisos especificados
   * @param {string[]} permissions - Lista de permisos (OR)
   * @returns {Function} Middleware de Express
   */
  static requireAnyPermission(permissions) {
    return async (req, res, next) => {
      try {
        const auth0Id = req.user?.sub;

        if (!auth0Id) {
          return res.status(401).json({
            success: false,
            error: 'Token de acceso requerido',
            code: 'UNAUTHORIZED'
          });
        }

        // Verificar si el usuario tiene al menos uno de los permisos
        const hasAnyPermission = await roleService.userHasAnyPermission(auth0Id, permissions);

        if (!hasAnyPermission) {
          return res.status(403).json({
            success: false,
            error: `Permiso insuficiente. Se requiere al menos uno de: ${permissions.join(', ')}`,
            code: 'FORBIDDEN',
            requiredPermissions: permissions
          });
        }

        // Agregar información de permisos al request
        req.userPermissions = await roleService.getUserPermissions(auth0Id);
        
        next();

      } catch (error) {
        return handlePermissionError(error, res);
      }
    };
  }

  /**
   * Verifica si el usuario tiene todos los permisos especificados
   * @param {string[]} permissions - Lista de permisos (AND)
   * @returns {Function} Middleware de Express
   */
  static requireAllPermissions(permissions) {
    return async (req, res, next) => {
      try {
        const auth0Id = req.user?.sub;

        if (!auth0Id) {
          return res.status(401).json({
            success: false,
            error: 'Token de acceso requerido',
            code: 'UNAUTHORIZED'
          });
        }

        // Verificar si el usuario tiene todos los permisos
        const hasAllPermissions = await roleService.userHasAllPermissions(auth0Id, permissions);

        if (!hasAllPermissions) {
          return res.status(403).json({
            success: false,
            error: `Permisos insuficientes. Se requieren todos: ${permissions.join(', ')}`,
            code: 'FORBIDDEN',
            requiredPermissions: permissions
          });
        }

        // Agregar información de permisos al request
        req.userPermissions = await roleService.getUserPermissions(auth0Id);
        
        next();

      } catch (error) {
        console.error('Error en verificación de permisos:', error);
        
        res.status(500).json({
          success: false,
          error: 'Error interno del servidor',
          code: 'INTERNAL_ERROR'
        });
      }
    };
  }

  /**
   * Verifica si el usuario tiene un rol específico
   * @param {string} roleName - Nombre del rol requerido
   * @returns {Function} Middleware de Express
   */
  static requireRole(roleName) {
    return async (req, res, next) => {
      try {
        const auth0Id = req.user?.sub;

        if (!auth0Id) {
          return res.status(401).json({
            success: false,
            error: 'Token de acceso requerido',
            code: 'UNAUTHORIZED'
          });
        }

        // Verificar si el usuario tiene el rol
        const hasRole = await roleService.userHasRole(auth0Id, roleName);

        if (!hasRole) {
          return res.status(403).json({
            success: false,
            error: `Rol insuficiente. Se requiere: ${roleName}`,
            code: 'FORBIDDEN',
            requiredRole: roleName
          });
        }

        // Agregar información de roles y permisos al request
        req.userRoles = await roleService.getUserRoles(auth0Id);
        req.userPermissions = await roleService.getUserPermissions(auth0Id);
        
        next();

      } catch (error) {
        console.error('Error en verificación de rol:', error);
        
        res.status(500).json({
          success: false,
          error: 'Error interno del servidor',
          code: 'INTERNAL_ERROR'
        });
      }
    };
  }

  /**
   * Verifica si el usuario tiene al menos uno de los roles especificados
   * @param {string[]} roleNames - Lista de roles (OR)
   * @returns {Function} Middleware de Express
   */
  static requireAnyRole(roleNames) {
    return async (req, res, next) => {
      try {
        const auth0Id = req.user?.sub;

        if (!auth0Id) {
          return res.status(401).json({
            success: false,
            error: 'Token de acceso requerido',
            code: 'UNAUTHORIZED'
          });
        }

        // Verificar si el usuario tiene al menos uno de los roles
        const userRoles = await roleService.getUserRoles(auth0Id);
        const hasAnyRole = userRoles.some(userRole => roleNames.includes(userRole.name));

        if (!hasAnyRole) {
          return res.status(403).json({
            success: false,
            error: `Rol insuficiente. Se requiere al menos uno de: ${roleNames.join(', ')}`,
            code: 'FORBIDDEN',
            requiredRoles: roleNames
          });
        }

        // Agregar información de roles y permisos al request
        req.userRoles = userRoles;
        req.userPermissions = await roleService.getUserPermissions(auth0Id);
        
        next();

      } catch (error) {
        console.error('Error en verificación de roles:', error);
        
        res.status(500).json({
          success: false,
          error: 'Error interno del servidor',
          code: 'INTERNAL_ERROR'
        });
      }
    };
  }

  /**
   * Middleware que solo permite acceso a administradores
   * @returns {Function} Middleware de Express
   */
  static requireAdmin() {
    return this.requireRole('admin');
  }

  /**
   * Middleware que permite acceso a editores y administradores
   * @returns {Function} Middleware de Express
   */
  static requireEditor() {
    return this.requireAnyRole(['editor', 'admin']);
  }

  /**
   * Middleware que permite acceso a viewers, editores y administradores
   * @returns {Function} Middleware de Express
   */
  static requireViewer() {
    return this.requireAnyRole(['viewer', 'editor', 'admin']);
  }

  /**
   * Middleware que inyecta información de roles y permisos sin restricciones
   * @returns {Function} Middleware de Express
   */
  static injectUserInfo() {
    return async (req, res, next) => {
      try {
        const auth0Id = req.user?.sub;

        if (auth0Id) {
          req.userRoles = await roleService.getUserRoles(auth0Id);
          req.userPermissions = await roleService.getUserPermissions(auth0Id);
        }
        
        next();

      } catch (error) {
        console.error('Error al inyectar información del usuario:', error);
        // No fallar, solo continuar sin la información adicional
        next();
      }
    };
  }
}

// Exportar métodos estáticos como funciones individuales para facilitar el uso
module.exports = {
  requirePermission: PermissionMiddleware.requirePermission.bind(PermissionMiddleware),
  requireAnyPermission: PermissionMiddleware.requireAnyPermission.bind(PermissionMiddleware),
  requireAllPermissions: PermissionMiddleware.requireAllPermissions.bind(PermissionMiddleware),
  requireRole: PermissionMiddleware.requireRole.bind(PermissionMiddleware),
  requireAnyRole: PermissionMiddleware.requireAnyRole.bind(PermissionMiddleware),
  requireAdmin: PermissionMiddleware.requireAdmin.bind(PermissionMiddleware),
  requireEditor: PermissionMiddleware.requireEditor.bind(PermissionMiddleware),
  requireViewer: PermissionMiddleware.requireViewer.bind(PermissionMiddleware),
  injectUserInfo: PermissionMiddleware.injectUserInfo.bind(PermissionMiddleware)
};
