const express = require('express');
const { body, validationResult } = require('express-validator');
const emailService = require('../services/emailService');
const { sanitizeInput, validateEmail } = require('../utils/validation');

const router = express.Router();

/**
 * Middleware de validación para el endpoint de contacto
 */
const contactValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
    
  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Debe proporcionar un email válido')
    .isLength({ max: 254 })
    .withMessage('El email es demasiado largo'),
    
  body('subject')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('El asunto debe tener entre 5 y 200 caracteres')
    .matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\.,;:¿?¡!\-()]+$/)
    .withMessage('El asunto contiene caracteres no permitidos'),
    
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('El mensaje debe tener entre 10 y 2000 caracteres'),
    
  body('phone')
    .optional()
    .trim()
    .matches(/^[\+]?[0-9\s\-\(\)]{9,20}$/)
    .withMessage('El formato del teléfono no es válido'),
    
  // Validaciones adicionales de seguridad
  body('name').custom(value => {
    if (/<script|javascript:|on\w+=/i.test(value)) {
      throw new Error('El nombre contiene contenido no permitido');
    }
    return true;
  }),
  
  body('message').custom(value => {
    if (/<script|javascript:|on\w+=/i.test(value)) {
      throw new Error('El mensaje contiene contenido no permitido');
    }
    return true;
  })
];

/**
 * POST /api/contact
 * Endpoint principal para recibir mensajes del formulario de contacto
 */
router.post('/contact', contactValidation, async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn('❌ Errores de validación en /contact:', errors.array());
      return res.status(400).json({
        success: false,
        error: 'Datos de entrada inválidos',
        details: errors.array().map(err => ({
          field: err.path,
          message: err.msg,
          value: err.value
        })),
        code: 'VALIDATION_ERROR'
      });
    }

    // Extraer y sanitizar datos
    const { name, email, subject, message, phone } = req.body;
    
    const contactData = {
      name: sanitizeInput(name),
      email: email.toLowerCase(),
      subject: sanitizeInput(subject),
      message: sanitizeInput(message),
      phone: phone ? sanitizeInput(phone) : null
    };

    // Validación adicional del email
    if (!validateEmail(contactData.email)) {
      return res.status(400).json({
        success: false,
        error: 'El formato del email no es válido',
        code: 'INVALID_EMAIL'
      });
    }

    // Log de la solicitud
    console.log(`📧 Nueva solicitud de contacto de: ${contactData.email}`);

    // Enviar emails
    const emailResult = await emailService.sendEmails(contactData);

    // Calcular tiempo de respuesta
    const responseTime = Date.now() - startTime;

    // Respuesta exitosa
    res.status(200).json({
      success: true,
      message: 'Tu mensaje ha sido enviado correctamente. Te responderemos pronto.',
      data: {
        timestamp: new Date().toISOString(),
        messageId: emailResult.contactEmail.messageId,
        confirmationSent: emailResult.confirmationEmail.success,
        responseTime: `${responseTime}ms`
      },
      code: 'MESSAGE_SENT'
    });

    console.log(`✅ Email de contacto procesado exitosamente en ${responseTime}ms`);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('❌ Error en /contact:', error.message);

    // Error específico del servicio de email
    if (error.message.includes('email')) {
      return res.status(503).json({
        success: false,
        error: 'Servicio de email temporalmente no disponible',
        message: 'Por favor, intenta de nuevo en unos minutos o contáctanos directamente.',
        responseTime: `${responseTime}ms`,
        code: 'EMAIL_SERVICE_ERROR'
      });
    }

    // Error genérico
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: 'Ocurrió un error al procesar tu solicitud. Por favor, intenta de nuevo.',
      responseTime: `${responseTime}ms`,
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * GET /api/contact/status
 * Endpoint para verificar el estado del servicio de contacto
 */
router.get('/contact/status', async (req, res) => {
  try {
    // Verificar estado del servicio de email
    await emailService.verifyConnection();
    
    res.status(200).json({
      status: 'operational',
      message: 'Servicio de contacto funcionando correctamente',
      services: {
        email: 'operational',
        validation: 'operational'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'degraded',
      message: 'Algunos servicios no están disponibles',
      services: {
        email: 'error',
        validation: 'operational'
      },
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/contact/test
 * Endpoint de prueba (solo en desarrollo)
 */
if (process.env.NODE_ENV === 'development') {
  router.post('/contact/test', async (req, res) => {
    try {
      const testData = {
        name: 'Usuario de Prueba',
        email: 'test@example.com',
        subject: 'Mensaje de prueba',
        message: 'Este es un mensaje de prueba del sistema.',
        phone: '+34 600 000 000'
      };

      const result = await emailService.sendEmails(testData);
      
      res.status(200).json({
        success: true,
        message: 'Test completado',
        result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
}

module.exports = router;
