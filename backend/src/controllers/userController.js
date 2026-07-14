const asyncHandler = require('express-async-handler');
const { User } = require('../models');
const logActivity = require('../utils/logActivity');

// @desc List all users (paginated, searchable)
// @route GET /api/users
// @access Admin
const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const { Op } = require('sequelize');

  const where = {};
  if (req.query.role) where.role = req.query.role;
  if (req.query.search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${req.query.search}%` } },
      { email: { [Op.like]: `%${req.query.search}%` } },
    ];
  }

  const { rows, count } = await User.findAndCountAll({
    where,
    limit,
    offset: (page - 1) * limit,
    order: [['created_at', 'DESC']],
  });

  res.json({
    success: true,
    data: rows,
    pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  });
});

// @desc Create a user with any role (admin-only user provisioning)
// @route POST /api/users
// @access Admin
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    res.status(409);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({ name, email, password, role: role || 'team_member' });
  await logActivity({ userId: req.user.id, action: 'create_user', entityType: 'User', entityId: user.id });

  res.status(201).json({ success: true, data: user });
});

// @desc Get single user
// @route GET /api/users/:id
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, data: user });
});

// @desc Update a user's role, status, or profile info
// @route PUT /api/users/:id
// @access Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { name, role, status, password } = req.body;
  if (name !== undefined) user.name = name;
  if (role !== undefined) user.role = role;
  if (status !== undefined) user.status = status;
  if (password) user.password = password;

  await user.save();
  await logActivity({ userId: req.user.id, action: 'update_user', entityType: 'User', entityId: user.id });

  res.json({ success: true, data: user });
});

// @desc Delete a user
// @route DELETE /api/users/:id
// @access Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (user.id === req.user.id) {
    res.status(400);
    throw new Error('You cannot delete your own account');
  }

  await user.destroy();
  await logActivity({ userId: req.user.id, action: 'delete_user', entityType: 'User', entityId: req.params.id });

  res.json({ success: true, message: 'User deleted' });
});

module.exports = { getUsers, createUser, getUserById, updateUser, deleteUser };