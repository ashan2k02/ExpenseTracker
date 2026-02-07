const { Op } = require('sequelize');
const { Income } = require('../models');
const { asyncHandler } = require('../utils');

// @desc    Get all incomes for user
// @route   GET /api/incomes
// @access  Private
const getIncomes = asyncHandler(async (req, res) => {
  const { 
    source, 
    startDate, 
    endDate, 
    search,
    sortBy = 'date',
    sortOrder = 'DESC',
    page = 1,
    limit = 10 
  } = req.query;

  // Build where clause
  const where = { user_id: req.user.id };

  if (source) {
    where.source = source;
  }

  if (startDate && endDate) {
    where.date = {
      [Op.between]: [startDate, endDate]
    };
  } else if (startDate) {
    where.date = { [Op.gte]: startDate };
  } else if (endDate) {
    where.date = { [Op.lte]: endDate };
  }

  if (search) {
    where.title = { [Op.like]: `%${search}%` };
  }

  // Calculate pagination
  const offset = (page - 1) * limit;

  // Fetch incomes
  const { count, rows: incomes } = await Income.findAndCountAll({
    where,
    order: [[sortBy, sortOrder]],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    success: true,
    data: {
      incomes,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    }
  });
});

// @desc    Get single income
// @route   GET /api/incomes/:id
// @access  Private
const getIncome = asyncHandler(async (req, res) => {
  const income = await Income.findOne({
    where: { 
      id: req.params.id, 
      user_id: req.user.id 
    }
  });

  if (!income) {
    return res.status(404).json({ 
      success: false,
      message: 'Income not found' 
    });
  }

  res.json({
    success: true,
    data: income
  });
});

// @desc    Create income
// @route   POST /api/incomes
// @access  Private
const createIncome = asyncHandler(async (req, res) => {
  const { 
    title, 
    amount, 
    source, 
    date, 
    is_recurring,
    recurring_frequency,
    notes 
  } = req.body;

  // Validation
  if (!title || !amount) {
    return res.status(400).json({ 
      success: false,
      message: 'Please provide title and amount' 
    });
  }

  const income = await Income.create({
    user_id: req.user.id,
    title,
    amount,
    source: source || 'salary',
    date: date || new Date(),
    is_recurring: is_recurring || false,
    recurring_frequency: is_recurring ? recurring_frequency : null,
    notes
  });

  res.status(201).json({
    success: true,
    data: income,
    message: 'Income added successfully'
  });
});

// @desc    Update income
// @route   PUT /api/incomes/:id
// @access  Private
const updateIncome = asyncHandler(async (req, res) => {
  const income = await Income.findOne({
    where: { 
      id: req.params.id, 
      user_id: req.user.id 
    }
  });

  if (!income) {
    return res.status(404).json({ 
      success: false,
      message: 'Income not found' 
    });
  }

  const { 
    title, 
    amount, 
    source, 
    date, 
    is_recurring,
    recurring_frequency,
    notes 
  } = req.body;

  // Update fields
  income.title = title || income.title;
  income.amount = amount || income.amount;
  income.source = source || income.source;
  income.date = date || income.date;
  income.is_recurring = is_recurring !== undefined ? is_recurring : income.is_recurring;
  income.recurring_frequency = is_recurring ? recurring_frequency : null;
  income.notes = notes !== undefined ? notes : income.notes;

  await income.save();

  res.json({
    success: true,
    data: income,
    message: 'Income updated successfully'
  });
});

// @desc    Delete income
// @route   DELETE /api/incomes/:id
// @access  Private
const deleteIncome = asyncHandler(async (req, res) => {
  const income = await Income.findOne({
    where: { 
      id: req.params.id, 
      user_id: req.user.id 
    }
  });

  if (!income) {
    return res.status(404).json({ 
      success: false,
      message: 'Income not found' 
    });
  }

  await income.destroy();

  res.json({ 
    success: true,
    message: 'Income deleted successfully' 
  });
});

// @desc    Get income summary
// @route   GET /api/incomes/summary
// @access  Private
const getSummary = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  
  // Current month by default
  const now = new Date();
  const targetMonth = month ? parseInt(month) : now.getMonth() + 1;
  const targetYear = year ? parseInt(year) : now.getFullYear();

  // Calculate date range
  const startDate = new Date(targetYear, targetMonth - 1, 1);
  const endDate = new Date(targetYear, targetMonth, 0);

  // Get all incomes for the month
  const incomes = await Income.findAll({
    where: {
      user_id: req.user.id,
      date: {
        [Op.between]: [startDate, endDate]
      }
    },
    order: [['date', 'DESC']]
  });

  // Calculate totals
  const totalIncome = incomes.reduce(
    (sum, inc) => sum + parseFloat(inc.amount), 
    0
  );

  // Group by source
  const sourceBreakdown = incomes.reduce((acc, inc) => {
    const src = inc.source;
    if (!acc[src]) {
      acc[src] = {
        source: src,
        total: 0,
        count: 0
      };
    }
    acc[src].total += parseFloat(inc.amount);
    acc[src].count += 1;
    return acc;
  }, {});

  // Get total income for the year
  const yearStart = new Date(targetYear, 0, 1);
  const yearEnd = new Date(targetYear, 11, 31);
  
  const yearlyIncomes = await Income.findAll({
    where: {
      user_id: req.user.id,
      date: {
        [Op.between]: [yearStart, yearEnd]
      }
    }
  });

  const yearlyTotal = yearlyIncomes.reduce(
    (sum, inc) => sum + parseFloat(inc.amount), 
    0
  );

  res.json({
    success: true,
    data: {
      month: targetMonth,
      year: targetYear,
      totalIncome,
      incomeCount: incomes.length,
      yearlyTotal,
      sourceBreakdown: Object.values(sourceBreakdown),
      recentIncomes: incomes.slice(0, 5)
    }
  });
});

module.exports = {
  getIncomes,
  getIncome,
  createIncome,
  updateIncome,
  deleteIncome,
  getSummary
};
