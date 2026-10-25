const express = require('express');
const router = express.Router();
const {
  createAnnouncement, getAnnouncements, updateAnnouncement, archiveAnnouncement,
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAnnouncements);
router.post('/', authorize('hr_admin'), createAnnouncement);
router.put('/:id', authorize('hr_admin'), updateAnnouncement);
router.patch('/:id/archive', authorize('hr_admin'), archiveAnnouncement);

module.exports = router;
