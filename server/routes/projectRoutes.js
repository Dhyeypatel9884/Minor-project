const express = require('express');
const router = express.Router();
const { getProjects, getProject, createProject, getMyProjects, updateProject, deleteProject, submitProjectWork, approveProjectWork } = require('../controllers/projectController');
const { createReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public — order matters: specific routes before parameterized ones
router.get('/', getProjects);
router.get('/client/my-projects', protect, getMyProjects);

// POST — private
router.post('/', protect, upload.single('image'), createProject);

// Parameterized — must come AFTER specific named routes
router.get('/:id', getProject);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);
router.post('/:projectId/report', protect, createReport);
router.post('/:id/submit', protect, submitProjectWork);
router.put('/:id/approve', protect, approveProjectWork);

module.exports = router;
