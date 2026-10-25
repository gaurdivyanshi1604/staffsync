const LeaveRequest = require('../models/LeaveRequest');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Submit leave request
// @route   POST /api/leaves
exports.createLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({ success: false, message: 'Start date cannot be after end date' });
    }

    // Check for overlapping requests
    const overlap = await LeaveRequest.findOne({
      userId: req.user._id,
      status: { $in: ['Pending', 'Approved'] },
      startDate: { $lte: end },
      endDate: { $gte: start },
    });

    if (overlap) {
      return res.status(400).json({ success: false, message: 'Overlapping leave request exists' });
    }

    const leave = await LeaveRequest.create({
      userId: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      reason,
    });

    res.status(201).json({ success: true, data: leave });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my leave requests
// @route   GET /api/leaves/my
exports.getMyLeaves = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { userId: req.user._id };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await LeaveRequest.countDocuments(query);
    const leaves = await LeaveRequest.find(query)
      .populate('reviewedBy', 'fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: leaves,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all leave requests (HR) or team leaves (Manager)
// @route   GET /api/leaves
exports.getAllLeaves = async (req, res, next) => {
  try {
    const { status, userId, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (userId) query.userId = userId;

    // Manager: only team members
    if (req.user.role === 'manager') {
      const teamMembers = await User.find({ managerId: req.user._id }).select('_id');
      query.userId = { $in: teamMembers.map((m) => m._id) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await LeaveRequest.countDocuments(query);
    const leaves = await LeaveRequest.find(query)
      .populate('userId', 'fullName employeeId department')
      .populate('reviewedBy', 'fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: leaves,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/Reject leave
// @route   PUT /api/leaves/:id/decide
exports.decideLeave = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Approved or Rejected' });
    }

    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Can only decide on pending requests' });
    }

    // Prevent self-approval
    if (leave.userId.toString() === req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Cannot approve/reject your own leave' });
    }

    // Manager: verify the employee is in their team
    if (req.user.role === 'manager') {
      const employee = await User.findById(leave.userId);
      if (!employee || employee.managerId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to decide this request' });
      }
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;
    leave.decisionTimestamp = new Date();
    if (status === 'Rejected' && rejectionReason) {
      leave.rejectionReason = rejectionReason;
    }
    await leave.save();

    // Create notification for the employee
    await Notification.create({
      userId: leave.userId,
      title: `Leave ${status}`,
      message: `Your ${leave.leaveType} leave request from ${leave.startDate.toLocaleDateString()} to ${leave.endDate.toLocaleDateString()} has been ${status.toLowerCase()}.${rejectionReason ? ' Reason: ' + rejectionReason : ''}`,
      type: 'leave',
    });

    res.status(200).json({ success: true, data: leave });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel leave (own, pending only)
// @route   PUT /api/leaves/:id/cancel
exports.cancelLeave = async (req, res, next) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (leave.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Can only cancel pending requests' });
    }

    leave.status = 'Cancelled';
    await leave.save();

    res.status(200).json({ success: true, data: leave });
  } catch (error) {
    next(error);
  }
};
