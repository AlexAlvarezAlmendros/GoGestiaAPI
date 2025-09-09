// Wrapper para operaciones de base de datos que maneja tanto Sequelize como Turso
const { sequelize, tursoClient } = require('./database');

const isProduction = process.env.NODE_ENV === 'production';

// Función para ejecutar SQL raw
const executeSQL = async (sql, params = []) => {
  if (isProduction && tursoClient) {
    // Usar Turso en producción
    try {
      const result = await tursoClient.execute({
        sql: sql,
        args: params
      });
      return result;
    } catch (error) {
      console.error('❌ Error ejecutando SQL en Turso:', error);
      throw error;
    }
  } else {
    // Usar Sequelize en desarrollo
    try {
      const [results, metadata] = await sequelize.query(sql, {
        replacements: params
      });
      return { rows: results };
    } catch (error) {
      console.error('❌ Error ejecutando SQL en SQLite:', error);
      throw error;
    }
  }
};

// Función para sincronizar esquemas
const syncSchema = async () => {
  if (isProduction && tursoClient) {
    console.log('🔄 Sincronizando esquema con Turso...');
    
    // Crear tablas manualmente en Turso
    const createTablesSQL = [
      `CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL UNIQUE,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS authors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        avatar VARCHAR(500),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        content TEXT NOT NULL,
        excerpt TEXT,
        featured_image VARCHAR(500),
        status VARCHAR(20) DEFAULT 'draft',
        featured BOOLEAN DEFAULT false,
        published_at DATETIME,
        read_time INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0,
        meta_title VARCHAR(255),
        meta_description TEXT,
        meta_keywords TEXT,
        category_id INTEGER,
        author_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (author_id) REFERENCES authors(id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS post_tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
        UNIQUE(post_id, tag_id)
      )`
    ];
    
    for (const sql of createTablesSQL) {
      try {
        await executeSQL(sql);
        console.log('✅ Tabla creada/verificada en Turso');
      } catch (error) {
        console.error('❌ Error creando tabla en Turso:', error);
        throw error;
      }
    }
    
    console.log('✅ Esquema sincronizado con Turso');
    
  } else {
    // Usar Sequelize para desarrollo
    console.log('🔄 Sincronizando esquema con SQLite local...');
    await sequelize.sync({ alter: false });
    console.log('✅ Esquema sincronizado con SQLite local');
  }
};

module.exports = {
  executeSQL,
  syncSchema,
  isProduction
};
