/**
 * Modelo Author para Turso
 * Reemplaza el modelo Sequelize con operaciones SQL directas
 */
const { executeSQL } = require('../config/database-wrapper');

class AuthorModel {
  static async create(data) {
    const { name, avatar } = data;
    
    const sql = `
      INSERT INTO authors (name, avatar, created_at, updated_at)
      VALUES (?, ?, datetime('now'), datetime('now'))
    `;
    
    const result = await executeSQL(sql, [name, avatar || null]);
    return await this.findById(result.lastInsertRowid || result.insertId);
  }

  static async findById(id) {
    const sql = 'SELECT * FROM authors WHERE id = ?';
    const result = await executeSQL(sql, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  static async findByName(name) {
    const sql = 'SELECT * FROM authors WHERE name = ?';
    const result = await executeSQL(sql, [name]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  static async findAll() {
    const sql = 'SELECT * FROM authors ORDER BY name ASC';
    const result = await executeSQL(sql);
    return result.rows;
  }
}

module.exports = AuthorModel;
