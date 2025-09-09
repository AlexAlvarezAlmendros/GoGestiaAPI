const { Sequelize } = require('sequelize');
const path = require('path');

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Función para obtener la ruta de la base de datos
function getDatabasePath() {
  if (isProduction) {
    // Producción: SQLite en disco persistente de Render
    const persistentDiskPath = process.env.PERSISTENT_DISK_PATH || '/opt/render/project/data';
    const dbPath = path.join(persistentDiskPath, 'gogestia-sqlite-disk');
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
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente');
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
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
