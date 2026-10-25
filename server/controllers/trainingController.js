const TrainingProgram = require('../models/TrainingProgram');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Create training program
// @route   POST /api/training
exports.createTraining = async (req, res, next) => {
  try {
    const { title, description, trainer, startDate, endDate, location, capacity } = req.body;

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ success: false, message: 'Start date cannot be after end date' });
    }

    const program = await TrainingProgram.create({
      title,
      description,
      trainer,
      startDate,
      endDate,
      location,
      capacity,
    });

    res.status(201).json({ success: true, data: program });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all training programs
// @route   GET /api/training
exports.getTrainings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    // Employees only see programs they are assigned to
    if (req.user.role === 'employee') {
      query.assignedEmployees = req.user._id;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await TrainingProgram.countDocuments(query);
    const programs = await TrainingProgram.find(query)
      .populate('assignedEmployees', 'fullName employeeId department')
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: programs,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single training
// @route   GET /api/training/:id
exports.getTraining = async (req, res, next) => {
  try {
    const program = await TrainingProgram.findById(req.params.id)
      .populate('assignedEmployees', 'fullName employeeId department');

    if (!program) {
      return res.status(404).json({ success: false, message: 'Training program not found' });
    }

    res.status(200).json({ success: true, data: program });
  } catch (error) {
    next(error);
  }
};

// @desc    Update training
// @route   PUT /api/training/:id
exports.updateTraining = async (req, res, next) => {
  try {
    const { title, description, trainer, startDate, endDate, location, capacity, status } = req.body;

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ success: false, message: 'Start date cannot be after end date' });
    }

    const program = await TrainingProgram.findByIdAndUpdate(
      req.params.id,
      { title, description, trainer, startDate, endDate, location, capacity, status },
      { new: true, runValidators: true }
    );

    if (!program) {
      return res.status(404).json({ success: false, message: 'Training program not found' });
    }

    res.status(200).json({ success: true, data: program });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign employees to training
// @route   POST /api/training/:id/assign
exports.assignEmployees = async (req, res, next) => {
  try {
    const { employeeIds } = req.body;
    const program = await TrainingProgram.findById(req.params.id);

    if (!program) {
      return res.status(404).json({ success: false, message: 'Training program not found' });
    }

    const currentCount = program.assignedEmployees.length;
    const newIds = employeeIds.filter(
      (id) => !program.assignedEmployees.map((e) => e.toString()).includes(id)
    );

    if (currentCount + newIds.length > program.capacity) {
      return res.status(400).json({
        success: false,
        message: `Capacity exceeded. Remaining spots: ${program.capacity - currentCount}`,
      });
    }

    // Verify all employees exist
    const users = await User.find({ _id: { $in: newIds } });
    if (users.length !== newIds.length) {
      return res.status(400).json({ success: false, message: 'Some employee IDs are invalid' });
    }

    program.assignedEmployees.push(...newIds);
    await program.save();

    // Notify assigned employees
    const notifications = newIds.map((id) => ({
      userId: id,
      title: 'Training Assignment',
      message: `You have been assigned to training: ${program.title}`,
      type: 'training',
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    await program.populate('assignedEmployees', 'fullName employeeId department');
    res.status(200).json({ success: true, data: program });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove employee from training
// @route   DELETE /api/training/:id/assign/:employeeId
exports.removeEmployee = async (req, res, next) => {
  try {
    const program = await TrainingProgram.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ success: false, message: 'Training program not found' });
    }

    program.assignedEmployees = program.assignedEmployees.filter(
      (e) => e.toString() !== req.params.employeeId
    );
    await program.save();

    await program.populate('assignedEmployees', 'fullName employeeId department');
    res.status(200).json({ success: true, data: program });
  } catch (error) {
    next(error);
  }
};
