/**
 * Modelo Role para Turso
 * Reemplaza el modelo Sequelize con operaciones SQL directas
 */
const { executeSQL } = require('../config/database-wrapper');

class RoleModel {
  /**
   * Crea un nuevo rol
   */
  static async create(roleData) {
    const { name, description, permissions, isActive } = roleData;
    
    const sql = `
      INSERT INTO roles (name, description, created_at, updated_at)
      VALUES (?, ?, datetime('now'), datetime('now'))
    `;
    
    const result = await executeSQL(sql, [
      name,
      description || null
    ]);
    
    return await this.findById(result.lastInsertRowid || result.insertId);
  }

  /**
   * Busca un rol por ID
   */
  static async findById(id) {
    const sql = 'SELECT * FROM roles WHERE id = ?';
    const result = await executeSQL(sql, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.formatRole(result.rows[0]);
  }

  /**
   * Busca un rol por nombre
   */
  static async findByName(name) {
    const sql = 'SELECT * FROM roles WHERE name = ?';
    const result = await executeSQL(sql, [name]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.formatRole(result.rows[0]);
  }

  /**
   * Busca uno por criterios
   */
  static async findOne(where) {
    if (where.name) {
      return await this.findByName(where.name);
    }
    if (where.id) {
      return await this.findById(where.id);
    }
    return null;
  }

  /**
   * Busca o crea un rol
   */
  static async findOrCreate(options) {
    const { where, defaults } = options;
    const roleData = { ...where, ...defaults };
    
    let role = where.name ? await this.findByName(where.name) : null;
    
    if (role) {
      return [role, false];
    }
    
    role = await this.create(roleData);
    return [role, true];
  }

  /**
   * Obtiene todos los roles
   */
  static async findAll(options = {}) {
    const { where } = options;
    
    let sql = 'SELECT * FROM roles';
    const params = [];
    
    if (where && where.isActive !== undefined) {
      sql += ' WHERE is_active = ?';
      params.push(where.isActive ? 1 : 0);
    }
    
    sql += ' ORDER BY name ASC';
    
    const result = await executeSQL(sql, params);
    return result.rows.map(row => this.formatRole(row));
  }

  /**
   * Actualiza un rol
   */
  static async update(updateData, options) {
    const { where } = options;
    const role = await this.findOne(where);
    
    if (!role) {
      return [0];
    }
    
    const updates = [];
    const values = [];
    
    if (updateData.name !== undefined) {
      updates.push('name = ?');
      values.push(updateData.name);
    }
    
    if (updateData.description !== undefined) {
      updates.push('description = ?');
      values.push(updateData.description);
    }
    
    if (updates.length === 0) {
      return [0];
    }
    
    updates.push('updated_at = datetime(\'now\')');
    values.push(role.id);
    
    const sql = `UPDATE roles SET ${updates.join(', ')} WHERE id = ?`;
    const result = await executeSQL(sql, values);
    
    return [result.changes || 0];
  }

  /**
   * Elimina un rol
   */
  static async destroy(options) {
    const { where } = options;
    const role = await this.findOne(where);
    
    if (!role) {
      return 0;
    }
    
    const sql = 'DELETE FROM roles WHERE id = ?';
    const result = await executeSQL(sql, [role.id]);
    return result.changes || 0;
  }

  /**
   * Cuenta todos los roles
   */
  static async count() {
    const sql = 'SELECT COUNT(*) as count FROM roles';
    const result = await executeSQL(sql);
    return result.rows[0].count;
  }

  /**
   * Formatea un rol para la respuesta
   */
  static formatRole(row) {
    if (!row) return null;
    
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

module.exports = RoleModel;
