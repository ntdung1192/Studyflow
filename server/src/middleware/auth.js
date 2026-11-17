import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { asyncRoute, fail } from '../lib/http.js';

export const requireAuth = asyncRoute(async (req, res, next) => {
  const token = req.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) fail(401, 'UNAUTHENTICATED', 'Vui lòng đăng nhập.');
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    fail(401, 'UNAUTHENTICATED', 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.');
  }
  const user = await User.findById(payload.sub);
  if (!user) fail(401, 'UNAUTHENTICATED', 'Tài khoản không còn tồn tại.');
  req.user = user;
  next();
});

export function requireJwtSecret() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)
    throw new Error('JWT_SECRET must contain at least 32 characters.');
}
