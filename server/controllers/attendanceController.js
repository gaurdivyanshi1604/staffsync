const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Helper: get start of today (server time)
const getToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

// @desc    Check in
// @route   POST /api/attendance/check-in
exports.checkIn = async (req, res, next) => {
  try {
    const today = getToday();
    const now = new Date();

    // Prevent duplicate check-in
    const existing = await Attendance.findOne({ userId: req.user._id, date: today });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already checked in today' });
    }

    // Determine status: Late if after 9:30 AM, Half-Day if after 12:00 PM
    let status = 'Present';
    const hours = now.getHours();
    const minutes = now.getMinutes();
    if (hours > 12 || (hours === 12 && minutes > 0)) {
      status = 'Half-Day';
    } else if (hours > 9 || (hours === 9 && minutes > 30)) {
      status = 'Late';
    }

    const attendance = await Attendance.create({
      userId: req.user._id,
      date: today,
      checkIn: now,
      status,
    });

    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    next(error);
  }
};

// @desc    Check out
// @route   PUT /api/attendance/check-out
exports.checkOut = async (req, res, next) => {
  try {
    const today = getToday();
    const now = new Date();

    const attendance = await Attendance.findOne({ userId: req.user._id, date: today });

    if (!attendance) {
      return res.status(400).json({ success: false, message: 'No check-in record found for today' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ success: false, message: 'Already checked out today' });
    }

    if (now <= attendance.checkIn) {
      return res.status(400).json({ success: false, message: 'Check-out time must be after check-in time' });
    }

    const workHours = Math.round(((now - attendance.checkIn) / (1000 * 60 * 60)) * 100) / 100;

    attendance.checkOut = now;
    attendance.workHours = Math.max(0, workHours);
    await attendance.save();

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my attendance history
// @route   GET /api/attendance/my
exports.getMyAttendance = async (req, res, next) => {
  try {
    const { startDate, endDate, page = 1, limit = 30 } = req.query;
    const query = { userId: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query).sort({ date: -1 }).skip(skip).limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: records,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's status for current user
// @route   GET /api/attendance/today
exports.getTodayStatus = async (req, res, next) => {
  try {
    const today = getToday();
    const attendance = await Attendance.findOne({ userId: req.user._id, date: today });
    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all attendance (HR) or team attendance (Manager)
// @route   GET /api/attendance
exports.getAllAttendance = async (req, res, next) => {
  try {
    const { date, userId, department, page = 1, limit = 50 } = req.query;
    const query = {};

    if (date) {
      const d = new Date(date);
      query.date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }

    if (userId) query.userId = userId;

    // Manager: limit to team
    if (req.user.role === 'manager') {
      const teamMembers = await User.find({ managerId: req.user._id }).select('_id');
      const teamIds = teamMembers.map((m) => m._id);
      teamIds.push(req.user._id);
      query.userId = { $in: teamIds };
    }

    // Filter by department
    if (department && req.user.role === 'hr_admin') {
      const deptUsers = await User.find({ department }).select('_id');
      query.userId = { $in: deptUsers.map((u) => u._id) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .populate('userId', 'fullName employeeId department designation')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: records,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance stats
// @route   GET /api/attendance/stats
exports.getAttendanceStats = async (req, res, next) => {
  try {
    const today = getToday();
    let userFilter = {};

    if (req.user.role === 'manager') {
      const teamMembers = await User.find({ managerId: req.user._id }).select('_id');
      const teamIds = teamMembers.map((m) => m._id);
      teamIds.push(req.user._id);
      userFilter = { userId: { $in: teamIds } };
    }

    const todayRecords = await Attendance.countDocuments({ ...userFilter, date: today });
    const presentToday = await Attendance.countDocuments({ ...userFilter, date: today, status: 'Present' });
    const lateToday = await Attendance.countDocuments({ ...userFilter, date: today, status: 'Late' });

    // Last 30 days stats
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyStats = await Attendance.aggregate([
      { $match: { ...userFilter, date: { $gte: thirtyDaysAgo, $lte: today } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        today: { total: todayRecords, present: presentToday, late: lateToday },
        monthly: monthlyStats,
      },
    });
  } catch (error) {
    next(error);
  }
};
