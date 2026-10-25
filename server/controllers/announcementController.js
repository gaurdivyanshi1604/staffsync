const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Create announcement
// @route   POST /api/announcements
exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, category, targetDepartment, expiresAt } = req.body;

    const announcement = await Announcement.create({
      title,
      content,
      category,
      authorId: req.user._id,
      targetDepartment: targetDepartment || null,
      publishedAt: new Date(),
      expiresAt: expiresAt || null,
    });

    // Notify relevant users
    const userQuery = { isActive: true };
    if (targetDepartment) userQuery.department = targetDepartment;

    const users = await User.find(userQuery).select('_id');
    const notifications = users.map((u) => ({
      userId: u._id,
      title: 'New Announcement',
      message: `${title}`,
      type: 'announcement',
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    next(error);
  }
};

// @desc    Get announcements (filtered by user's dept)
// @route   GET /api/announcements
exports.getAnnouncements = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const query = { isArchived: false };

    if (category) query.category = category;

    // Non-HR users only see published, non-expired, relevant dept announcements
    if (req.user.role !== 'hr_admin') {
      query.publishedAt = { $ne: null };
      query.$or = [
        { targetDepartment: null },
        { targetDepartment: req.user.department },
      ];
      query.$and = query.$and || [];
      query.$and.push({
        $or: [{ expiresAt: null }, { expiresAt: { $gte: new Date() } }],
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Announcement.countDocuments(query);
    const announcements = await Announcement.find(query)
      .populate('authorId', 'fullName')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: announcements,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
exports.updateAnnouncement = async (req, res, next) => {
  try {
    const { title, content, category, targetDepartment, expiresAt } = req.body;

    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { title, content, category, targetDepartment, expiresAt },
      { new: true, runValidators: true }
    );

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    res.status(200).json({ success: true, data: announcement });
  } catch (error) {
    next(error);
  }
};

// @desc    Archive announcement
// @route   PATCH /api/announcements/:id/archive
exports.archiveAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { isArchived: true },
      { new: true }
    );

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    res.status(200).json({ success: true, data: announcement });
  } catch (error) {
    next(error);
  }
};
