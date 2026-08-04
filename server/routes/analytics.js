const express = require('express');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Village = require('../models/Village');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

const allowAnalyticsAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' });
  }

  const role = String(req.user.role || '').toLowerCase();
  if (['admin', 'president', 'superadmin'].includes(role)) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: `Role '${req.user.role}' is not authorized to access analytics.`
  });
};

router.use(allowAnalyticsAccess);

const getRoleScope = (user) => {
  if (!user) return {};
  if (!['president', 'admin'].includes(user.role)) return {};

  const filters = [];
  if (user.villageName) filters.push({ 'location.villageName': user.villageName });
  if (user.wardNumber) filters.push({ 'location.area': user.wardNumber });

  return filters.length > 0 ? { $or: filters } : {};
};

const applyRoleScope = (user, query = {}) => {
  const scope = getRoleScope(user);
  return Object.keys(scope).length ? { ...query, ...scope } : query;
};

// ─── GET /api/analytics/monthly ── Last 12 months trend ─────────────────────
router.get('/monthly', async (req, res, next) => {
  try {
    const months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - (11 - i));
      return {
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        start: new Date(d.getFullYear(), d.getMonth(), 1),
        end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
      };
    });

    const data = await Promise.all(months.map(async ({ label, start, end }) => {
      const scope = applyRoleScope(req.user, { createdAt: { $gte: start, $lte: end } });
      const [total, resolved, critical] = await Promise.all([
        Complaint.countDocuments(scope),
        Complaint.countDocuments({ ...scope, status: 'resolved' }),
        Complaint.countDocuments({ ...scope, priority: 'critical' })
      ]);
      return { month: label, total, resolved, critical };
    }));

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/analytics/category ── By category breakdown ────────────────────
router.get('/category', async (req, res, next) => {
  try {
    const scope = getRoleScope(req.user);
    const pipeline = [];
    if (Object.keys(scope).length) pipeline.push({ $match: scope });
    pipeline.push({
      $group: {
        _id: '$category',
        total: { $sum: 1 },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        critical: { $sum: { $cond: [{ $eq: ['$priority', 'critical'] }, 1, 0] } } ,
        avgUpvotes: { $avg: { $size: '$upvotes' } }
      }
    });
    pipeline.push({ $sort: { total: -1 } });

    const data = await Complaint.aggregate(pipeline);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/analytics/resolution-time ── Avg resolution time by category ───
router.get('/resolution-time', async (req, res, next) => {
  try {
    const scope = getRoleScope(req.user);
    const pipeline = [];
    if (Object.keys(scope).length) pipeline.push({ $match: scope });
    pipeline.push(
      { $match: { status: 'resolved', resolvedAt: { $ne: null } } },
      {
        $project: {
          category: 1,
          resolutionHours: {
            $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 1000 * 60 * 60]
          }
        }
      },
      {
        $group: {
          _id: '$category',
          avgHours: { $avg: '$resolutionHours' },
          minHours: { $min: '$resolutionHours' },
          maxHours: { $max: '$resolutionHours' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          category: '$_id',
          avgDays: { $round: [{ $divide: ['$avgHours', 24] }, 1] },
          avgHours: { $round: ['$avgHours', 1] },
          minHours: { $round: ['$minHours', 1] },
          maxHours: { $round: ['$maxHours', 1] },
          count: 1
        }
      },
      { $sort: { avgHours: 1 } }
    );

    const data = await Complaint.aggregate(pipeline);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/analytics/priority ── Priority distribution ────────────────────
router.get('/priority', async (req, res, next) => {
  try {
    const scope = getRoleScope(req.user);
    const pipeline = [];
    if (Object.keys(scope).length) pipeline.push({ $match: scope });
    pipeline.push({ $group: { _id: '$priority', count: { $sum: 1 } } }, { $sort: { count: -1 } });

    const data = await Complaint.aggregate(pipeline);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/overview', async (req, res, next) => {
  try {
    const scope = applyRoleScope(req.user);
    const totalComplaints = await Complaint.countDocuments(scope);
    const openComplaints = await Complaint.countDocuments({ ...scope, status: { $in: ['pending', 'under_review', 'in_progress'] } });
    const resolvedComplaints = await Complaint.countDocuments({ ...scope, status: 'resolved' });
    const criticalComplaints = await Complaint.countDocuments({ ...scope, priority: 'critical' });

    const response = {
      totalComplaints,
      openComplaints,
      resolvedComplaints,
      criticalComplaints
    };

    if (req.user.role === 'superadmin') {
      const [totalVillages, totalPresidents, totalAdmins] = await Promise.all([
        Village.countDocuments(),
        User.countDocuments({ role: 'president' }),
        User.countDocuments({ role: 'admin' })
      ]);
      response.totalVillages = totalVillages;
      response.totalPresidents = totalPresidents;
      response.totalAdmins = totalAdmins;
    }

    res.json({ success: true, data: response });
  } catch (err) {
    next(err);
  }
});

router.get('/work-performance', async (req, res, next) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Only superadmin may access work performance analytics.' });
    }

    const officerPerformance = await Complaint.aggregate([
      { $match: { assignedTo: { $ne: null }, 'feedback.rating': { $exists: true, $ne: null } } },
      {
        $lookup: {
          from: 'users',
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'officer'
        }
      },
      { $unwind: '$officer' },
      { $match: { 'officer.role': { $in: ['admin', 'president'] } } },
      {
        $group: {
          _id: { officerId: '$officer._id', role: '$officer.role', name: '$officer.name' },
          avgRating: { $avg: '$feedback.rating' },
          feedbackCount: { $sum: 1 },
          totalAssigned: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } }
        }
      },
      {
        $project: {
          officerId: '$_id.officerId',
          role: '$_id.role',
          name: '$_id.name',
          avgRating: { $round: ['$avgRating', 1] },
          feedbackCount: 1,
          totalAssigned: 1,
          resolved: 1
        }
      },
      { $sort: { avgRating: -1, feedbackCount: -1 } }
    ]);

    const presidents = officerPerformance.filter(item => item.role === 'president');
    const admins = officerPerformance.filter(item => item.role === 'admin');

    const villagePerformance = await Complaint.aggregate([
      { $match: { 'location.villageName': { $ne: null, $exists: true } } },
      {
        $group: {
          _id: '$location.villageName',
          complaints: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          avgRating: { $avg: '$feedback.rating' },
          feedbackCount: { $sum: { $cond: [{ $gt: ['$feedback.rating', null] }, 1, 0] } }
        }
      },
      {
        $project: {
          village: '$_id',
          complaints: 1,
          resolved: 1,
          avgRating: { $round: ['$avgRating', 1] },
          feedbackCount: 1
        }
      },
      { $sort: { complaints: -1, avgRating: -1 } },
      { $limit: 10 }
    ]);

    res.json({ success: true, data: { presidents, admins, villages: villagePerformance } });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/analytics/area ── Complaints by area ───────────────────────────
router.get('/area', async (req, res, next) => {
  try {
    const scope = getRoleScope(req.user);
    const pipeline = [];
    if (Object.keys(scope).length) pipeline.push({ $match: scope });
    pipeline.push(
      { $match: { 'location.area': { $ne: null, $exists: true } } },
      {
        $group: {
          _id: '$location.area',
          total: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          critical: { $sum: { $cond: [{ $eq: ['$priority', 'critical'] }, 1, 0] } }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 15 }
    );

    const data = await Complaint.aggregate(pipeline);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/analytics/assigned-performance ── Assigned complaint stats ─────
router.get('/assigned-performance', async (req, res, next) => {
  try {
    if (req.user.role === 'president') {
      return res.json({ success: true, data: [] });
    }

    const data = await Complaint.aggregate([
      { $match: { assignedTo: { $ne: null } } },
      {
        $group: {
          _id: '$assignedTo',
          total: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          avgResolutionHours: {
            $avg: {
              $cond: [
                { $ne: ['$resolvedAt', null] },
                { $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 1000 * 60 * 60] },
                null
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'officer'
        }
      },
      { $unwind: { path: '$officer', preserveNullAndEmpty: false } },
      {
        $project: {
          name: '$officer.name',
          email: '$officer.email',
          department: '$officer.department',
          total: 1, resolved: 1,
          resolutionRate: {
            $cond: [{ $gt: ['$total', 0] }, { $multiply: [{ $divide: ['$resolved', '$total'] }, 100] }, 0]
          },
          avgResolutionHours: { $round: ['$avgResolutionHours', 1] }
        }
      },
      { $sort: { resolved: -1 } }
    ]);

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
