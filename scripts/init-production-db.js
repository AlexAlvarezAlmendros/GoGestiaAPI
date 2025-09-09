/**
 * Script de inicialización de base de datos para producción con Turso (SQLite en la nube)
 * Este script se ejecuta durante el build en Render
 */

// Cargar variables de entorno si no están en producción real
if (!process.env.RENDER && process.env.NODE_ENV === 'production') {
  require('dotenv').config();
}

const { sequelize, testConnection, syncDatabase, tursoClient } = require('../src/config/database');
const { syncSchema, executeSQL } = require('../src/config/database-wrapper');

// Verificar configuración de Turso para producción
function checkTursoConfiguration() {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`ℹ️ Modo desarrollo - usando SQLite local`);
    return;
  }

  console.log(`🌐 Verificando configuración de Turso para producción...`);
  console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV}`);
  
  const requiredEnvVars = ['TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`❌ Variables de entorno faltantes para Turso:`);
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    throw new Error('Configuración de Turso incompleta');
  }
  
  console.log(`✅ Variables de entorno de Turso configuradas:`);
  console.log(`   - TURSO_DATABASE_URL: ${process.env.TURSO_DATABASE_URL}`);
  console.log(`   - TURSO_AUTH_TOKEN: ${process.env.TURSO_AUTH_TOKEN ? '[configurado]' : '[faltante]'}`);
  
  // Test de conectividad básico si tenemos el cliente directo
  if (tursoClient) {
    console.log(`🔌 Cliente Turso directo disponible para pruebas`);
  }
}

// Inicializar datos básicos si es necesario
async function seedDefaultData() {
  try {
    console.log('🌱 Verificando datos por defecto...');
    
    if (process.env.NODE_ENV === 'production') {
      // En producción, usar SQL directo con Turso
      await seedDataWithSQL();
    } else {
      // En desarrollo, usar Sequelize
      await seedDataWithSequelize();
    }
    
  } catch (error) {
    console.error('❌ Error creando datos por defecto:', error);
    throw error;
  }
}

// Función para crear datos usando SQL directo (Turso)
async function seedDataWithSQL() {
  // Verificar si hay categorías
  const categoryResult = await executeSQL('SELECT COUNT(*) as count FROM categories');
  const categoryCount = categoryResult.rows[0].count;
  
  if (categoryCount === 0) {
    console.log('📝 Creando categorías por defecto...');
    
    const defaultCategories = [
      ['Tecnología', 'tecnologia', 'Artículos sobre tecnología y programación'],
      ['Noticias', 'noticias', 'Últimas noticias y actualizaciones'],
      ['Tutoriales', 'tutoriales', 'Guías paso a paso y tutoriales']
    ];
    
    for (const [name, slug, description] of defaultCategories) {
      await executeSQL(
        'INSERT INTO categories (name, slug, description, created_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
        [name, slug, description]
      );
    }
    
    console.log(`✅ ${defaultCategories.length} categorías creadas`);
  } else {
    console.log(`ℹ️ Ya existen ${categoryCount} categorías`);
  }
  
  // Verificar si hay autores
  const authorResult = await executeSQL('SELECT COUNT(*) as count FROM authors');
  const authorCount = authorResult.rows[0].count;
  
  if (authorCount === 0) {
    console.log('📝 Creando autor por defecto...');
    
    await executeSQL(
      'INSERT INTO authors (name, avatar, created_at, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
      ['GoGestia', null]
    );
    
    console.log('✅ Autor por defecto creado');
  } else {
    console.log(`ℹ️ Ya existen ${authorCount} autores`);
  }
  
  // Verificar si hay tags
  const tagResult = await executeSQL('SELECT COUNT(*) as count FROM tags');
  const tagCount = tagResult.rows[0].count;
  
  if (tagCount === 0) {
    console.log('📝 Creando tags por defecto...');
    
    const defaultTags = ['javascript', 'nodejs', 'react', 'tutorial', 'api'];
    
    for (const name of defaultTags) {
      await executeSQL(
        'INSERT INTO tags (name, created_at, updated_at) VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
        [name]
      );
    }
    
    console.log(`✅ ${defaultTags.length} tags creados`);
  } else {
    console.log(`ℹ️ Ya existen ${tagCount} tags`);
  }
}

// Función para crear datos usando Sequelize (desarrollo)
async function seedDataWithSequelize() {
  // Importar modelos
  const models = require('../src/models');
  
  // Verificar si hay categorías
  const categoryCount = await models.Category.count();
  if (categoryCount === 0) {
    console.log('📝 Creando categorías por defecto...');
    
    const defaultCategories = [
      {
        name: 'Tecnología',
        slug: 'tecnologia',
        description: 'Artículos sobre tecnología y programación'
      },
      {
        name: 'Noticias',
        slug: 'noticias', 
        description: 'Últimas noticias y actualizaciones'
      },
      {
        name: 'Tutoriales',
        slug: 'tutoriales',
        description: 'Guías paso a paso y tutoriales'
      }
    ];
    
    for (const categoryData of defaultCategories) {
      await models.Category.create(categoryData);
    }
    
    console.log(`✅ ${defaultCategories.length} categorías creadas`);
  } else {
    console.log(`ℹ️ Ya existen ${categoryCount} categorías`);
  }
  
  // Verificar si hay autores
  const authorCount = await models.Author.count();
  if (authorCount === 0) {
    console.log('📝 Creando autor por defecto...');
    
    await models.Author.create({
      name: 'GoGestia',
      avatar: null
    });
    
    console.log('✅ Autor por defecto creado');
  } else {
    console.log(`ℹ️ Ya existen ${authorCount} autores`);
  }
  
  // Verificar si hay tags
  const tagCount = await models.Tag.count();
  if (tagCount === 0) {
    console.log('📝 Creando tags por defecto...');
    
    const defaultTags = [
      { name: 'javascript' },
      { name: 'nodejs' },
      { name: 'react' },
      { name: 'tutorial' },
      { name: 'api' }
    ];
    
    for (const tagData of defaultTags) {
      await models.Tag.create(tagData);
    }
    
    console.log(`✅ ${defaultTags.length} tags creados`);
  } else {
    console.log(`ℹ️ Ya existen ${tagCount} tags`);
  }
}

// Función principal de inicialización
async function initProductionDatabase() {
  console.log('🚀 Iniciando configuración de base de datos para producción...');
  console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV}`);
  
  try {
    // 1. Verificar configuración (Turso en producción, SQLite local en desarrollo)
    checkTursoConfiguration();
    
    // 2. Probar conexión a la base de datos
    console.log('🔗 Probando conexión a la base de datos...');
    await testConnection();
    
    // 3. Sincronizar modelos con el wrapper híbrido
    console.log('🔄 Sincronizando modelos de base de datos...');
    await syncSchema(); // Usar el wrapper en lugar de syncDatabase
    
    // 4. Crear datos por defecto si no existen
    await seedDefaultData();
    
    console.log('🎉 Base de datos inicializada correctamente');
    
    // 5. Mostrar información final
    console.log('📊 Estadísticas de la base de datos:');
    
    if (process.env.NODE_ENV === 'production') {
      // Usar SQL directo para obtener estadísticas
      const categoryResult = await executeSQL('SELECT COUNT(*) as count FROM categories');
      const authorResult = await executeSQL('SELECT COUNT(*) as count FROM authors');
      const tagResult = await executeSQL('SELECT COUNT(*) as count FROM tags');
      const postResult = await executeSQL('SELECT COUNT(*) as count FROM posts');
      
      console.log(`   - Categorías: ${categoryResult.rows[0].count}`);
      console.log(`   - Autores: ${authorResult.rows[0].count}`);
      console.log(`   - Tags: ${tagResult.rows[0].count}`);
      console.log(`   - Posts: ${postResult.rows[0].count}`);
    } else {
      // Usar Sequelize para desarrollo
      const models = require('../src/models');
      const stats = {
        categories: await models.Category.count(),
        authors: await models.Author.count(),
        tags: await models.Tag.count(),
        posts: await models.Post.count()
      };
      
      console.log(`   - Categorías: ${stats.categories}`);
      console.log(`   - Autores: ${stats.authors}`);
      console.log(`   - Tags: ${stats.tags}`);
      console.log(`   - Posts: ${stats.posts}`);
    }
    
    if (process.env.NODE_ENV === 'production') {
      console.log('🌐 Base de datos Turso lista para producción');
    } else {
      console.log('💻 Base de datos SQLite local lista para desarrollo');
    }
    
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    process.exit(1);
  } finally {
    // Cerrar conexión
    await sequelize.close();
  }
}

// Solo ejecutar si es llamado directamente
if (require.main === module) {
  initProductionDatabase();
}

module.exports = {
  initProductionDatabase,
  checkTursoConfiguration,
  seedDefaultData
};
