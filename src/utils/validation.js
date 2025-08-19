/**
 * Utilidades para validación y sanitización de datos
 */

/**
 * Sanitiza una cadena de texto removiendo caracteres peligrosos
 * @param {string} input - Texto a sanitizar
 * @returns {string} - Texto sanitizado
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    // Remover caracteres de control y espacios excesivos
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Remover múltiples espacios consecutivos
    .replace(/\s+/g, ' ')
    // Remover espacios al inicio y final
    .trim()
    // Escapar caracteres HTML básicos para prevenir XSS
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Valida formato de email de manera más estricta
 * @param {string} email - Email a validar
 * @returns {boolean} - True si es válido
 */
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Regex más estricta para emails
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  // Verificar formato básico
  if (!emailRegex.test(email)) {
    return false;
  }

  // Verificar longitud total
  if (email.length > 254) {
    return false;
  }

  // Verificar longitud de la parte local (antes del @)
  const localPart = email.split('@')[0];
  if (localPart.length > 64) {
    return false;
  }

  // Verificar que no tenga dominios obviamente falsos
  const domain = email.split('@')[1];
  const invalidDomains = ['test.com', 'example.com', 'fake.com', 'dummy.com'];
  if (invalidDomains.includes(domain.toLowerCase())) {
    return false;
  }

  return true;
};

/**
 * Valida número de teléfono
 * @param {string} phone - Teléfono a validar
 * @returns {boolean} - True si es válido
 */
const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return true; // Teléfono es opcional
  }

  // Remover espacios y caracteres comunes
  const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
  
  // Verificar que solo contenga números y posible +
  const phoneRegex = /^[\+]?[0-9]{9,15}$/;
  
  return phoneRegex.test(cleanPhone);
};

/**
 * Valida que un texto no contenga contenido malicioso
 * @param {string} text - Texto a validar
 * @returns {boolean} - True si es seguro
 */
const validateTextSafety = (text) => {
  if (!text || typeof text !== 'string') {
    return true;
  }

  // Patrones sospechosos
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\s*\(/i,
    /expression\s*\(/i,
    /vbscript:/i,
    /data:/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<link/i,
    /<meta/i,
    /\/\*.*\*\//,
    /--.*--/,
    /union.*select/i,
    /drop.*table/i,
    /insert.*into/i,
    /delete.*from/i
  ];

  return !suspiciousPatterns.some(pattern => pattern.test(text));
};

/**
 * Normaliza un nombre para consistencia
 * @param {string} name - Nombre a normalizar
 * @returns {string} - Nombre normalizado
 */
const normalizeName = (name) => {
  if (!name || typeof name !== 'string') {
    return '';
  }

  return name
    // Capitalizar primera letra de cada palabra
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    // Remover espacios extra
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Valida longitud de campos
 * @param {string} text - Texto a validar
 * @param {number} min - Longitud mínima
 * @param {number} max - Longitud máxima
 * @returns {object} - Resultado de validación
 */
const validateLength = (text, min = 0, max = Infinity) => {
  if (!text || typeof text !== 'string') {
    return {
      valid: min === 0,
      message: 'El campo es requerido'
    };
  }

  const length = text.trim().length;

  if (length < min) {
    return {
      valid: false,
      message: `Debe tener al menos ${min} caracteres`
    };
  }

  if (length > max) {
    return {
      valid: false,
      message: `No puede exceder ${max} caracteres`
    };
  }

  return {
    valid: true,
    message: 'Válido'
  };
};

/**
 * Función principal de validación de datos de contacto
 * @param {object} data - Datos a validar
 * @returns {object} - Resultado de validación
 */
const validateContactData = (data) => {
  const errors = {};

  // Validar nombre
  const nameValidation = validateLength(data.name, 2, 100);
  if (!nameValidation.valid) {
    errors.name = nameValidation.message;
  } else if (!validateTextSafety(data.name)) {
    errors.name = 'El nombre contiene caracteres no permitidos';
  }

  // Validar email
  if (!validateEmail(data.email)) {
    errors.email = 'Formato de email inválido';
  }

  // Validar asunto
  const subjectValidation = validateLength(data.subject, 5, 200);
  if (!subjectValidation.valid) {
    errors.subject = subjectValidation.message;
  } else if (!validateTextSafety(data.subject)) {
    errors.subject = 'El asunto contiene caracteres no permitidos';
  }

  // Validar mensaje
  const messageValidation = validateLength(data.message, 10, 2000);
  if (!messageValidation.valid) {
    errors.message = messageValidation.message;
  } else if (!validateTextSafety(data.message)) {
    errors.message = 'El mensaje contiene contenido no permitido';
  }

  // Validar teléfono (opcional)
  if (data.phone && !validatePhone(data.phone)) {
    errors.phone = 'Formato de teléfono inválido';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

module.exports = {
  sanitizeInput,
  validateEmail,
  validatePhone,
  validateTextSafety,
  normalizeName,
  validateLength,
  validateContactData
};
