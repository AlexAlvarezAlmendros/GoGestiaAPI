const { tursoClient } = require('../config/database');

class DatabaseService {
  constructor() {
    this.isInitialized = false;
    this.usingTurso = true; // Siempre usar Turso
  }

  /**
   * Inicializa el servicio de base de datos
   */
  async initialize() {
    try {
      console.log('🔧 Inicializando servicio de base de datos (solo Turso)...');
      
      // Verificar que Turso esté configurado
      if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
        throw new Error('Variables de entorno de Turso no configuradas');
      }

      if (!tursoClient) {
        throw new Error('Cliente de Turso no inicializado');
      }
      
      // Verificar conexión a Turso
      const testResult = await tursoClient.execute('SELECT 1 as test');
      console.log('✅ Conexión a Turso verificada:', testResult.rows[0]);
      
      this.isInitialized = true;
      console.log('✅ Servicio de base de datos inicializado (Turso únicamente)');
      
    } catch (error) {
      console.error('❌ Error al inicializar el servicio de base de datos:', error);
      throw error;
    }
  }

  /**
   * Verifica si el servicio está usando Turso
   */
  isUsingTurso() {
    return true; // Siempre true ahora
  }

  /**
   * Obtiene el cliente de Turso
   */
  getTursoClient() {
    return tursoClient;
  }

  /**
   * Verifica si el servicio está inicializado
   */
  getIsInitialized() {
    return this.isInitialized;
  }

  /**
   * Cierra las conexiones de base de datos
   */
  async close() {
    try {
      if (tursoClient) {
        console.log('✅ Cliente de Turso liberado');
      }
      
      this.isInitialized = false;
    } catch (error) {
      console.error('❌ Error al cerrar conexiones de base de datos:', error);
    }
  }
}

module.exports = new DatabaseService();
