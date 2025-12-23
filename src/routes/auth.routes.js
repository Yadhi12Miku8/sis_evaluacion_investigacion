const express = require('express');
const AuthController = require('../controllers/Auth.controller');

const router = express.Router();

router.post('/login', (req, res) => AuthController.login(req, res));
router.get('/verify', (req, res) => AuthController.verify(req, res));
router.post('/logout', (req, res) => AuthController.logout(req, res));

module.exports = router;