const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../models/db');

exports.login = async (req, res) => {
  const { correo_institucional, password } = req.body;

  try {
    const result = await pool.query(
      `SELECT u.id, u.nombres, u.apellidos, u.password_hash, r.rol 
       FROM usuarios u
       JOIN roles_usuario r ON u.id = r.usuario_id
       WHERE u.correo_institucional = $1 AND u.activo = true`,
      [correo_institucional]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, rol: user.rol });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.logout = (req, res) => {
  // En JWT no hay "sesión" del lado servidor, así que solo respondemos éxito
  res.json({ message: 'Sesión cerrada correctamente' });
};