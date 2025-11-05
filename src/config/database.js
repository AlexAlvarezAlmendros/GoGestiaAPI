const { createClient } = require('@libsql/client');
require('dotenv').config();

// Configuración de Turso
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

// Cliente Turso único para desarrollo y producción
let tursoClient = null;

try {
  const tursoConfig = getTursoConfig();
  tursoClient = createClient(tursoConfig);
  console.log('✅ Cliente Turso inicializado correctamente');
} catch (error) {
  console.error('❌ Error al inicializar cliente Turso:', error.message);
  throw error;
}

// Función para verificar la conexión
const testConnection = async () => {
  try {
    console.log('🌐 Verificando conexión a Turso...');
    
    const result = await tursoClient.execute('SELECT 1 as test');
    console.log('✅ Conexión a Turso exitosa:', result.rows[0]);
    
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con Turso:', error);
    console.error('❌ Detalles del error:', error.message);
    console.log('🔍 Variables de entorno Turso:');
    console.log(`   - TURSO_DATABASE_URL: ${process.env.TURSO_DATABASE_URL ? 'configurada' : 'NO configurada'}`);
    console.log(`   - TURSO_AUTH_TOKEN: ${process.env.TURSO_AUTH_TOKEN ? 'configurada' : 'NO configurada'}`);
    
    throw error;
  }
};

// Función helper para obtener el cliente
const getClient = () => {
  if (!tursoClient) {
    throw new Error('Cliente Turso no inicializado');
  }
  return tursoClient;
};

module.exports = {
  tursoClient,
  getClient,
  testConnection
};
