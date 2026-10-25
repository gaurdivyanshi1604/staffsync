process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_for_staffsync_hrms_app';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const app = require('../server');

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app).listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

describe('StaffSync API Server Health & Routes', () => {
  test('GET /api/health should return status healthy (200)', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.status, 'healthy');
    assert.strictEqual(body.version, '1.0.0');
  });

  test('GET /api/nonexistent should return 404 with error message', async () => {
    const res = await fetch(`${baseUrl}/api/nonexistent`);
    assert.strictEqual(res.status, 404);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.match(body.message, /Not found/);
  });

  test('POST /api/auth/login without body should reject with 400', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.message, 'Please provide email and password');
  });

  test('GET /api/employees without JWT token should reject with 401', async () => {
    const res = await fetch(`${baseUrl}/api/employees`);
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.message, 'Not authorized, no token');
  });

  test('GET /api/leaves/my without JWT token should reject with 401', async () => {
    const res = await fetch(`${baseUrl}/api/leaves/my`);
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.message, 'Not authorized, no token');
  });

  test('GET /api/attendance/today without JWT token should reject with 401', async () => {
    const res = await fetch(`${baseUrl}/api/attendance/today`);
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.message, 'Not authorized, no token');
  });
});
