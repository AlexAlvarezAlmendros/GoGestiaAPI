// Wrapper para operaciones de base de datos usando solo Turso
const { tursoClient } = require('./database');

// Función para ejecutar SQL raw usando Turso
const executeSQL = async (sql, params = []) => {
  if (!tursoClient) {
    throw new Error('Cliente Turso no está inicializado');
  }
  
  try {
    const result = await tursoClient.execute({
      sql: sql,
      args: params
    });
    return result;
  } catch (error) {
    console.error('❌ Error ejecutando SQL en Turso:', error);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  }
};

// Función para sincronizar esquemas en Turso
const syncSchema = async () => {
  console.log('🔄 Sincronizando esquema con Turso...');
  
  // Crear tablas en Turso
  const createTablesSQL = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      auth0_id VARCHAR(255) UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      name VARCHAR(255),
      nickname VARCHAR(255),
      picture VARCHAR(500),
      email_verified BOOLEAN DEFAULT false,
      locale VARCHAR(10) DEFAULT 'es',
      last_login DATETIME,
      is_active BOOLEAN DEFAULT true,
      default_role_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (default_role_id) REFERENCES roles(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL UNIQUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS user_roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      role_id INTEGER NOT NULL,
      assigned_by INTEGER,
      assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      is_active BOOLEAN DEFAULT true,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_by) REFERENCES users(id),
      UNIQUE(user_id, role_id)
    )`,
    
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
};

module.exports = {
  executeSQL,
  syncSchema
};
