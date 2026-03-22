const request = require('supertest');
const app = require('../app');
const { sequelize, Hero, User } = require('../models');
const { hashPassword } = require('../helpers/bcrypt');
const { signToken } = require('../helpers/jwt');

let adminToken;
let userToken;
let heroId;

beforeAll(async () => {
  const admin = await User.create({
    username: 'heroadmin',
    email: 'heroadmin@mail.com',
    password: hashPassword('admin123'),
    role: 'admin',
  });
  const user = await User.create({
    username: 'herouser',
    email: 'herouser@mail.com',
    password: hashPassword('user123'),
    role: 'user',
  });

  adminToken = signToken({ id: admin.id });
  userToken = signToken({ id: user.id });

  const hero = await Hero.create({
    heroId: 999,
    name: 'Test Hero',
    role: 'Fighter',
    specialty: 'Damage',
    imageUrl: null,
    lane: 'EXP',
    durability: 5,
    offense: 8,
    controlEffect: 3,
    difficulty: 4,
  });
  heroId = hero.id;
});

afterAll(async () => {
  await sequelize.queryInterface.bulkDelete('Heroes', null, {
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

describe('GET /api/heroes', () => {
  test('200 - get all heroes', async () => {
    const res = await request(app).get('/api/heroes');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('200 - filter by role', async () => {
    const res = await request(app).get('/api/heroes?role=Fighter');
    expect(res.status).toBe(200);
    res.body.forEach((hero) => expect(hero.role).toBe('Fighter'));
  });

  test('200 - search by name', async () => {
    const res = await request(app).get('/api/heroes?search=Test');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe('GET /api/heroes/:id', () => {
  test('200 - get hero by id', async () => {
    const res = await request(app).get(`/api/heroes/${heroId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'Test Hero');
  });

  test('404 - hero not found', async () => {
    const res = await request(app).get('/api/heroes/9999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Hero not found');
  });
});

describe('POST /api/heroes', () => {
  test('201 - admin create hero', async () => {
    const res = await request(app)
      .post('/api/heroes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        heroId: 998,
        name: 'New Hero',
        role: 'Mage',
        specialty: 'Burst',
        lane: 'Mid',
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('name', 'New Hero');
  });

  test('403 - user cannot create hero', async () => {
    const res = await request(app)
      .post('/api/heroes')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ heroId: 997, name: 'Forbidden Hero', role: 'Tank' });
    expect(res.status).toBe(403);
  });

  test('401 - no token', async () => {
    const res = await request(app)
      .post('/api/heroes')
      .send({ heroId: 996, name: 'No Auth Hero', role: 'Tank' });
    expect(res.status).toBe(401);
  });

  test('400 - empty name', async () => {
    const res = await request(app)
      .post('/api/heroes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ heroId: 995, name: '', role: 'Tank' });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/heroes/:id', () => {
  test('200 - admin update hero', async () => {
    const res = await request(app)
      .put(`/api/heroes/${heroId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Hero' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'Updated Hero');
  });

  test('404 - update hero not found', async () => {
    const res = await request(app)
      .put('/api/heroes/9999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Ghost' });
    expect(res.status).toBe(404);
  });

  test('403 - user cannot update', async () => {
    const res = await request(app)
      .put(`/api/heroes/${heroId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Hacked' });
    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/heroes/:id', () => {
  test('403 - user cannot delete', async () => {
    const res = await request(app)
      .delete(`/api/heroes/${heroId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  test('200 - admin delete hero', async () => {
    const res = await request(app)
      .delete(`/api/heroes/${heroId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  test('404 - delete hero not found', async () => {
    const res = await request(app)
      .delete('/api/heroes/9999')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});
