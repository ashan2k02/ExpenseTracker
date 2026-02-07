const express = require('express');
const router = express.Router();
const { incomeController } = require('../controllers');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Summary route (before :id to avoid conflict)
router.get('/summary', incomeController.getSummary);

// CRUD routes
router.route('/')
  .get(incomeController.getIncomes)
  .post(incomeController.createIncome);

router.route('/:id')
  .get(incomeController.getIncome)
  .put(incomeController.updateIncome)
  .delete(incomeController.deleteIncome);

module.exports = router;
