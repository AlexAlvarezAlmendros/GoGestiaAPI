const { body } = require('express-validator');

const authValidation = {
  
  // Validación para registro
  register: [
    body('email')
      .isEmail()
      .withMessage('Debe ser un email válido')
      .normalizeEmail()
      .isLength({ min: 5, max: 100 })
      .withMessage('El email debe tener entre 5 y 100 caracteres'),
    
    body('password')
      .isLength({ min: 8, max: 128 })
      .withMessage('La contraseña debe tener entre 8 y 128 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('La contraseña debe contener al menos una minúscula, una mayúscula, un número y un carácter especial'),
    
    body('name')
      .notEmpty()
      .withMessage('El nombre es requerido')
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre debe tener entre 2 y 100 caracteres')
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      .withMessage('El nombre solo puede contener letras y espacios'),
    
    body('nickname')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('El nickname debe tener entre 2 y 50 caracteres')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('El nickname solo puede contener letras, números, guiones y guiones bajos')
  ],

  // Validación para login
  login: [
    body('email')
      .isEmail()
      .withMessage('Debe ser un email válido')
      .normalizeEmail(),
    
    body('password')
      .notEmpty()
      .withMessage('La contraseña es requerida')
  ],

  // Validación para actualizar perfil
  updateProfile: [
    body('name')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre debe tener entre 2 y 100 caracteres')
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      .withMessage('El nombre solo puede contener letras y espacios'),
    
    body('nickname')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('El nickname debe tener entre 2 y 50 caracteres')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('El nickname solo puede contener letras, números, guiones y guiones bajos'),
    
    body('locale')
      .optional()
      .isIn(['es', 'en', 'fr', 'de', 'it', 'pt'])
      .withMessage('El idioma debe ser uno de: es, en, fr, de, it, pt')
  ],

  // Validación para solicitar cambio de contraseña
  requestPasswordReset: [
    body('email')
      .isEmail()
      .withMessage('Debe ser un email válido')
      .normalizeEmail()
  ],

  // Validación para refrescar token
  refreshToken: [
    body('refresh_token')
      .notEmpty()
      .withMessage('El token de refresco es requerido')
  ]
};

module.exports = authValidation;
