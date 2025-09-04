const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authValidation = require('../middleware/authValidation');
const { checkJwt } = require('../config/auth0');

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
 * @desc    Endpoint de prueba para verificar autenticación
 * @access  Private
 */
router.get('/me', checkJwt, (req, res) => {
  res.json({
    success: true,
    message: 'Usuario autenticado',
    user: req.user
  });
});

module.exports = router;
