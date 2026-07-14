const express = require('express');
const router = express.Router();
const { getUsers, createUser, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { registerRules } = require('../validators/authValidators');
const validate = require('../middleware/validate');

router.use(protect);

router.get('/', authorize('admin', 'project_manager'), getUsers); // PM needs this to pick members
router.post('/', authorize('admin'), registerRules, validate, createUser);
router.get('/:id', authorize('admin'), getUserById);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;