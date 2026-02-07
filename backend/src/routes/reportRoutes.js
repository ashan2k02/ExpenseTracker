const express = require('express');
const { reportController } = require('../controllers');
const { auth } = require('../middleware');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Routes
router.get('/dashboard', reportController.getDashboard);
router.get('/monthly', reportController.getMonthlyReportSimple); // GET /api/reports/monthly?month=1&year=2026
router.get('/monthly/:year/:month', reportController.getMonthlyReport); // GET /api/reports/monthly/2026/1
router.get('/weekly', reportController.getWeeklyReport);
router.get('/yearly/:year', reportController.getYearlyReport);
router.get('/category', reportController.getCategoryReport); // GET /api/reports/category?month=1&year=2026

module.exports = router;
