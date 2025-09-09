/**
 * Script de inicialización de base de datos para producción con SQLite + Persistent Disk
 * Este script se ejecuta durante el build en Render
 */

const fs = require('fs');
const path = require('path');
const { sequelize, testConnection, syncDatabase } = require('../src/config/database');

// Verificar si existe el directorio del disco persistente
function ensurePersistentDiskDirectory() {
  const persistentDiskPath = process.env.PERSISTENT_DISK_PATH || '/opt/render/project/data';
  
  console.log(`🔍 Verificando directorio del disco persistente: ${persistentDiskPath}`);
  console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`📂 Current working directory: ${process.cwd()}`);
  
  // En desarrollo, usar directorio local
  if (process.env.NODE_ENV !== 'production') {
    console.log(`ℹ️ Modo desarrollo - usando SQLite local`);
    return;
  }
  
  try {
    // Verificar si el directorio padre existe
    const parentDir = path.dirname(persistentDiskPath);
    console.log(`🔍 Verificando directorio padre: ${parentDir}`);
    
    if (!fs.existsSync(parentDir)) {
      console.log(`❌ El directorio padre no existe: ${parentDir}`);
      console.log(`💡 Esto puede indicar que el disco persistente no está montado`);
      
      // Intentar crear en un directorio alternativo
      const alternativePath = path.join(process.cwd(), 'data');
      console.log(`🔄 Intentando usar directorio alternativo: ${alternativePath}`);
      
      if (!fs.existsSync(alternativePath)) {
        fs.mkdirSync(alternativePath, { recursive: true });
      }
      
      // Actualizar variable de entorno temporalmente
      process.env.PERSISTENT_DISK_PATH = alternativePath;
      console.log(`⚠️ Usando directorio alternativo: ${alternativePath}`);
      return;
    }
    
    // Crear el directorio del disco persistente si no existe
    if (!fs.existsSync(persistentDiskPath)) {
      console.log(`📁 Creando directorio del disco persistente...`);
      fs.mkdirSync(persistentDiskPath, { recursive: true, mode: 0o755 });
      console.log(`✅ Directorio creado: ${persistentDiskPath}`);
    } else {
      console.log(`✅ Directorio del disco persistente existe: ${persistentDiskPath}`);
    }
    
    // Verificar permisos de escritura
    const testFile = path.join(persistentDiskPath, 'write-test.tmp');
    fs.writeFileSync(testFile, 'test-write-permissions');
    const readBack = fs.readFileSync(testFile, 'utf8');
    fs.unlinkSync(testFile);
    
    if (readBack === 'test-write-permissions') {
      console.log(`✅ Permisos de escritura verificados en: ${persistentDiskPath}`);
    } else {
      throw new Error('No se pudo verificar la escritura');
    }
    
    // Mostrar información del directorio
    const stats = fs.statSync(persistentDiskPath);
    console.log(`📊 Información del directorio:`);
    console.log(`   - Permisos: ${stats.mode.toString(8)}`);
    console.log(`   - Propietario: UID ${stats.uid}, GID ${stats.gid}`);
    console.log(`   - Tamaño: ${stats.size} bytes`);
    
  } catch (error) {
    console.error(`❌ Error con disco persistente:`, error.message);
    
    // Fallback: usar directorio local en el proyecto
    const fallbackPath = path.join(process.cwd(), 'data');
    console.log(`🔄 Fallback: usando directorio local ${fallbackPath}`);
    
    try {
      if (!fs.existsSync(fallbackPath)) {
        fs.mkdirSync(fallbackPath, { recursive: true });
      }
      
      // Probar escritura en fallback
      const testFile = path.join(fallbackPath, 'write-test.tmp');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      
      // Actualizar variable de entorno
      process.env.PERSISTENT_DISK_PATH = fallbackPath;
      console.log(`✅ Usando directorio fallback: ${fallbackPath}`);
      
    } catch (fallbackError) {
      console.error(`❌ Error también en directorio fallback:`, fallbackError.message);
      throw new Error(`No se puede crear directorio para SQLite: ${error.message}`);
    }
  }
}

// Inicializar datos básicos si es necesario
async function seedDefaultData() {
  try {
    // Importar modelos
    const models = require('../src/models');
    
    console.log('🌱 Verificando datos por defecto...');
    
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
    
  } catch (error) {
    console.error('❌ Error creando datos por defecto:', error);
    throw error;
  }
}

// Función principal de inicialización
async function initProductionDatabase() {
  console.log('🚀 Iniciando configuración de base de datos para producción...');
  console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`📁 PERSISTENT_DISK_PATH: ${process.env.PERSISTENT_DISK_PATH || 'No configurado'}`);
  
  try {
    // 1. Verificar/crear directorio del disco persistente
    if (process.env.NODE_ENV === 'production') {
      ensurePersistentDiskDirectory();
    }
    
    // 2. Probar conexión a la base de datos
    console.log('🔗 Probando conexión a la base de datos...');
    await testConnection();
    
    // 3. Sincronizar modelos (usar alter en lugar de force para preservar datos)
    console.log('🔄 Sincronizando modelos de base de datos...');
    await syncDatabase(false); // No usar force en producción
    
    // 4. Crear datos por defecto si no existen
    await seedDefaultData();
    
    console.log('🎉 Base de datos inicializada correctamente para producción');
    
    // 5. Mostrar información final
    const models = require('../src/models');
    const stats = {
      categories: await models.Category.count(),
      authors: await models.Author.count(),
      tags: await models.Tag.count(),
      posts: await models.Post.count()
    };
    
    console.log('📊 Estadísticas de la base de datos:');
    console.log(`   - Categorías: ${stats.categories}`);
    console.log(`   - Autores: ${stats.authors}`);
    console.log(`   - Tags: ${stats.tags}`);
    console.log(`   - Posts: ${stats.posts}`);
    
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
  ensurePersistentDiskDirectory,
  seedDefaultData
};
