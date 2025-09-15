const { executeSQL } = require('../config/database-wrapper');

class TursoBlogService {
  constructor() {
    this.isInitialized = false;
  }

  /**
   * Inicializa el servicio de blog para Turso
   */
  async initialize() {
    try {
      console.log('🌐 Inicializando TursoBlogService...');
      
      // Verificar que las tablas principales existan
      await this.checkTables();
      
      this.isInitialized = true;
      console.log('✅ TursoBlogService inicializado correctamente');
      
    } catch (error) {
      console.error('❌ Error al inicializar TursoBlogService:', error);
      throw error;
    }
  }

  /**
   * Verifica que las tablas necesarias existan
   */
  async checkTables() {
    try {
      const tables = ['posts', 'categories', 'authors', 'tags', 'post_tags'];
      
      for (const table of tables) {
        const result = await executeSQL(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [table]);
        if (result.rows.length === 0) {
          console.warn(`⚠️ Tabla '${table}' no encontrada en Turso`);
        }
      }
    } catch (error) {
      console.error('❌ Error verificando tablas:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los posts con paginación
   */
  async getAllPosts(limit = 10, offset = 0) {
    try {
      const query = `
        SELECT 
          p.id, p.slug, p.title, p.excerpt, p.featured_image, 
          p.featured, p.published_at, p.read_time, p.views, p.status, p.published,
          c.id as category_id, c.name as category_name, c.slug as category_slug,
          a.name as author_name, a.avatar as author_avatar
        FROM posts p 
        LEFT JOIN categories c ON p.category_id = c.id 
        LEFT JOIN authors a ON p.author_id = a.id 
        WHERE p.published = 1 AND p.status = 'published'
        ORDER BY p.published_at DESC 
        LIMIT ? OFFSET ?
      `;

      const result = await executeSQL(query, [limit, offset]);
      
      return result.rows.map(post => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        featuredImage: post.featured_image,
        category: post.category_id ? {
          id: post.category_id,
          name: post.category_name,
          slug: post.category_slug
        } : null,
        tags: [], // Se cargarán por separado si es necesario
        author: {
          name: post.author_name,
          avatar: post.author_avatar
        },
        publishedAt: post.published_at,
        readTime: post.read_time,
        views: post.views,
        featured: post.featured === 1
      }));
      
    } catch (error) {
      console.error('❌ Error obteniendo posts desde Turso:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo post en Turso
   */
  async createPost(postData) {
    try {
      const {
        title,
        content,
        excerpt,
        tags = [],
        author,
        category,
        published = false,
        featured = false,
        featuredImage,
        metaTitle,
        metaDescription,
        slug
      } = postData;

      // Generar slug único si no se proporciona
      const finalSlug = slug || await this.generateUniqueSlug(title);
      
      // Buscar o crear autor
      let authorId = await this.findOrCreateAuthor(author);
      
      // Buscar o crear categoría
      let categoryId = null;
      if (category) {
        categoryId = await this.findOrCreateCategory(category);
      }

      // Crear el post - ajustado a la estructura real de Turso
      const insertQuery = `
        INSERT INTO posts (
          title, content, excerpt, slug, author_id, category_id, 
          featured_image, meta_title, meta_description, status, 
          featured, published, published_at, read_time, views
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const readTime = this.calculateReadTime(content);
      const publishedValue = published ? 1 : 0;
      const featuredValue = featured ? 1 : 0;
      const publishedAt = published ? new Date().toISOString() : null;

      const result = await executeSQL(insertQuery, [
        title,
        content,
        excerpt || content.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
        finalSlug,
        authorId,
        categoryId,
        featuredImage || null,
        metaTitle || null,
        metaDescription || null,
        published ? 'published' : 'draft',
        featuredValue,
        publishedValue,
        publishedAt,
        readTime,
        0 // views inicial
      ]);

      const postId = result.insertId || result.lastInsertRowid;

      // Manejar tags si los hay
      if (tags.length > 0) {
        await this.handlePostTags(postId, tags);
      }

      // Retornar el post creado
      return await this.getPostById(postId);
      
    } catch (error) {
      console.error('❌ Error creando post en Turso:', error);
      throw error;
    }
  }

  /**
   * Busca o crea un autor
   */
  async findOrCreateAuthor(authorName) {
    try {
      // Buscar autor existente
      let result = await executeSQL('SELECT id FROM authors WHERE name = ?', [authorName]);
      
      if (result.rows.length > 0) {
        return result.rows[0].id;
      }

      // Crear nuevo autor (sin email, siguiendo la estructura real de Turso)
      const insertResult = await executeSQL(
        'INSERT INTO authors (name, created_at, updated_at) VALUES (?, datetime(\'now\'), datetime(\'now\'))',
        [authorName]
      );

      return insertResult.insertId || insertResult.lastInsertRowid;
      
    } catch (error) {
      console.error('❌ Error manejando autor:', error);
      throw error;
    }
  }

  /**
   * Busca o crea una categoría
   */
  async findOrCreateCategory(categoryName) {
    try {
      // Buscar categoría existente
      let result = await executeSQL('SELECT id FROM categories WHERE name = ?', [categoryName]);
      
      if (result.rows.length > 0) {
        return result.rows[0].id;
      }

      // Crear nueva categoría
      const slug = this.generateSlug(categoryName);
      const insertResult = await executeSQL(
        'INSERT INTO categories (name, slug, description, created_at, updated_at) VALUES (?, ?, ?, datetime(\'now\'), datetime(\'now\'))',
        [categoryName, slug, `Categoría de ${categoryName}`]
      );

      return insertResult.insertId || insertResult.lastInsertRowid;
      
    } catch (error) {
      console.error('❌ Error manejando categoría:', error);
      throw error;
    }
  }

  /**
   * Maneja los tags de un post
   */
  async handlePostTags(postId, tags) {
    try {
      for (const tagName of tags) {
        // Buscar o crear tag
        let result = await executeSQL('SELECT id FROM tags WHERE name = ?', [tagName]);
        let tagId;

        if (result.rows.length > 0) {
          tagId = result.rows[0].id;
        } else {
          const insertResult = await executeSQL(
            'INSERT INTO tags (name, created_at, updated_at) VALUES (?, datetime(\'now\'), datetime(\'now\'))',
            [tagName]
          );
          tagId = insertResult.insertId || insertResult.lastInsertRowid;
        }

        // Crear relación post-tag
        await executeSQL(
          'INSERT OR IGNORE INTO post_tags (post_id, tag_id, created_at, updated_at) VALUES (?, ?, datetime(\'now\'), datetime(\'now\'))',
          [postId, tagId]
        );
      }
    } catch (error) {
      console.error('❌ Error manejando tags:', error);
      throw error;
    }
  }

  /**
   * Obtiene un post por ID
   */
  async getPostById(postId) {
    try {
      const query = `
        SELECT 
          p.id, p.slug, p.title, p.excerpt, p.content, p.featured_image,
          p.published_at, p.updated_at, p.read_time, p.views,
          p.meta_title, p.meta_description, p.status, p.featured, p.published,
          c.id as category_id, c.name as category_name, c.slug as category_slug,
          a.name as author_name, a.avatar as author_avatar
        FROM posts p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN authors a ON p.author_id = a.id
        WHERE p.id = ?
      `;

      const result = await executeSQL(query, [postId]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const post = result.rows[0];

      // Obtener tags del post
      const tagsQuery = `
        SELECT t.name 
        FROM tags t
        JOIN post_tags pt ON t.id = pt.tag_id
        WHERE pt.post_id = ?
      `;
      const tagsResult = await executeSQL(tagsQuery, [postId]);
      const tags = tagsResult.rows.map(row => row.name);

      return {
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        featuredImage: post.featured_image,
        category: post.category_id ? {
          id: post.category_id,
          name: post.category_name,
          slug: post.category_slug
        } : null,
        tags: tags,
        author: {
          name: post.author_name,
          avatar: post.author_avatar
        },
        publishedAt: post.published_at,
        updatedAt: post.updated_at,
        readTime: post.read_time,
        views: post.views,
        status: post.status,
        featured: post.featured === 1,
        published: post.published === 1,
        seo: {
          metaTitle: post.meta_title || post.title,
          metaDescription: post.meta_description || post.excerpt,
          keywords: []
        }
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo post por ID:', error);
      throw error;
    }
  }

  /**
   * Genera un slug único
   */
  async generateUniqueSlug(title) {
    let baseSlug = this.generateSlug(title);
    let finalSlug = baseSlug;
    let counter = 1;

    while (true) {
      const result = await executeSQL('SELECT id FROM posts WHERE slug = ?', [finalSlug]);
      if (result.rows.length === 0) {
        break;
      }
      counter++;
      finalSlug = `${baseSlug}-${counter}`;
    }

    return finalSlug;
  }

  /**
   * Genera un slug a partir del título
   */
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  /**
   * Calcula el tiempo estimado de lectura
   */
  calculateReadTime(content) {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  }
}

module.exports = new TursoBlogService();
