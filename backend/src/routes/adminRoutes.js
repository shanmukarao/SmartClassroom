const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken, authorizeRoles('admin'));

// Dashboard
router.get('/dashboard', adminController.getAdminDashboard);

// User Management
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Subjects Management
router.get('/subjects', adminController.getSubjects);
router.post('/subjects', adminController.createSubject);
router.put('/subjects/:id', adminController.updateSubject);
router.delete('/subjects/:id', adminController.deleteSubject);

// Classes Management
router.get('/classes', adminController.getClasses);
router.post('/classes', adminController.createClass);
router.put('/classes/:id', adminController.updateClass);
router.delete('/classes/:id', adminController.deleteClass);

// Class Enrollments
router.get('/classes/:classId/enrollments', adminController.getClassEnrollments);
router.post('/classes/:classId/enrollments', adminController.enrollStudent);
router.delete('/enrollments/:enrollmentId', adminController.unenrollStudent);

// Classrooms Management
router.get('/classrooms', adminController.getClassrooms);
router.post('/classrooms', adminController.createClassroom);
router.put('/classrooms/:id', adminController.updateClassroom);
router.delete('/classrooms/:id', adminController.deleteClassroom);

module.exports = router;
