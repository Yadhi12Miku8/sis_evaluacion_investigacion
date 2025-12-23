const db = require('../database/connection');
const Usuario = require('../models/Usuario.model');

class UsuarioRepository {
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