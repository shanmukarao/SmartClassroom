const express = require('express');
const router = express.Router();
const continuityController = require('../controllers/continuityController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

router.post('/', authorizeRoles('teacher'), continuityController.createPackage);
router.get('/class/:classId', continuityController.getPackagesForClass);
router.get('/package/:packageId', continuityController.getPackageDetails);
router.post('/task/:taskId/toggle', authorizeRoles('student'), continuityController.toggleTaskCompletion);

module.exports = router;
