const db = require('../database/connection');

class DashboardController {
  async docente(req, res) {
    try {
      const userId = req.user.id;
      const proyectos = await db.query(
        `SELECT p.*
         FROM proyectos p
         INNER JOIN integrantes_proyecto ip ON p.id = ip.proyecto_id
         WHERE ip.usuario_id = ?
         ORDER BY p.fecha_registro DESC`,
        [userId]
      );
      const articulos = await db.query(
        `SELECT a.*
         FROM articulos_cientificos a
         INNER JOIN proyectos p ON a.proyecto_id = p.id
         INNER JOIN integrantes_proyecto ip ON p.id = ip.proyecto_id
         WHERE ip.usuario_id = ?
         ORDER BY a.id DESC`,
        [userId]
      );
      const documentos = await db.query(
        `SELECT d.*
         FROM documentos_proyecto d
         INNER JOIN proyectos p ON d.proyecto_id = p.id
         INNER JOIN integrantes_proyecto ip ON p.id = ip.proyecto_id
         WHERE ip.usuario_id = ?
         ORDER BY d.fecha_subida DESC`,
        [userId]
      );
      const estadisticas = {
        proyectosActivos: proyectos.filter(p => p.estado === 'En Ejecucion').length,
        proyectosCompletados: proyectos.filter(p => p.estado === 'Finalizado Aprobado').length,
        articulos: articulos.length,
        avancesPendientes: documentos.filter(d => d.estado === 'En revision').length
      };
      res.json({
        success: true,
        user: req.user,
        data: { proyectos, articulos, documentos, estadisticas }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al cargar dashboard de docente' });
    }
  }

  async jefeUnidad(req, res) {
    try {
      const programaId = req.user.programaEstudioId;
      const unidad = await db.query(
        'SELECT id, nombre, estado FROM programas_estudio WHERE id = ? LIMIT 1',
        [programaId]
      );
      const proyectos = await db.query(
        `SELECT p.*, u.nombres, u.apellidos
         FROM proyectos p
         INNER JOIN usuarios u ON u.id = p.usuario_id
         WHERE u.programa_estudio_id = ?
         ORDER BY p.fecha_registro DESC`,
        [programaId]
      );
      const docentes = await db.query(
        `SELECT id, nombres, apellidos, correo_institucional, rol, estado
         FROM usuarios
         WHERE programa_estudio_id = ?
         ORDER BY apellidos, nombres`,
        [programaId]
      );
      const informesPendientes = await db.query(
        `SELECT d.*
         FROM documentos_proyecto d
         INNER JOIN proyectos p ON d.proyecto_id = p.id
         INNER JOIN usuarios u ON p.usuario_id = u.id
         WHERE u.programa_estudio_id = ? AND d.tipo_documento = 'Informe Final' AND d.estado = 'En revision'
         ORDER BY d.fecha_subida DESC`,
        [programaId]
      );
      const perfilesPendientes = await db.query(
        `SELECT d.*
         FROM documentos_proyecto d
         INNER JOIN proyectos p ON d.proyecto_id = p.id
         INNER JOIN usuarios u ON p.usuario_id = u.id
         WHERE u.programa_estudio_id = ? AND d.tipo_documento = 'Perfil' AND d.estado = 'En revision'
         ORDER BY d.fecha_subida DESC`,
        [programaId]
      );
      const estadisticas = {
        proyectosActivos: proyectos.filter(p => p.estado === 'En Ejecucion').length,
        proyectosAtrasados: 0,
        proyectosCompletados: proyectos.filter(p => p.estado === 'Finalizado Aprobado').length,
        evaluacionesPendientes: perfilesPendientes.length + informesPendientes.length
      };
      res.json({
        success: true,
        user: req.user,
        data: {
          unidad: unidad && unidad[0] ? unidad[0] : {},
          proyectos,
          docentes,
          reportes: { perfilesPendientes, informesPendientes },
          estadisticas
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al cargar dashboard de jefe de unidad' });
    }
  }

  async director(req, res) {
    try {
      const totalUsuarios = await db.query('SELECT COUNT(*) as total FROM usuarios');
      const totalProyectos = await db.query('SELECT COUNT(*) as total FROM proyectos');
      const unidades = await db.query('SELECT id, nombre, estado FROM programas_estudio ORDER BY nombre');
      const proyectosPorUnidad = await db.query(
        `SELECT u.programa_estudio_id AS unidad_id, COUNT(p.id) AS total
         FROM proyectos p
         INNER JOIN usuarios u ON u.id = p.usuario_id
         GROUP BY u.programa_estudio_id`
      );
      const estadisticas = {
        usuarios: totalUsuarios[0] ? totalUsuarios[0].total : 0,
        proyectos: totalProyectos[0] ? totalProyectos[0].total : 0,
        unidades: unidades.length,
        proyectosPorUnidad
      };
      res.json({
        success: true,
        user: req.user,
        data: { sistema: {}, unidades, reportesGenerales: {}, estadisticas }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al cargar dashboard de director' });
    }
  }

  async comiteEditor(req, res) {
    try {
      const pendientesArticulos = await db.query(
        `SELECT a.*, p.titulo AS proyecto_titulo
         FROM articulos_cientificos a
         LEFT JOIN proyectos p ON a.proyecto_id = p.id
         WHERE a.estado = 'En revision'
         ORDER BY a.id DESC`
      );
      const informesPendientes = await db.query(
        `SELECT d.*, p.titulo AS proyecto_titulo
         FROM documentos_proyecto d
         LEFT JOIN proyectos p ON d.proyecto_id = p.id
         WHERE d.tipo_documento = 'Informe Final' AND d.estado = 'En revision'
         ORDER BY d.fecha_subida DESC`
      );
      const historial = await db.query(
        `SELECT a.*, p.titulo AS proyecto_titulo
         FROM articulos_cientificos a
         LEFT JOIN proyectos p ON a.proyecto_id = p.id
         WHERE a.estado IN ('Aprobado','Rechazado')
         ORDER BY a.id DESC
         LIMIT 50`
      );
      const metricas = {
        pendientes: pendientesArticulos.length + informesPendientes.length,
        aprobados: historial.filter(h => h.estado === 'Aprobado').length,
        rechazados: historial.filter(h => h.estado === 'Rechazado').length
      };
      res.json({
        success: true,
        user: req.user,
        data: {
          investigacionesPorRevisar: pendientesArticulos,
          informesPorRevisar: informesPendientes,
          historialRevisiones: historial,
          metricas
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al cargar dashboard de comité editor' });
    }
  }

  async admin(req, res) {
    try {
      const totalUsers = await db.query('SELECT COUNT(*) as total FROM usuarios');
      const activeUsers = await db.query("SELECT COUNT(*) as total FROM usuarios WHERE estado = 'Activo'");
      const inactiveUsers = await db.query("SELECT COUNT(*) as total FROM usuarios WHERE estado = 'Inactivo'");
      const programsCount = await db.query('SELECT COUNT(*) as total FROM programas_estudio');
      const researchLinesCount = await db.query('SELECT COUNT(*) as total FROM lineas_investigacion');
      const departmentsCount = await db.query('SELECT COUNT(DISTINCT programa_estudio_id) as total FROM usuarios WHERE programa_estudio_id IS NOT NULL');
      const projectTypesCount = await db.query('SELECT COUNT(DISTINCT tipo) as total FROM proyectos');
      const systemLogs = await db.query('SELECT COUNT(*) as total FROM notificaciones');
      const unreadNotifications = await db.query('SELECT COUNT(*) as total FROM notificaciones WHERE leido = 0');
      res.json({
        success: true,
        user: req.user,
        data: {
          usuarios: [],
          configuraciones: {},
          logs: [],
          backup: {},
          stats: {
            totalUsers: totalUsers[0] ? totalUsers[0].total : 0,
            activeUsers: activeUsers[0] ? activeUsers[0].total : 0,
            inactiveUsers: inactiveUsers[0] ? inactiveUsers[0].total : 0,
            pendingApprovals: inactiveUsers[0] ? inactiveUsers[0].total : 0,
            programsCount: programsCount[0] ? programsCount[0].total : 0,
            researchLinesCount: researchLinesCount[0] ? researchLinesCount[0].total : 0,
            departmentsCount: departmentsCount[0] ? departmentsCount[0].total : 0,
            projectTypesCount: projectTypesCount[0] ? projectTypesCount[0].total : 0,
            systemLogs: systemLogs[0] ? systemLogs[0].total : 0,
            unreadNotifications: unreadNotifications[0] ? unreadNotifications[0].total : 0,
            activeSessions: 0
          }
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al cargar dashboard de administrador' });
    }
  }
}

module.exports = new DashboardController();
