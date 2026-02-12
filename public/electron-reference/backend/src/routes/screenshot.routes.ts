import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth';
import { enforceTenant } from '../middleware/tenantIsolation';
import { requireRole } from '../middleware/roleGuard';
import { Screenshot } from '../models/Screenshot';
import { uploadToS3, getSignedDownloadUrl } from '../utils/s3';
import { AppError } from '../utils/errors';

const router = Router();
router.use(authenticate, enforceTenant);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// POST /api/agent/screenshots — upload from agent
router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400);

  const metadata = JSON.parse(req.body.metadata || '{}');
  const key = `screenshots/${req.auth!.company_id}/${req.auth!.user_id}/${Date.now()}.webp`;

  await uploadToS3(key, req.file.buffer, req.file.mimetype);

  const screenshot = await Screenshot.create({
    user_id: req.auth!.user_id,
    company_id: req.auth!.company_id,
    session_id: metadata.session_id,
    timestamp: new Date(metadata.timestamp || Date.now()),
    s3_key: key,
    s3_bucket: process.env.AWS_S3_BUCKET,
    file_size: req.file.size,
    resolution: metadata.resolution || { width: 1920, height: 1080 },
    monitor_id: metadata.monitor_id,
    activity_score: metadata.activity_score || 0,
    active_window: metadata.active_window || { title: '', app_name: '' },
    blurred: metadata.blurred || false,
  });

  res.status(201).json({ success: true, id: screenshot._id });
});

// GET /api/screenshots/:userId (admin)
router.get('/:userId', requireRole('company_admin', 'sub_admin'), async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  const [screenshots, total] = await Promise.all([
    Screenshot.find({ company_id: req.auth!.company_id, user_id: req.params.userId })
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Screenshot.countDocuments({ company_id: req.auth!.company_id, user_id: req.params.userId }),
  ]);

  res.json({ screenshots, total, page, limit });
});

// GET /api/screenshots/:id/url (admin) — signed download URL
router.get('/:id/url', requireRole('company_admin', 'sub_admin'), async (req, res) => {
  const screenshot = await Screenshot.findOne({ _id: req.params.id, company_id: req.auth!.company_id });
  if (!screenshot) throw new AppError('Screenshot not found', 404);

  const signedUrl = await getSignedDownloadUrl(screenshot.s3_key);
  res.json({ signedUrl });
});

export default router;
