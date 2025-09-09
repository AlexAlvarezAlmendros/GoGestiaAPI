const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = require('../middleware/upload');
const uploadController = require('../controllers/uploadController');
const { body, validationResult } = require('express-validator');

// Middleware de validación
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Error de validación',
      details: errors.array(),
      code: 'VALIDATION_ERROR'
    });
  }
  next();
};

// Middleware para manejar errores de Multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'El archivo es demasiado grande. Máximo 10MB permitido.',
        code: 'FILE_TOO_LARGE'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Demasiados archivos. Máximo 10 imágenes permitidas.',
        code: 'TOO_MANY_FILES'
      });
    }
  }
  
  if (err.message.includes('Solo se permiten imágenes')) {
    return res.status(400).json({
      success: false,
      error: err.message,
      code: 'INVALID_FILE_TYPE'
    });
  }
  
  next(err);
};

// 1. Subir una imagen
router.post('/upload/image', 
  upload.single('image'),
  handleMulterError,
  [
    body('postId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('El postId debe ser un número entero válido'),
    body('title')
      .optional()
      .isLength({ max: 100 })
      .withMessage('El título no puede exceder 100 caracteres'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('La descripción no puede exceder 500 caracteres')
  ],
  validateRequest,
  uploadController.uploadImage
);

// 2. Subir múltiples imágenes
router.post('/upload/images', 
  upload.array('images', 10), // Máximo 10 imágenes
  handleMulterError,
  [
    body('title')
      .optional()
      .isLength({ max: 100 })
      .withMessage('El título no puede exceder 100 caracteres'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('La descripción no puede exceder 500 caracteres')
  ],
  validateRequest,
  uploadController.uploadImages
);

// 3. Eliminar imagen
router.delete('/upload/image/:deleteHash',
  uploadController.deleteImage
);

// 4. Obtener información de imagen
router.get('/upload/image/:imageId',
  uploadController.getImageInfo
);

module.exports = router;
