const User = require('../models/User');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const TrainingProgram = require('../models/TrainingProgram');
const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');

const getToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

// @desc    Get HR Admin dashboard
// @route   GET /api/dashboard/hr
exports.getHRDashboard = async (req, res, next) => {
  try {
    const today = getToday();

    const [
      totalEmployees,
      activeEmployees,
      todayAttendance,
      pendingLeaves,
      activeTraining,
      departmentStats,
      recentAnnouncements,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ isActive: true }),
      Attendance.countDocuments({ date: today }),
      LeaveRequest.countDocuments({ status: 'Pending' }),
      TrainingProgram.countDocuments({ status: { $in: ['Upcoming', 'In Progress'] } }),
      User.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Announcement.find({ isArchived: false })
        .populate('authorId', 'fullName')
        .sort({ publishedAt: -1 })
        .limit(5),
    ]);

    // Attendance over last 7 days
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const attendanceChart = await Attendance.aggregate([
      { $match: { date: { $gte: sevenDaysAgo, $lte: today } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          present: { $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$status', 'Late'] }, 1, 0] } },
          halfDay: { $sum: { $cond: [{ $eq: ['$status', 'Half-Day'] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Leave summary
    const leaveSummary = await LeaveRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        todayAttendance,
        pendingLeaves,
        activeTraining,
        departmentStats,
        attendanceChart,
        leaveSummary,
        recentAnnouncements,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Manager dashboard
// @route   GET /api/dashboard/manager
exports.getManagerDashboard = async (req, res, next) => {
  try {
    const today = getToday();
    const teamMembers = await User.find({ managerId: req.user._id, isActive: true }).select('_id');
    const teamIds = teamMembers.map((m) => m._id);

    const [teamSize, teamAttendanceToday, pendingLeaves, upcomingTraining] = await Promise.all([
      teamMembers.length,
      Attendance.countDocuments({ userId: { $in: teamIds }, date: today }),
      LeaveRequest.countDocuments({ userId: { $in: teamIds }, status: 'Pending' }),
      TrainingProgram.countDocuments({
        assignedEmployees: { $in: teamIds },
        status: 'Upcoming',
      }),
    ]);

    const teamAttendanceRecords = await Attendance.find({ userId: { $in: teamIds }, date: today })
      .populate('userId', 'fullName employeeId');

    const pendingLeaveRequests = await LeaveRequest.find({ userId: { $in: teamIds }, status: 'Pending' })
      .populate('userId', 'fullName employeeId')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        teamSize,
        teamAttendanceToday,
        pendingLeaves,
        upcomingTraining,
        teamAttendanceRecords,
        pendingLeaveRequests,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Employee dashboard
// @route   GET /api/dashboard/employee
exports.getEmployeeDashboard = async (req, res, next) => {
  try {
    const today = getToday();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [todayAttendance, recentAttendance, leaveStats, upcomingTraining, recentAnnouncements, unreadNotifications] =
      await Promise.all([
        Attendance.findOne({ userId: req.user._id, date: today }),
        Attendance.find({ userId: req.user._id, date: { $gte: sevenDaysAgo } }).sort({ date: -1 }),
        LeaveRequest.aggregate([
          { $match: { userId: req.user._id } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        TrainingProgram.find({ assignedEmployees: req.user._id, status: 'Upcoming' })
          .sort({ startDate: 1 })
          .limit(3),
        Announcement.find({
          isArchived: false,
          publishedAt: { $ne: null },
          $or: [{ targetDepartment: null }, { targetDepartment: req.user.department }],
        })
          .sort({ publishedAt: -1 })
          .limit(5),
        Notification.countDocuments({ userId: req.user._id, isRead: false }),
      ]);

    res.status(200).json({
      success: true,
      data: {
        todayAttendance,
        recentAttendance,
        leaveStats,
        upcomingTraining,
        recentAnnouncements,
        unreadNotifications,
      },
    });
  } catch (error) {
    next(error);
  }
};
