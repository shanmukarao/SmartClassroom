const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken, authorizeRoles('student'));

router.get('/dashboard', studentController.getStudentDashboard);
router.get('/classes', studentController.getStudentClasses);
router.get('/preferences', studentController.getPreferences);
router.put('/preferences', studentController.updatePreferences);

module.exports = router;
