/**
 * Modelo User para Turso
 * Reemplaza el modelo Sequelize con operaciones SQL directas
 */
const { executeSQL } = require('../config/database-wrapper');

class UserModel {
  /**
   * Crea un nuevo usuario
   */
  static async create(userData) {
    const { auth0Id, email, name, nickname, picture, emailVerified, locale, isActive, defaultRoleId } = userData;
    
    const sql = `
      INSERT INTO users (auth0_id, email, name, nickname, picture, email_verified, locale, is_active, default_role_id, last_login, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), datetime('now'))
    `;
    
    const result = await executeSQL(sql, [
      auth0Id,
      email,
      name,
      nickname || null,
      picture || null,
      emailVerified ? 1 : 0,
      locale || 'es',
      isActive !== false ? 1 : 0,
      defaultRoleId || null
    ]);
    
    return await this.findById(result.lastInsertRowid || result.insertId);
  }

  /**
   * Busca un usuario por ID
   */
  static async findById(id) {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const result = await executeSQL(sql, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.formatUser(result.rows[0]);
  }

  /**
   * Busca un usuario por email
   */
  static async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const result = await executeSQL(sql, [email]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.formatUser(result.rows[0]);
  }

  /**
   * Busca un usuario por Auth0 ID
   */
  static async findByAuth0Id(auth0Id) {
    const sql = 'SELECT * FROM users WHERE auth0_id = ?';
    const result = await executeSQL(sql, [auth0Id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.formatUser(result.rows[0]);
  }

  /**
   * Busca uno por criterios
   */
  static async findOne(where) {
    if (where.auth0Id) {
      return await this.findByAuth0Id(where.auth0Id);
    }
    if (where.email) {
      return await this.findByEmail(where.email);
    }
    if (where.id) {
      return await this.findById(where.id);
    }
    return null;
  }

  /**
   * Busca o crea un usuario
   */
  static async findOrCreate(options) {
    const { where, defaults } = options;
    const userData = { ...where, ...defaults };
    
    // Buscar por email o auth0_id
    let user = where.email ? await this.findByEmail(where.email) : null;
    if (!user && where.auth0Id) {
      user = await this.findByAuth0Id(where.auth0Id);
    }
    
    if (user) {
      return [user, false];
    }
    
    user = await this.create(userData);
    return [user, true];
  }

  /**
   * Actualiza un usuario
   */
  static async update(updateData, options) {
    const { where } = options;
    
    // Encontrar el usuario primero
    const user = await this.findOne(where);
    if (!user) {
      return [0];
    }
    
    const updates = [];
    const values = [];
    
    if (updateData.name !== undefined) {
      updates.push('name = ?');
      values.push(updateData.name);
    }
    
    if (updateData.nickname !== undefined) {
      updates.push('nickname = ?');
      values.push(updateData.nickname);
    }
    
    if (updateData.picture !== undefined) {
      updates.push('picture = ?');
      values.push(updateData.picture);
    }
    
    if (updateData.emailVerified !== undefined) {
      updates.push('email_verified = ?');
      values.push(updateData.emailVerified ? 1 : 0);
    }
    
    if (updateData.locale !== undefined) {
      updates.push('locale = ?');
      values.push(updateData.locale);
    }
    
    if (updateData.lastLogin !== undefined) {
      updates.push('last_login = ?');
      values.push(updateData.lastLogin);
    }
    
    if (updateData.isActive !== undefined) {
      updates.push('is_active = ?');
      values.push(updateData.isActive ? 1 : 0);
    }
    
    if (updateData.defaultRoleId !== undefined) {
      updates.push('default_role_id = ?');
      values.push(updateData.defaultRoleId);
    }
    
    if (updates.length === 0) {
      return [0];
    }
    
    updates.push('updated_at = datetime(\'now\')');
    values.push(user.id);
    
    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    const result = await executeSQL(sql, values);
    
    return [result.changes || 0];
  }

  /**
   * Actualiza el último login
   */
  static async updateLastLogin(id) {
    const sql = 'UPDATE users SET last_login = datetime(\'now\'), updated_at = datetime(\'now\') WHERE id = ?';
    await executeSQL(sql, [id]);
  }

  /**
   * Obtiene todos los usuarios
   */
  static async findAll(options = {}) {
    const { limit, offset, where } = options;
    
    let sql = 'SELECT * FROM users';
    const params = [];
    
    // Agregar condiciones WHERE si existen
    if (where) {
      const conditions = [];
      if (where.isActive !== undefined) {
        conditions.push('is_active = ?');
        params.push(where.isActive ? 1 : 0);
      }
      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }
    }
    
    sql += ' ORDER BY created_at DESC';
    
    if (limit) {
      sql += ' LIMIT ?';
      params.push(limit);
      
      if (offset) {
        sql += ' OFFSET ?';
        params.push(offset);
      }
    }
    
    const result = await executeSQL(sql, params);
    return result.rows.map(row => this.formatUser(row));
  }

  /**
   * Cuenta todos los usuarios
   */
  static async count(options = {}) {
    const { where } = options;
    let sql = 'SELECT COUNT(*) as count FROM users';
    const params = [];
    
    if (where && where.isActive !== undefined) {
      sql += ' WHERE is_active = ?';
      params.push(where.isActive ? 1 : 0);
    }
    
    const result = await executeSQL(sql, params);
    return result.rows[0].count;
  }

  /**
   * Elimina un usuario
   */
  static async destroy(options) {
    const { where } = options;
    const user = await this.findOne(where);
    
    if (!user) {
      return 0;
    }
    
    const sql = 'DELETE FROM users WHERE id = ?';
    const result = await executeSQL(sql, [user.id]);
    return result.changes || 0;
  }

  /**
   * Formatea un usuario para la respuesta
   */
  static formatUser(row) {
    if (!row) return null;
    
    return {
      id: row.id,
      auth0Id: row.auth0_id,
      email: row.email,
      name: row.name,
      nickname: row.nickname,
      picture: row.picture,
      emailVerified: row.email_verified === 1,
      locale: row.locale,
      lastLogin: row.last_login,
      isActive: row.is_active === 1,
      defaultRoleId: row.default_role_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

module.exports = UserModel;
