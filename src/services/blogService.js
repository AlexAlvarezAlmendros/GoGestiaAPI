/**
 * Servicio de Blog simplificado - Solo usa Turso
 * Eliminadas todas las referencias a SQLite/Sequelize
 */

const tursoBlogService = require('./tursoBlogService');

class BlogService {
  
  /**
   * Obtiene una lista paginada de posts con filtros
   */
  async getPosts(options = {}) {
    return await tursoBlogService.getAllPosts(options);
  }

  /**
   * Obtiene un post por su slug
   */
  async getPostBySlug(slug) {
    return await tursoBlogService.getPostBySlug(slug);
  }

  /**
   * Crea un nuevo post
   */
  async createPost(postData) {
    return await tursoBlogService.createPost(postData);
  }

  /**
   * Actualiza un post existente
   */
  async updatePost(slug, updateData) {
    return await tursoBlogService.updatePost(slug, updateData);
  }

  /**
   * Elimina un post
   */
  async deletePost(slug) {
    return await tursoBlogService.deletePost(slug);
  }

  /**
   * Obtiene categorías
   */
  async getCategories() {
    return await tursoBlogService.getCategories();
  }

  /**
   * Obtiene posts relacionados
   */
  async getRelatedPosts(slug, limit = 4) {
    return await tursoBlogService.getRelatedPosts(slug, limit);
  }

  /**
   * Incrementa las vistas de un post
   */
  async incrementViews(slug) {
    return await tursoBlogService.incrementViews(slug);
  }

  /**
   * Genera un slug a partir del título
   */
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // Remover caracteres especiales
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-') // Reemplazar múltiples guiones con uno solo
      .trim('-'); // Remover guiones al inicio y final
  }
}

module.exports = new BlogService();
