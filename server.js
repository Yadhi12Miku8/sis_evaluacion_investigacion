require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Importar rutas
const authRoutes = require('./src/routes/auth.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'app')));
app.use('/src/views/js', express.static(path.join(__dirname, 'src/views/js')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de conexión a BD
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sistema_investigacion_innovacion',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Función para generar JWT
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'tu_clave_secreta_super_segura_2025';

function generarToken(usuario) {
    return jwt.sign(
        {
            id: usuario.id,
            correo: usuario.correo_institucional,
            rol: usuario.rol
        },
        SECRET_KEY,
        { expiresIn: '8h' }
    );
}

function verificarJWT(header) {
  try {
    if (!header || !header.startsWith('Bearer ')) return null;
    const token = header.split(' ')[1];
    return jwt.verify(token, SECRET_KEY);
  } catch (e) {
    return null;
  }
}

function requireAuth(req, res, next) {
  const decoded = verificarJWT(req.headers.authorization || '');
  if (!decoded) return res.status(401).json({ success: false, message: 'No autorizado' });
  req.user = decoded;
  next();
}

function rolToRoute(rol) {
    if (!rol) return '/dashboard';
    const r = rol.toLowerCase();
    if (r.includes('docente')) return '/dashboard/docente';
    if (r.includes('jefe')) return '/dashboard/jefe-unidad';
    if (r.includes('director')) return '/dashboard/director';
    if (r.includes('comite') || r.includes('editor')) return '/dashboard/comite-editor';
    if (r.includes('admin')) return '/dashboard/admin';
    return '/dashboard';
}

// El endpoint de login ahora está centralizado en `src/routes/auth.routes.js`
// (controlador: `src/controllers/Auth.controller.js`).

// Ruta para obtener proyectos del usuario autenticado
app.get('/api/proyectos/:usuario_id', async (req, res) => {
    const { usuario_id } = req.params;

    try {
        const conn = await pool.getConnection();
        const [proyectos] = await conn.query(
            `SELECT p.* FROM proyectos p 
             INNER JOIN integrantes_proyecto ip ON p.id = ip.proyecto_id 
             WHERE ip.usuario_id = ?`,
            [usuario_id]
        );
        conn.release();

        res.json({ success: true, proyectos });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener proyectos' });
    }
});

app.post('/api/proyectos', requireAuth, async (req, res) => {
  const { titulo = '', tipo = 'Investigacion Aplicada', linea_investigacion_id = null, objetivo_general = null, beneficiarios = null, fecha_inicio = null, fecha_fin = null } = req.body;
  try {
    const conn = await pool.getConnection();
    const [maxIdRows] = await conn.query('SELECT IFNULL(MAX(id),0)+1 as next_id FROM proyectos');
    const nextId = maxIdRows.next_id || Date.now();
    const year = new Date().getFullYear();
    const codigo = `PROY-${year}-${String(nextId).padStart(3,'0')}`;
    const [result] = await conn.query(
      'INSERT INTO proyectos (codigo, titulo, tipo, linea_investigacion_id, usuario_id, objetivo_general, beneficiarios, fecha_inicio, fecha_fin, estado) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [codigo, titulo, tipo, linea_investigacion_id, req.user.id, objetivo_general, beneficiarios, fecha_inicio, fecha_fin, 'En Ejecucion']
    );
    const insertedId = result.insertId;
    await conn.query('INSERT INTO integrantes_proyecto (proyecto_id, usuario_id, rol) VALUES (?,?,?)', [insertedId, req.user.id, 'Investigador Principal']);
    const [userRows] = await conn.query('SELECT programa_estudio_id FROM usuarios WHERE id = ? LIMIT 1', [req.user.id]);
    const programaId = Array.isArray(userRows) && userRows.length ? userRows[0].programa_estudio_id : null;
    if (programaId) {
      const [jefes] = await conn.query("SELECT id FROM usuarios WHERE rol = 'Jefe de Unidad de Investigacion' AND programa_estudio_id = ?", [programaId]);
      const titleN = 'Nuevo proyecto registrado';
      const messageN = `Proyecto ${codigo}: ${titulo}`;
      for (const j of jefes) {
        await conn.query('INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, leido) VALUES (?,?,?,?,0)', [j.id, titleN, messageN, 'Recordatorio']);
      }
    }
    conn.release();
    res.json({ success: true, proyecto: { id: insertedId, codigo, titulo, tipo } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al crear proyecto' });
  }
});

app.post('/api/documentos_proyecto', requireAuth, async (req, res) => {
  const { proyecto_id, tipo_documento = 'Perfil', nombre_archivo = null, ruta_archivo = null, estado = 'En revision' } = req.body;
  try {
    const conn = await pool.getConnection();
    const [result] = await conn.query(
      'INSERT INTO documentos_proyecto (proyecto_id, tipo_documento, nombre_archivo, ruta_archivo, subido_por, estado) VALUES (?,?,?,?,?,?)',
      [proyecto_id, tipo_documento, nombre_archivo, ruta_archivo, req.user.id, estado]
    );
    if (String(tipo_documento).toLowerCase() === 'informe final') {
      const [projInfo] = await conn.query(
        'SELECT p.codigo, p.titulo, u.programa_estudio_id FROM proyectos p INNER JOIN usuarios u ON p.usuario_id = u.id WHERE p.id = ? LIMIT 1',
        [proyecto_id]
      );
      const info = Array.isArray(projInfo) && projInfo.length ? projInfo[0] : null;
      if (info && info.programa_estudio_id) {
        const [jefes] = await conn.query("SELECT id FROM usuarios WHERE rol = 'Jefe de Unidad de Investigacion' AND programa_estudio_id = ?", [info.programa_estudio_id]);
        const titleN = 'Informe Final presentado';
        const messageN = `Proyecto ${info.codigo}: ${info.titulo}`;
        for (const j of jefes) {
          await conn.query('INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, leido) VALUES (?,?,?,?,0)', [j.id, titleN, messageN, 'Evaluacion']);
        }
      }
    }
    conn.release();
    res.json({ success: true, documento_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al registrar documento' });
  }
});

// Subir archivo de documento (base64) y registrar en BD
app.post('/api/documentos_proyecto/upload', requireAuth, async (req, res) => {
  const { proyecto_id, tipo_documento = 'Perfil', nombre_archivo = null, archivo_base64 = '' } = req.body || {};
  if (!proyecto_id || !archivo_base64) {
    return res.status(400).json({ success: false, message: 'Proyecto y archivo requeridos' });
  }
  try {
    // Preparar carpeta destino
    const safeProjectId = String(proyecto_id).replace(/[^0-9]/g, '');
    const uploadsDir = path.join(__dirname, 'public', 'uploads', safeProjectId);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    // Normalizar base64 (acepta data URL o base64 puro)
    let base64 = String(archivo_base64);
    const commaIdx = base64.indexOf(',');
    if (commaIdx > -1) base64 = base64.substring(commaIdx + 1);
    // Nombre de archivo
    const ts = Date.now();
    const originalName = String(nombre_archivo || `${tipo_documento}.pdf`);
    const cleanName = originalName.replace(/[\\/:*?"<>|]+/g, '_');
    const fileName = `${ts}_${cleanName}`;
    const absPath = path.join(uploadsDir, fileName);
    const relPath = `/uploads/${safeProjectId}/${fileName}`;
    // Escribir archivo
    const buffer = Buffer.from(base64, 'base64');
    fs.writeFileSync(absPath, buffer);
    // Registrar en BD
    const conn = await pool.getConnection();
    const [result] = await conn.query(
      'INSERT INTO documentos_proyecto (proyecto_id, tipo_documento, nombre_archivo, ruta_archivo, subido_por, estado) VALUES (?,?,?,?,?,?)',
      [proyecto_id, tipo_documento, cleanName, relPath, req.user.id, 'En revision']
    );
    // Notificar a Jefe de Unidad para evaluación
    const [projInfo] = await conn.query(
      'SELECT p.codigo, p.titulo, u.programa_estudio_id FROM proyectos p INNER JOIN usuarios u ON p.usuario_id = u.id WHERE p.id = ? LIMIT 1',
      [proyecto_id]
    );
    const info = Array.isArray(projInfo) && projInfo.length ? projInfo[0] : null;
    if (info && info.programa_estudio_id) {
      const [jefes] = await conn.query("SELECT id FROM usuarios WHERE rol = 'Jefe de Unidad de Investigacion' AND programa_estudio_id = ?", [info.programa_estudio_id]);
      const titleN = tipo_documento === 'Informe Final' ? 'Informe Final presentado' : 'Perfil presentado';
      const messageN = `Proyecto ${info.codigo}: ${info.titulo}`;
      for (const j of jefes) {
        await conn.query('INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, leido) VALUES (?,?,?,?,0)', [j.id, titleN, messageN, 'Evaluacion']);
      }
    }
    conn.release();
    res.json({ success: true, documento_id: result.insertId, ruta_archivo: relPath });
  } catch (err) {
    console.error('Error en upload documento:', err);
    res.status(500).json({ success: false, message: 'Error al subir documento' });
  }
});

app.get('/api/documentos_proyecto/:proyecto_id', async (req, res) => {
  const { proyecto_id } = req.params;
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT * FROM documentos_proyecto WHERE proyecto_id = ? ORDER BY fecha_subida DESC', [proyecto_id]);
    conn.release();
    res.json({ success: true, documentos: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener documentos' });
  }
});

app.get('/api/documentos_proyecto/by-user/:usuario_id', async (req, res) => {
  const { usuario_id } = req.params;
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query(
      `SELECT d.* FROM documentos_proyecto d
       INNER JOIN proyectos p ON d.proyecto_id = p.id
       INNER JOIN integrantes_proyecto ip ON p.id = ip.proyecto_id
       WHERE ip.usuario_id = ?
       ORDER BY d.fecha_subida DESC`,
      [usuario_id]
    );
    conn.release();
    res.json({ success: true, documentos: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener documentos por usuario' });
  }
});

app.get('/api/unidad/proyectos', requireAuth, async (req, res) => {
  try {
    const jefeId = req.user.id;
    const conn = await pool.getConnection();
    const [jefeRows] = await conn.query('SELECT programa_estudio_id, rol FROM usuarios WHERE id = ? LIMIT 1', [jefeId]);
    if (!jefeRows || jefeRows.length === 0) {
      conn.release();
      return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    }
    const jefe = jefeRows[0];
    if (!String(jefe.rol || '').toLowerCase().includes('jefe')) {
      conn.release();
      return res.status(403).json({ success: false, message: 'Permisos insuficientes' });
    }
    const [rows] = await conn.query(
      `SELECT p.*, u.nombres, u.apellidos, u.programa_estudio_id
       FROM proyectos p
       INNER JOIN usuarios u ON u.id = p.usuario_id
       WHERE u.programa_estudio_id = ?
       ORDER BY p.fecha_registro DESC`,
      [jefe.programa_estudio_id]
    );
    conn.release();
    res.json({ success: true, proyectos: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener proyectos de unidad' });
  }
});

// Proyectos del programa del usuario autenticado (para docente/investigador)
app.get('/api/programa/proyectos/me', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const conn = await pool.getConnection();
    const [userRows] = await conn.query('SELECT programa_estudio_id FROM usuarios WHERE id = ? LIMIT 1', [userId]);
    if (!userRows || !userRows.length || !userRows[0].programa_estudio_id) {
      conn.release();
      return res.json({ success: true, proyectos: [] });
    }
    const programaId = userRows[0].programa_estudio_id;
    const [rows] = await conn.query(
      `SELECT p.*, u.nombres, u.apellidos
       FROM proyectos p
       INNER JOIN usuarios u ON u.id = p.usuario_id
       WHERE u.programa_estudio_id = ?
       ORDER BY p.fecha_registro DESC`,
      [programaId]
    );
    conn.release();
    res.json({ success: true, proyectos: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener proyectos del programa' });
  }
});

app.get('/api/unidad/documentos', requireAuth, async (req, res) => {
  try {
    const jefeId = req.user.id;
    const conn = await pool.getConnection();
    const [jefeRows] = await conn.query('SELECT programa_estudio_id, rol FROM usuarios WHERE id = ? LIMIT 1', [jefeId]);
    if (!jefeRows || jefeRows.length === 0) {
      conn.release();
      return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    }
    const jefe = jefeRows[0];
    if (!String(jefe.rol || '').toLowerCase().includes('jefe')) {
      conn.release();
      return res.status(403).json({ success: false, message: 'Permisos insuficientes' });
    }
    const [rows] = await conn.query(
      `SELECT d.*, p.titulo, u.nombres, u.apellidos
       FROM documentos_proyecto d
       INNER JOIN proyectos p ON d.proyecto_id = p.id
       INNER JOIN usuarios u ON p.usuario_id = u.id
       WHERE u.programa_estudio_id = ?
       ORDER BY d.fecha_subida DESC`,
      [jefe.programa_estudio_id]
    );
    conn.release();
    res.json({ success: true, documentos: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener documentos de unidad' });
  }
});

app.post('/api/evaluaciones', requireAuth, async (req, res) => {
  const { proyecto_id, tipo = 'Perfil', tabla_evaluacion = null, puntaje_total = null, condicion = null, observaciones = null } = req.body || {};
  try {
    const jefeId = req.user.id;
    const conn = await pool.getConnection();
    const [jefeRows] = await conn.query('SELECT programa_estudio_id, rol FROM usuarios WHERE id = ? LIMIT 1', [jefeId]);
    if (!jefeRows || jefeRows.length === 0) {
      conn.release();
      return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    }
    const jefe = jefeRows[0];
    if (!(String(jefe.rol || '').toLowerCase().includes('jefe') || String(jefe.rol || '').toLowerCase().includes('admin'))) {
      conn.release();
      return res.status(403).json({ success: false, message: 'Permisos insuficientes' });
    }
    const [projRows] = await conn.query('SELECT u.programa_estudio_id FROM proyectos p INNER JOIN usuarios u ON p.usuario_id = u.id WHERE p.id = ? LIMIT 1', [proyecto_id]);
    if (!projRows || projRows.length === 0) {
      conn.release();
      return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
    }
    const belongs = projRows[0].programa_estudio_id === jefe.programa_estudio_id || String(jefe.rol || '').toLowerCase().includes('admin');
    if (!belongs) {
      conn.release();
      return res.status(403).json({ success: false, message: 'Proyecto no pertenece a tu unidad' });
    }
    const [result] = await conn.query(
      'INSERT INTO evaluaciones (proyecto_id, evaluador_id, tipo, tabla_evaluacion, puntaje_total, condicion, observaciones) VALUES (?,?,?,?,?,?,?)',
      [proyecto_id, jefeId, tipo, tabla_evaluacion, puntaje_total, condicion, observaciones]
    );
    const [docRow] = await conn.query(
      'SELECT id FROM documentos_proyecto WHERE proyecto_id = ? AND tipo_documento = ? ORDER BY fecha_subida DESC LIMIT 1',
      [proyecto_id, tipo]
    );
    if (Array.isArray(docRow) && docRow.length) {
      const docId = docRow[0].id;
      if (condicion === 'Aprobado') {
        await conn.query('UPDATE documentos_proyecto SET estado = ? WHERE id = ?', ['Aprobado', docId]);
      } else if (condicion === 'Desaprobado') {
        await conn.query('UPDATE documentos_proyecto SET estado = ? WHERE id = ?', ['Rechazado', docId]);
      }
    }
    if (tipo === 'Informe Final' && condicion === 'Aprobado') {
      await conn.query("UPDATE proyectos SET estado = 'Finalizado Aprobado' WHERE id = ?", [proyecto_id]);
    }
    conn.release();
    res.json({ success: true, evaluacion_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al registrar evaluación' });
  }
});

app.get('/api/evaluaciones/by-proyecto/:proyecto_id', async (req, res) => {
  const proyecto_id = Number(req.params.proyecto_id);
  if (!proyecto_id) return res.status(400).json({ success: false, message: 'ID inválido' });
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query(
      `SELECT e.*, u.nombres AS evaluador_nombres, u.apellidos AS evaluador_apellidos
       FROM evaluaciones e
       LEFT JOIN usuarios u ON u.id = e.evaluador_id
       WHERE e.proyecto_id = ?
       ORDER BY e.fecha_evaluacion DESC`,
      [proyecto_id]
    );
    conn.release();
    res.json({ success: true, evaluaciones: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener evaluaciones' });
  }
});
app.get('/api/evaluaciones/by-user/:usuario_id', async (req, res) => {
  const usuario_id = Number(req.params.usuario_id);
  if (!usuario_id) return res.status(400).json({ success: false, message: 'ID inválido' });
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query(
      `SELECT e.*, p.titulo, p.id AS proyecto_id
       FROM evaluaciones e
       INNER JOIN proyectos p ON e.proyecto_id = p.id
       INNER JOIN integrantes_proyecto ip ON p.id = ip.proyecto_id
       WHERE ip.usuario_id = ?
       ORDER BY e.fecha_evaluacion DESC`,
      [usuario_id]
    );
    conn.release();
    res.json({ success: true, evaluaciones: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener evaluaciones por usuario' });
  }
});
app.get('/api/articulos/:usuario_id', async (req, res) => {
  const { usuario_id } = req.params;
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT a.* FROM articulos_cientificos a INNER JOIN proyectos p ON a.proyecto_id = p.id INNER JOIN integrantes_proyecto ip ON p.id = ip.proyecto_id WHERE ip.usuario_id = ?', [usuario_id]);
    conn.release();
    res.json({ success: true, articulos: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener artículos' });
  }
});

app.post('/api/articulos', requireAuth, async (req, res) => {
  const { proyecto_id, titulo = '', autores = null, resumen_es = null, palabras_clave = null } = req.body;
  try {
    const conn = await pool.getConnection();
    const [result] = await conn.query('INSERT INTO articulos_cientificos (proyecto_id, titulo, autores, resumen_es, palabras_clave, estado) VALUES (?,?,?,?,?,?)', [proyecto_id, titulo, autores, resumen_es, palabras_clave, 'En revision']);
    conn.release();
    res.json({ success: true, articulo_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al crear artículo' });
  }
});

app.get('/api/gastos/:proyecto_id', async (req, res) => {
  const { proyecto_id } = req.params;
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT * FROM gastos WHERE proyecto_id = ?', [proyecto_id]);
    conn.release();
    res.json({ success: true, gastos: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener gastos' });
  }
});

app.post('/api/gastos', requireAuth, async (req, res) => {
  const { proyecto_id, concepto = '', monto = 0, fecha = null, comprobante = null } = req.body;
  try {
    const conn = await pool.getConnection();
    const [result] = await conn.query('INSERT INTO gastos (proyecto_id, concepto, monto, fecha, comprobante) VALUES (?,?,?,?,?)', [proyecto_id, concepto, monto, fecha, comprobante]);
    conn.release();
    res.json({ success: true, gasto_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al registrar gasto' });
  }
});

app.get('/api/presupuestos/:proyecto_id', async (req, res) => {
  const { proyecto_id } = req.params;
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT * FROM presupuestos WHERE proyecto_id = ?', [proyecto_id]);
    conn.release();
    res.json({ success: true, presupuestos: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener presupuestos' });
  }
});

app.get('/api/notificaciones/:usuario_id', async (req, res) => {
  const { usuario_id } = req.params;
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT * FROM notificaciones WHERE usuario_id = ? ORDER BY fecha_envio DESC', [usuario_id]);
    conn.release();
    res.json({ success: true, notificaciones: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener notificaciones por usuario' });
  }
});

app.get('/api/admin/stats', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [uTotal] = await conn.query('SELECT COUNT(*) as total FROM usuarios');
    const [uActive] = await conn.query("SELECT COUNT(*) as total FROM usuarios WHERE estado = 'Activo'");
    const [uInactive] = await conn.query("SELECT COUNT(*) as total FROM usuarios WHERE estado = 'Inactivo'");
    const [prog] = await conn.query('SELECT COUNT(*) as total FROM programas_estudio');
    const [lines] = await conn.query('SELECT COUNT(*) as total FROM lineas_investigacion');
    const [deps] = await conn.query('SELECT COUNT(DISTINCT programa_estudio_id) as total FROM usuarios WHERE programa_estudio_id IS NOT NULL');
    const [projTypes] = await conn.query('SELECT COUNT(DISTINCT tipo) as total FROM proyectos');
    const [logs] = await conn.query('SELECT COUNT(*) as total FROM notificaciones');
    const [unread] = await conn.query('SELECT COUNT(*) as total FROM notificaciones WHERE leido = 0');
    conn.release();
    res.json({
      success: true,
      stats: {
        totalUsers: (uTotal[0] && uTotal[0].total) || 0,
        activeUsers: (uActive[0] && uActive[0].total) || 0,
        inactiveUsers: (uInactive[0] && uInactive[0].total) || 0,
        pendingApprovals: (uInactive[0] && uInactive[0].total) || 0,
        programsCount: (prog[0] && prog[0].total) || 0,
        researchLinesCount: (lines[0] && lines[0].total) || 0,
        departmentsCount: (deps[0] && deps[0].total) || 0,
        projectTypesCount: (projTypes[0] && projTypes[0].total) || 0,
        systemLogs: (logs[0] && logs[0].total) || 0,
        unreadNotifications: (unread[0] && unread[0].total) || 0,
        activeSessions: 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas de administración' });
  }
});

app.get('/api/admin/alerts', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query(
      "SELECT id, titulo, mensaje, tipo, leido, fecha_envio FROM notificaciones ORDER BY fecha_envio DESC LIMIT 10"
    );
    conn.release();

    const alerts = rows.map(r => ({
      id: r.id,
      title: r.titulo,
      message: r.mensaje,
      type: r.tipo,
      read: !!r.leido,
      date: r.fecha_envio
    }));

    res.json({ success: true, alerts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener alertas' });
  }
});

app.post('/api/admin/alerts/mark-all-read', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [result] = await conn.query('UPDATE notificaciones SET leido = 1 WHERE leido = 0');
    conn.release();
    res.json({ success: true, updated: (result && result.affectedRows) || 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al marcar alertas como leídas' });
  }
});

app.get('/api/admin/pending-requests', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query(
      "SELECT id, nombres, apellidos, correo_institucional, rol, fecha_registro FROM usuarios WHERE estado = 'Inactivo' ORDER BY fecha_registro DESC"
    );
    conn.release();
    const requests = rows.map(r => ({
      id: r.id,
      name: `${r.nombres} ${r.apellidos}`,
      email: r.correo_institucional,
      role: r.rol,
      date: (new Date(r.fecha_registro)).toISOString().slice(0, 10),
      status: 'Pendiente'
    }));
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener solicitudes pendientes' });
  }
});

app.post('/api/admin/requests/:id/approve', async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: 'ID inválido' });
  try {
    const conn = await pool.getConnection();
    const [result] = await conn.query(
      "UPDATE usuarios SET estado = 'Activo' WHERE id = ? AND estado = 'Inactivo'",
      [id]
    );
    conn.release();

    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada o ya fue procesada' });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al aprobar solicitud' });
  }
});

app.post('/api/admin/requests/:id/reject', async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: 'ID inválido' });
  try {
    const conn = await pool.getConnection();
    const [result] = await conn.query(
      "DELETE FROM usuarios WHERE id = ? AND estado = 'Inactivo'",
      [id]
    );
    conn.release();

    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada o ya fue procesada' });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al rechazar solicitud' });
  }
});

app.post('/api/admin/requests/approve-batch', async (req, res) => {
  const ids = Array.isArray(req.body && req.body.ids) ? req.body.ids : [];
  const cleanIds = ids.map(n => Number(n)).filter(n => Number.isInteger(n) && n > 0);
  if (cleanIds.length === 0) return res.status(400).json({ success: false, message: 'Lista de IDs inválida' });

  try {
    const conn = await pool.getConnection();
    const [result] = await conn.query(
      `UPDATE usuarios SET estado = 'Activo' WHERE estado = 'Inactivo' AND id IN (${cleanIds.map(() => '?').join(',')})`,
      cleanIds
    );
    conn.release();
    res.json({ success: true, updated: (result && result.affectedRows) || 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al aprobar solicitudes' });
  }
});

app.get('/api/exposiciones', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT * FROM exposiciones ORDER BY fecha DESC');
    conn.release();
    res.json({ success: true, exposiciones: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener exposiciones' });
  }
});

app.post('/api/inscripciones_exposicion', requireAuth, async (req, res) => {
  const { exposicion_id, proyecto_id } = req.body;
  try {
    const conn = await pool.getConnection();
    const [result] = await conn.query('INSERT INTO inscripciones_exposicion (exposicion_id, proyecto_id) VALUES (?,?)', [exposicion_id, proyecto_id]);
    conn.release();
    res.json({ success: true, inscripcion_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al inscribirse en exposición' });
  }
});

// Ruta para obtener todos los usuarios (solo Admin)
app.get('/api/usuarios', async (req, res) => {
    try {
        const { rol, estado, q } = req.query;
        const conn = await pool.getConnection();

        const where = [];
        const params = [];

        if (rol && String(rol).trim() !== '') {
            where.push('rol = ?');
            params.push(String(rol).trim());
        }

        if (estado && String(estado).trim() !== '') {
            where.push('estado = ?');
            params.push(String(estado).trim());
        }

        if (q && String(q).trim() !== '') {
            where.push('(nombres LIKE ? OR apellidos LIKE ? OR correo_institucional LIKE ?)');
            const like = `%${String(q).trim()}%`;
            params.push(like, like, like);
        }

        const whereSql = where.length > 0 ? ` WHERE ${where.join(' AND ')}` : '';
        const sql = `SELECT id, nombres, apellidos, correo_institucional, rol, estado FROM usuarios${whereSql} ORDER BY apellidos, nombres`;
        const [usuarios] = await conn.query(sql, params);
        conn.release();

        res.json({ success: true, usuarios });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

app.get('/api/usuarios/id/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ success: false, message: 'ID inválido' });
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query(
      'SELECT id, dni, nombres, apellidos, correo_institucional, telefono, programa_estudio_id, rol, estado FROM usuarios WHERE id = ? LIMIT 1',
      [id]
    );
    conn.release();
    const usuario = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    if (!usuario) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    res.json({ success: true, data: usuario });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al obtener usuario' });
  }
});

app.post('/api/usuarios', async (req, res) => {
  const body = req.body || {};
  const required = ['dni', 'nombres', 'apellidos', 'correo_institucional', 'rol', 'password'];
  const missing = required.filter(k => !String(body[k] || '').trim());
  if (missing.length) return res.status(400).json({ success: false, message: `Campos requeridos: ${missing.join(', ')}` });

  try {
    const conn = await pool.getConnection();
    const [exists] = await conn.query('SELECT id FROM usuarios WHERE correo_institucional = ? LIMIT 1', [String(body.correo_institucional).trim()]);
    if (Array.isArray(exists) && exists.length > 0) {
      conn.release();
      return res.status(409).json({ success: false, message: 'Ya existe un usuario con ese correo institucional' });
    }

    const passwordHash = crypto.createHash('sha256').update(String(body.password)).digest('hex');
    const estado = body.estado ? String(body.estado).trim() : 'Activo';

    const [result] = await conn.query(
      `INSERT INTO usuarios (dni, nombres, apellidos, correo_institucional, telefono, programa_estudio_id, rol, estado, password, fecha_registro)
       VALUES (?,?,?,?,?,?,?,?,?, NOW())`,
      [
        String(body.dni).trim(),
        String(body.nombres).trim(),
        String(body.apellidos).trim(),
        String(body.correo_institucional).trim(),
        body.telefono ? String(body.telefono).trim() : null,
        body.programa_estudio_id || null,
        String(body.rol).trim(),
        estado,
        passwordHash
      ]
    );

    const insertedId = result && result.insertId ? result.insertId : null;
    const [rows] = await conn.query(
      'SELECT id, dni, nombres, apellidos, correo_institucional, telefono, programa_estudio_id, rol, estado FROM usuarios WHERE id = ? LIMIT 1',
      [insertedId]
    );
    conn.release();
    res.json({ success: true, data: (rows && rows[0]) || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al crear usuario' });
  }
});

app.put('/api/usuarios/id/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ success: false, message: 'ID inválido' });
  const body = req.body || {};

  try {
    const conn = await pool.getConnection();
    const [rowsUser] = await conn.query('SELECT id, correo_institucional FROM usuarios WHERE id = ? LIMIT 1', [id]);
    const current = Array.isArray(rowsUser) && rowsUser.length > 0 ? rowsUser[0] : null;
    if (!current) {
      conn.release();
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    if (body.correo_institucional && String(body.correo_institucional).trim() !== String(current.correo_institucional).trim()) {
      const [exists] = await conn.query('SELECT id FROM usuarios WHERE correo_institucional = ? LIMIT 1', [String(body.correo_institucional).trim()]);
      if (Array.isArray(exists) && exists.length > 0) {
        conn.release();
        return res.status(409).json({ success: false, message: 'Ya existe un usuario con ese correo institucional' });
      }
    }

    const sets = [];
    const params = [];
    const allowed = ['dni', 'nombres', 'apellidos', 'correo_institucional', 'telefono', 'programa_estudio_id', 'rol', 'estado'];
    allowed.forEach(k => {
      if (Object.prototype.hasOwnProperty.call(body, k)) {
        sets.push(`${k} = ?`);
        params.push(body[k] === '' ? null : body[k]);
      }
    });

    if (body.password) {
      sets.push('password = ?');
      params.push(crypto.createHash('sha256').update(String(body.password)).digest('hex'));
    }

    if (sets.length > 0) {
      params.push(id);
      await conn.query(`UPDATE usuarios SET ${sets.join(', ')} WHERE id = ?`, params);
    }

    const [rows] = await conn.query(
      'SELECT id, dni, nombres, apellidos, correo_institucional, telefono, programa_estudio_id, rol, estado FROM usuarios WHERE id = ? LIMIT 1',
      [id]
    );
    conn.release();
    res.json({ success: true, data: (rows && rows[0]) || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al actualizar usuario' });
  }
});

app.patch('/api/usuarios/id/:id/estado', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ success: false, message: 'ID inválido' });
  const estado = req.body && req.body.estado ? String(req.body.estado).trim() : '';
  if (!estado || !['Activo', 'Inactivo', 'Pendiente'].includes(estado)) {
    return res.status(400).json({ success: false, message: 'Estado inválido (Activo, Inactivo, Pendiente)' });
  }
  try {
    const conn = await pool.getConnection();
    const [result] = await conn.query('UPDATE usuarios SET estado = ? WHERE id = ?', [estado, id]);
    if (!result || result.affectedRows === 0) {
      conn.release();
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    const [rows] = await conn.query(
      'SELECT id, dni, nombres, apellidos, correo_institucional, telefono, programa_estudio_id, rol, estado FROM usuarios WHERE id = ? LIMIT 1',
      [id]
    );
    conn.release();
    res.json({ success: true, data: (rows && rows[0]) || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al actualizar estado' });
  }
});

app.delete('/api/usuarios/id/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ success: false, message: 'ID inválido' });
  try {
    const conn = await pool.getConnection();
    const [result] = await conn.query('DELETE FROM usuarios WHERE id = ?', [id]);
    conn.release();
    if (!result || result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    res.json({ success: true, deleted: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al eliminar usuario' });
  }
});

// Ruta para obtener programas de estudio
app.get('/api/programas', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const [programas] = await conn.query('SELECT * FROM programas_estudio');
        conn.release();

        res.json({ success: true, programas });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener programas' });
    }
});

// Ruta para obtener líneas de investigación
app.get('/api/lineas/:programa_id', async (req, res) => {
    const { programa_id } = req.params;

    try {
        const conn = await pool.getConnection();
        const [lineas] = await conn.query(
            'SELECT * FROM lineas_investigacion WHERE programa_estudio_id = ?',
            [programa_id]
        );
        conn.release();

        res.json({ success: true, lineas });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener líneas' });
    }
});

// Catálogos (para el dashboard admin)
app.get('/api/catalogos/programas', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT id, nombre, estado FROM programas_estudio ORDER BY nombre');
    conn.release();
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener programas' });
  }
});

app.get('/api/catalogos/lineas', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query(
      `SELECT l.id, l.nombre, l.estado, l.programa_estudio_id, p.nombre AS programa
       FROM lineas_investigacion l
       LEFT JOIN programas_estudio p ON p.id = l.programa_estudio_id
       ORDER BY p.nombre, l.nombre`
    );
    conn.release();
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener líneas' });
  }
});

app.get('/api/catalogos/departamentos', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query(
      `SELECT p.id, p.nombre, p.estado, COUNT(u.id) AS usuarios
       FROM programas_estudio p
       LEFT JOIN usuarios u ON u.programa_estudio_id = p.id
       GROUP BY p.id, p.nombre, p.estado
       ORDER BY p.nombre`
    );
    conn.release();
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener departamentos' });
  }
});

app.get('/api/catalogos/tipos-proyecto', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT DISTINCT tipo FROM proyectos ORDER BY tipo');
    conn.release();
    res.json({ success: true, data: rows.map(r => ({ tipo: r.tipo })) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener tipos de proyecto' });
  }
});

// Rutas de API
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Ruta para servir el inicio de sesión (en español)
app.get('/inicio-sesion', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/inicio_sesion.html'));
});

// Compatibilidad: redirigir /login a /inicio-sesion
app.get('/login', (req, res) => {
    res.redirect('/inicio-sesion');
});

// Redirigir raíz a /inicio-sesion
app.get('/', (req, res) => {
    res.redirect('/inicio-sesion');
});

// Rutas HTML de dashboard
app.get('/dashboard/docente', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/dashboard/docente-investigador.html'));
});

app.get('/dashboard/jefe-unidad', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/dashboard/jefe-unidad.html'));
});

app.get('/dashboard/director', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/dashboard/director.html'));
});

app.get('/dashboard/comite-editor', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/dashboard/comite-editor.html'));
});

app.get('/dashboard/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/dashboard/admin.html'));
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

// Iniciar servidor con fallback de puerto si está en uso
function startServer(startPort, retries = 10) {
  const selectedPort = Number(startPort);
  const server = app.listen(selectedPort, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${selectedPort}`);
    console.log(`📁 Entorno: ${process.env.NODE_ENV || 'development'}`);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE' && retries > 0) {
      const nextPort = selectedPort + 1;
      console.warn(`⚠️ Puerto ${selectedPort} en uso. Intentando ${nextPort}...`);
      startServer(nextPort, retries - 1);
    } else {
      console.error('❌ Error al iniciar servidor:', err);
      process.exit(1);
    }
  });
}

startServer(PORT);

/*escribe este primer commit para este proyecto*/
