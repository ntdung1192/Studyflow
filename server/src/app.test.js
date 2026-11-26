import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { IncomingMessage } from 'node:http';
import { describe, it } from 'node:test';

process.env.JWT_SECRET ||= 'test-secret-key-for-studyflow-unit-tests-12345';

const { default: app } = await import('./app.js');

function invokeApp({ method = 'GET', url = '/', headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const socket = Object.assign(new EventEmitter(), {
      remoteAddress: '127.0.0.1',
      destroy() {},
      pause() {},
      resume() {},
    });
    const req = new IncomingMessage(socket);
    req.method = method;
    req.url = url;
    req.headers = Object.fromEntries(
      Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value])
    );
    if (body !== null && !req.headers['content-length']) {
      req.headers['content-length'] = String(Buffer.byteLength(body));
    }
    if (body !== null) req.push(Buffer.from(body));
    req.push(null);

    const chunks = [];
    const resHeaders = {};
    const res = new EventEmitter();
    res.statusCode = 200;
    res.headersSent = false;
    res.setHeader = (name, value) => {
      resHeaders[name.toLowerCase()] = value;
    };
    res.getHeader = (name) => resHeaders[name.toLowerCase()];
    res.removeHeader = (name) => {
      delete resHeaders[name.toLowerCase()];
    };
    res.writeHead = (status, hdrs = {}) => {
      res.statusCode = status;
      for (const [k, v] of Object.entries(hdrs)) res.setHeader(k, v);
      res.headersSent = true;
      return res;
    };
    res.write = (chunk) => {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      return true;
    };
    res.end = (chunk) => {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      res.headersSent = true;
      const raw = Buffer.concat(chunks).toString('utf8');
      let json = null;
      try {
        json = raw ? JSON.parse(raw) : null;
      } catch {
        json = null;
      }
      resolve({ status: res.statusCode, headers: resHeaders, text: raw, json });
      res.emit('finish');
    };

    app(req, res, (err) => {
      if (err) reject(err);
    });
  });
}

describe('Express app middleware', () => {
  it('responds to GET /api/v1/health', async () => {
    const res = await invokeApp({ method: 'GET', url: '/api/v1/health' });
    assert.equal(res.status, 200);
    assert.deepEqual(res.json, { data: { status: 'ok' } });
  });

  it('returns 400 VALIDATION_ERROR instead of 500 when JSON body is missing', async () => {
    const res = await invokeApp({ method: 'POST', url: '/api/v1/auth/login' });
    assert.equal(res.status, 400);
    assert.equal(res.json.error.code, 'VALIDATION_ERROR');
  });

  it('returns 400 VALIDATION_ERROR for malformed JSON payloads', async () => {
    const res = await invokeApp({
      method: 'POST',
      url: '/api/v1/auth/login',
      headers: { 'Content-Type': 'application/json' },
      body: '{"email":',
    });
    assert.equal(res.status, 400);
    assert.equal(res.json.error.code, 'VALIDATION_ERROR');
  });

  it('returns 400 VALIDATION_ERROR for JSON array body', async () => {
    const res = await invokeApp({
      method: 'POST',
      url: '/api/v1/auth/login',
      headers: { 'Content-Type': 'application/json' },
      body: '[]',
    });
    assert.equal(res.status, 400);
    assert.equal(res.json.error.code, 'VALIDATION_ERROR');
  });

  it('returns 401 UNAUTHENTICATED for protected routes without token', async () => {
    const res = await invokeApp({ method: 'GET', url: '/api/v1/subjects' });
    assert.equal(res.status, 401);
    assert.equal(res.json.error.code, 'UNAUTHENTICATED');
  });
});
