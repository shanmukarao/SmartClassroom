const express = require('express');
const router = express.Router();
const helpController = require('../controllers/helpController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

router.post('/', authorizeRoles('student'), helpController.createHelpRequest);
router.get('/student', authorizeRoles('student'), helpController.getStudentHelpRequests);
router.get('/teacher-insights', authorizeRoles('teacher'), helpController.getTeacherHelpInsights);
router.put('/:requestId/status', authorizeRoles('teacher'), helpController.updateHelpRequestStatus);
router.get('/topics/class/:classId', helpController.getTopicsForClass);

module.exports = router;
