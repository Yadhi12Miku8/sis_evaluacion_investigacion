const db = require('../database/connection');
const Usuario = require('../models/Usuario.model');

class UsuarioRepository {
  normalizeOrderBy(orderBy) {
    const allowed = new Set(['id', 'dni', 'nombres', 'apellidos', 'correo_institucional', 'rol', 'estado', 'fecha_registro']);
    return allowed.has(orderBy) ? orderBy : 'id';
  }

  normalizeOrder(order) {
    return String(order || '').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  }

  async findByEmail(email) {
    try {
      const sql = `SELECT * FROM usuarios WHERE correo_institucional = ? LIMIT 1`;
      const rows = await db.query(sql, [email]);
      const row = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
      return row ? new Usuario(row) : null;
    } catch (error) {
      console.error('Error en findByEmail:', error);
      throw error;
    }
  }

  async findAll(options = {}) {
    try {
      const limit = Number.isFinite(options.limit) ? options.limit : parseInt(options.limit, 10);
      const offset = Number.isFinite(options.offset) ? options.offset : parseInt(options.offset, 10);
      const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 500) : 100;
      const safeOffset = Number.isFinite(offset) && offset >= 0 ? offset : 0;

      const where = [];
      const params = [];

      if (options.estado) {
        where.push('estado = ?');
        params.push(options.estado);
      }

      if (options.rol) {
        where.push('rol = ?');
        params.push(options.rol);
      }

      if (options.q) {
        where.push(`(nombres LIKE ? OR apellidos LIKE ? OR correo_institucional LIKE ? OR dni LIKE ?)`);
        const like = `%${options.q}%`;
        params.push(like, like, like, like);
      }

      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
      const orderBy = this.normalizeOrderBy(options.orderBy || 'id');
      const order = this.normalizeOrder(options.order || 'ASC');

      const sql = `SELECT * FROM usuarios ${whereSql} ORDER BY ${orderBy} ${order} LIMIT ? OFFSET ?`;
      params.push(safeLimit, safeOffset);

      const rows = await db.query(sql, params);
      return (rows || []).map(row => new Usuario(row));
    } catch (error) {
      console.error('Error en findAll:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const sql = `SELECT * FROM usuarios WHERE id = ? LIMIT 1`;
      const rows = await db.query(sql, [id]);
      const row = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
      return row ? new Usuario(row) : null;
    } catch (error) {
      console.error('Error en findById:', error);
      throw error;
    }
  }

  async findByDni(dni) {
    try {
      const sql = `SELECT * FROM usuarios WHERE dni = ? LIMIT 1`;
      const rows = await db.query(sql, [dni]);
      const row = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
      return row ? new Usuario(row) : null;
    } catch (error) {
      console.error('Error en findByDni:', error);
      throw error;
    }
  }

  async searchByName(term) {
    try {
      const like = `%${term}%`;
      const sql = `SELECT * FROM usuarios WHERE nombres LIKE ? OR apellidos LIKE ? ORDER BY apellidos, nombres LIMIT 100`;
      const rows = await db.query(sql, [like, like]);
      return (rows || []).map(row => new Usuario(row));
    } catch (error) {
      console.error('Error en searchByName:', error);
      throw error;
    }
  }

  async updateLastLogin(id) {
    try {
      const sql = `UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?`;
      await db.query(sql, [id]);
      return true;
    } catch (error) {
      console.error('Error en updateLastLogin:', error);
      return false;
    }
  }

  async create(data) {
    try {
      const sql = `
        INSERT INTO usuarios (
          dni,
          nombres,
          apellidos,
          correo_institucional,
          telefono,
          programa_estudio_id,
          rol,
          estado,
          password,
          fecha_registro
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;

      const params = [
        data.dni,
        data.nombres,
        data.apellidos,
        data.correo_institucional,
        data.telefono || null,
        data.programa_estudio_id || null,
        data.rol,
        data.estado || 'Activo',
        data.password
      ];

      const result = await db.query(sql, params);
      const insertedId = result && result.insertId ? result.insertId : null;
      if (!insertedId) return null;
      return await this.findById(insertedId);
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  async updateById(id, data) {
    try {
      const sets = [];
      const params = [];

      const allowed = [
        'dni',
        'nombres',
        'apellidos',
        'correo_institucional',
        'telefono',
        'programa_estudio_id',
        'rol',
        'estado',
        'password'
      ];

      allowed.forEach(k => {
        if (Object.prototype.hasOwnProperty.call(data, k) && data[k] !== undefined) {
          sets.push(`${k} = ?`);
          params.push(data[k]);
        }
      });

      if (sets.length === 0) return await this.findById(id);

      const sql = `UPDATE usuarios SET ${sets.join(', ')} WHERE id = ?`;
      params.push(id);
      await db.query(sql, params);
      return await this.findById(id);
    } catch (error) {
      console.error('Error en updateById:', error);
      throw error;
    }
  }

  async updateEstado(id, estado) {
    try {
      const sql = `UPDATE usuarios SET estado = ? WHERE id = ?`;
      await db.query(sql, [estado, id]);
      return await this.findById(id);
    } catch (error) {
      console.error('Error en updateEstado:', error);
      throw error;
    }
  }

  async deleteById(id) {
    try {
      const sql = `DELETE FROM usuarios WHERE id = ?`;
      const result = await db.query(sql, [id]);
      return !!(result && typeof result.affectedRows === 'number' ? result.affectedRows > 0 : false);
    } catch (error) {
      console.error('Error en deleteById:', error);
      throw error;
    }
  }

  async getAllActivos() {
    try {
      const sql = `SELECT * FROM usuarios WHERE estado = 'Activo' ORDER BY apellidos, nombres`;
      const rows = await db.query(sql);
      return rows.map(row => new Usuario(row));
    } catch (error) {
      console.error('Error en getAllActivos:', error);
      throw error;
    }
  }

  async getStatsByRol() {
    try {
      const sql = `
        SELECT rol, COUNT(*) as total
        FROM usuarios
        WHERE estado = 'Activo'
        GROUP BY rol
        ORDER BY total DESC
      `;
      const rows = await db.query(sql);
      return rows || [];
    } catch (error) {
      console.error('Error en getStatsByRol:', error);
      throw error;
    }
  }

  async countByRol(rol) {
    try {
      const sql = `SELECT COUNT(*) as total FROM usuarios WHERE rol = ? AND estado = 'Activo'`;
      const rows = await db.query(sql, [rol]);
      const result = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
      return result ? result.total : 0;
    } catch (error) {
      console.error('Error en countByRol:', error);
      throw error;
    }
  }
}

module.exports = new UsuarioRepository();