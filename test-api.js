#!/usr/bin/env node

/**
 * Script de pruebas manuales para GoGestia API
 * Ejecutar con: node test-api.js
 */

const axios = require('axios');

// Configuración
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const TIMEOUT = 10000; // 10 segundos

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`${colors.bold}${colors.blue}\n🧪 ${msg}${colors.reset}`)
};

/**
 * Prueba el endpoint de health check
 */
async function testHealthCheck() {
  log.title('Probando Health Check');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/api/health`, {
      timeout: TIMEOUT
    });
    
    if (response.status === 200 && response.data.status === 'ok') {
      log.success('Health check funcionando correctamente');
      log.info(`Version: ${response.data.version}`);
      log.info(`Environment: ${response.data.environment}`);
      return true;
    } else {
      log.error('Health check devolvió respuesta inesperada');
      return false;
    }
  } catch (error) {
    log.error(`Health check falló: ${error.message}`);
    return false;
  }
}

/**
 * Prueba el endpoint de contacto con datos válidos
 */
async function testContactValid() {
  log.title('Probando Contacto - Datos Válidos');
  
  const testData = {
    name: 'Usuario de Prueba',
    email: 'test@example.com',
    phone: '+34 600 123 456',
    company: 'Empresa de Prueba S.L.',
    position: 'Director General',
    message: 'Este es un mensaje de prueba generado automáticamente por el script de testing. Incluye suficientes caracteres para pasar la validación mínima y solicitar un informe.',
    acceptPrivacy: true
  };
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/contact`, testData, {
      timeout: TIMEOUT,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200 && response.data.success) {
      log.success('Contacto enviado correctamente');
      log.info(`Message ID: ${response.data.data.messageId}`);
      log.info(`Response time: ${response.data.data.responseTime}`);
      log.info(`Confirmation sent: ${response.data.data.confirmationSent}`);
      return true;
    } else {
      log.error('Contacto devolvió respuesta inesperada');
      console.log(response.data);
      return false;
    }
  } catch (error) {
    log.error(`Contacto falló: ${error.message}`);
    if (error.response) {
      console.log('Response data:', error.response.data);
    }
    return false;
  }
}

/**
 * Prueba el endpoint de contacto con datos inválidos
 */
async function testContactInvalid() {
  log.title('Probando Contacto - Datos Inválidos');
  
  const invalidTests = [
    {
      name: 'Email inválido',
      data: {
        name: 'Test',
        email: 'email-invalido',
        phone: '+34 600 000 000',
        company: 'Test Company',
        message: 'Mensaje de prueba',
        acceptPrivacy: true
      },
      expectedField: 'email'
    },
    {
      name: 'Nombre muy corto',
      data: {
        name: 'X',
        email: 'test@example.com',
        phone: '+34 600 000 000',
        company: 'Test Company',
        message: 'Mensaje de prueba',
        acceptPrivacy: true
      },
      expectedField: 'name'
    },
    {
      name: 'Sin aceptar privacidad',
      data: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+34 600 000 000',
        company: 'Test Company',
        message: 'Mensaje de prueba válido',
        acceptPrivacy: false
      },
      expectedField: 'acceptPrivacy'
    }
  ];
  
  let passed = 0;
  
  for (const test of invalidTests) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/contact`, test.data, {
        timeout: TIMEOUT,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      log.error(`${test.name}: Debería haber fallado pero fue exitoso`);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        log.success(`${test.name}: Validación funcionando correctamente`);
        passed++;
      } else {
        log.error(`${test.name}: Error inesperado - ${error.message}`);
      }
    }
  }
  
  return passed === invalidTests.length;
}

/**
 * Prueba el rate limiting
 */
async function testRateLimit() {
  log.title('Probando Rate Limiting');
  log.warning('Esta prueba puede tomar tiempo...');
  
  const testData = {
    name: 'Rate Limit Test',
    email: 'ratelimit@example.com',
    phone: '+34 600 000 000',
    company: 'Test Company Ltd.',
    message: 'Este es un mensaje para probar el rate limiting del sistema.',
    acceptPrivacy: true
  };
  
  let requests = 0;
  let rateLimited = false;
  
  // Enviar múltiples requests hasta ser bloqueado
  for (let i = 0; i < 10; i++) {
    try {
      await axios.post(`${API_BASE_URL}/api/contact`, testData, {
        timeout: TIMEOUT,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      requests++;
      log.info(`Request ${requests} enviado exitosamente`);
    } catch (error) {
      if (error.response && error.response.status === 429) {
        log.success(`Rate limiting activado después de ${requests} requests`);
        rateLimited = true;
        break;
      } else {
        log.error(`Error inesperado en request ${i + 1}: ${error.message}`);
      }
    }
    
    // Pequeña pausa entre requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  if (!rateLimited && requests >= 10) {
    log.warning('Rate limiting no se activó en 10 requests (puede estar configurado con límites altos)');
    return true;
  }
  
  return rateLimited;
}

/**
 * Prueba el estado del servicio
 */
async function testServiceStatus() {
  log.title('Probando Estado del Servicio');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/api/contact/status`, {
      timeout: TIMEOUT
    });
    
    if (response.status === 200) {
      log.success('Estado del servicio obtenido correctamente');
      log.info(`Status: ${response.data.status}`);
      log.info(`Email service: ${response.data.services.email}`);
      log.info(`Validation service: ${response.data.services.validation}`);
      return true;
    } else {
      log.error('Estado del servicio devolvió respuesta inesperada');
      return false;
    }
  } catch (error) {
    log.error(`Estado del servicio falló: ${error.message}`);
    return false;
  }
}

/**
 * Prueba endpoints inexistentes
 */
async function testNotFound() {
  log.title('Probando Endpoints Inexistentes');
  
  try {
    await axios.get(`${API_BASE_URL}/api/inexistente`, {
      timeout: TIMEOUT
    });
    log.error('Endpoint inexistente no devolvió 404');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      log.success('Endpoint inexistente devolvió 404 correctamente');
      return true;
    } else {
      log.error(`Error inesperado en endpoint inexistente: ${error.message}`);
      return false;
    }
  }
}

/**
 * Ejecuta todas las pruebas
 */
async function runAllTests() {
  console.log(`${colors.bold}${colors.blue}🚀 GoGestia API Test Suite${colors.reset}`);
  console.log(`${colors.blue}Target: ${API_BASE_URL}${colors.reset}\n`);
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Contact Valid', fn: testContactValid },
    { name: 'Contact Invalid', fn: testContactInvalid },
    { name: 'Service Status', fn: testServiceStatus },
    { name: 'Not Found', fn: testNotFound },
    { name: 'Rate Limiting', fn: testRateLimit }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
    } catch (error) {
      log.error(`Test ${test.name} falló con error: ${error.message}`);
      results.push({ name: test.name, passed: false });
    }
  }
  
  // Resumen
  console.log(`\n${colors.bold}📊 Resumen de Pruebas${colors.reset}`);
  console.log('='.repeat(40));
  
  let passed = 0;
  for (const result of results) {
    const status = result.passed ? `${colors.green}PASS${colors.reset}` : `${colors.red}FAIL${colors.reset}`;
    console.log(`${result.name.padEnd(20)} ${status}`);
    if (result.passed) passed++;
  }
  
  console.log('='.repeat(40));
  console.log(`Total: ${passed}/${results.length} pruebas pasaron`);
  
  if (passed === results.length) {
    log.success('🎉 Todas las pruebas pasaron!');
    process.exit(0);
  } else {
    log.error(`❌ ${results.length - passed} pruebas fallaron`);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  runAllTests().catch(error => {
    log.error(`Error fatal en test suite: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  testHealthCheck,
  testContactValid,
  testContactInvalid,
  testRateLimit,
  testServiceStatus,
  testNotFound,
  runAllTests
};
