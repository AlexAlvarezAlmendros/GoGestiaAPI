const { Sequelize } = require('sequelize');
const { createClient } = require('@libsql/client');
const path = require('path');

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Configuración de Turso para producción
function getTursoConfig() {
  if (!process.env.TURSO_DATABASE_URL) {
    throw new Error('TURSO_DATABASE_URL no está configurada en las variables de entorno');
  }
  
  if (!process.env.TURSO_AUTH_TOKEN) {
    throw new Error('TURSO_AUTH_TOKEN no está configurada en las variables de entorno');
  }
  
  return {
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
  };
}

// Cliente Turso para producción
let tursoClient = null;
let sequelize = null;

if (isProduction) {
  try {
    const tursoConfig = getTursoConfig();
    tursoClient = createClient(tursoConfig);
    console.log('✅ Cliente Turso inicializado para producción');
    
    // Para producción, usar una configuración mínima de Sequelize solo para mantener la interfaz
    // Las operaciones reales se harán con tursoClient
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:', // No se usa realmente
      logging: false
    });
    
  } catch (error) {
    console.error('⚠️ No se pudo inicializar cliente Turso:', error.message);
    throw error;
  }
} else {
  // Desarrollo: SQLite local con Sequelize normal
  const dbPath = path.join(__dirname, '../../database.sqlite');
  console.log(`📁 Base de datos SQLite local en desarrollo: ${dbPath}`);
  
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: isDevelopment ? console.log : false,
    define: {
      timestamps: true,
      underscored: true,
    },
    pool: {
      max: 1,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
}

// Función para verificar la conexión
const testConnection = async () => {
  try {
    if (isProduction) {
      console.log(`🌐 Verificando conexión a Turso...`);
      
      // Test con cliente Turso directo
      if (tursoClient) {
        const result = await tursoClient.execute('SELECT 1 as test');
        console.log('✅ Conexión directa a Turso exitosa:', result.rows[0]);
      }
      
      // Sequelize solo se usa para mantener la interfaz, pero las operaciones van a Turso
      console.log('✅ Configuración de Turso verificada correctamente');
      
    } else {
      const dbPath = path.join(__dirname, '../../database.sqlite');
      console.log(`🔍 Verificando base de datos local en: ${dbPath}`);
      
      await sequelize.authenticate();
      console.log('✅ Conexión a SQLite local establecida correctamente');
    }
    
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    console.error('❌ Detalles del error:', error.message);
    
    // Información adicional de debugging
    console.log(`🔍 Entorno: ${process.env.NODE_ENV}`);
    if (isProduction) {
      console.log(`🔍 Variables de entorno Turso:`);
      console.log(`   - TURSO_DATABASE_URL: ${process.env.TURSO_DATABASE_URL ? 'configurada' : 'NO configurada'}`);
      console.log(`   - TURSO_AUTH_TOKEN: ${process.env.TURSO_AUTH_TOKEN ? 'configurada' : 'NO configurada'}`);
    } else {
      console.log(`🔍 Archivo SQLite local: ${path.join(__dirname, '../../database.sqlite')}`);
    }
    
    throw error;
  }
};

// Función para sincronizar la base de datos
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('✅ Base de datos sincronizada correctamente');
  } catch (error) {
    console.error('❌ Error al sincronizar la base de datos:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase,
  tursoClient // Exportar cliente Turso para uso directo si es necesario
};
