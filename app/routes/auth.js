const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await pool.query('SELECT * FROM usuarios WHERE correo_institucional = $1', [email]);
  if (user.rows.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });

  const valid = await bcrypt.compare(password, user.rows[0].password_hash);
  if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

  const rol = await pool.query('SELECT rol FROM roles_usuario WHERE usuario_id = $1 AND activo = true', [user.rows[0].id]);
  const token = jwt.sign({ id: user.rows[0].id, rol: rol.rows[0]?.rol }, 'secret');

  let redirect = '/';
  if (rol.rows[0]?.rol === 'JEFE_INVESTIGACION') redirect = '/dashboard-jefe.html';
  if (rol.rows[0]?.rol === 'ADMINISTRADOR') redirect = '/dashboard-admin.html';

  res.json({ token, rol: rol.rows[0]?.rol, redirect });
});

module.exports = router;