const express = require('express');
const { body } = require('express-validator');
const { budgetController } = require('../controllers');
const { auth, validate } = require('../middleware');

const router = express.Router();

// Validation rules
const budgetValidation = [
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('month')
    .notEmpty().withMessage('Month is required')
    .isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  body('year')
    .notEmpty().withMessage('Year is required')
    .isInt({ min: 2000, max: 2100 }).withMessage('Year must be valid'),
  body('categoryId')
    .optional()
    .isInt().withMessage('Category must be valid'),
];

// All routes require authentication
router.use(auth);

// Routes
router.get('/', budgetController.getBudgets);
router.get('/:month/:year', budgetController.getBudgetByPeriod);
router.post('/', budgetValidation, validate, budgetController.upsertBudget);
router.delete('/:id', budgetController.deleteBudget);

module.exports = router;
