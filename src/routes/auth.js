const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authValidation = require('../middleware/authValidation');
const { checkJwt } = require('../config/auth0');
const { getUserInfo } = require('../middleware/auth0-permissions');

/**
 * @route   POST /api/auth/register
 * @desc    Registra un nuevo usuario
 * @access  Public
 */
router.post('/register', 
  authValidation.register,
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Autentica un usuario
 * @access  Public
 */
router.post('/login', 
  authValidation.login,
  authController.login
);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresca el token de acceso
 * @access  Public
 */
router.post('/refresh-token', 
  authValidation.refreshToken,
  authController.refreshToken
);

/**
 * @route   POST /api/auth/logout
 * @desc    Cierra sesión del usuario
 * @access  Public
 */
router.post('/logout', authController.logout);

/**
 * @route   GET /api/auth/profile
 * @desc    Obtiene el perfil del usuario autenticado
 * @access  Private
 */
router.get('/profile', 
  checkJwt,
  authController.getProfile
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Actualiza el perfil del usuario
 * @access  Private
 */
router.put('/profile', 
  checkJwt,
  authValidation.updateProfile,
  authController.updateProfile
);

/**
 * @route   POST /api/auth/send-verification-email
 * @desc    Envía email de verificación
 * @access  Private
 */
router.post('/send-verification-email', 
  checkJwt,
  authController.sendVerificationEmail
);

/**
 * @route   POST /api/auth/request-password-reset
 * @desc    Solicita cambio de contraseña
 * @access  Public
 */
router.post('/request-password-reset', 
  authValidation.requestPasswordReset,
  authController.requestPasswordReset
);

/**
 * @route   GET /api/auth/me
 * @desc    Obtiene información del usuario desde el token Auth0
 * @access  Private
 */
router.get('/me', checkJwt, getUserInfo, (req, res) => {
  try {
    // Devolver información del usuario desde el token JWT
    res.status(200).json({
      success: true,
      message: 'Usuario autenticado',
      data: {
        id: req.user.sub,
        email: req.user.email,
        name: req.user.name,
        nickname: req.user.nickname,
        picture: req.user.picture,
        emailVerified: req.user.email_verified,
        roles: req.user.roles || req.user['https://gogestia.com/roles'] || [],
        permissions: req.user.permissions || req.user.scope?.split(' ') || [],
        // Información adicional del token
        tokenInfo: {
          issuer: req.user.iss,
          audience: req.user.aud,
          issuedAt: new Date(req.user.iat * 1000),
          expiresAt: new Date(req.user.exp * 1000)
        }
      }
    });
  } catch (error) {
    console.error('Error en GET /auth/me:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: 'Error al obtener información del usuario',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

// Verificar estado de autenticación
router.get('/verify', checkJwt, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token válido',
    data: {
      authenticated: true,
      userId: req.user.sub,
      email: req.user.email,
      roles: req.user.roles || req.user['https://gogestia.com/roles'] || [],
      tokenValid: true,
      expiresAt: new Date(req.user.exp * 1000)
    }
  });
});

// Debug endpoint para ver el contenido completo del token
router.get('/debug-token', checkJwt, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Debug del token JWT',
    data: {
      fullToken: req.user,
      claims: Object.keys(req.user),
      roles: {
        'roles': req.user.roles,
        'https://gogestia.com/roles': req.user['https://gogestia.com/roles'],
        'namespace_roles': req.user['https://myapp.example.com/roles']
      },
      permissions: {
        'permissions': req.user.permissions,
        'scope': req.user.scope
      }
    }
  });
});

module.exports = router;
