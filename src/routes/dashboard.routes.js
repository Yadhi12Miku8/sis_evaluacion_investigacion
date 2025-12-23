const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const DashboardController = require('../controllers/Dashboard.controller');

// Middleware de autenticación para todas las rutas de dashboard
router.use(authMiddleware.verifyToken);

// Dashboard para Docente Investigador
router.get('/docente', authMiddleware.checkRole(['Docente Investigador']), (req, res) => DashboardController.docente(req, res));

// Dashboard para Jefe de Unidad
router.get('/jefe-unidad', authMiddleware.checkRole(['Jefe de Unidad de Investigacion']), (req, res) => DashboardController.jefeUnidad(req, res));

// Dashboard para Director General
router.get('/director', authMiddleware.checkRole(['Director General']), (req, res) => DashboardController.director(req, res));

// Dashboard para Comité Editor
router.get('/comite-editor', authMiddleware.checkRole(['Comite Editor']), (req, res) => DashboardController.comiteEditor(req, res));

// Dashboard para Administrador
router.get('/admin', authMiddleware.checkRole(['Administrador']), (req, res) => DashboardController.admin(req, res));

module.exports = router;
