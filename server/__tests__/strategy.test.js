const request = require('supertest');
const app = require('../app');
const { sequelize, User, SavedStrategy } = require('../models');
const { hashPassword } = require('../helpers/bcrypt');
const { signToken } = require('../helpers/jwt');

let userToken;
let user2Token;
let strategyId;

beforeAll(async () => {
  const user = await User.create({
    username: 'stratuser',
    email: 'stratuser@mail.com',
    password: hashPassword('user123'),
    role: 'user',
  });
  const user2 = await User.create({
    username: 'stratuser2',
    email: 'stratuser2@mail.com',
    password: hashPassword('user123'),
    role: 'user',
  });

  userToken = signToken({ id: user.id });
  user2Token = signToken({ id: user2.id });
});

afterAll(async () => {
  await sequelize.queryInterface.bulkDelete('Votes', null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
  await sequelize.queryInterface.bulkDelete('SavedStrategies', null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
  await sequelize.queryInterface.bulkDelete('Users', null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
  await sequelize.close();
});

describe('POST /api/strategies', () => {
  test('201 - success create strategy', async () => {
    const res = await request(app)
      .post('/api/strategies')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Test Strategy',
        enemyComp: [1, 2, 3],
        recommendation: 'Pick Esmeralda and Karrie',
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('title', 'Test Strategy');
    strategyId = res.body.id;
  });

  test('401 - no token', async () => {
    const res = await request(app)
      .post('/api/strategies')
      .send({ title: 'No Auth', enemyComp: [1], recommendation: 'test' });
    expect(res.status).toBe(401);
  });

  test('400 - empty title', async () => {
    const res = await request(app)
      .post('/api/strategies')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: '', enemyComp: [1], recommendation: 'test' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/strategies', () => {
  test('200 - get all strategies', async () => {
    const res = await request(app).get('/api/strategies');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe('PUT /api/strategies/:id', () => {
  test('200 - update own strategy', async () => {
    const res = await request(app)
      .put(`/api/strategies/${strategyId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Updated Strategy' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('title', 'Updated Strategy');
  });

  test('403 - cannot update others strategy', async () => {
    const res = await request(app)
      .put(`/api/strategies/${strategyId}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ title: 'Hacked' });
    expect(res.status).toBe(403);
  });

  test('404 - strategy not found', async () => {
    const res = await request(app)
      .put('/api/strategies/9999')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Ghost' });
    expect(res.status).toBe(404);
  });
});

describe('POST /api/strategies/:id/vote', () => {
  test('200 - upvote strategy', async () => {
    const res = await request(app)
      .post(`/api/strategies/${strategyId}/vote`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ type: 'up' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('likes', 1);
  });

  test('400 - already voted same way', async () => {
    const res = await request(app)
      .post(`/api/strategies/${strategyId}/vote`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ type: 'up' });
    expect(res.status).toBe(400);
  });

  test('200 - change vote to down', async () => {
    const res = await request(app)
      .post(`/api/strategies/${strategyId}/vote`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ type: 'down' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('likes', -1);
  });

  test('400 - invalid vote type', async () => {
    const res = await request(app)
      .post(`/api/strategies/${strategyId}/vote`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ type: 'invalid' });
    expect(res.status).toBe(400);
  });

  test('404 - vote on non-existent strategy', async () => {
    const res = await request(app)
      .post('/api/strategies/9999/vote')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ type: 'up' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/strategies/:id/vote', () => {
  test('200 - remove vote', async () => {
    const res = await request(app)
      .delete(`/api/strategies/${strategyId}/vote`)
      .set('Authorization', `Bearer ${user2Token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Vote removed');
  });

  test('404 - remove vote that doesnt exist', async () => {
    const res = await request(app)
      .delete(`/api/strategies/${strategyId}/vote`)
      .set('Authorization', `Bearer ${user2Token}`);
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/strategies/:id', () => {
  test('403 - cannot delete others strategy', async () => {
    const res = await request(app)
      .delete(`/api/strategies/${strategyId}`)
      .set('Authorization', `Bearer ${user2Token}`);
    expect(res.status).toBe(403);
  });

  test('200 - delete own strategy', async () => {
    const res = await request(app)
      .delete(`/api/strategies/${strategyId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Strategy deleted successfully');
  });

  test('404 - strategy not found', async () => {
    const res = await request(app)
      .delete('/api/strategies/9999')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(404);
  });
});
