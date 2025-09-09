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

// Función para obtener la configuración de la base de datos
function getDatabaseConfig() {
  if (isProduction) {
    // Producción: usar Turso (SQLite en la nube)
    const tursoConfig = getTursoConfig();
    console.log(`🌐 Conectando a Turso: ${tursoConfig.url}`);
    
    return {
      dialect: 'sqlite',
      dialectModule: require('@libsql/client'),
      dialectOptions: {
        url: tursoConfig.url,
        authToken: tursoConfig.authToken,
        syncUrl: tursoConfig.url,
        syncInterval: 60
      },
      storage: ':memory:' // Turso maneja el almacenamiento
    };
  } else {
    // Desarrollo: SQLite local
    const dbPath = path.join(__dirname, '../../database.sqlite');
    console.log(`📁 Base de datos SQLite local en desarrollo: ${dbPath}`);
    
    return {
      dialect: 'sqlite',
      storage: dbPath
    };
  }
}

// Configuración de la base de datos
const databaseConfig = getDatabaseConfig();
const sequelize = new Sequelize({
  ...databaseConfig,
  logging: isDevelopment ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
  },
  pool: {
    max: isProduction ? 5 : 1, // Turso soporta múltiples conexiones
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Cliente Turso directo para operaciones especiales (opcional)
let tursoClient = null;
if (isProduction) {
  try {
    const tursoConfig = getTursoConfig();
    tursoClient = createClient(tursoConfig);
    console.log('✅ Cliente Turso directo inicializado');
  } catch (error) {
    console.error('⚠️ No se pudo inicializar cliente Turso directo:', error.message);
  }
}

// Función para verificar la conexión
const testConnection = async () => {
  try {
    if (isProduction) {
      console.log(`🌐 Verificando conexión a Turso...`);
      
      // Test con cliente directo si está disponible
      if (tursoClient) {
        const result = await tursoClient.execute('SELECT 1 as test');
        console.log('✅ Conexión directa a Turso exitosa:', result.rows[0]);
      }
    } else {
      const dbPath = getDatabaseConfig().storage;
      console.log(`🔍 Verificando base de datos local en: ${dbPath}`);
    }
    
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente');
    
    // Información adicional para Turso
    if (isProduction) {
      console.log('🌐 Usando Turso (SQLite en la nube)');
      console.log('📊 Configuración: Sync habilitado, pool de conexiones optimizado');
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
      console.log(`🔍 Archivo SQLite local: ${getDatabaseConfig().storage}`);
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
