const request = require('supertest');
const app = require('../app');
const { sequelize, Item, User } = require('../models');
const { hashPassword } = require('../helpers/bcrypt');
const { signToken } = require('../helpers/jwt');

let adminToken;
let userToken;
let itemId;

beforeAll(async () => {
  const admin = await User.create({
    username: 'itemadmin',
    email: 'itemadmin@mail.com',
    password: hashPassword('admin123'),
    role: 'admin',
  });
  const user = await User.create({
    username: 'itemuser',
    email: 'itemuser@mail.com',
    password: hashPassword('user123'),
    role: 'user',
  });

  adminToken = signToken({ id: admin.id });
  userToken = signToken({ id: user.id });

  const item = await Item.create({
    name: 'Test Sword',
    type: 'attack',
    price: 1000,
    description: 'A test item',
    passive: 'Test passive',
    stats: { physicalAttack: 50 },
  });
  itemId = item.id;
});

afterAll(async () => {
  await sequelize.queryInterface.bulkDelete('Items', null, {
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

describe('GET /api/items', () => {
  test('200 - get all items', async () => {
    const res = await request(app).get('/api/items');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('200 - filter by type', async () => {
    const res = await request(app).get('/api/items?type=attack');
    expect(res.status).toBe(200);
    res.body.forEach((item) => expect(item.type).toBe('attack'));
  });

  test('200 - search by name', async () => {
    const res = await request(app).get('/api/items?search=Test');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe('GET /api/items/:id', () => {
  test('200 - get item by id', async () => {
    const res = await request(app).get(`/api/items/${itemId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'Test Sword');
  });

  test('404 - item not found', async () => {
    const res = await request(app).get('/api/items/9999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Item not found');
  });
});

describe('POST /api/items', () => {
  test('201 - admin create item', async () => {
    const res = await request(app)
      .post('/api/items')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'New Item',
        type: 'magic',
        price: 2000,
        description: 'New magic item',
        stats: { magicPower: 80 },
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('name', 'New Item');
  });

  test('403 - user cannot create item', async () => {
    const res = await request(app)
      .post('/api/items')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Forbidden Item', type: 'attack' });
    expect(res.status).toBe(403);
  });

  test('401 - no token', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ name: 'No Auth Item', type: 'attack' });
    expect(res.status).toBe(401);
  });

  test('400 - empty name', async () => {
    const res = await request(app)
      .post('/api/items')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: '', type: 'attack' });
    expect(res.status).toBe(400);
  });

  test('400 - empty type', async () => {
    const res = await request(app)
      .post('/api/items')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'No Type', type: '' });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/items/:id', () => {
  test('200 - admin update item', async () => {
    const res = await request(app)
      .put(`/api/items/${itemId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Sword' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'Updated Sword');
  });

  test('404 - update item not found', async () => {
    const res = await request(app)
      .put('/api/items/9999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Ghost' });
    expect(res.status).toBe(404);
  });

  test('403 - user cannot update', async () => {
    const res = await request(app)
      .put(`/api/items/${itemId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Hacked' });
    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/items/:id', () => {
  test('403 - user cannot delete', async () => {
    const res = await request(app)
      .delete(`/api/items/${itemId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  test('200 - admin delete item', async () => {
    const res = await request(app)
      .delete(`/api/items/${itemId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  test('404 - delete item not found', async () => {
    const res = await request(app)
      .delete('/api/items/9999')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});
