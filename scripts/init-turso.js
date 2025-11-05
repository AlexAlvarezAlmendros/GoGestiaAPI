/**
 * Script de inicialización de base de datos para Turso
 * Crea las tablas necesarias y datos iniciales
 */
const { testConnection } = require('../src/config/database');
const { syncSchema } = require('../src/config/database-wrapper');
const roleService = require('../src/services/roleService');

const initializeDatabase = async () => {
  try {
    console.log('🔄 Inicializando base de datos con Turso...');
    
    // Verificar conexión
    await testConnection();
    
    // Crear tablas en Turso
    console.log('📋 Creando esquema de base de datos...');
    await syncSchema();
    
    console.log('🔐 Inicializando roles por defecto...');
    
    // Inicializar roles por defecto
    await roleService.initializeDefaultRoles();
    
    console.log('✅ Base de datos inicializada correctamente');
    console.log('🔧 Roles por defecto creados: admin, editor, viewer');
    
    console.log('\n👤 Roles disponibles:');
    try {
      const roles = await roleService.getAllRoles();
      if (roles && Array.isArray(roles)) {
        roles.forEach(role => {
          console.log(`- ${role.name}: ${role.description}`);
        });
      }
    } catch (error) {
      console.log('- Error obteniendo roles:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    throw error;
  }
};

// Ejecutar la inicialización si el script se ejecuta directamente
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('🎉 Inicialización completada exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en la inicialización:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };
