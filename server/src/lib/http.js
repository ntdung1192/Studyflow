import mongoose from 'mongoose';

export class HttpError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

export function fail(status, code, message, details) {
  throw new HttpError(status, code, message, details);
}

export function objectId(value, field = 'id') {
  if (!mongoose.isValidObjectId(value))
    fail(400, 'VALIDATION_ERROR', 'Dữ liệu gửi lên không hợp lệ.', [
      { field, message: 'ID không hợp lệ.' },
    ]);
  return value;
}

export function requiredString(value, field, max = 200) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) {
    fail(400, 'VALIDATION_ERROR', 'Dữ liệu gửi lên không hợp lệ.', [
      { field, message: `Trường này là bắt buộc và tối đa ${max} ký tự.` },
    ]);
  }
  return value.trim();
}

export function optionalString(value, field, max = 2000) {
  if (value == null || value === '') return null;
  if (typeof value !== 'string' || value.length > max)
    fail(400, 'VALIDATION_ERROR', 'Dữ liệu gửi lên không hợp lệ.', [
      { field, message: `Tối đa ${max} ký tự.` },
    ]);
  return value.trim();
}

export function validDate(value, field) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.valueOf()))
    fail(400, 'VALIDATION_ERROR', 'Dữ liệu gửi lên không hợp lệ.', [
      { field, message: 'Ngày giờ không hợp lệ.' },
    ]);
  return date;
}

export function pageOptions(query) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 20));
  return { skip: (page - 1) * limit, limit };
}

export function serialize(doc) {
  if (Array.isArray(doc)) return doc.map(serialize);
  if (!doc) return doc;
  const value = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  const { _id, __v, passwordHash, ...rest } = value;
  return { id: String(_id ?? value.id), ...rest };
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error?.code === 11000) {
    const email = Object.hasOwn(error.keyPattern ?? {}, 'email');
    return res
      .status(409)
      .json({
        error: {
          code: email ? 'EMAIL_ALREADY_EXISTS' : 'RESOURCE_CONFLICT',
          message: email ? 'Email đã được sử dụng.' : 'Dữ liệu bị trùng.',
        },
      });
  }
  if (error?.name === 'ValidationError' || error?.name === 'CastError') {
    return res
      .status(400)
      .json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dữ liệu gửi lên không hợp lệ.',
          details: Object.values(error.errors ?? {}).map((item) => ({
            field: item.path,
            message: item.message,
          })),
        },
      });
  }
  const status = error.status ?? 500;
  if (status >= 500) console.error(error);
  return res
    .status(status)
    .json({
      error: {
        code: error.code ?? 'INTERNAL_ERROR',
        message: status >= 500 ? 'Đã xảy ra lỗi máy chủ.' : error.message,
        ...(error.details ? { details: error.details } : {}),
      },
    });
}
