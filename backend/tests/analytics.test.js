const request = require('supertest');

const app = require('../src/app');
const Post = require('../src/models/Post');
const { connect, clear, disconnect } = require('./setup');

beforeAll(connect);
afterEach(clear);
afterAll(disconnect);

const signUp = async (email) => {
  const { body } = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Test User', email, password: 'secret123' });
  return { token: body.token, userId: body.user.id };
};

const publishedPost = (user, overrides = {}) =>
  Post.create({
    user,
    content: 'Published post',
    platform: 'instagram',
    status: 'published',
    publishedTime: new Date(),
    engagement: { likes: 10, comments: 2, shares: 1, reach: 100 },
    ...overrides,
  });

const get = (token, range) =>
  request(app)
    .get(range ? `/api/analytics?range=${range}` : '/api/analytics')
    .set('Authorization', `Bearer ${token}`);

describe('GET /api/analytics', () => {
  it('requires authentication', async () => {
    expect((await request(app).get('/api/analytics')).status).toBe(401);
  });

  it('returns a zeroed, gap-free series when nothing is published', async () => {
    const { token } = await signUp('a@example.com');

    const res = await get(token, 7);

    expect(res.status).toBe(200);
    expect(res.body.postsTracked).toBe(0);
    expect(res.body.daily).toHaveLength(7);
    expect(res.body.totals).toEqual({
      likes: 0,
      comments: 0,
      shares: 0,
      reach: 0,
      engagement: 0,
    });
  });

  it('aggregates engagement from the user own published posts', async () => {
    const { token, userId } = await signUp('a@example.com');
    await publishedPost(userId);
    await publishedPost(userId, { platform: 'linkedin' });

    const res = await get(token, 30);

    expect(res.body.postsTracked).toBe(2);
    expect(res.body.totals.likes).toBe(20);
    expect(res.body.totals.reach).toBe(200);
    // engagement = likes + comments + shares, per post
    expect(res.body.totals.engagement).toBe(26);
  });

  it('breaks engagement down by platform', async () => {
    const { token, userId } = await signUp('a@example.com');
    await publishedPost(userId);
    await publishedPost(userId, {
      platform: 'linkedin',
      engagement: { likes: 50, comments: 0, shares: 0, reach: 500 },
    });

    const res = await get(token, 30);

    expect(res.body.platforms).toEqual([
      { platformId: 'linkedin', value: 50 },
      { platformId: 'instagram', value: 13 },
    ]);
  });

  it('ignores drafts and scheduled posts', async () => {
    const { token, userId } = await signUp('a@example.com');
    await Post.create({
      user: userId,
      content: 'Draft',
      platform: 'instagram',
      status: 'draft',
      engagement: { likes: 999, comments: 0, shares: 0, reach: 0 },
    });

    const res = await get(token, 30);

    expect(res.body.postsTracked).toBe(0);
    expect(res.body.totals.likes).toBe(0);
  });

  it("does not include another user's posts", async () => {
    const alice = await signUp('alice@example.com');
    const bob = await signUp('bob@example.com');
    await publishedPost(alice.userId);

    const res = await get(bob.token, 30);

    expect(res.body.postsTracked).toBe(0);
  });

  it('excludes posts published before the requested range', async () => {
    const { token, userId } = await signUp('a@example.com');
    await publishedPost(userId, {
      publishedTime: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    });

    const inRange = await get(token, 30);
    const outOfRange = await get(token, 7);

    expect(inRange.body.postsTracked).toBe(1);
    expect(outOfRange.body.postsTracked).toBe(0);
  });

  it('falls back to 30 days for an unsupported range', async () => {
    const { token } = await signUp('a@example.com');

    const res = await get(token, 999);

    expect(res.body.range).toBe(30);
    expect(res.body.daily).toHaveLength(30);
  });

  it('never returns base64 image payloads', async () => {
    const { token, userId } = await signUp('a@example.com');
    await publishedPost(userId, {
      image: 'data:image/png;base64,AAAA',
      hasImage: true,
    });

    const res = await get(token, 30);

    expect(res.body.topPosts[0].hasImage).toBe(true);
    expect(JSON.stringify(res.body)).not.toContain('base64');
  });

  it('ranks top posts by engagement', async () => {
    const { token, userId } = await signUp('a@example.com');
    await publishedPost(userId, { content: 'quiet' });
    await publishedPost(userId, {
      content: 'popular',
      engagement: { likes: 500, comments: 0, shares: 0, reach: 900 },
    });

    const res = await get(token, 30);

    expect(res.body.topPosts.map((p) => p.content)).toEqual(['popular', 'quiet']);
  });
});
