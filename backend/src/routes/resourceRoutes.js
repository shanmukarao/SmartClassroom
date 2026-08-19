const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', resourceController.getResources);
router.post('/', authorizeRoles('teacher'), resourceController.createResource);
router.delete('/:id', authorizeRoles('teacher'), resourceController.deleteResource);

module.exports = router;
