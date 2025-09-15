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
  async getAllPosts(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        search,
        featured,
        includeUnpublished = false
      } = options;

      const offset = (page - 1) * limit;
      
      let whereConditions = [];
      let queryParams = [];

      // Solo incluir posts publicados a menos que se especifique lo contrario
      if (!includeUnpublished) {
        whereConditions.push('p.status = ?');
        queryParams.push('published');
      }

      // Filtro por categoría
      if (category) {
        whereConditions.push('c.slug = ?');
        queryParams.push(category);
      }

      // Filtro por búsqueda
      if (search) {
        whereConditions.push('(p.title LIKE ? OR p.excerpt LIKE ? OR p.content LIKE ?)');
        const searchTerm = `%${search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
      }

      // Filtro por featured
      if (featured !== undefined) {
        whereConditions.push('p.featured = ?');
        queryParams.push(featured ? 1 : 0);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      const query = `
        SELECT 
          p.id, p.slug, p.title, p.excerpt, p.featured_image, 
          p.featured, p.published_at, p.read_time, p.views, p.status,
          c.id as category_id, c.name as category_name, c.slug as category_slug,
          a.name as author_name, a.avatar as author_avatar
        FROM posts p 
        LEFT JOIN categories c ON p.category_id = c.id 
        LEFT JOIN authors a ON p.author_id = a.id 
        ${whereClause}
        ORDER BY p.published_at DESC 
        LIMIT ? OFFSET ?
      `;

      // Agregar limit y offset al final
      queryParams.push(limit, offset);

      const result = await executeSQL(query, queryParams);
      
      // Obtener el total de posts para paginación
      const countQuery = `
        SELECT COUNT(*) as total
        FROM posts p 
        LEFT JOIN categories c ON p.category_id = c.id 
        ${whereClause}
      `;
      
      const countParams = queryParams.slice(0, -2); // Remover limit y offset
      const countResult = await executeSQL(countQuery, countParams);
      const total = countResult.rows[0].total;

      const posts = result.rows.map(post => ({
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
        featured: post.featured === 1,
        status: post.status
      }));

      return {
        posts,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          limit,
          totalItems: total
        }
      };
      
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
          featured, published_at, read_time, views
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const readTime = this.calculateReadTime(content);
      const featuredValue = featured ? 1 : 0;
      const publishedAt = published ? new Date().toISOString() : null;
      const statusValue = published ? 'published' : 'draft';

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
        statusValue,
        featuredValue,
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
   * Obtiene todas las categorías
   */
  async getCategories() {
    try {
      const query = `
        SELECT 
          c.id, c.name, c.slug, c.description,
          COUNT(p.id) as post_count
        FROM categories c
        LEFT JOIN posts p ON c.id = p.category_id AND p.status = 'published'
        GROUP BY c.id, c.name, c.slug, c.description
        ORDER BY c.name ASC
      `;

      const result = await executeSQL(query);
      
      return result.rows.map(category => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        postCount: category.post_count || 0
      }));
      
    } catch (error) {
      console.error('❌ Error obteniendo categorías desde Turso:', error);
      throw error;
    }
  }

  /**
   * Obtiene un post por su slug
   */
  async getPostBySlug(slug) {
    try {
      const query = `
        SELECT 
          p.id, p.slug, p.title, p.excerpt, p.content, p.featured_image,
          p.published_at, p.updated_at, p.read_time, p.views,
          p.meta_title, p.meta_description, p.status, p.featured,
          c.id as category_id, c.name as category_name, c.slug as category_slug,
          a.name as author_name, a.avatar as author_avatar
        FROM posts p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN authors a ON p.author_id = a.id
        WHERE p.slug = ? AND p.status = 'published'
      `;

      const result = await executeSQL(query, [slug]);
      
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
      const tagsResult = await executeSQL(tagsQuery, [post.id]);
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
        published: post.status === 'published',
        seo: {
          metaTitle: post.meta_title || post.title,
          metaDescription: post.meta_description || post.excerpt,
          keywords: []
        }
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo post por slug desde Turso:', error);
      throw error;
    }
  }

  /**
   * Obtiene posts relacionados por categoría y tags
   */
  async getRelatedPosts(slug, limit = 4) {
    try {
      // Primero obtener el post actual para conocer su categoría y tags
      const currentPostQuery = `
        SELECT p.id, p.category_id 
        FROM posts p 
        WHERE p.slug = ? AND p.status = 'published'
      `;
      
      const currentPostResult = await executeSQL(currentPostQuery, [slug]);
      
      if (currentPostResult.rows.length === 0) {
        return [];
      }
      
      const currentPost = currentPostResult.rows[0];
      
      // Obtener posts relacionados por categoría, excluyendo el post actual
      const query = `
        SELECT DISTINCT
          p.id, p.slug, p.title, p.excerpt, p.featured_image,
          p.published_at, p.read_time, p.views, p.featured,
          c.id as category_id, c.name as category_name, c.slug as category_slug,
          a.name as author_name, a.avatar as author_avatar
        FROM posts p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN authors a ON p.author_id = a.id
        WHERE p.category_id = ? 
          AND p.id != ? 
          AND p.status = 'published'
        ORDER BY p.published_at DESC
        LIMIT ?
      `;
      
      const result = await executeSQL(query, [currentPost.category_id, currentPost.id, limit]);
      
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
      console.error('❌ Error obteniendo posts relacionados desde Turso:', error);
      throw error;
    }
  }

  /**
   * Incrementa las vistas de un post
   */
  async incrementViews(slug) {
    try {
      const query = `
        UPDATE posts 
        SET views = views + 1, updated_at = datetime('now')
        WHERE slug = ? AND status = 'published'
      `;
      
      const result = await executeSQL(query, [slug]);
      
      return result.changes > 0;
      
    } catch (error) {
      console.error('❌ Error incrementando vistas desde Turso:', error);
      throw error;
    }
  }

  /**
   * Actualiza un post existente
   */
  async updatePost(slug, updateData) {
    try {
      // Primero verificar que el post existe
      const existingPost = await this.getPostBySlug(slug);
      if (!existingPost) {
        return null;
      }

      const {
        title,
        content,
        excerpt,
        tags = [],
        author,
        category,
        published,
        featured,
        featuredImage,
        metaTitle,
        metaDescription,
        slug: newSlug
      } = updateData;

      // Preparar los valores para actualizar
      const updates = [];
      const values = [];

      if (title !== undefined) {
        updates.push('title = ?');
        values.push(title);
      }

      if (content !== undefined) {
        updates.push('content = ?');
        values.push(content);
        
        // Recalcular tiempo de lectura si se actualiza el contenido
        updates.push('read_time = ?');
        values.push(this.calculateReadTime(content));
      }

      if (excerpt !== undefined) {
        updates.push('excerpt = ?');
        values.push(excerpt);
      }

      if (featuredImage !== undefined) {
        updates.push('featured_image = ?');
        values.push(featuredImage);
      }

      if (metaTitle !== undefined) {
        updates.push('meta_title = ?');
        values.push(metaTitle);
      }

      if (metaDescription !== undefined) {
        updates.push('meta_description = ?');
        values.push(metaDescription);
      }

      if (featured !== undefined) {
        updates.push('featured = ?');
        values.push(featured ? 1 : 0);
      }

      if (published !== undefined) {
        updates.push('status = ?');
        values.push(published ? 'published' : 'draft');
        
        if (published) {
          updates.push('published_at = ?');
          values.push(new Date().toISOString());
        }
      }

      // Manejar autor si se proporciona
      if (author !== undefined) {
        const authorId = await this.findOrCreateAuthor(author);
        updates.push('author_id = ?');
        values.push(authorId);
      }

      // Manejar categoría si se proporciona
      if (category !== undefined) {
        const categoryId = category ? await this.findOrCreateCategory(category) : null;
        updates.push('category_id = ?');
        values.push(categoryId);
      }

      // Manejar nuevo slug si se proporciona
      if (newSlug !== undefined && newSlug !== slug) {
        const uniqueSlug = await this.generateUniqueSlug(newSlug);
        updates.push('slug = ?');
        values.push(uniqueSlug);
      }

      // Agregar updated_at
      updates.push('updated_at = ?');
      values.push(new Date().toISOString());

      // Ejecutar la actualización
      if (updates.length > 0) {
        values.push(slug); // Para el WHERE
        const updateQuery = `UPDATE posts SET ${updates.join(', ')} WHERE slug = ?`;
        await executeSQL(updateQuery, values);
      }

      // Manejar tags si se proporcionan
      if (tags !== undefined) {
        // Eliminar tags existentes
        await executeSQL('DELETE FROM post_tags WHERE post_id = ?', [existingPost.id]);
        
        // Agregar nuevos tags
        if (tags.length > 0) {
          await this.handlePostTags(existingPost.id, tags);
        }
      }

      // Retornar el post actualizado
      const finalSlug = newSlug && newSlug !== slug ? await this.generateUniqueSlug(newSlug) : slug;
      return await this.getPostBySlug(finalSlug);
      
    } catch (error) {
      console.error('❌ Error actualizando post en Turso:', error);
      throw error;
    }
  }

  /**
   * Elimina un post
   */
  async deletePost(slug) {
    try {
      // Primero obtener el ID del post
      const postQuery = 'SELECT id FROM posts WHERE slug = ?';
      const postResult = await executeSQL(postQuery, [slug]);
      
      if (postResult.rows.length === 0) {
        return false;
      }
      
      const postId = postResult.rows[0].id;
      
      // Eliminar relaciones con tags
      await executeSQL('DELETE FROM post_tags WHERE post_id = ?', [postId]);
      
      // Eliminar el post
      const deleteResult = await executeSQL('DELETE FROM posts WHERE slug = ?', [slug]);
      
      return deleteResult.changes > 0;
      
    } catch (error) {
      console.error('❌ Error eliminando post desde Turso:', error);
      throw error;
    }
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
