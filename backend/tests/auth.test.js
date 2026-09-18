const request = require('supertest');

const app = require('../src/app');
const User = require('../src/models/User');
const { connect, clear, disconnect } = require('./setup');

beforeAll(connect);
afterEach(clear);
afterAll(disconnect);

const validUser = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  password: 'secret123',
};

describe('POST /api/auth/register', () => {
  it('creates a user and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe('ada@example.com');
  });

  it('never returns the password, hashed or otherwise', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.body.user.password).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain(validUser.password);
  });

  it('stores the password hashed, not in plaintext', async () => {
    await request(app).post('/api/auth/register').send(validUser);

    const stored = await User.findOne({ email: validUser.email }).select('+password');
    expect(stored.password).not.toBe(validUser.password);
    expect(stored.password.startsWith('$2')).toBe(true);
  });

  it('rejects a password shorter than 6 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, password: 'abc' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects a duplicate email regardless of casing', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: 'ADA@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already registered/i);
  });
});

describe('POST /api/auth/login', () => {
  it('returns a token for correct credentials', async () => {
    await request(app).post('/api/auth/register').send(validUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  it('rejects a wrong password without revealing which field was wrong', async () => {
    await request(app).post('/api/auth/register').send(validUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('gives the same message for an unknown email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'secret123' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });
});

describe('GET /api/auth/me', () => {
  it('rejects a request with no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects a malformed token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer not-a-real-token');

    expect(res.status).toBe(401);
  });

  it('returns the current user for a valid token', async () => {
    const { body } = await request(app).post('/api/auth/register').send(validUser);

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(validUser.email);
  });
});
