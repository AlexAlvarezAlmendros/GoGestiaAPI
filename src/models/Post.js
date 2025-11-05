/**
 * Modelo Post para Turso
 * Las operaciones complejas se manejan en tursoBlogService
 */
const { executeSQL } = require('../config/database-wrapper');

class PostModel {
  static async findBySlug(slug) {
    const sql = 'SELECT * FROM posts WHERE slug = ?';
    const result = await executeSQL(sql, [slug]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  static async findById(id) {
    const sql = 'SELECT * FROM posts WHERE id = ?';
    const result = await executeSQL(sql, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  static async findAll(options = {}) {
    const { limit, offset, where } = options;
    let sql = 'SELECT * FROM posts';
    const params = [];
    
    if (where && where.status) {
      sql += ' WHERE status = ?';
      params.push(where.status);
    }
    
    sql += ' ORDER BY published_at DESC';
    
    if (limit) {
      sql += ' LIMIT ?';
      params.push(limit);
      if (offset) {
        sql += ' OFFSET ?';
        params.push(offset);
      }
    }
    
    const result = await executeSQL(sql, params);
    return result.rows;
  }
}

module.exports = PostModel;
