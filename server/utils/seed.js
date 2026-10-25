const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const User = require('../models/User');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const TrainingProgram = require('../models/TrainingProgram');
const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/staffsync';

async function seed() {
  try {
    console.log(' Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log(' Connected to MongoDB.');

    // Clear old collections
    console.log(' Cleaning old records...');
    await Promise.all([
      User.deleteMany({}),
      Attendance.deleteMany({}),
      LeaveRequest.deleteMany({}),
      TrainingProgram.deleteMany({}),
      Announcement.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log(' Seeding Users (Admin, Managers, Employees)...');
    // Common default password: Password123!
    const defaultPassword = 'Password123!';

    // 1. Create HR Admin
    const hrAdmin = await User.create({
      employeeId: 'EMP-001',
      fullName: 'Sarah Jenkins',
      email: 'admin@staffsync.com',
      password: defaultPassword,
      role: 'hr_admin',
      department: 'Human Resources',
      designation: 'HR Director & VP People',
      phoneNumber: '+1 (555) 019-2831',
      joiningDate: new Date('2021-01-15'),
      isActive: true,
    });

    // 2. Create Managers
    const engManager = await User.create({
      employeeId: 'EMP-002',
      fullName: 'Marcus Vance',
      email: 'manager.eng@staffsync.com',
      password: defaultPassword,
      role: 'manager',
      department: 'Engineering',
      designation: 'VP of Engineering',
      phoneNumber: '+1 (555) 014-9821',
      joiningDate: new Date('2021-06-01'),
      isActive: true,
    });

    const mktManager = await User.create({
      employeeId: 'EMP-003',
      fullName: 'Elena Rodriguez',
      email: 'manager.mkt@staffsync.com',
      password: defaultPassword,
      role: 'manager',
      department: 'Marketing',
      designation: 'Head of Marketing',
      phoneNumber: '+1 (555) 018-7712',
      joiningDate: new Date('2022-02-10'),
      isActive: true,
    });

    // 3. Create Employees
    const empAlice = await User.create({
      employeeId: 'EMP-004',
      fullName: 'Alice Johnson',
      email: 'alice@staffsync.com',
      password: defaultPassword,
      role: 'employee',
      department: 'Engineering',
      designation: 'Senior Full Stack Developer',
      phoneNumber: '+1 (555) 012-3456',
      joiningDate: new Date('2022-08-15'),
      managerId: engManager._id,
      isActive: true,
    });

    const empBob = await User.create({
      employeeId: 'EMP-005',
      fullName: 'Bob Chen',
      email: 'bob@staffsync.com',
      password: defaultPassword,
      role: 'employee',
      department: 'Engineering',
      designation: 'Frontend Engineer',
      phoneNumber: '+1 (555) 015-6789',
      joiningDate: new Date('2023-03-20'),
      managerId: engManager._id,
      isActive: true,
    });

    const empClara = await User.create({
      employeeId: 'EMP-006',
      fullName: 'Clara Oswald',
      email: 'clara@staffsync.com',
      password: defaultPassword,
      role: 'employee',
      department: 'Marketing',
      designation: 'Senior Content Strategist',
      phoneNumber: '+1 (555) 017-4321',
      joiningDate: new Date('2023-05-12'),
      managerId: mktManager._id,
      isActive: true,
    });

    const empDavid = await User.create({
      employeeId: 'EMP-007',
      fullName: 'David Miller',
      email: 'david@staffsync.com',
      password: defaultPassword,
      role: 'employee',
      department: 'Sales',
      designation: 'Enterprise Account Executive',
      phoneNumber: '+1 (555) 019-8765',
      joiningDate: new Date('2023-11-01'),
      managerId: hrAdmin._id,
      isActive: true,
    });

    const allUsers = [hrAdmin, engManager, mktManager, empAlice, empBob, empClara, empDavid];
    console.log(` Created ${allUsers.length} users.`);

    // 4. Seed Attendance (Last 7 days)
    console.log(' Seeding Attendance records...');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const attendanceRecords = [];
    for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
      const recordDate = new Date(today);
      recordDate.setDate(recordDate.getDate() - dayOffset);

      // Skip weekends
      const dayOfWeek = recordDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      for (const u of allUsers) {
        // Randomize attendance status
        const isToday = dayOffset === 0;
        const checkInHour = 8 + Math.floor(Math.random() * 2); // 8:xx or 9:xx
        const checkInMin = Math.floor(Math.random() * 50);
        const checkIn = new Date(recordDate);
        checkIn.setHours(checkInHour, checkInMin, 0);

        let checkOut = null;
        let workHours = 0;
        let status = checkInHour >= 9 && checkInMin > 15 ? 'Late' : 'Present';

        if (!isToday || Math.random() > 0.4) {
          checkOut = new Date(recordDate);
          checkOut.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 45), 0);
          workHours = parseFloat(((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(1));
        }

        attendanceRecords.push({
          userId: u._id,
          date: recordDate,
          checkIn,
          checkOut,
          workHours,
          status,
          remarks: status === 'Late' ? 'Traffic congestion' : 'Regular shift',
        });
      }
    }
    await Attendance.insertMany(attendanceRecords);
    console.log(` Created ${attendanceRecords.length} attendance records.`);

    // 5. Seed Leave Requests
    console.log(' Seeding Leave Requests...');
    const leaves = [
      {
        userId: empAlice._id,
        leaveType: 'Casual',
        startDate: new Date(Date.now() + 3 * 86400000),
        endDate: new Date(Date.now() + 5 * 86400000),
        reason: 'Family wedding celebration in my hometown.',
        status: 'Pending',
      },
      {
        userId: empBob._id,
        leaveType: 'Sick',
        startDate: new Date(Date.now() - 4 * 86400000),
        endDate: new Date(Date.now() - 3 * 86400000),
        reason: 'Viral fever and prescribed medical rest.',
        status: 'Approved',
        reviewedBy: engManager._id,
        decisionTimestamp: new Date(Date.now() - 4 * 86400000),
      },
      {
        userId: empClara._id,
        leaveType: 'Earned',
        startDate: new Date(Date.now() + 10 * 86400000),
        endDate: new Date(Date.now() + 14 * 86400000),
        reason: 'Annual vacation trip.',
        status: 'Approved',
        reviewedBy: mktManager._id,
        decisionTimestamp: new Date(Date.now() - 2 * 86400000),
      },
      {
        userId: empDavid._id,
        leaveType: 'Unpaid',
        startDate: new Date(Date.now() - 10 * 86400000),
        endDate: new Date(Date.now() - 9 * 86400000),
        reason: 'Personal urgent family matter.',
        status: 'Rejected',
        reviewedBy: hrAdmin._id,
        rejectionReason: 'Critical sales client demo scheduled on that day.',
        decisionTimestamp: new Date(Date.now() - 11 * 86400000),
      },
    ];
    await LeaveRequest.insertMany(leaves);
    console.log(` Created ${leaves.length} leave requests.`);

    // 6. Seed Announcements
    console.log(' Seeding Announcements...');
    const announcements = [
      {
        title: 'Welcome to StaffSync Modern HR Platform',
        content: 'We are thrilled to launch StaffSync across the entire organization! Please familiarize yourself with attendance check-in, leave application, and company training tracking features.',
        category: 'General',
        authorId: hrAdmin._id,
        publishedAt: new Date(Date.now() - 2 * 86400000),
        isArchived: false,
      },
      {
        title: 'Q4 Annual Town Hall & Recognition Gala',
        content: 'Join us this coming Friday at 4:00 PM EST in the Main Auditorium or virtually on Teams for our Q4 town hall meeting and quarterly excellence awards.',
        category: 'Events',
        authorId: hrAdmin._id,
        publishedAt: new Date(Date.now() - 1 * 86400000),
        isArchived: false,
      },
      {
        title: 'Updated Health & Wellness Benefit Policies',
        content: 'The 2026 employee wellness insurance package details have been finalized. Employees can claim annual gym subscriptions, mental health coverage, and flexible medical plans.',
        category: 'HR Updates',
        authorId: hrAdmin._id,
        publishedAt: new Date(),
        isArchived: false,
      },
    ];
    await Announcement.insertMany(announcements);
    console.log(` Created ${announcements.length} announcements.`);

    // 7. Seed Training Programs
    console.log(' Seeding Training Programs...');
    const trainings = [
      {
        title: 'Full-Stack MERN & Microservices Architecture',
        description: 'Comprehensive masterclass on modern microservice design, reactive data pipelines, and scalable enterprise patterns in Node.js and React.',
        trainer: 'Dr. Aris Thorne (Cloud Architect)',
        startDate: new Date(Date.now() + 7 * 86400000),
        endDate: new Date(Date.now() + 14 * 86400000),
        location: 'Virtual Classroom A & Lab',
        capacity: 25,
        status: 'Upcoming',
        assignedEmployees: [empAlice._id, empBob._id],
      },
      {
        title: 'Modern Product Growth & Digital Inbound Marketing',
        description: 'Advanced omnichannel campaign execution, SEO engineering, and performance analytics for marketing leaders.',
        trainer: 'Elena Rodriguez & Guest Speakers',
        startDate: new Date(Date.now() - 3 * 86400000),
        endDate: new Date(Date.now() + 4 * 86400000),
        location: 'Training Room B - HQ 3rd Floor',
        capacity: 15,
        status: 'In Progress',
        assignedEmployees: [empClara._id],
      },
      {
        title: 'Security Compliance & Data Protection Essentials',
        description: 'Mandatory annual ISO 27001 and GDPR cybersecurity training for all staff members.',
        trainer: 'Global Cybersec Compliance Team',
        startDate: new Date(Date.now() - 30 * 86400000),
        endDate: new Date(Date.now() - 25 * 86400000),
        location: 'Self-paced E-Learning Portal',
        capacity: 100,
        status: 'Completed',
        assignedEmployees: [hrAdmin._id, engManager._id, mktManager._id, empAlice._id, empBob._id, empClara._id, empDavid._id],
      },
    ];
    await TrainingProgram.insertMany(trainings);
    console.log(` Created ${trainings.length} training programs.`);

    // 8. Seed Notifications
    console.log(' Seeding Notifications...');
    const notifications = [
      {
        userId: empAlice._id,
        title: 'Training Program Enrolled',
        message: 'You have been enrolled in Full-Stack MERN & Microservices Architecture.',
        type: 'training',
        isRead: false,
      },
      {
        userId: engManager._id,
        title: 'New Leave Request Submitted',
        message: 'Alice Johnson has requested Casual leave for 3 days.',
        type: 'leave',
        isRead: false,
      },
      {
        userId: empBob._id,
        title: 'Leave Request Approved',
        message: 'Your Sick leave request for 2 days has been approved by Marcus Vance.',
        type: 'leave',
        isRead: true,
      },
      {
        userId: hrAdmin._id,
        title: 'System Initialized',
        message: 'StaffSync HRMS seeded successfully with baseline data.',
        type: 'system',
        isRead: false,
      },
    ];
    await Notification.insertMany(notifications);
    console.log(` Created ${notifications.length} notifications.`);

    console.log('\n======================================================');
    console.log(' STAFFSYNC SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Demo Credentials (Password for all: Password123!):');
    console.log('------------------------------------------------------');
    console.log('1. HR Admin:   admin@staffsync.com          (Sarah Jenkins)');
    console.log('2. Manager:    manager.eng@staffsync.com    (Marcus Vance - Engineering)');
    console.log('3. Manager:    manager.mkt@staffsync.com    (Elena Rodriguez - Marketing)');
    console.log('4. Employee:   alice@staffsync.com          (Alice Johnson - Dev)');
    console.log('5. Employee:   bob@staffsync.com            (Bob Chen - Frontend)');
    console.log('6. Employee:   clara@staffsync.com          (Clara Oswald - Content)');
    console.log('7. Employee:   david@staffsync.com          (David Miller - Sales)');
    console.log('======================================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(' Seeding Failed:', error);
    process.exit(1);
  }
}

seed();
