const { User, Category } = require('../models');
const { generateToken, ApiError, ApiResponse } = require('../utils');

// Default categories to create for new users
const defaultCategories = [
  { name: 'Food & Dining', icon: '🍕', color: '#ef4444' },
  { name: 'Transportation', icon: '🚗', color: '#f97316' },
  { name: 'Shopping', icon: '🛒', color: '#eab308' },
  { name: 'Entertainment', icon: '🎬', color: '#22c55e' },
  { name: 'Bills & Utilities', icon: '💡', color: '#3b82f6' },
  { name: 'Healthcare', icon: '🏥', color: '#8b5cf6' },
  { name: 'Education', icon: '📚', color: '#ec4899' },
  { name: 'Travel', icon: '✈️', color: '#06b6d4' },
  { name: 'Other', icon: '📦', color: '#6b7280' },
];

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw ApiError.conflict('User with this email already exists');
    }

    // Create user
    const user = await User.create({ name, email, password });

    // Create default categories for user
    const categories = defaultCategories.map((cat) => ({
      ...cat,
      userId: user.id,
      isDefault: true,
    }));
    await Category.bulkCreate(categories);

    // Generate token
    const token = generateToken(user);

    return ApiResponse.created(res, {
      user: user.toSafeObject(),
      token,
    }, 'User registered successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Generate token
    const token = generateToken(user);

    return ApiResponse.success(res, {
      user: user.toSafeObject(),
      token,
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    return ApiResponse.success(res, { user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByPk(req.userId);

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw ApiError.conflict('Email already in use');
      }
    }

    await user.update({ name, email });

    return ApiResponse.success(res, { user: user.toSafeObject() }, 'Profile updated');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.userId);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw ApiError.badRequest('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    return ApiResponse.success(res, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
};
