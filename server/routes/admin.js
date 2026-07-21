const express = require('express');
const { body, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const PresidentRequest = require('../models/PresidentRequest');
const { protect, authorize } = require('../middleware/auth');
const { sendNotification, notifyAdmins, emitComplaintUpdate } = require('../utils/notifications');
const logger = require('../config/logger');

const router = express.Router();
router.use(protect);
router.use(authorize('admin','president'));

// ─── GET /api/admin/complaints ── List all complaints ─────────────────────────
router.get('/complaints', async (req, res, next) => {
  try {
    const {
      status,
      category,
      priority,
      search,
      page = 1,
      limit = 15
    } = req.query;

    const query = {};
// President sees only his village complaints
if (req.user.role === 'president') {
  query.villageName = req.user.villageName;
}
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { complaintId: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Complaint.countDocuments(query);

    const complaints = await Complaint.find(query)
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      complaints,
      total,
      pages: Math.ceil(total / limit)
    });

  } catch (err) {
    next(err);
  }
});

 // CREATE USER (admin can create users/presidents)
router.post('/users', authorize('admin'), async (req, res, next) => {
  try {
    const { name, email, password, role, department } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role, // 'user' | 'admin' | 'president'
      department: department || ''
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user
    });

  } catch (err) {
    next(err);
  }
});

    // UPDATE USER DETAILS
router.put('/users/:id', authorize('admin'), async (req, res, next) => {
  try {
    const { name, email, role, department, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (department !== undefined) user.department = department;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });

  } catch (err) {
    next(err);
  }
});

// DELETE USER (or deactivate)
router.delete('/users/:id', authorize('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // soft delete (recommended)
    user.isActive = false;
    user.email = user.email + '_deleted_' + Date.now();

    await user.save();

    res.json({
      success: true,
      message: 'User deactivated successfully'
  });
    const allowedSorts = ['-priorityScore', '-createdAt', 'createdAt', 'status', '-upvotes'];
    const sortField = allowedSorts.includes(sort) ? sort : '-priorityScore';
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const [total, complaints] = await Promise.all([
      Complaint.countDocuments(query),
      Complaint.find(query)
        .sort(sortField)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate('submittedBy', 'name email phone')
        .populate('assignedTo', 'name email department')
        .lean()
    ]);

    res.json({
      success: true,
      complaints,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) }
    });
  } catch (err) {
    next(err);
  }
});


// ─── PUT /api/admin/complaints/:id/status ── Update status ───────────────────
router.put('/complaints/:id/status', [
  body('status').isIn(['pending','under_review','in_progress','resolved','rejected','closed']).withMessage('Invalid status'),
  body('note').optional().trim().isLength({ max: 500 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const complaint = await Complaint.findById(req.params.id).populate('submittedBy', '_id name email');
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    const { status, note } = req.body;
    const oldStatus = complaint.status;

    complaint.status = status;
    // Remember who handled this complaint
complaint.assignedTo = req.user._id;
    complaint.statusHistory.push({
      status,
      changedBy: req.user._id,
      note: note || `Status changed from ${oldStatus} to ${status} by ${req.user.name}`,
      changedAt: new Date()
    });

    if (status === 'resolved' && !complaint.resolvedAt) {
      complaint.resolvedAt = new Date();
    }

    await complaint.save();
    await complaint.populate('assignedTo', 'name email');

    logger.info(`Complaint ${complaint.complaintId} status: ${oldStatus} → ${status} by ${req.user.email}`);

    // Citizen notification
    const statusMessages = {
      under_review: 'is now under review by officials',
      in_progress: 'is being actively worked on',
      resolved: 'has been resolved! Please share your feedback.',
      rejected: 'could not be processed at this time',
      closed: 'has been closed'
    };

    await sendNotification(
      complaint.submittedBy._id,
      `Your complaint "${complaint.title}" ${statusMessages[status] || 'has been updated'}`,
      status === 'resolved' ? 'success' : status === 'rejected' ? 'warning' : 'info',
      complaint._id
    );

    // Real-time broadcast
    emitComplaintUpdate(complaint._id, {
      status,
      updatedBy: req.user.name,
      complaintId: complaint.complaintId
    });

    res.json({ success: true, message: `Status updated to ${status}`, complaint });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/admin/complaints/:id/assign ── Assign officer ──────────────────
router.put('/complaints/:id/assign', [
  body('officerId').optional({ nullable: true })
], async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const { officerId } = req.body;

    // Validate officer exists if provided
    if (officerId) {
      if (!mongoose.Types.ObjectId.isValid(officerId)) {
        return res.status(400).json({ success: false, message: 'Invalid officer ID' });
      }
      const president = await User.findById(officerId);

if (!president || !['admin', 'president'].includes(president.role)) {
  return res.status(400).json({
    success: false,
    message: 'Invalid president'
  });
}
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { assignedTo: officerId || null },
      { new: true }
    ).populate('assignedTo', 'name email department');

    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    if (officerId) {
      await sendNotification(
        officerId,
        `Complaint "${complaint.title}" [${complaint.complaintId}] has been assigned to you`,
        'info',
        complaint._id
      );
    }

    logger.info(`Complaint ${complaint.complaintId} assigned to officer ${officerId || 'unassigned'}`);
    res.json({ success: true, message: officerId ? 'Complaint assigned' : 'Assignment removed', complaint });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/admin/complaints/:id/respond ── Add official response ──────────
router.post('/complaints/:id/respond', [
  body('message').trim().notEmpty().withMessage('Response message required').isLength({ max: 2000 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const complaint = await Complaint.findById(req.params.id).populate('submittedBy', '_id name');
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    complaint.responses.push({
      message: req.body.message,
      respondedBy: req.user._id,
      respondedAt: new Date()
    });
    await complaint.save();

    await sendNotification(
      complaint.submittedBy._id,
      `An official response has been added to your complaint "${complaint.title}"`,
      'info',
      complaint._id
    );

    logger.info(`Response added to complaint ${complaint.complaintId} by ${req.user.email}`);
    res.json({ success: true, message: 'Response added', responses: complaint.responses });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/admin/stats ── Dashboard statistics ────────────────────────────
router.get('/stats', async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      total, pending, underReview, inProgress, resolved, rejected, critical, todayCount, weekCount,
      avgResolutionResult, topCategories
    ] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'pending' }),
      Complaint.countDocuments({ status: 'under_review' }),
      Complaint.countDocuments({ status: 'in_progress' }),
      Complaint.countDocuments({ status: 'resolved' }),
      Complaint.countDocuments({ status: 'rejected' }),
      Complaint.countDocuments({ priority: 'critical', status: { $nin: ['resolved','closed'] } }),
      Complaint.countDocuments({ createdAt: { $gte: today } }),
      Complaint.countDocuments({ createdAt: { $gte: weekAgo } }),
      Complaint.aggregate([
        { $match: { status: 'resolved', resolvedAt: { $ne: null } } },
        { $project: { resolutionMs: { $subtract: ['$resolvedAt', '$createdAt'] } } },
        { $group: { _id: null, avgMs: { $avg: '$resolutionMs' } } }
      ]),
      Complaint.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 5 }
      ])
    ]);

    const avgResolutionHours = avgResolutionResult.length > 0
      ? Math.round(avgResolutionResult[0].avgMs / (1000 * 60 * 60))
      : 0;

    res.json({
      success: true,
      stats: {
        total, pending, underReview, inProgress, resolved, rejected, critical,
        todayCount, weekCount, avgResolutionHours,
        resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
        topCategories
      }
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/admin/officers ── List officers for assignment ──────────────────
router.get('/presidents', async (req, res, next) => {
  try {
    const officers = await User.find({ role: { $in: ['admin', 'president'] }, isActive: true })
      .select('name email department role')
      .sort('name');
    res.json({ success: true, officers });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/admin/users ── List all users (admin only) ─────────────────────
router.get('/users', authorize('admin'), async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));

    const [total, users] = await Promise.all([
      User.countDocuments(query),
      User.find(query).select('-password -notifications').sort('-createdAt')
        .skip((pageNum - 1) * limitNum).limit(limitNum)
    ]);

    res.json({ success: true, users, pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) } });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/admin/users/:id/toggle ── Activate/deactivate user ──────────────
router.put('/users/:id/toggle', authorize('admin'), async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate your own account' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    logger.info(`User ${user.email} ${user.isActive ? 'activated' : 'deactivated'} by ${req.user.email}`);
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, isActive: user.isActive });
  } catch (err) {
    next(err);
  }
});
// DELETE Complaint
router.delete('/complaints/:id', authorize('admin'), async (req, res, next) => {
  try {

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    await Complaint.findByIdAndDelete(req.params.id);

    logger.info(
      `Complaint ${complaint.complaintId} deleted by ${req.user.email}`
    );

    res.json({
      success: true,
      message: 'Complaint deleted successfully'
    });

  } catch (err) {
    next(err);
  }
});

router.get('/president-requests', authorize('admin'), async (req, res) => {

    try {

        const requests = await PresidentRequest.find();

        console.log("President Requests:");
        console.log(requests);

        res.json({
            success: true,
            requests
        });

    } catch(err) {

        console.log(err);

        res.status(500).json({
            success:false,
            message:err.message
        });

    }

});
router.post('/president-requests/:id/approve', authorize('admin'), async (req, res) => {

  try {

    const request = await PresidentRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success:false,
        message:"Request not found"
      });
    }

    const existing = await User.findOne({
      email: request.email
    });

    if(existing){
      return res.status(400).json({
        success:false,
        message:"User already exists"
      });
    }

    const user = new User({

      name:request.name,
      email:request.email,
      password:request.password,
      phone:request.phone,
      role:"president",
      aadharNumber: request.aadharNumber,
      villageName:request.villageName,
      address:request.address

    });

    await user.save();

    await PresidentRequest.findByIdAndDelete(req.params.id);

    res.json({
      success:true,
      message:"President Approved"
    });

  } catch(err){

    res.status(500).json({
      success:false,
      message:err.message
    });

  }

});

router.delete('/president-requests/:id', authorize('admin'), async (req,res)=>{

    try{

        await PresidentRequest.findByIdAndDelete(req.params.id);

        res.json({
            success:true,
            message:"Request Rejected"
        });

    }catch(err){

        res.status(500).json({
            success:false,
            message:err.message
        });

    }

});

module.exports = router;
