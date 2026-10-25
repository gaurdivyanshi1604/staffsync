const express = require('express');
const router = express.Router();
const {
  createLeave, getMyLeaves, getAllLeaves, decideLeave, cancelLeave,
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createLeave);
router.get('/my', getMyLeaves);
router.get('/', authorize('hr_admin', 'manager'), getAllLeaves);
router.put('/:id/decide', authorize('hr_admin', 'manager'), decideLeave);
router.put('/:id/cancel', cancelLeave);

module.exports = router;
