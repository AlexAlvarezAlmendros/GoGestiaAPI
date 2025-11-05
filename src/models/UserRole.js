/**
 * Modelo UserRole para Turso
 * Reemplaza el modelo Sequelize con operaciones SQL directas
 */
const { executeSQL } = require('../config/database-wrapper');

class UserRoleModel {
  /**
   * Crea una asignación de rol a usuario
   */
  static async create(data) {
    const { userId, roleId, assignedBy, expiresAt, isActive } = data;
    
    const sql = `
      INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at, expires_at, is_active, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), ?, ?, datetime('now'), datetime('now'))
    `;
    
    const result = await executeSQL(sql, [
      userId,
      roleId,
      assignedBy || null,
      expiresAt || null,
      isActive !== false ? 1 : 0
    ]);
    
    return await this.findById(result.lastInsertRowid || result.insertId);
  }

  /**
   * Busca por ID
   */
  static async findById(id) {
    const sql = 'SELECT * FROM user_roles WHERE id = ?';
    const result = await executeSQL(sql, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.formatUserRole(result.rows[0]);
  }

  /**
   * Busca una asignación específica
   */
  static async findOne(where) {
    let sql = 'SELECT * FROM user_roles WHERE 1=1';
    const params = [];
    
    if (where.userId !== undefined) {
      sql += ' AND user_id = ?';
      params.push(where.userId);
    }
    
    if (where.roleId !== undefined) {
      sql += ' AND role_id = ?';
      params.push(where.roleId);
    }
    
    if (where.isActive !== undefined) {
      sql += ' AND is_active = ?';
      params.push(where.isActive ? 1 : 0);
    }
    
    sql += ' LIMIT 1';
    
    const result = await executeSQL(sql, params);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.formatUserRole(result.rows[0]);
  }

  /**
   * Busca todos los roles de un usuario
   */
  static async findAll(options = {}) {
    const { where } = options;
    
    let sql = `
      SELECT ur.*, r.name as role_name
      FROM user_roles ur
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE 1=1
    `;
    const params = [];
    
    if (where) {
      if (where.userId !== undefined) {
        sql += ' AND ur.user_id = ?';
        params.push(where.userId);
      }
      
      if (where.roleId !== undefined) {
        sql += ' AND ur.role_id = ?';
        params.push(where.roleId);
      }
      
      if (where.isActive !== undefined) {
        sql += ' AND ur.is_active = ?';
        params.push(where.isActive ? 1 : 0);
      }
    }
    
    sql += ' ORDER BY ur.assigned_at DESC';
    
    const result = await executeSQL(sql, params);
    return result.rows.map(row => this.formatUserRole(row));
  }

  /**
   * Busca o crea una asignación
   */
  static async findOrCreate(options) {
    const { where, defaults } = options;
    const data = { ...where, ...defaults };
    
    let userRole = await this.findOne(where);
    
    if (userRole) {
      return [userRole, false];
    }
    
    userRole = await this.create(data);
    return [userRole, true];
  }

  /**
   * Actualiza una asignación
   */
  static async update(updateData, options) {
    const { where } = options;
    const userRole = await this.findOne(where);
    
    if (!userRole) {
      return [0];
    }
    
    const updates = [];
    const values = [];
    
    if (updateData.isActive !== undefined) {
      updates.push('is_active = ?');
      values.push(updateData.isActive ? 1 : 0);
    }
    
    if (updateData.expiresAt !== undefined) {
      updates.push('expires_at = ?');
      values.push(updateData.expiresAt);
    }
    
    if (updates.length === 0) {
      return [0];
    }
    
    updates.push('updated_at = datetime(\'now\')');
    values.push(userRole.id);
    
    const sql = `UPDATE user_roles SET ${updates.join(', ')} WHERE id = ?`;
    const result = await executeSQL(sql, values);
    
    return [result.changes || 0];
  }

  /**
   * Elimina una asignación
   */
  static async destroy(options) {
    const { where } = options;
    const userRole = await this.findOne(where);
    
    if (!userRole) {
      return 0;
    }
    
    const sql = 'DELETE FROM user_roles WHERE id = ?';
    const result = await executeSQL(sql, [userRole.id]);
    return result.changes || 0;
  }

  /**
   * Obtiene roles de un usuario con información completa
   */
  static async getUserRoles(userId) {
    const sql = `
      SELECT 
        ur.*,
        r.name as role_name,
        r.description as role_description
      FROM user_roles ur
      INNER JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = ? AND ur.is_active = 1
      ORDER BY ur.assigned_at DESC
    `;
    
    const result = await executeSQL(sql, [userId]);
    return result.rows.map(row => ({
      ...this.formatUserRole(row),
      role: {
        id: row.role_id,
        name: row.role_name,
        description: row.role_description
      }
    }));
  }

  /**
   * Formatea un UserRole para la respuesta
   */
  static formatUserRole(row) {
    if (!row) return null;
    
    return {
      id: row.id,
      userId: row.user_id,
      roleId: row.role_id,
      assignedBy: row.assigned_by,
      assignedAt: row.assigned_at,
      expiresAt: row.expires_at,
      isActive: row.is_active === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      roleName: row.role_name || undefined
    };
  }
}

module.exports = UserRoleModel;
