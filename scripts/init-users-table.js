const { sequelize } = require('../src/config/database');
const { User } = require('../src/models');

async function initializeUsersTable() {
  try {
    console.log('🔄 Iniciando sincronización de tabla de usuarios...');
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    
    // Sincronizar el modelo User
    await User.sync({ force: false }); // force: false para no borrar datos existentes
    console.log('✅ Tabla de usuarios sincronizada correctamente.');
    
    // Verificar la estructura de la tabla
    const tableInfo = await sequelize.getQueryInterface().describeTable('users');
    console.log('📋 Estructura de la tabla users:');
    console.table(Object.keys(tableInfo).map(column => ({
      Columna: column,
      Tipo: tableInfo[column].type,
      Nullable: tableInfo[column].allowNull ? 'Sí' : 'No',
      Unique: tableInfo[column].unique ? 'Sí' : 'No'
    })));
    
    console.log('🎉 Inicialización de tabla de usuarios completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error al inicializar tabla de usuarios:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔐 Conexión a la base de datos cerrada.');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initializeUsersTable()
    .then(() => {
      console.log('✨ Proceso completado.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error.message);
      process.exit(1);
    });
}

module.exports = initializeUsersTable;
