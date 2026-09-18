const request = require('supertest');

const app = require('../src/app');
const Post = require('../src/models/Post');
const { connect, clear, disconnect } = require('./setup');

beforeAll(connect);
afterEach(clear);
afterAll(disconnect);

// Registers a user and returns their bearer token.
const signUp = async (email) => {
  const { body } = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Test User', email, password: 'secret123' });
  return body.token;
};

const futureISO = (minutes = 60) =>
  new Date(Date.now() + minutes * 60 * 1000).toISOString();

const draft = { content: 'Hello world', platform: 'instagram' };

describe('POST /api/posts', () => {
  it('creates a draft', async () => {
    const token = await signUp('a@example.com');

    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send(draft);

    expect(res.status).toBe(201);
    expect(res.body.post.status).toBe('draft');
  });

  it('refuses to create a post that claims to be already published', async () => {
    const token = await signUp('a@example.com');

    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...draft, status: 'published' });

    expect(res.status).toBe(400);
    expect(await Post.countDocuments()).toBe(0);
  });

  it('rejects a schedule in the past', async () => {
    const token = await signUp('a@example.com');

    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...draft,
        status: 'scheduled',
        scheduledTime: new Date(Date.now() - 60_000).toISOString(),
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/future/i);
  });

  it('records hasImage so list views can show a placeholder', async () => {
    const token = await signUp('a@example.com');

    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...draft, image: 'data:image/png;base64,AAAA' });

    expect(res.body.post.hasImage).toBe(true);
  });
});

describe('GET /api/posts', () => {
  it('omits the base64 image from the list response', async () => {
    const token = await signUp('a@example.com');
    await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...draft, image: 'data:image/png;base64,AAAA' });

    const list = await request(app)
      .get('/api/posts')
      .set('Authorization', `Bearer ${token}`);

    expect(list.body.posts[0].image).toBeUndefined();
    expect(list.body.posts[0].hasImage).toBe(true);
  });

  it('returns the image from the detail route', async () => {
    const token = await signUp('a@example.com');
    const created = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...draft, image: 'data:image/png;base64,AAAA' });

    const detail = await request(app)
      .get(`/api/posts/${created.body.post._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(detail.body.post.image).toBe('data:image/png;base64,AAAA');
  });
});

describe('ownership scoping', () => {
  it("does not list another user's posts", async () => {
    const alice = await signUp('alice@example.com');
    const bob = await signUp('bob@example.com');

    await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${alice}`)
      .send(draft);

    const res = await request(app)
      .get('/api/posts')
      .set('Authorization', `Bearer ${bob}`);

    expect(res.body.posts).toHaveLength(0);
  });

  it("returns 404 rather than another user's post", async () => {
    const alice = await signUp('alice@example.com');
    const bob = await signUp('bob@example.com');

    const created = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${alice}`)
      .send(draft);
    const id = created.body.post._id;

    const read = await request(app)
      .get(`/api/posts/${id}`)
      .set('Authorization', `Bearer ${bob}`);
    const update = await request(app)
      .put(`/api/posts/${id}`)
      .set('Authorization', `Bearer ${bob}`)
      .send({ content: 'hijacked' });
    const remove = await request(app)
      .delete(`/api/posts/${id}`)
      .set('Authorization', `Bearer ${bob}`);

    expect([read.status, update.status, remove.status]).toEqual([404, 404, 404]);
    expect((await Post.findById(id)).content).toBe(draft.content);
  });

  it("does not count another user's posts in stats", async () => {
    const alice = await signUp('alice@example.com');
    const bob = await signUp('bob@example.com');

    await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${alice}`)
      .send(draft);

    const res = await request(app)
      .get('/api/posts/stats')
      .set('Authorization', `Bearer ${bob}`);

    expect(res.body.stats.total).toBe(0);
  });
});

describe('PUT /api/posts/:id — server-owned fields', () => {
  it('ignores a client-supplied engagement payload', async () => {
    const token = await signUp('a@example.com');
    const created = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send(draft);

    const res = await request(app)
      .put(`/api/posts/${created.body.post._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ engagement: { likes: 99999, reach: 123456 } });

    expect(res.status).toBe(200);
    expect(res.body.post.engagement.likes).toBe(0);
    expect(res.body.post.engagement.reach).toBe(0);
  });

  it('refuses to let a draft jump straight to published', async () => {
    const token = await signUp('a@example.com');
    const created = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send(draft);

    const res = await request(app)
      .put(`/api/posts/${created.body.post._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'published' });

    expect(res.status).toBe(400);
    expect((await Post.findById(created.body.post._id)).status).toBe('draft');
  });

  it('allows a draft to be scheduled', async () => {
    const token = await signUp('a@example.com');
    const created = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send(draft);

    const res = await request(app)
      .put(`/api/posts/${created.body.post._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'scheduled', scheduledTime: futureISO() });

    expect(res.status).toBe(200);
    expect(res.body.post.status).toBe('scheduled');
  });
});
