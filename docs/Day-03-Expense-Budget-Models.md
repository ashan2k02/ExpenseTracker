# 📅 Day 3: Expense & Budget Models + CRUD Operations
## Industry-Academia Collaborative Incubation Program
### Personal Expense Tracker - Full Stack Developer Challenge

---

## 🎯 Day 3 Objectives
- [x] Create Expense model
- [x] Create Budget model
- [x] Set up model associations
- [x] Build CRUD operations for expenses
- [x] Implement expense filtering and pagination
- [x] Create budget management endpoints

---

## 📊 Expense Model

### models/Expense.js
```javascript
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: false,
    // Alias for 'title' field
    get() {
      return this.getDataValue('description');
    },
    set(value) {
      this.setDataValue('description', value);
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  payment_method: {
    type: DataTypes.ENUM('cash', 'card', 'bank_transfer', 'mobile_payment', 'other'),
    defaultValue: 'cash'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'expenses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Virtual field for title (alias)
Expense.prototype.title = function() {
  return this.description;
};

module.exports = Expense;
```

---

## 💰 Budget Model

### models/Budget.js
```javascript
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Budget = sequelize.define('Budget', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // null for overall budget
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  period: {
    type: DataTypes.ENUM('weekly', 'monthly', 'yearly'),
    defaultValue: 'monthly'
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  tableName: 'budgets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Budget;
```

---

## 🔗 Model Associations

### models/index.js
```javascript
const User = require('./User');
const Category = require('./Category');
const Expense = require('./Expense');
const Budget = require('./Budget');

// User -> Expenses (One to Many)
User.hasMany(Expense, { foreignKey: 'user_id', as: 'expenses' });
Expense.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User -> Categories (One to Many)
User.hasMany(Category, { foreignKey: 'user_id', as: 'categories' });
Category.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User -> Budgets (One to Many)
User.hasMany(Budget, { foreignKey: 'user_id', as: 'budgets' });
Budget.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Category -> Expenses (One to Many)
Category.hasMany(Expense, { foreignKey: 'category_id', as: 'expenses' });
Expense.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Category -> Budgets (One to Many)
Category.hasMany(Budget, { foreignKey: 'category_id', as: 'budgets' });
Budget.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

module.exports = { User, Category, Expense, Budget };
```

### Association Diagram:
```
┌──────────┐         ┌────────────┐         ┌────────────┐
│   User   │────────►│  Expense   │◄────────│  Category  │
│          │   1:N   │            │   N:1   │            │
└──────────┘         └────────────┘         └────────────┘
     │                                            │
     │ 1:N                                   1:N  │
     │                                            │
     └────────────────────────────────────────────┘
                          │
                          ▼
                   ┌────────────┐
                   │   Budget   │
                   │            │
                   └────────────┘
```

---

## 🎮 Expense Controller

### controllers/expenseController.js
```javascript
const { Op } = require('sequelize');
const Expense = require('../models/Expense');
const Category = require('../models/Category');

// @desc    Get all expenses for user
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
  try {
    const { 
      category, 
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

    if (category) {
      where.category_id = category;
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
      where.description = { [Op.like]: `%${search}%` };
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Fetch expenses
    const { count, rows: expenses } = await Expense.findAndCountAll({
      where,
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'icon', 'color']
      }],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      expenses,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
const getExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      where: { 
        id: req.params.id, 
        user_id: req.user.id 
      },
      include: [{
        model: Category,
        as: 'category'
      }]
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      amount, 
      category_id, 
      date, 
      payment_method, 
      notes 
    } = req.body;

    // Use title or description
    const expenseDescription = title || description;

    // Validation
    if (!expenseDescription || !amount || !category_id) {
      return res.status(400).json({ 
        message: 'Please provide title, amount, and category' 
      });
    }

    const expense = await Expense.create({
      user_id: req.user.id,
      category_id,
      description: expenseDescription,
      amount,
      date: date || new Date(),
      payment_method: payment_method || 'cash',
      notes
    });

    // Fetch with category
    const expenseWithCategory = await Expense.findByPk(expense.id, {
      include: [{
        model: Category,
        as: 'category'
      }]
    });

    res.status(201).json(expenseWithCategory);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      where: { 
        id: req.params.id, 
        user_id: req.user.id 
      }
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const { 
      title, 
      description, 
      amount, 
      category_id, 
      date, 
      payment_method, 
      notes 
    } = req.body;

    // Update fields
    expense.description = title || description || expense.description;
    expense.amount = amount || expense.amount;
    expense.category_id = category_id || expense.category_id;
    expense.date = date || expense.date;
    expense.payment_method = payment_method || expense.payment_method;
    expense.notes = notes !== undefined ? notes : expense.notes;

    await expense.save();

    // Fetch with category
    const updatedExpense = await Expense.findByPk(expense.id, {
      include: [{
        model: Category,
        as: 'category'
      }]
    });

    res.json(updatedExpense);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      where: { 
        id: req.params.id, 
        user_id: req.user.id 
      }
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    await expense.destroy();

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get expense summary
// @route   GET /api/expenses/summary
// @access  Private
const getSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    // Current month by default
    const now = new Date();
    const targetMonth = month ? parseInt(month) : now.getMonth() + 1;
    const targetYear = year ? parseInt(year) : now.getFullYear();

    // Calculate date range
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0);

    // Get total expenses for the month
    const expenses = await Expense.findAll({
      where: {
        user_id: req.user.id,
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [{
        model: Category,
        as: 'category'
      }]
    });

    // Calculate totals
    const totalExpenses = expenses.reduce(
      (sum, exp) => sum + parseFloat(exp.amount), 
      0
    );

    // Group by category
    const categoryTotals = expenses.reduce((acc, exp) => {
      const catId = exp.category_id;
      if (!acc[catId]) {
        acc[catId] = {
          category: exp.category,
          total: 0,
          count: 0
        };
      }
      acc[catId].total += parseFloat(exp.amount);
      acc[catId].count += 1;
      return acc;
    }, {});

    res.json({
      month: targetMonth,
      year: targetYear,
      totalExpenses,
      expenseCount: expenses.length,
      categoryBreakdown: Object.values(categoryTotals),
      recentExpenses: expenses.slice(0, 5)
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getSummary
};
```

---

## 🛣️ Expense Routes

### routes/expenseRoutes.js
```javascript
const express = require('express');
const router = express.Router();
const { 
  getExpenses, 
  getExpense, 
  createExpense, 
  updateExpense, 
  deleteExpense,
  getSummary
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Summary route (before :id to avoid conflict)
router.get('/summary', getSummary);

// CRUD routes
router.route('/')
  .get(getExpenses)
  .post(createExpense);

// Alias for POST
router.post('/add', createExpense);

router.route('/:id')
  .get(getExpense)
  .put(updateExpense)
  .delete(deleteExpense);

module.exports = router;
```

---

## 📊 Query Parameters Explained

### Filtering & Pagination
```
GET /api/expenses?category=1&startDate=2026-01-01&endDate=2026-01-31&page=1&limit=10

Query Parameters:
┌────────────┬─────────────────────────────────────────┐
│ Parameter  │ Description                             │
├────────────┼─────────────────────────────────────────┤
│ category   │ Filter by category ID                   │
│ startDate  │ Filter expenses from this date          │
│ endDate    │ Filter expenses until this date         │
│ search     │ Search in description (LIKE)            │
│ sortBy     │ Field to sort by (date, amount)         │
│ sortOrder  │ ASC or DESC                             │
│ page       │ Current page number (default: 1)        │
│ limit      │ Items per page (default: 10)            │
└────────────┴─────────────────────────────────────────┘
```

### Response Structure
```json
{
  "expenses": [
    {
      "id": 1,
      "description": "Grocery shopping",
      "amount": "150.00",
      "date": "2026-01-15",
      "payment_method": "card",
      "category": {
        "id": 1,
        "name": "Food",
        "icon": "FaUtensils",
        "color": "#10B981"
      }
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "pages": 5,
    "limit": 10
  }
}
```

---

## 🧪 Testing CRUD Operations

```bash
# Create expense
curl -X POST http://localhost:5001/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Lunch at restaurant",
    "amount": 25.50,
    "category_id": 1,
    "date": "2026-01-20",
    "payment_method": "card"
  }'

# Get all expenses (with filters)
curl "http://localhost:5001/api/expenses?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update expense
curl -X PUT http://localhost:5001/api/expenses/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount": 30.00}'

# Delete expense
curl -X DELETE http://localhost:5001/api/expenses/1 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get summary
curl "http://localhost:5001/api/expenses/summary?month=1&year=2026" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✅ Day 3 Checklist

- [x] Created Expense model with all fields
- [x] Created Budget model with period types
- [x] Set up model associations
- [x] Implemented getExpenses with filtering
- [x] Implemented pagination
- [x] Implemented sorting
- [x] Created createExpense endpoint
- [x] Created updateExpense endpoint
- [x] Created deleteExpense endpoint
- [x] Created getSummary endpoint
- [x] Tested all CRUD operations

---

## 📚 Key Learnings

1. **Sequelize Associations**: Define relationships between models
2. **Query Building**: Dynamic where clauses with Op operators
3. **Pagination**: Offset-based pagination pattern
4. **Eager Loading**: Include related data with `include`
5. **Data Validation**: Sequelize validators ensure data integrity

---

## 🔜 Day 4 Preview
- Build Category and Budget controllers
- Create reporting endpoints
- Implement dashboard summary API
- Set up category CRUD

---

**Progress: Day 3 of 10 Complete** ████████████░░░░ 30%
