const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: { msg: 'Amount must be a valid number' },
      min: { args: [0.01], msg: 'Amount must be greater than 0' },
    },
  },
  // Title/Description field (stored as 'description' in DB for backward compatibility)
  description: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Title/Description is required' },
    },
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'credit_card', 'debit_card', 'bank_transfer', 'upi', 'wallet', 'check', 'other'),
    allowNull: true,
    defaultValue: 'cash',
    field: 'payment_method',
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'category_id',
  },
}, {
  tableName: 'expenses',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['category_id'] },
    { fields: ['date'] },
    { fields: ['user_id', 'date'] },
    { fields: ['user_id', 'category_id'] },
  ],
  // Virtual getter for 'title' alias
  getterMethods: {
    title() {
      return this.description;
    },
  },
  // Virtual setter for 'title' alias
  setterMethods: {
    title(value) {
      this.setDataValue('description', value);
    },
  },
});

module.exports = Expense;
