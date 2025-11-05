/**
 * Modelo Category para Turso
 * Reemplaza el modelo Sequelize con operaciones SQL directas
 */
const { executeSQL } = require('../config/database-wrapper');

class CategoryModel {
  static async create(data) {
    const { name, slug, description } = data;
    
    const sql = `
      INSERT INTO categories (name, slug, description, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `;
    
    const result = await executeSQL(sql, [name, slug, description || null]);
    return await this.findById(result.lastInsertRowid || result.insertId);
  }

  static async findById(id) {
    const sql = 'SELECT * FROM categories WHERE id = ?';
    const result = await executeSQL(sql, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  static async findBySlug(slug) {
    const sql = 'SELECT * FROM categories WHERE slug = ?';
    const result = await executeSQL(sql, [slug]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  static async findAll() {
    const sql = 'SELECT * FROM categories ORDER BY name ASC';
    const result = await executeSQL(sql);
    return result.rows;
  }
}

module.exports = CategoryModel;
