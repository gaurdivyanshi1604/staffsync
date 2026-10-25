const express = require('express');
const router = express.Router();
const {
  getEmployees, getEmployee, createEmployee, updateEmployee, toggleStatus, getManagers,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/managers/list', getManagers);
router.get('/', getEmployees);
router.get('/:id', getEmployee);
router.post('/', authorize('hr_admin'), createEmployee);
router.put('/:id', authorize('hr_admin'), updateEmployee);
router.patch('/:id/toggle-status', authorize('hr_admin'), toggleStatus);

module.exports = router;
