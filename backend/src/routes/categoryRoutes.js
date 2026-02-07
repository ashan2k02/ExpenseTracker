const express = require('express');
const { body } = require('express-validator');
const { categoryController } = require('../controllers');
const { auth, validate } = require('../middleware');

const router = express.Router();

// Validation rules
const categoryValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required')
    .isLength({ max: 50 }).withMessage('Category name cannot exceed 50 characters'),
  body('icon')
    .optional()
    .trim(),
  body('color')
    .optional()
    .trim()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Color must be a valid hex color'),
];

const updateCategoryValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Category name cannot exceed 50 characters'),
  body('icon')
    .optional()
    .trim(),
  body('color')
    .optional()
    .trim()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Color must be a valid hex color'),
];

// All routes require authentication
router.use(auth);

// Routes
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategory);
router.post('/', categoryValidation, validate, categoryController.createCategory);
router.put('/:id', updateCategoryValidation, validate, categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
