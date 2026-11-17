import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { asyncRoute, fail, requiredString, serialize } from '../lib/http.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const publicUser = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  timeZone: user.timeZone,
});
const tokenFor = (user) =>
  jwt.sign({}, process.env.JWT_SECRET, { subject: String(user._id), expiresIn: '24h' });
const validTimeZone = (value) => {
  try {
    new Intl.DateTimeFormat('en', { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
};

router.post(
  '/register',
  asyncRoute(async (req, res) => {
    const name = requiredString(req.body.name, 'name', 100);
    const email = requiredString(req.body.email, 'email', 254).toLowerCase();
    const password = req.body.password;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      fail(400, 'VALIDATION_ERROR', 'Dữ liệu gửi lên không hợp lệ.', [
        { field: 'email', message: 'Email không hợp lệ.' },
      ]);
    if (typeof password !== 'string' || password.length < 8)
      fail(400, 'VALIDATION_ERROR', 'Dữ liệu gửi lên không hợp lệ.', [
        { field: 'password', message: 'Mật khẩu phải có ít nhất 8 ký tự.' },
      ]);
    const timeZone = req.body.timeZone ?? 'Asia/Ho_Chi_Minh';
    if (!validTimeZone(timeZone))
      fail(400, 'VALIDATION_ERROR', 'Dữ liệu gửi lên không hợp lệ.', [
        { field: 'timeZone', message: 'Mã IANA không hợp lệ.' },
      ]);
    const user = await User.create({
      name,
      email,
      timeZone,
      passwordHash: await bcrypt.hash(password, 12),
    });
    res.status(201).json({ data: { user: publicUser(user) } });
  })
);

router.post(
  '/login',
  asyncRoute(async (req, res) => {
    const email = requiredString(req.body.email, 'email', 254).toLowerCase();
    if (typeof req.body.password !== 'string')
      fail(400, 'VALIDATION_ERROR', 'Dữ liệu gửi lên không hợp lệ.', [
        { field: 'password', message: 'Mật khẩu là bắt buộc.' },
      ]);
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash)))
      fail(401, 'INVALID_CREDENTIALS', 'Email hoặc mật khẩu không đúng.');
    res.json({ data: { user: publicUser(user), token: tokenFor(user) } });
  })
);

router.get('/me', requireAuth, (req, res) => res.json({ data: { user: publicUser(req.user) } }));

router.patch(
  '/me',
  requireAuth,
  asyncRoute(async (req, res) => {
    const allowed = ['name', 'timeZone'];
    if (
      !Object.keys(req.body).length ||
      Object.keys(req.body).some((key) => !allowed.includes(key))
    )
      fail(400, 'VALIDATION_ERROR', 'Chỉ được cập nhật name và timeZone.');
    if (req.body.name !== undefined) req.user.name = requiredString(req.body.name, 'name', 100);
    if (req.body.timeZone !== undefined) {
      if (!validTimeZone(req.body.timeZone))
        fail(400, 'VALIDATION_ERROR', 'Mã IANA không hợp lệ.', [
          { field: 'timeZone', message: 'Mã IANA không hợp lệ.' },
        ]);
      req.user.timeZone = req.body.timeZone;
    }
    await req.user.save();
    res.json({ data: { user: publicUser(req.user) } });
  })
);

export default router;
