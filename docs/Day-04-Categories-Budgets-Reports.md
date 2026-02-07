# 📅 Day 4: Categories, Budgets & Reporting APIs
## Industry-Academia Collaborative Incubation Program
### Personal Expense Tracker - Full Stack Developer Challenge

---

## 🎯 Day 4 Objectives
- [x] Build Category controller and routes
- [x] Build Budget controller and routes
- [x] Create reporting endpoints
- [x] Implement dashboard summary API
- [x] Set up default categories

---

## 📂 Category Controller

### controllers/categoryController.js
```javascript
const Category = require('../models/Category');
const { Op } = require('sequelize');

// @desc    Get all categories
// @route   GET /api/categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: {
        [Op.or]: [
          { user_id: req.user.id },
          { user_id: null } // Default categories
        ]
      },
      order: [['name', 'ASC']]
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create category
// @route   POST /api/categories
const createCategory = async (req, res) => {
  try {
    const { name, icon, color } = req.body;
    
    const category = await Category.create({
      name,
      icon: icon || 'FaTag',
      color: color || '#6B7280',
      user_id: req.user.id
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
```

---

## 💰 Budget Controller

### controllers/budgetController.js
```javascript
const { Op } = require('sequelize');
const Budget = require('../models/Budget');
const Category = require('../models/Category');
const Expense = require('../models/Expense');

// @desc    Get all budgets with spent amounts
// @route   GET /api/budgets
const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.findAll({
      where: { user_id: req.user.id },
      include: [{
        model: Category,
        as: 'category'
      }]
    });

    // Calculate spent amount for each budget
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await Expense.sum('amount', {
          where: {
            user_id: req.user.id,
            category_id: budget.category_id,
            date: {
              [Op.between]: [budget.start_date, budget.end_date]
            }
          }
        });

        return {
          ...budget.toJSON(),
          spent: spent || 0,
          remaining: parseFloat(budget.amount) - (spent || 0),
          percentage: spent 
            ? Math.round((spent / parseFloat(budget.amount)) * 100) 
            : 0
        };
      })
    );

    res.json(budgetsWithSpent);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get budget status with alerts
// @route   GET /api/budgets/status
const getBudgetStatus = async (req, res) => {
  try {
    const now = new Date();
    const budgets = await Budget.findAll({
      where: {
        user_id: req.user.id,
        start_date: { [Op.lte]: now },
        end_date: { [Op.gte]: now }
      },
      include: [{ model: Category, as: 'category' }]
    });

    const alerts = [];
    let totalBudget = 0;
    let totalSpent = 0;

    for (const budget of budgets) {
      const spent = await Expense.sum('amount', {
        where: {
          user_id: req.user.id,
          category_id: budget.category_id,
          date: { [Op.between]: [budget.start_date, budget.end_date] }
        }
      }) || 0;

      totalBudget += parseFloat(budget.amount);
      totalSpent += spent;
      const percentage = Math.round((spent / parseFloat(budget.amount)) * 100);

      if (percentage >= 100) {
        alerts.push({
          type: 'exceeded',
          category: budget.category?.name || 'Overall',
          budget: parseFloat(budget.amount),
          spent,
          percentage
        });
      } else if (percentage >= 80) {
        alerts.push({
          type: 'warning',
          category: budget.category?.name || 'Overall',
          budget: parseFloat(budget.amount),
          spent,
          percentage
        });
      }
    }

    res.json({
      totalBudget,
      totalSpent,
      remaining: totalBudget - totalSpent,
      overallPercentage: totalBudget > 0 
        ? Math.round((totalSpent / totalBudget) * 100) : 0,
      alerts,
      activeBudgets: budgets.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
```

---

## 📊 Report Controller

### controllers/reportController.js
```javascript
const { Op, fn, col, literal } = require('sequelize');
const Expense = require('../models/Expense');
const Category = require('../models/Category');

// @desc    Get dashboard summary
// @route   GET /api/reports/dashboard
const getDashboardSummary = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Monthly total
    const monthlyTotal = await Expense.sum('amount', {
      where: {
        user_id: req.user.id,
        date: { [Op.between]: [startOfMonth, endOfMonth] }
      }
    }) || 0;

    // Top categories
    const topCategories = await Expense.findAll({
      where: {
        user_id: req.user.id,
        date: { [Op.between]: [startOfMonth, endOfMonth] }
      },
      attributes: [
        'category_id',
        [fn('SUM', col('amount')), 'total']
      ],
      include: [{
        model: Category,
        as: 'category',
        attributes: ['name', 'icon', 'color']
      }],
      group: ['category_id', 'category.id'],
      order: [[literal('total'), 'DESC']],
      limit: 5
    });

    // Recent transactions
    const recentTransactions = await Expense.findAll({
      where: { user_id: req.user.id },
      include: [{
        model: Category,
        as: 'category'
      }],
      order: [['date', 'DESC']],
      limit: 5
    });

    res.json({
      summary: { monthlyTotal },
      topCategories,
      recentTransactions
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get monthly report (last N months)
// @route   GET /api/reports/monthly
const getMonthlyReportSimple = async (req, res) => {
  try {
    const now = new Date();
    const months = parseInt(req.query.months) || 6;
    const result = [];
    
    for (let i = 0; i < months; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const total = await Expense.sum('amount', {
        where: {
          user_id: req.user.id,
          date: { [Op.between]: [startDate, endDate] }
        }
      }) || 0;

      result.unshift({
        month: date.toLocaleString('default', { month: 'short' }),
        year: date.getFullYear(),
        total: parseFloat(total)
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get category report
// @route   GET /api/reports/category
const getCategoryReport = async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const categoryData = await Expense.findAll({
      where: {
        user_id: req.user.id,
        date: { [Op.between]: [start, end] }
      },
      attributes: [
        'category_id',
        [fn('SUM', col('amount')), 'total'],
        [fn('COUNT', col('id')), 'count']
      ],
      include: [{
        model: Category,
        as: 'category'
      }],
      group: ['category_id', 'category.id'],
      order: [[literal('total'), 'DESC']]
    });

    res.json({ categories: categoryData });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
```

---

## 🗃️ Default Categories (12 Categories)

```sql
INSERT INTO categories (name, icon, color, user_id) VALUES
('Food & Dining', 'FaUtensils', '#10B981', NULL),
('Transportation', 'FaCar', '#3B82F6', NULL),
('Shopping', 'FaShoppingBag', '#8B5CF6', NULL),
('Entertainment', 'FaGamepad', '#EC4899', NULL),
('Bills & Utilities', 'FaFileInvoiceDollar', '#F59E0B', NULL),
('Healthcare', 'FaHeart', '#EF4444', NULL),
('Education', 'FaGraduationCap', '#6366F1', NULL),
('Travel', 'FaPlane', '#14B8A6', NULL),
('Groceries', 'FaShoppingCart', '#22C55E', NULL),
('Personal Care', 'FaSpa', '#F472B6', NULL),
('Gifts', 'FaGift', '#A855F7', NULL),
('Other', 'FaEllipsisH', '#6B7280', NULL);
```

---

## 📊 API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all categories |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |
| GET | `/api/budgets` | Get all budgets |
| GET | `/api/budgets/status` | Get budget alerts |
| POST | `/api/budgets` | Create budget |
| PUT | `/api/budgets/:id` | Update budget |
| DELETE | `/api/budgets/:id` | Delete budget |
| GET | `/api/reports/dashboard` | Dashboard summary |
| GET | `/api/reports/monthly` | Monthly totals |
| GET | `/api/reports/category` | Category breakdown |

---

## ✅ Day 4 Checklist

- [x] Built Category controller with CRUD
- [x] Built Budget controller with status alerts
- [x] Created Report controller
- [x] Implemented dashboard summary API
- [x] Set up all routes
- [x] Added default categories

---

## 📚 Key Learnings

1. **Aggregation Queries**: Using Sequelize's `fn`, `col`, `literal`
2. **Budget Alerts**: Real-time calculation of spending vs budget
3. **Date Ranges**: Working with date calculations
4. **Complex Queries**: Combining GROUP BY with JOINs

---

## 🔜 Day 5 Preview
- Start frontend development
- Set up React Router
- Create layout components
- Build authentication context

---

**Progress: Day 4 of 10 Complete** ████████████████░░░░ 40%
