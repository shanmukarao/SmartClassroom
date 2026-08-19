const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken, authorizeRoles('teacher'));

router.get('/dashboard', teacherController.getTeacherDashboard);
router.get('/classes', teacherController.getAssignedClasses);
router.put('/signals/:signalId', teacherController.updateSupportSignalStatus);

module.exports = router;
