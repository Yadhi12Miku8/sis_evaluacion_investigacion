const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');

// Middleware de autenticación para todas las rutas de dashboard
router.use(authMiddleware.verifyToken);

// Dashboard para Docente Investigador
router.get('/docente', authMiddleware.checkRole(['Docente Investigador']), (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenido al Dashboard de Docente Investigador',
    user: req.user,
    data: {
      proyectos: [],
      investigaciones: [],
      estadisticas: {}
    }
  });
});

// Dashboard para Jefe de Unidad
router.get('/jefe-unidad', authMiddleware.checkRole(['Jefe de Unidad de Investigacion']), (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenido al Dashboard de Jefe de Unidad',
    user: req.user,
    data: {
      unidad: {},
      proyectos: [],
      docentes: [],
      reportes: {}
    }
  });
});

// Dashboard para Director General
router.get('/director', authMiddleware.checkRole(['Director General']), (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenido al Dashboard de Director General',
    user: req.user,
    data: {
      sistema: {},
      unidades: [],
      reportesGenerales: {},
      estadisticas: {}
    }
  });
});

// Dashboard para Comité Editor
router.get('/comite-editor', authMiddleware.checkRole(['Comite Editor']), (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenido al Dashboard de Comité Editor',
    user: req.user,
    data: {
      investigacionesPorRevisar: [],
      historialRevisiones: [],
      metricas: {}
    }
  });
});

// Dashboard para Administrador
router.get('/admin', authMiddleware.checkRole(['Administrador']), (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenido al Dashboard de Administrador',
    user: req.user,
    data: {
      usuarios: [],
      configuraciones: {},
      logs: [],
      backup: {}
    }
  });
});

module.exports = router;