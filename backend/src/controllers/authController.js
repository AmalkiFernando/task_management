const asyncHandler = require('express-async-handler');
const { User } = require('../models');
const generateToken = require('../utils/generateToken');
const logActivity = require('../utils/logActivity');

// @desc Register a new user (defaults to team_member; only admins can create other roles via /users)
// @route POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    res.status(409);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({ name, email, password, role: 'team_member' });
  await logActivity({ userId: user.id, action: 'register', entityType: 'User', entityId: user.id });

  const token = generateToken(user);
  res.status(201).json({
    success: true,
    data: { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token },
  });
});

// @desc Authenticate user & get token
// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.scope('withPassword').findOne({ where: { email } });
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  if (user.status === 'suspended') {
    res.status(403);
    throw new Error('This account has been suspended. Contact an administrator.');
  }

  await logActivity({ userId: user.id, action: 'login', entityType: 'User', entityId: user.id });

  const token = generateToken(user);
  res.json({
    success: true,
    data: { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token },
  });
});

// @desc Get currently authenticated user
// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

module.exports = { register, login, getMe };