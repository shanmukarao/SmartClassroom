const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/demo-login', authController.demoLogin);
router.get('/users-by-role/:role', authController.getUsersByRole);
router.get('/me', authenticateToken, authController.getCurrentUser);

module.exports = router;
