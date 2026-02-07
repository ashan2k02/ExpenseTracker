const express = require('express');
const { body } = require('express-validator');
const { expenseController } = require('../controllers');
const { auth, validate } = require('../middleware');

const router = express.Router();

// Validation rules
const paymentMethods = ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'upi', 'wallet', 'check', 'other'];

const expenseValidation = [
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 255 }).withMessage('Description cannot exceed 255 characters'),
  body('date')
    .optional()
    .isDate().withMessage('Please provide a valid date'),
  body('categoryId')
    .notEmpty().withMessage('Category is required')
    .isInt().withMessage('Category must be valid'),
  body('paymentMethod')
    .optional({ nullable: true })
    .isIn(paymentMethods).withMessage('Invalid payment method'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
];

const updateExpenseValidation = [
  body('amount')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Description cannot exceed 255 characters'),
  body('date')
    .optional()
    .isDate().withMessage('Please provide a valid date'),
  body('categoryId')
    .optional()
    .isInt().withMessage('Category must be valid'),
  body('paymentMethod')
    .optional({ nullable: true })
    .isIn(paymentMethods).withMessage('Invalid payment method'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
];

// All routes require authentication
router.use(auth);

// Routes
router.get('/summary', expenseController.getSummary);
router.get('/', expenseController.getExpenses);
router.get('/:id', expenseController.getExpense);
router.post('/', expenseValidation, validate, expenseController.createExpense);
router.post('/add', expenseValidation, validate, expenseController.createExpense); // Alias for POST /
router.put('/:id', updateExpenseValidation, validate, expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
