const { Sequelize } = require('sequelize');
const path = require('path');

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Función para obtener la ruta de la base de datos
function getDatabasePath() {
  if (isProduction) {
    // Producción: SQLite en disco persistente de Render
    const persistentDiskPath = process.env.PERSISTENT_DISK_PATH || '/opt/render/project/data';
    const dbPath = path.join(persistentDiskPath, 'database.sqlite');
    console.log(`📁 Base de datos SQLite en producción: ${dbPath}`);
    return dbPath;
  } else {
    // Desarrollo: SQLite local
    const dbPath = path.join(__dirname, '../../database.sqlite');
    console.log(`📁 Base de datos SQLite en desarrollo: ${dbPath}`);
    return dbPath;
  }
}

// Configuración de la base de datos
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: getDatabasePath(),
  logging: isDevelopment ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
  },
  pool: {
    max: 1, // SQLite no soporta múltiples conexiones concurrentes
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  // Configuraciones específicas para SQLite en producción
  dialectOptions: {
    // Timeout más largo para operaciones en disco persistente
    timeout: 60000
  }
});

// Función para verificar la conexión
const testConnection = async () => {
  try {
    const dbPath = getDatabasePath();
    const fs = require('fs');
    
    console.log(`🔍 Verificando acceso a base de datos en: ${dbPath}`);
    
    // Verificar directorio padre
    const parentDir = path.dirname(dbPath);
    console.log(`📂 Directorio padre: ${parentDir}`);
    console.log(`📂 Directorio padre existe: ${fs.existsSync(parentDir)}`);
    
    if (!fs.existsSync(parentDir)) {
      console.log(`📁 Creando directorio padre: ${parentDir}`);
      fs.mkdirSync(parentDir, { recursive: true });
    }
    
    // Verificar permisos del directorio
    try {
      fs.accessSync(parentDir, fs.constants.W_OK);
      console.log(`✅ Directorio tiene permisos de escritura`);
    } catch (error) {
      console.error(`❌ Sin permisos de escritura en directorio:`, error.message);
    }
    
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente');
    
    // Verificar que el archivo se creó
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      console.log(`📊 Archivo de base de datos: ${stats.size} bytes`);
    }
    
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    console.error('❌ Detalles del error:', error.message);
    
    // Información adicional de debugging
    const dbPath = getDatabasePath();
    console.log(`🔍 Ruta intentada: ${dbPath}`);
    console.log(`🔍 Directorio de trabajo: ${process.cwd()}`);
    console.log(`🔍 Variables de entorno relevantes:`);
    console.log(`   - NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`   - PERSISTENT_DISK_PATH: ${process.env.PERSISTENT_DISK_PATH}`);
    
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
  syncDatabase
};
