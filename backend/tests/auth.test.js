const request = require('supertest');

// These tests only check request validation, which does not require a live DB,
// so they are safe to run in CI without a MySQL service.
const app = require('../server');

describe('Auth API validation', () => {
  it('rejects registration with an invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'not-an-email', password: 'password123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects registration with a short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: '123' });

    expect(res.statusCode).toBe(400);
  });

  it('rejects login without a password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'test@example.com' });
    expect(res.statusCode).toBe(400);
  });

  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.statusCode).toBe(404);
  });
});