const express = require('express');
const router = express.Router();
const path = require('path');
const auth = require('../middlewares/auth');

// Dashboard de docente
router.get('/docente', auth(['DOCENTE_INVESTIGADOR']), (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard/docente.html'));
});

// Dashboard de jefe
router.get('/jefe', auth(['JEFE_INVESTIGACION']), (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard/jefe.html'));
});

// Dashboard de director
router.get('/director', auth(['DIRECTOR_GENERAL']), (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard/director.html'));
});

// Dashboard de editor
router.get('/editor', auth(['COMITE_EDITOR']), (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard/editor.html'));
});

module.exports = router;