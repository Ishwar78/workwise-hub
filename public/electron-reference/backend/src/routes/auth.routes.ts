import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { User } from '../models/User';
import { env } from '../config/env';
import { getRedis } from '../config/redis';
import { AppError } from '../utils/errors';

const router = Router();

const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  device_id: z.string().uuid(),
  device_name: z.string().max(100).optional(),
  os: z.string().max(50).optional(),
});

const refreshSchema = z.object({
  refresh_token: z.string().min(1),
});

function generateTokens(payload: object) {
  const accessToken = jwt.sign(payload, env.JWT_PRIVATE_KEY, {
    algorithm: 'RS256',
    expiresIn: env.JWT_ACCESS_EXPIRY,
    issuer: 'teamtreck-api',
    audience: 'teamtreck-agent',
  });
  const refreshToken = jwt.sign(payload, env.JWT_PRIVATE_KEY, {
    algorithm: 'RS256',
    expiresIn: env.JWT_REFRESH_EXPIRY,
    issuer: 'teamtreck-api',
  });
  return { accessToken, refreshToken };
}

// POST /api/auth/login
router.post('/login', authLimiter, validate(loginSchema), async (req, res) => {
  const { email, password, device_id, device_name, os } = req.body;

  const user = await User.findOne({ email, status: 'active' }).select('+password_hash');
  if (!user) throw new AppError('Invalid credentials', 401);

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new AppError('Invalid credentials', 401);

  // Device binding
  const existingDevice = user.devices.find((d) => d.device_id === device_id);
  if (!existingDevice) {
    if (user.devices.length >= 3) {
      throw new AppError('Maximum devices reached. Remove a device first.', 403);
    }
    user.devices.push({
      device_id,
      device_name: device_name || 'Unknown',
      os: os || 'Unknown',
      bound_at: new Date(),
      last_seen: new Date(),
    });
  } else {
    existingDevice.last_seen = new Date();
  }
  user.last_login = new Date();
  await user.save();

  const payload = {
    user_id: user._id.toString(),
    company_id: user.company_id.toString(),
    role: user.role,
    device_id,
  };

  const tokens = generateTokens(payload);

  await getRedis().set(`refresh:${user._id}:${device_id}`, tokens.refreshToken, { EX: 7 * 86400 });

  res.json({
    token: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// POST /api/auth/refresh
router.post('/refresh', validate(refreshSchema), async (req, res) => {
  const { refresh_token } = req.body;

  let decoded: any;
  try {
    decoded = jwt.verify(refresh_token, env.JWT_PUBLIC_KEY, { algorithms: ['RS256'] });
  } catch {
    throw new AppError('Invalid refresh token', 401);
  }

  const stored = await getRedis().get(`refresh:${decoded.user_id}:${decoded.device_id}`);
  if (stored !== refresh_token) throw new AppError('Invalid refresh token', 401);

  const tokens = generateTokens({
    user_id: decoded.user_id,
    company_id: decoded.company_id,
    role: decoded.role,
    device_id: decoded.device_id,
  });

  await getRedis().set(`refresh:${decoded.user_id}:${decoded.device_id}`, tokens.refreshToken, { EX: 7 * 86400 });

  res.json({ token: tokens.accessToken, refreshToken: tokens.refreshToken });
});

// POST /api/auth/logout
router.post('/logout', authenticate, async (req, res) => {
  await getRedis().del(`refresh:${req.auth!.user_id}:${req.auth!.device_id}`);
  res.json({ success: true });
});

export default router;
