import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { errorHandler, HttpError, objectId, serialize } from './http.js';

function createMockRes() {
  return {
    headersSent: false,
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return this;
    },
  };
}

describe('http helpers', () => {
  it('validates 24-hex ObjectIds strictly', () => {
    const valid = '673b2f9e8c1a4d5e6f708192';
    assert.equal(objectId(valid, 'taskId'), valid);
    assert.throws(() => objectId('123456789012', 'taskId'), HttpError);
    assert.throws(() => objectId(12345, 'taskId'), HttpError);
    assert.throws(() => objectId('not-an-id', 'taskId'), HttpError);
  });

  it('serializes documents without injecting undefined id', () => {
    assert.deepEqual(serialize({ status: 'ACTIVE' }), { status: 'ACTIVE' });
    assert.deepEqual(serialize({ groupId: 'g1', ownerId: 'u1' }), {
      groupId: 'g1',
      ownerId: 'u1',
    });
    assert.deepEqual(
      serialize({ _id: '673b2f9e8c1a4d5e6f708192', __v: 0, passwordHash: 'secret', name: 'An' }),
      { id: '673b2f9e8c1a4d5e6f708192', name: 'An' }
    );
  });

  it('maps malformed JSON SyntaxError to 400 VALIDATION_ERROR', () => {
    const res = createMockRes();
    const parseError = new SyntaxError('Unexpected token');
    parseError.status = 400;
    parseError.type = 'entity.parse.failed';

    errorHandler(parseError, {}, res, () => {});
    assert.equal(res.statusCode, 400);
    assert.equal(res.payload.error.code, 'VALIDATION_ERROR');
  });
});
