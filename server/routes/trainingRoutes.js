const express = require('express');
const router = express.Router();
const {
  createTraining, getTrainings, getTraining, updateTraining, assignEmployees, removeEmployee,
} = require('../controllers/trainingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getTrainings);
router.get('/:id', getTraining);
router.post('/', authorize('hr_admin', 'manager'), createTraining);
router.put('/:id', authorize('hr_admin', 'manager'), updateTraining);
router.post('/:id/assign', authorize('hr_admin', 'manager'), assignEmployees);
router.delete('/:id/assign/:employeeId', authorize('hr_admin', 'manager'), removeEmployee);

module.exports = router;
