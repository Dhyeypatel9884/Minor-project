const express = require('express');
const router = express.Router();
const { getDashboardStats, getPlatformUsers, getPlatformProjects, cancelProject, approveUser, removeUser, deleteProject, toggleBlockUser } = require('../controllers/adminController');
const { getReports, resolveReport, adminMessageProject } = require('../controllers/reportController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.use(adminOnly);

router.get('/stats', getDashboardStats);
router.get('/users', getPlatformUsers);
router.get('/projects', getPlatformProjects);
router.put('/projects/:id/cancel', cancelProject);
router.delete('/projects/:id', deleteProject);
router.put('/users/:id/approve', approveUser);
router.put('/users/:id/block', toggleBlockUser);
router.delete('/users/:id', removeUser);

// Dispute / Moderation routes
router.get('/reports', getReports);
router.put('/reports/:id/resolve', resolveReport);
router.post('/messages', adminMessageProject);

module.exports = router;
