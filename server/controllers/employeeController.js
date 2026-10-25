const User = require('../models/User');

// @desc    Get all employees
// @route   GET /api/employees
exports.getEmployees = async (req, res, next) => {
  try {
    const { department, role, isActive, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (department) query.department = department;
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Manager: only see team members
    if (req.user.role === 'manager') {
      query.managerId = req.user._id;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);
    const employees = await User.find(query)
      .populate('managerId', 'fullName employeeId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: employees,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
exports.getEmployee = async (req, res, next) => {
  try {
    const employee = await User.findById(req.params.id).populate('managerId', 'fullName employeeId');
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Manager can only view own team
    if (req.user.role === 'manager' && employee.managerId?.toString() !== req.user._id.toString() && employee._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this employee' });
    }

    // Employee can only view self
    if (req.user.role === 'employee' && employee._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this employee' });
    }

    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

// @desc    Create employee
// @route   POST /api/employees
exports.createEmployee = async (req, res, next) => {
  try {
    const { employeeId, fullName, email, password, role, department, designation, phoneNumber, joiningDate, managerId } = req.body;

    // Validate manager reference
    if (managerId) {
      const manager = await User.findById(managerId);
      if (!manager) {
        return res.status(400).json({ success: false, message: 'Invalid manager reference' });
      }
    }

    const employee = await User.create({
      employeeId,
      fullName,
      email,
      password: password || 'staffsync123',
      role: role || 'employee',
      department,
      designation,
      phoneNumber,
      joiningDate,
      managerId,
    });

    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
exports.updateEmployee = async (req, res, next) => {
  try {
    const allowedFields = [
      'fullName', 'email', 'role', 'department', 'designation',
      'phoneNumber', 'joiningDate', 'managerId', 'isActive',
    ];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Validate manager reference
    if (updates.managerId) {
      const manager = await User.findById(updates.managerId);
      if (!manager) {
        return res.status(400).json({ success: false, message: 'Invalid manager reference' });
      }
    }

    const employee = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle employee active status
// @route   PATCH /api/employees/:id/toggle-status
exports.toggleStatus = async (req, res, next) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    employee.isActive = !employee.isActive;
    await employee.save();

    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

// @desc    Get managers list (for assignment dropdowns)
// @route   GET /api/employees/managers/list
exports.getManagers = async (req, res, next) => {
  try {
    const managers = await User.find({ role: { $in: ['manager', 'hr_admin'] }, isActive: true })
      .select('fullName employeeId department');
    res.status(200).json({ success: true, data: managers });
  } catch (error) {
    next(error);
  }
};
