const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Category name is required' },
    },
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: '📦',
  },
  color: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: '#6366f1',
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true, // null means it's a default category
    field: 'user_id',
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_default',
  },
}, {
  tableName: 'categories',
  indexes: [
    {
      unique: true,
      fields: ['name', 'user_id'],
    },
  ],
});

module.exports = Category;
