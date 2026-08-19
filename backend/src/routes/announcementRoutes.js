const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', announcementController.getAnnouncements);
router.post('/', authorizeRoles('teacher'), announcementController.createAnnouncement);

module.exports = router;
