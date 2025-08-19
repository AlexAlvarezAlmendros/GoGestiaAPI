#!/usr/bin/env node

/**
 * Script de verificación pre-deploy
 * Verifica que todo esté configurado correctamente antes del despliegue
 */

const fs = require('fs');
const path = require('path');

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
  title: (msg) => console.log(`${colors.bold}${colors.blue}\n📋 ${msg}${colors.reset}`)
};

/**
 * Verifica que todos los archivos necesarios existan
 */
function checkRequiredFiles() {
  log.title('Verificando Archivos Requeridos');
  
  const requiredFiles = [
    'package.json',
    'src/server.js',
    'src/routes/contact.js',
    'src/services/emailService.js',
    'src/templates/emailTemplates.js',
    'src/utils/validation.js',
    '.env.example',
    'README.md',
    'DEPLOY.md'
  ];
  
  let allExist = true;
  
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      log.success(`${file} existe`);
    } else {
      log.error(`${file} NO EXISTE`);
      allExist = false;
    }
  }
  
  return allExist;
}

/**
 * Verifica la configuración del package.json
 */
function checkPackageJson() {
  log.title('Verificando package.json');
  
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Verificar campos esenciales
    const requiredFields = ['name', 'version', 'description', 'main', 'scripts'];
    let valid = true;
    
    for (const field of requiredFields) {
      if (pkg[field]) {
        log.success(`${field}: ${typeof pkg[field] === 'object' ? 'configurado' : pkg[field]}`);
      } else {
        log.error(`${field} falta en package.json`);
        valid = false;
      }
    }
    
    // Verificar scripts esenciales
    const requiredScripts = ['start', 'dev'];
    for (const script of requiredScripts) {
      if (pkg.scripts && pkg.scripts[script]) {
        log.success(`Script ${script}: ${pkg.scripts[script]}`);
      } else {
        log.error(`Script ${script} falta`);
        valid = false;
      }
    }
    
    // Verificar engines
    if (pkg.engines && pkg.engines.node) {
      log.success(`Node version: ${pkg.engines.node}`);
    } else {
      log.warning('engines.node no especificado (recomendado para producción)');
    }
    
    return valid;
  } catch (error) {
    log.error(`Error leyendo package.json: ${error.message}`);
    return false;
  }
}

/**
 * Verifica las dependencias
 */
function checkDependencies() {
  log.title('Verificando Dependencias');
  
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = [
      'express',
      'nodemailer', 
      'cors',
      'dotenv',
      'helmet',
      'express-rate-limit',
      'express-validator'
    ];
    
    let allPresent = true;
    
    for (const dep of requiredDeps) {
      if (pkg.dependencies && pkg.dependencies[dep]) {
        log.success(`${dep}: ${pkg.dependencies[dep]}`);
      } else {
        log.error(`${dep} no está en dependencies`);
        allPresent = false;
      }
    }
    
    return allPresent;
  } catch (error) {
    log.error(`Error verificando dependencias: ${error.message}`);
    return false;
  }
}

/**
 * Verifica la estructura de directorios
 */
function checkDirectoryStructure() {
  log.title('Verificando Estructura de Directorios');
  
  const requiredDirs = [
    'src',
    'src/routes',
    'src/services', 
    'src/templates',
    'src/utils',
    'src/config'
  ];
  
  let allExist = true;
  
  for (const dir of requiredDirs) {
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
      log.success(`Directorio ${dir} existe`);
    } else {
      log.error(`Directorio ${dir} NO EXISTE`);
      allExist = false;
    }
  }
  
  return allExist;
}

/**
 * Verifica que no hay archivos sensibles en el repo
 */
function checkSensitiveFiles() {
  log.title('Verificando Archivos Sensibles');
  
  const sensitiveFiles = ['.env'];
  const shouldNotExist = [];
  
  for (const file of sensitiveFiles) {
    if (fs.existsSync(file)) {
      shouldNotExist.push(file);
    }
  }
  
  if (shouldNotExist.length > 0) {
    log.error(`Archivos sensibles encontrados: ${shouldNotExist.join(', ')}`);
    log.warning('Estos archivos NO deben estar en el repositorio');
    return false;
  } else {
    log.success('No se encontraron archivos sensibles en el repositorio');
    return true;
  }
}

/**
 * Verifica la sintaxis de los archivos JS principales
 */
function checkSyntax() {
  log.title('Verificando Sintaxis de JavaScript');
  
  const jsFiles = [
    'src/server.js',
    'src/routes/contact.js', 
    'src/services/emailService.js',
    'src/templates/emailTemplates.js',
    'src/utils/validation.js'
  ];
  
  let allValid = true;
  
  for (const file of jsFiles) {
    try {
      require(path.resolve(file));
      log.success(`${file} - sintaxis válida`);
    } catch (error) {
      log.error(`${file} - error de sintaxis: ${error.message}`);
      allValid = false;
    }
  }
  
  return allValid;
}

/**
 * Verifica que el .env.example tiene todas las variables necesarias
 */
function checkEnvExample() {
  log.title('Verificando .env.example');
  
  try {
    const envExample = fs.readFileSync('.env.example', 'utf8');
    const requiredVars = [
      'PORT',
      'NODE_ENV',
      'EMAIL_USER',
      'EMAIL_PASS', 
      'EMAIL_FROM',
      'EMAIL_TO',
      'CORS_ORIGIN',
      'RATE_LIMIT_WINDOW_MS',
      'RATE_LIMIT_MAX_REQUESTS'
    ];
    
    let allPresent = true;
    
    for (const variable of requiredVars) {
      if (envExample.includes(variable)) {
        log.success(`Variable ${variable} presente`);
      } else {
        log.error(`Variable ${variable} falta en .env.example`);
        allPresent = false;
      }
    }
    
    return allPresent;
  } catch (error) {
    log.error(`Error leyendo .env.example: ${error.message}`);
    return false;
  }
}

/**
 * Ejecuta todas las verificaciones
 */
function runChecks() {
  console.log(`${colors.bold}${colors.blue}🔍 GoGestia API - Verificación Pre-Deploy${colors.reset}\n`);
  
  const checks = [
    { name: 'Archivos Requeridos', fn: checkRequiredFiles },
    { name: 'package.json', fn: checkPackageJson },
    { name: 'Dependencias', fn: checkDependencies },
    { name: 'Estructura de Directorios', fn: checkDirectoryStructure },
    { name: 'Archivos Sensibles', fn: checkSensitiveFiles },
    { name: '.env.example', fn: checkEnvExample },
    { name: 'Sintaxis JavaScript', fn: checkSyntax }
  ];
  
  const results = [];
  
  for (const check of checks) {
    try {
      const result = check.fn();
      results.push({ name: check.name, passed: result });
    } catch (error) {
      log.error(`Error en verificación ${check.name}: ${error.message}`);
      results.push({ name: check.name, passed: false });
    }
  }
  
  // Resumen
  console.log(`\n${colors.bold}📊 Resumen de Verificaciones${colors.reset}`);
  console.log('='.repeat(50));
  
  let passed = 0;
  for (const result of results) {
    const status = result.passed ? `${colors.green}PASS${colors.reset}` : `${colors.red}FAIL${colors.reset}`;
    console.log(`${result.name.padEnd(30)} ${status}`);
    if (result.passed) passed++;
  }
  
  console.log('='.repeat(50));
  console.log(`Total: ${passed}/${results.length} verificaciones pasaron`);
  
  if (passed === results.length) {
    log.success('🎉 ¡Todo listo para el despliegue!');
    console.log(`\n${colors.blue}📋 Próximos pasos:${colors.reset}`);
    console.log('1. Hacer commit de los cambios');
    console.log('2. Push al repositorio');
    console.log('3. Configurar variables de entorno en Render');
    console.log('4. Desplegar en Render');
    console.log('5. Verificar el health check');
    return true;
  } else {
    log.error(`❌ ${results.length - passed} verificaciones fallaron`);
    console.log(`\n${colors.yellow}🔧 Arregla los problemas antes del despliegue${colors.reset}`);
    return false;
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const success = runChecks();
  process.exit(success ? 0 : 1);
}

module.exports = {
  runChecks,
  checkRequiredFiles,
  checkPackageJson,
  checkDependencies,
  checkDirectoryStructure,
  checkSensitiveFiles,
  checkSyntax,
  checkEnvExample
};
