const express = require('express');
const router = express.Router();
const {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require('../controllers/projectController');
const { getProjectTasks, createTask } = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');
const { loadProjectAndCheckAccess } = require('../middleware/projectAccess');
const { createProjectRules, updateProjectRules } = require('../validators/projectValidators');
const { createTaskRules } = require('../validators/taskValidators');
const validate = require('../middleware/validate');

router.use(protect);

router.get('/', getProjects);
router.post('/', authorize('admin', 'project_manager'), createProjectRules, validate, createProject);

router.get('/:id', loadProjectAndCheckAccess, getProjectById);
router.put('/:id', loadProjectAndCheckAccess, updateProjectRules, validate, updateProject);
router.delete('/:id', loadProjectAndCheckAccess, deleteProject);

router.post('/:id/members', loadProjectAndCheckAccess, authorize('admin', 'project_manager'), addMember);
router.delete('/:id/members/:userId', loadProjectAndCheckAccess, authorize('admin', 'project_manager'), removeMember);

// Nested task routes
router.get('/:projectId/tasks', loadProjectAndCheckAccess, getProjectTasks);
router.post('/:projectId/tasks', loadProjectAndCheckAccess, createTaskRules, validate, createTask);

module.exports = router;