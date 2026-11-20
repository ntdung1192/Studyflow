import express from 'express';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import groupRoutes from './routes/groups.js';
import personalRoutes from './routes/personal.js';
import plannerRoutes from './routes/planner.js';
import { errorHandler, HttpError } from './lib/http.js';
import { requireJwtSecret } from './middleware/auth.js';

requireJwtSecret();
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use((req, _res, next) => {
  if (req.body === undefined) {
    req.body = {};
    return next();
  }
  if (typeof req.body !== 'object' || req.body === null || Array.isArray(req.body)) {
    return next(new HttpError(400, 'VALIDATION_ERROR', 'Nội dung yêu cầu phải là JSON object.'));
  }
  return next();
});
app.get('/api/v1/health', (req, res) => res.json({ data: { status: 'ok' } }));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', personalRoutes);
app.use('/api/v1', groupRoutes);
app.use('/api/v1', plannerRoutes);
app.use('/api/v1', dashboardRoutes);
app.use((req, res, next) => next(new HttpError(404, 'NOT_FOUND', 'Không tìm thấy endpoint.')));
app.use(errorHandler);
export default app;
