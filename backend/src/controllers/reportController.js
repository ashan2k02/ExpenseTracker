const { Op, fn, col, literal } = require('sequelize');
const { sequelize } = require('../config/database');
const { Expense, Category, Budget } = require('../models');
const { ApiResponse } = require('../utils');

/**
 * @desc    Get dashboard summary
 * @route   GET /api/reports/dashboard
 * @access  Private
 */
const getDashboard = async (req, res, next) => {
  try {
    const userId = req.userId;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Get current month's total expenses
    const monthlyTotal = await Expense.sum('amount', {
      where: {
        userId,
        date: {
          [Op.gte]: new Date(currentYear, currentMonth - 1, 1),
          [Op.lt]: new Date(currentYear, currentMonth, 1),
        },
      },
    }) || 0;

    // Get current month's budget
    const monthlyBudget = await Budget.findOne({
      where: {
        userId,
        month: currentMonth,
        year: currentYear,
        categoryId: null,
      },
    });

    // Get expenses by category for current month
    const expensesByCategory = await Expense.findAll({
      where: {
        userId,
        date: {
          [Op.gte]: new Date(currentYear, currentMonth - 1, 1),
          [Op.lt]: new Date(currentYear, currentMonth, 1),
        },
      },
      attributes: [
        [fn('SUM', col('amount')), 'total'],
      ],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon', 'color'],
        },
      ],
      group: ['category.id'],
      order: [[literal('total'), 'DESC']],
    });

    // Get last 6 months trend
    const sixMonthsAgo = new Date(currentYear, currentMonth - 7, 1);
    const monthlyTrend = await Expense.findAll({
      where: {
        userId,
        date: {
          [Op.gte]: sixMonthsAgo,
        },
      },
      attributes: [
        [fn('YEAR', col('date')), 'year'],
        [fn('MONTH', col('date')), 'month'],
        [fn('SUM', col('amount')), 'total'],
      ],
      group: [fn('YEAR', col('date')), fn('MONTH', col('date'))],
      order: [[fn('YEAR', col('date')), 'ASC'], [fn('MONTH', col('date')), 'ASC']],
      raw: true,
    });

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
      limit: 5,
    });

    // Get total expenses all time
    const totalAllTime = await Expense.sum('amount', { where: { userId } }) || 0;

    // Get expense count
    const expenseCount = await Expense.count({ where: { userId } });

    return ApiResponse.success(res, {
      summary: {
        monthlyTotal: parseFloat(monthlyTotal),
        monthlyBudget: monthlyBudget ? parseFloat(monthlyBudget.amount) : null,
        budgetRemaining: monthlyBudget 
          ? parseFloat(monthlyBudget.amount) - parseFloat(monthlyTotal) 
          : null,
        budgetPercentage: monthlyBudget 
          ? Math.round((parseFloat(monthlyTotal) / parseFloat(monthlyBudget.amount)) * 100) 
          : null,
        totalAllTime: parseFloat(totalAllTime),
        expenseCount,
      },
      expensesByCategory,
      monthlyTrend,
      recentExpenses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get monthly report
 * @route   GET /api/reports/monthly/:year/:month
 * @access  Private
 */
const getMonthlyReport = async (req, res, next) => {
  try {
    const { year, month } = req.params;
    const userId = req.userId;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Get all expenses for the month
    const expenses = await Expense.findAll({
      where: {
        userId,
        date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon', 'color'],
        },
      ],
      order: [['date', 'DESC']],
    });

    // Get total
    const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

    // Get expenses by category
    const byCategory = await Expense.findAll({
      where: {
        userId,
        date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      },
      attributes: [
        [fn('SUM', col('amount')), 'total'],
        [fn('COUNT', col('Expense.id')), 'count'],
      ],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon', 'color'],
        },
      ],
      group: ['category.id'],
      order: [[literal('total'), 'DESC']],
    });

    // Get daily breakdown
    const dailyBreakdown = await Expense.findAll({
      where: {
        userId,
        date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      },
      attributes: [
        'date',
        [fn('SUM', col('amount')), 'total'],
      ],
      group: ['date'],
      order: [['date', 'ASC']],
      raw: true,
    });

    // Get budget for this month
    const budget = await Budget.findOne({
      where: {
        userId,
        month: parseInt(month),
        year: parseInt(year),
        categoryId: null,
      },
    });

    return ApiResponse.success(res, {
      period: { year: parseInt(year), month: parseInt(month) },
      total,
      budget: budget ? parseFloat(budget.amount) : null,
      expenseCount: expenses.length,
      expenses,
      byCategory,
      dailyBreakdown,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get weekly report
 * @route   GET /api/reports/weekly
 * @access  Private
 */
const getWeeklyReport = async (req, res, next) => {
  try {
    const { startDate } = req.query;
    const userId = req.userId;

    // Default to current week
    const start = startDate 
      ? new Date(startDate) 
      : getStartOfWeek(new Date());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    // Get all expenses for the week
    const expenses = await Expense.findAll({
      where: {
        userId,
        date: {
          [Op.gte]: start,
          [Op.lte]: end,
        },
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon', 'color'],
        },
      ],
      order: [['date', 'DESC']],
    });

    const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

    // Get expenses by category
    const byCategory = await Expense.findAll({
      where: {
        userId,
        date: {
          [Op.gte]: start,
          [Op.lte]: end,
        },
      },
      attributes: [
        [fn('SUM', col('amount')), 'total'],
      ],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon', 'color'],
        },
      ],
      group: ['category.id'],
      order: [[literal('total'), 'DESC']],
    });

    // Get daily breakdown
    const dailyBreakdown = await Expense.findAll({
      where: {
        userId,
        date: {
          [Op.gte]: start,
          [Op.lte]: end,
        },
      },
      attributes: [
        'date',
        [fn('SUM', col('amount')), 'total'],
      ],
      group: ['date'],
      order: [['date', 'ASC']],
      raw: true,
    });

    return ApiResponse.success(res, {
      period: {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      },
      total,
      expenseCount: expenses.length,
      expenses,
      byCategory,
      dailyBreakdown,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get yearly report
 * @route   GET /api/reports/yearly/:year
 * @access  Private
 */
const getYearlyReport = async (req, res, next) => {
  try {
    const { year } = req.params;
    const userId = req.userId;

    // Get monthly breakdown
    const monthlyBreakdown = await Expense.findAll({
      where: {
        userId,
        date: {
          [Op.gte]: new Date(year, 0, 1),
          [Op.lt]: new Date(parseInt(year) + 1, 0, 1),
        },
      },
      attributes: [
        [fn('MONTH', col('date')), 'month'],
        [fn('SUM', col('amount')), 'total'],
        [fn('COUNT', col('id')), 'count'],
      ],
      group: [fn('MONTH', col('date'))],
      order: [[fn('MONTH', col('date')), 'ASC']],
      raw: true,
    });

    // Get yearly total
    const yearlyTotal = await Expense.sum('amount', {
      where: {
        userId,
        date: {
          [Op.gte]: new Date(year, 0, 1),
          [Op.lt]: new Date(parseInt(year) + 1, 0, 1),
        },
      },
    }) || 0;

    // Get expenses by category for the year
    const byCategory = await Expense.findAll({
      where: {
        userId,
        date: {
          [Op.gte]: new Date(year, 0, 1),
          [Op.lt]: new Date(parseInt(year) + 1, 0, 1),
        },
      },
      attributes: [
        [fn('SUM', col('amount')), 'total'],
      ],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon', 'color'],
        },
      ],
      group: ['category.id'],
      order: [[literal('total'), 'DESC']],
    });

    return ApiResponse.success(res, {
      year: parseInt(year),
      total: parseFloat(yearlyTotal),
      monthlyBreakdown,
      byCategory,
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to get start of week (Monday)
function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

/**
 * @desc    Get monthly report with query params
 * @route   GET /api/reports/monthly?month=1&year=2026
 * @access  Private
 */
const getMonthlyReportSimple = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const userId = req.userId;

    // Default to current month/year
    const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    // Get total expenses for the month
    const totalExpenses = await Expense.sum('amount', {
      where: {
        userId,
        date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      },
    }) || 0;

    // Get expense count
    const expenseCount = await Expense.count({
      where: {
        userId,
        date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      },
    });

    // Get expenses by category
    const byCategory = await Expense.findAll({
      where: {
        userId,
        date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      },
      attributes: [
        [fn('SUM', col('amount')), 'total'],
        [fn('COUNT', col('Expense.id')), 'count'],
      ],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon', 'color'],
        },
      ],
      group: ['category.id'],
      order: [[literal('total'), 'DESC']],
    });

    // Get budget for this month
    const budget = await Budget.findOne({
      where: {
        userId,
        month: targetMonth,
        year: targetYear,
        categoryId: null,
      },
    });

    // Get daily breakdown
    const dailyBreakdown = await Expense.findAll({
      where: {
        userId,
        date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      },
      attributes: [
        'date',
        [fn('SUM', col('amount')), 'total'],
      ],
      group: ['date'],
      order: [['date', 'ASC']],
      raw: true,
    });

    // Compare with previous month
    const prevStartDate = new Date(targetYear, targetMonth - 2, 1);
    const prevEndDate = new Date(targetYear, targetMonth - 1, 0, 23, 59, 59);
    
    const prevMonthTotal = await Expense.sum('amount', {
      where: {
        userId,
        date: {
          [Op.gte]: prevStartDate,
          [Op.lte]: prevEndDate,
        },
      },
    }) || 0;

    const changeFromPrevMonth = totalExpenses - prevMonthTotal;
    const changePercentage = prevMonthTotal > 0 
      ? ((changeFromPrevMonth / prevMonthTotal) * 100).toFixed(1) 
      : 0;

    return ApiResponse.success(res, {
      period: { 
        month: targetMonth, 
        year: targetYear,
        monthName: new Date(targetYear, targetMonth - 1, 1).toLocaleDateString('en-US', { month: 'long' }),
      },
      total: parseFloat(totalExpenses),
      expenseCount,
      budget: budget ? parseFloat(budget.amount) : null,
      budgetRemaining: budget ? parseFloat(budget.amount) - totalExpenses : null,
      budgetPercentage: budget ? Math.round((totalExpenses / parseFloat(budget.amount)) * 100) : null,
      comparison: {
        previousMonth: parseFloat(prevMonthTotal),
        change: parseFloat(changeFromPrevMonth),
        changePercentage: parseFloat(changePercentage),
      },
      byCategory,
      dailyBreakdown,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get expenses by category report
 * @route   GET /api/reports/category?month=1&year=2026
 * @access  Private
 */
const getCategoryReport = async (req, res, next) => {
  try {
    const { month, year, categoryId } = req.query;
    const userId = req.userId;

    // Default to current month/year
    const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    // If specific category requested
    if (categoryId) {
      const categoryExpenses = await Expense.findAll({
        where: {
          userId,
          categoryId: parseInt(categoryId),
          date: {
            [Op.gte]: startDate,
            [Op.lte]: endDate,
          },
        },
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'icon', 'color'],
          },
        ],
        order: [['date', 'DESC']],
      });

      const total = categoryExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

      // Get category budget
      const categoryBudget = await Budget.findOne({
        where: {
          userId,
          categoryId: parseInt(categoryId),
          month: targetMonth,
          year: targetYear,
        },
      });

      return ApiResponse.success(res, {
        period: { month: targetMonth, year: targetYear },
        category: categoryExpenses[0]?.category || null,
        total,
        expenseCount: categoryExpenses.length,
        budget: categoryBudget ? parseFloat(categoryBudget.amount) : null,
        expenses: categoryExpenses,
      });
    }

    // Get all categories with their expenses
    const categoryBreakdown = await Expense.findAll({
      where: {
        userId,
        date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      },
      attributes: [
        [fn('SUM', col('amount')), 'total'],
        [fn('COUNT', col('Expense.id')), 'count'],
        [fn('AVG', col('amount')), 'average'],
        [fn('MAX', col('amount')), 'max'],
        [fn('MIN', col('amount')), 'min'],
      ],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon', 'color'],
        },
      ],
      group: ['category.id'],
      order: [[literal('total'), 'DESC']],
      raw: true,
      nest: true,
    });

    // Get total expenses
    const totalExpenses = await Expense.sum('amount', {
      where: {
        userId,
        date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      },
    }) || 0;

    // Get category budgets
    const categoryBudgets = await Budget.findAll({
      where: {
        userId,
        month: targetMonth,
        year: targetYear,
        categoryId: { [Op.ne]: null },
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon', 'color'],
        },
      ],
    });

    // Merge budget info with category breakdown
    const categoriesWithBudget = categoryBreakdown.map(cat => {
      const budget = categoryBudgets.find(b => b.categoryId === cat.category?.id);
      const total = parseFloat(cat.total);
      const budgetAmount = budget ? parseFloat(budget.amount) : null;
      
      return {
        category: cat.category,
        total,
        count: parseInt(cat.count),
        average: parseFloat(cat.average) || 0,
        max: parseFloat(cat.max) || 0,
        min: parseFloat(cat.min) || 0,
        percentage: totalExpenses > 0 ? ((total / totalExpenses) * 100).toFixed(1) : 0,
        budget: budgetAmount,
        budgetRemaining: budgetAmount ? budgetAmount - total : null,
        budgetPercentage: budgetAmount ? Math.round((total / budgetAmount) * 100) : null,
        isOverBudget: budgetAmount ? total > budgetAmount : false,
      };
    });

    return ApiResponse.success(res, {
      period: { 
        month: targetMonth, 
        year: targetYear,
        monthName: new Date(targetYear, targetMonth - 1, 1).toLocaleDateString('en-US', { month: 'long' }),
      },
      totalExpenses: parseFloat(totalExpenses),
      categoryCount: categoriesWithBudget.length,
      categories: categoriesWithBudget,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getMonthlyReport,
  getMonthlyReportSimple,
  getWeeklyReport,
  getYearlyReport,
  getCategoryReport,
};
