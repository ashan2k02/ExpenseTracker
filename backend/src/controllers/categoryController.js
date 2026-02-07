const { Op } = require('sequelize');
const { Category, Expense } = require('../models');
const { ApiError, ApiResponse } = require('../utils');

/**
 * @desc    Get all categories for user
 * @route   GET /api/categories
 * @access  Private
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      where: {
        [Op.or]: [{ userId: req.userId }, { userId: null }],
      },
      order: [['name', 'ASC']],
    });

    return ApiResponse.success(res, categories);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single category
 * @route   GET /api/categories/:id
 * @access  Private
 */
const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      where: {
        id: req.params.id,
        [Op.or]: [{ userId: req.userId }, { userId: null }],
      },
    });

    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    return ApiResponse.success(res, category);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create category
 * @route   POST /api/categories
 * @access  Private
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, icon, color } = req.body;

    // Check for duplicate
    const existing = await Category.findOne({
      where: { name, userId: req.userId },
    });

    if (existing) {
      throw ApiError.conflict('Category with this name already exists');
    }

    const category = await Category.create({
      name,
      icon: icon || '📦',
      color: color || '#6366f1',
      userId: req.userId,
      isDefault: false,
    });

    return ApiResponse.created(res, category, 'Category created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private
 */
const updateCategory = async (req, res, next) => {
  try {
    const { name, icon, color } = req.body;

    const category = await Category.findOne({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!category) {
      throw ApiError.notFound('Category not found or not editable');
    }

    // Check for duplicate name
    if (name && name !== category.name) {
      const existing = await Category.findOne({
        where: { name, userId: req.userId, id: { [Op.ne]: category.id } },
      });

      if (existing) {
        throw ApiError.conflict('Category with this name already exists');
      }
    }

    await category.update({ name, icon, color });

    return ApiResponse.success(res, category, 'Category updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private
 */
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!category) {
      throw ApiError.notFound('Category not found or not deletable');
    }

    // Check if category has expenses
    const expenseCount = await Expense.count({
      where: { categoryId: category.id },
    });

    if (expenseCount > 0) {
      throw ApiError.badRequest(
        `Cannot delete category with ${expenseCount} expense(s). Please reassign or delete them first.`
      );
    }

    await category.destroy();

    return ApiResponse.success(res, null, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
