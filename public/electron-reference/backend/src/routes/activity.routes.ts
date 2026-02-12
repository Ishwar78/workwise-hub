import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { enforceTenant } from '../middleware/tenantIsolation';
import { requireRole } from '../middleware/roleGuard';
import { validate } from '../middleware/validate';
import { ActivityLog } from '../models/ActivityLog';

const router = Router();
router.use(authenticate, enforceTenant);

const activityBatchSchema = z.object({
  session_id: z.string(),
  logs: z.array(z.object({
    timestamp: z.string().datetime(),
    interval_start: z.string().datetime(),
    interval_end: z.string().datetime(),
    keyboard_events: z.number().int().min(0),
    mouse_events: z.number().int().min(0),
    mouse_distance: z.number().min(0),
    activity_score: z.number().min(0).max(100),
    idle: z.boolean(),
    active_window: z.object({
      title: z.string().max(500),
      app_name: z.string().max(200),
      url: z.string().max(2000).optional(),
    }),
  })).min(1).max(500),
});

// POST /api/agent/activity — batch upload from desktop agent
router.post('/', validate(activityBatchSchema), async (req, res) => {
  const docs = req.body.logs.map((log: any) => ({
    ...log,
    user_id: req.auth!.user_id,
    company_id: req.auth!.company_id,
    session_id: req.body.session_id,
    timestamp: new Date(log.timestamp),
    interval_start: new Date(log.interval_start),
    interval_end: new Date(log.interval_end),
  }));

  await ActivityLog.insertMany(docs, { ordered: false });
  res.json({ success: true, count: docs.length });
});

// POST /api/agent/heartbeat
router.post('/heartbeat', async (req, res) => {
  // Update last_seen, return any pending commands (force-logout, config change)
  const commands: any[] = [];
  res.json({ commands });
});

// GET /api/activity/:userId/timeline (admin)
router.get('/:userId/timeline', requireRole('company_admin', 'sub_admin'), async (req, res) => {
  const { date, range } = req.query;
  const start = new Date(date as string);
  const end = new Date(start);
  end.setDate(end.getDate() + (Number(range) || 1));

  const timeline = await ActivityLog.find({
    company_id: req.auth!.company_id,
    user_id: req.params.userId,
    timestamp: { $gte: start, $lt: end },
  }).sort({ timestamp: 1 }).lean();

  res.json({ timeline });
});

// GET /api/activity/:userId/summary (admin)
router.get('/:userId/summary', requireRole('company_admin', 'sub_admin'), async (req, res) => {
  const period = req.query.period === 'weekly' ? 7 : 1;
  const start = new Date();
  start.setDate(start.getDate() - period);

  const summary = await ActivityLog.aggregate([
    { $match: { company_id: req.auth!.company_id, user_id: req.params.userId, timestamp: { $gte: start } } },
    {
      $group: {
        _id: null,
        total_samples: { $sum: 1 },
        avg_activity: { $avg: '$activity_score' },
        total_keyboard: { $sum: '$keyboard_events' },
        total_mouse: { $sum: '$mouse_events' },
        idle_samples: { $sum: { $cond: ['$idle', 1, 0] } },
      },
    },
  ]);

  res.json({ summary: summary[0] || {} });
});

export default router;
