const User = require('./User');
const Category = require('./Category');
const Expense = require('./Expense');
const Budget = require('./Budget');

// Define associations

// User has many Categories
User.hasMany(Category, {
  foreignKey: 'userId',
  as: 'categories',
});
Category.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// User has many Expenses
User.hasMany(Expense, {
  foreignKey: 'userId',
  as: 'expenses',
});
Expense.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// Category has many Expenses
Category.hasMany(Expense, {
  foreignKey: 'categoryId',
  as: 'expenses',
});
Expense.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category',
});

// User has many Budgets
User.hasMany(Budget, {
  foreignKey: 'userId',
  as: 'budgets',
});
Budget.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// Category has many Budgets
Category.hasMany(Budget, {
  foreignKey: 'categoryId',
  as: 'budgets',
});
Budget.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category',
});

module.exports = {
  User,
  Category,
  Expense,
  Budget,
};
