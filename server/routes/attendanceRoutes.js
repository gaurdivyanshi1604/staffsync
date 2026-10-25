const express = require('express');
const router = express.Router();
const {
  checkIn, checkOut, getMyAttendance, getTodayStatus, getAllAttendance, getAttendanceStats,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/check-in', checkIn);
router.put('/check-out', checkOut);
router.get('/my', getMyAttendance);
router.get('/today', getTodayStatus);
router.get('/stats', authorize('hr_admin', 'manager'), getAttendanceStats);
router.get('/', authorize('hr_admin', 'manager'), getAllAttendance);

module.exports = router;
