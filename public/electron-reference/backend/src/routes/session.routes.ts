import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { enforceTenant } from '../middleware/tenantIsolation';
import { requireRole } from '../middleware/roleGuard';
import { validate } from '../middleware/validate';
import { Session } from '../models/Session';
import { AppError } from '../utils/errors';

const router = Router();
router.use(authenticate, enforceTenant);

const startSchema = z.object({
  device_id: z.string().uuid(),
  timestamp: z.string().datetime(),
});

// POST /api/sessions/start
router.post('/start', validate(startSchema), async (req, res) => {
  const existing = await Session.findOne({
    user_id: req.auth!.user_id,
    status: { $in: ['active', 'paused'] },
  });
  if (existing) throw new AppError('Active session already exists', 409);

  const session = await Session.create({
    user_id: req.auth!.user_id,
    company_id: req.auth!.company_id,
    device_id: req.body.device_id,
    start_time: new Date(req.body.timestamp),
    events: [{ type: 'start', timestamp: new Date(req.body.timestamp) }],
  });

  res.status(201).json({ session_id: session._id, startTime: session.start_time });
});

// PUT /api/sessions/:id/pause
router.put('/:id/pause', async (req, res) => {
  const session = await Session.findOneAndUpdate(
    { _id: req.params.id, user_id: req.auth!.user_id, status: 'active' },
    { $set: { status: 'paused' }, $push: { events: { type: 'pause', timestamp: new Date() } } },
    { new: true },
  );
  if (!session) throw new AppError('No active session found', 404);
  res.json({ success: true });
});

// PUT /api/sessions/:id/resume
router.put('/:id/resume', async (req, res) => {
  const session = await Session.findOneAndUpdate(
    { _id: req.params.id, user_id: req.auth!.user_id, status: 'paused' },
    { $set: { status: 'active' }, $push: { events: { type: 'resume', timestamp: new Date() } } },
    { new: true },
  );
  if (!session) throw new AppError('No paused session found', 404);
  res.json({ success: true });
});

// PUT /api/sessions/:id/end
router.put('/:id/end', async (req, res) => {
  const session = await Session.findOneAndUpdate(
    { _id: req.params.id, user_id: req.auth!.user_id, status: { $in: ['active', 'paused'] } },
    {
      $set: { status: 'ended', end_time: new Date(), summary: req.body.summary || {} },
      $push: { events: { type: 'end', timestamp: new Date() } },
    },
    { new: true },
  );
  if (!session) throw new AppError('No active session found', 404);
  res.json({ success: true });
});

// GET /api/sessions/active (admin)
router.get('/active', requireRole('company_admin', 'sub_admin'), async (req, res) => {
  const sessions = await Session.find({
    company_id: req.auth!.company_id,
    status: { $in: ['active', 'paused'] },
  }).populate('user_id', 'name email');
  res.json({ sessions });
});

// POST /api/sessions/:id/force-end (admin)
router.post('/:id/force-end', requireRole('company_admin'), async (req, res) => {
  const session = await Session.findOneAndUpdate(
    { _id: req.params.id, company_id: req.auth!.company_id, status: { $in: ['active', 'paused'] } },
    {
      $set: { status: 'force_ended', end_time: new Date() },
      $push: { events: { type: 'force_end', timestamp: new Date(), metadata: { reason: req.body.reason } } },
    },
    { new: true },
  );
  if (!session) throw new AppError('Session not found', 404);
  res.json({ success: true });
});

export default router;
