const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Budget = sequelize.define('Budget', {
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
      min: { args: [0], msg: 'Amount must be a positive number' },
    },
  },
  month: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 12,
    },
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: true, // null means overall budget
    field: 'category_id',
  },
}, {
  tableName: 'budgets',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'category_id', 'month', 'year'],
    },
  ],
});

module.exports = Budget;
