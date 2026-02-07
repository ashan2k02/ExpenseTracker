const { Op, fn, col, literal } = require('sequelize');
const { Expense, Category, Budget } = require('../models');
const { ApiError, ApiResponse } = require('../utils');

/**
 * @desc    Get expense summary for dashboard
 * @route   GET /api/expenses/summary
 * @access  Private
 */
const getSummary = async (req, res, next) => {
  try {
    const userId = req.userId;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Get start and end of current month
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    // Get total expenses for current month
    const monthlyTotal = await Expense.sum('amount', {
      where: {
        userId,
        date: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
    }) || 0;

    // Get total income (assuming it's stored or using a default/budget)
    // For now, we'll use the monthly budget as income reference
    const monthlyBudget = await Budget.findOne({
      where: {
        userId,
        month: currentMonth,
        year: currentYear,
        categoryId: null, // Overall budget
      },
    });

    const totalIncome = monthlyBudget ? parseFloat(monthlyBudget.amount) : 5000; // Default income
    const budgetAmount = monthlyBudget ? parseFloat(monthlyBudget.amount) : 3000; // Default budget

    // Get expenses by category
    const expensesByCategory = await Expense.findAll({
      where: {
        userId,
        date: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
      attributes: [
        'categoryId',
        [fn('SUM', col('amount')), 'total'],
      ],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon', 'color'],
        },
      ],
      group: ['categoryId', 'category.id'],
      order: [[literal('total'), 'DESC']],
    });

    // Get monthly trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1 - i, 1);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);

      const total = await Expense.sum('amount', {
        where: {
          userId,
          date: {
            [Op.between]: [start, end],
          },
        },
      }) || 0;

      monthlyTrend.push({
        month,
        year,
        total: parseFloat(total),
      });
    }

    // Get recent expenses
    const recentExpenses = await Expense.findAll({
      where: { userId },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon', 'color'],
        },
      ],
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
      limit: 10,
    });

    // Get expense count
    const expenseCount = await Expense.count({
      where: {
        userId,
        date: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
    });

    const summary = {
      totalIncome,
      totalExpenses: parseFloat(monthlyTotal),
      monthlyTotal: parseFloat(monthlyTotal),
      monthlyBudget: budgetAmount,
      budgetRemaining: budgetAmount - parseFloat(monthlyTotal),
      budgetPercentage: budgetAmount > 0 ? Math.round((parseFloat(monthlyTotal) / budgetAmount) * 100) : 0,
      expenseCount,
    };

    return ApiResponse.success(res, {
      summary,
      expensesByCategory,
      monthlyTrend,
      recentExpenses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all expenses for user
 * @route   GET /api/expenses
 * @access  Private
 */
const getExpenses = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'date',
      sortOrder = 'DESC',
      categoryId,
      startDate,
      endDate,
      search,
    } = req.query;

    const where = { userId: req.userId };

    // Filter by category
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Filter by date range
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = startDate;
      if (endDate) where.date[Op.lte] = endDate;
    }

    // Search in description
    if (search) {
      where.description = { [Op.like]: `%${search}%` };
    }

    const offset = (page - 1) * limit;

    const { count, rows: expenses } = await Expense.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon', 'color'],
        },
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return ApiResponse.paginated(res, expenses, {
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      itemsPerPage: parseInt(limit),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single expense
 * @route   GET /api/expenses/:id
 * @access  Private
 */
const getExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      where: { id: req.params.id, userId: req.userId },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon', 'color'],
        },
      ],
    });

    if (!expense) {
      throw ApiError.notFound('Expense not found');
    }

    return ApiResponse.success(res, expense);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create expense
 * @route   POST /api/expenses
 * @access  Private
 */
const createExpense = async (req, res, next) => {
  try {
    const { amount, description, date, categoryId, notes, paymentMethod } = req.body;

    // Verify category belongs to user
    const category = await Category.findOne({
      where: {
        id: categoryId,
        [Op.or]: [{ userId: req.userId }, { userId: null }],
      },
    });

    if (!category) {
      throw ApiError.badRequest('Invalid category');
    }

    const expense = await Expense.create({
      amount,
      description,
      date: date || new Date(),
      categoryId,
      notes,
      paymentMethod,
      userId: req.userId,
    });

    const expenseWithCategory = await Expense.findByPk(expense.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon', 'color'],
        },
      ],
    });

    return ApiResponse.created(res, expenseWithCategory, 'Expense created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update expense
 * @route   PUT /api/expenses/:id
 * @access  Private
 */
const updateExpense = async (req, res, next) => {
  try {
    const { amount, description, date, categoryId, notes, paymentMethod } = req.body;

    const expense = await Expense.findOne({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!expense) {
      throw ApiError.notFound('Expense not found');
    }

    // Verify category if changing
    if (categoryId && categoryId !== expense.categoryId) {
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

    await expense.update({ amount, description, date, categoryId, notes, paymentMethod });

    const updatedExpense = await Expense.findByPk(expense.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon', 'color'],
        },
      ],
    });

    return ApiResponse.success(res, updatedExpense, 'Expense updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete expense
 * @route   DELETE /api/expenses/:id
 * @access  Private
 */
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!expense) {
      throw ApiError.notFound('Expense not found');
    }

    await expense.destroy();

    return ApiResponse.success(res, null, 'Expense deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
};
