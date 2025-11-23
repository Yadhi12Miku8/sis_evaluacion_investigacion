const express = require('express');
const path = require('path');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

router.post('/login', authController.login);
router.get('/logout', authController.logout);

module.exports = router;