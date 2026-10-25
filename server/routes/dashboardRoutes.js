const express = require('express');
const router = express.Router();
const { getHRDashboard, getManagerDashboard, getEmployeeDashboard } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/hr', authorize('hr_admin'), getHRDashboard);
router.get('/manager', authorize('hr_admin', 'manager'), getManagerDashboard);
router.get('/employee', getEmployeeDashboard);

module.exports = router;
