import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { authenticate } from '../middleware/auth';
import { enforceTenant } from '../middleware/tenantIsolation';
import { requireRole } from '../middleware/roleGuard';
import { validate } from '../middleware/validate';
import { User } from '../models/User';
import { Session } from '../models/Session';
import { Screenshot } from '../models/Screenshot';
import { ActivityLog } from '../models/ActivityLog';
import { Company } from '../models/Company';
import { AppError } from '../utils/errors';

const router = Router();
router.use(authenticate, enforceTenant, requireRole('company_admin'));

const inviteSchema = z.object({
  email: z.string().email().max(255),
  role: z.enum(['sub_admin', 'user']).default('user'),
});

const rulesSchema = z.object({
  rules: z.object({
    screenshot_interval: z.number().int().min(60).max(3600).optional(),
    idle_threshold: z.number().int().min(60).max(1800).optional(),
    blur_screenshots: z.boolean().optional(),
    track_urls: z.boolean().optional(),
    track_apps: z.boolean().optional(),
  }),
});

// GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  const companyId = req.auth!.company_id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalUsers, activeToday, activeSessions, screenshotsToday] = await Promise.all([
    User.countDocuments({ company_id: companyId, status: 'active' }),
    Session.distinct('user_id', { company_id: companyId, start_time: { $gte: today } }).then((ids) => ids.length),
    Session.countDocuments({ company_id: companyId, status: { $in: ['active', 'paused'] } }),
    Screenshot.countDocuments({ company_id: companyId, timestamp: { $gte: today } }),
  ]);

  const avgActivity = await ActivityLog.aggregate([
    { $match: { company_id: companyId, timestamp: { $gte: today } } },
    { $group: { _id: null, avg: { $avg: '$activity_score' } } },
  ]);

  res.json({
    stats: {
      totalUsers,
      activeToday,
      activeSessions,
      screenshotsToday,
      avgActivityScore: avgActivity[0]?.avg ?? 0,
    },
  });
});

// PUT /api/admin/monitoring-rules
router.put('/monitoring-rules', validate(rulesSchema), async (req, res) => {
  await Company.findByIdAndUpdate(req.auth!.company_id, {
    $set: { settings: { ...req.body.rules } },
  });
  res.json({ success: true });
});

// POST /api/admin/invite
router.post('/invite', validate(inviteSchema), async (req, res) => {
  const { email, role } = req.body;

  // Check plan user limit
  const company = await Company.findById(req.auth!.company_id);
  if (!company) throw new AppError('Company not found', 404);

  const currentUserCount = await User.countDocuments({ company_id: req.auth!.company_id });
  if (currentUserCount >= company.max_users) {
    throw new AppError(`User limit reached (${company.max_users}). Upgrade your plan.`, 403);
  }

  const existing = await User.findOne({ company_id: req.auth!.company_id, email });
  if (existing) throw new AppError('User already exists in this company', 409);

  const inviteToken = crypto.randomBytes(32).toString('hex');

  const user = await User.create({
    company_id: req.auth!.company_id,
    email,
    password_hash: 'PENDING',
    name: email.split('@')[0],
    role,
    status: 'invited',
    invite_token: inviteToken,
  });

  // TODO: Send invite email via SES/SendGrid
  res.status(201).json({ inviteId: user._id, inviteToken });
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  const users = await User.find({ company_id: req.auth!.company_id })
    .select('-password_hash')
    .sort({ created_at: -1 })
    .lean();
  res.json({ users });
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, company_id: req.auth!.company_id });
  if (!user) throw new AppError('User not found', 404);
  if (user.role === 'company_admin') throw new AppError('Cannot delete company admin', 403);

  await User.deleteOne({ _id: req.params.id });
  res.json({ success: true });
});

export default router;
