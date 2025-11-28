const express = require('express');
const path = require('path');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.get('/docente.html', authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard/docente.html'));
});

router.get('/jefe.html', authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard/jefe.html'));
});

router.get('/director.html', authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard/director.html'));
});

router.get('/editor.html', authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard/editor.html'));
});

module.exports = router;