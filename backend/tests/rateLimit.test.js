const request = require('supertest');

const app = require('../src/app');
const { connect, clear, disconnect } = require('./setup');

// This file lives on its own because the limiter's counters are module state:
// spending the budget here would otherwise affect other auth tests.
beforeAll(connect);
afterEach(clear);
afterAll(disconnect);

describe('auth rate limiting', () => {
  it('returns 429 once the failed-attempt budget is spent', async () => {
    const attempt = () =>
      request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'wrongpassword' });

    const statuses = [];
    for (let i = 0; i < 11; i++) {
      // Sequential, so the limiter counts them deterministically.
      // eslint-disable-next-line no-await-in-loop
      statuses.push((await attempt()).status);
    }

    // The limit is 10 per window; the first ten are ordinary auth failures.
    expect(statuses.slice(0, 10)).toEqual(Array(10).fill(401));
    expect(statuses[10]).toBe(429);
  });

  it('explains the wait in the 429 body', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(429);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/too many attempts/i);
  });
});
