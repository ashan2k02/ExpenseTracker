const { Op } = require('sequelize');
const { Budget, Category } = require('../models');
const { ApiError, ApiResponse } = require('../utils');

/**
 * @desc    Get all budgets for user
 * @route   GET /api/budgets
 * @access  Private
 */
const getBudgets = async (req, res, next) => {
  try {
    const { month, year } = req.query;

    const where = { userId: req.userId };

    if (month) where.month = month;
    if (year) where.year = year;

    const budgets = await Budget.findAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon', 'color'],
        },
      ],
      order: [['month', 'ASC'], ['year', 'ASC']],
    });

    return ApiResponse.success(res, budgets);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get or create budget for month/year
 * @route   GET /api/budgets/:month/:year
 * @access  Private
 */
const getBudgetByPeriod = async (req, res, next) => {
  try {
    const { month, year } = req.params;
    const { categoryId } = req.query;

    const where = {
      userId: req.userId,
      month: parseInt(month),
      year: parseInt(year),
    };

    if (categoryId) {
      where.categoryId = categoryId;
    } else {
      where.categoryId = null; // Overall budget
    }

    const budget = await Budget.findOne({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon', 'color'],
        },
      ],
    });

    return ApiResponse.success(res, budget);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create or update budget
 * @route   POST /api/budgets
 * @access  Private
 */
const upsertBudget = async (req, res, next) => {
  try {
    const { amount, month, year, categoryId } = req.body;

    // Verify category if provided
    if (categoryId) {
      const category = await Category.findOne({
        where: {
          id: categoryId,
          [Op.or]: [{ userId: req.userId }, { userId: null }],
        },
      });

      if (!category) {
        throw ApiError.badRequest('Invalid category');
      }
    }

    const [budget, created] = await Budget.upsert({
      amount,
      month,
      year,
      categoryId: categoryId || null,
      userId: req.userId,
    }, {
      returning: true,
    });

    const budgetWithCategory = await Budget.findByPk(budget.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon', 'color'],
        },
      ],
    });

    return ApiResponse.success(
      res,
      budgetWithCategory,
      created ? 'Budget created successfully' : 'Budget updated successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete budget
 * @route   DELETE /api/budgets/:id
 * @access  Private
 */
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!budget) {
      throw ApiError.notFound('Budget not found');
    }

    await budget.destroy();

    return ApiResponse.success(res, null, 'Budget deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudgets,
  getBudgetByPeriod,
  upsertBudget,
  deleteBudget,
};
