/**
 * Modelo PostTag para Turso
 * Reemplaza el modelo Sequelize con operaciones SQL directas
 */
const { executeSQL } = require('../config/database-wrapper');

class PostTagModel {
  static async create(data) {
    const { post_id, tag_id } = data;
    
    const sql = `
      INSERT OR IGNORE INTO post_tags (post_id, tag_id, created_at, updated_at)
      VALUES (?, ?, datetime('now'), datetime('now'))
    `;
    
    await executeSQL(sql, [post_id, tag_id]);
    return { post_id, tag_id };
  }

  static async findByPostId(postId) {
    const sql = 'SELECT * FROM post_tags WHERE post_id = ?';
    const result = await executeSQL(sql, [postId]);
    return result.rows;
  }

  static async deleteByPostId(postId) {
    const sql = 'DELETE FROM post_tags WHERE post_id = ?';
    await executeSQL(sql, [postId]);
  }
}

module.exports = PostTagModel;
