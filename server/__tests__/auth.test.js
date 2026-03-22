const request = require('supertest');
const app = require('../app');
const { sequelize, User } = require('../models');
const { hashPassword } = require('../helpers/bcrypt');

beforeAll(async () => {
  await sequelize.queryInterface.bulkInsert('Users', [
    {
      username: 'testadmin',
      email: 'testadmin@mail.com',
      password: hashPassword('admin123'),
      role: 'admin',
      googleId: null,
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      username: 'testuser',
      email: 'testuser@mail.com',
      password: hashPassword('user123'),
      role: 'user',
      googleId: null,
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
});

afterAll(async () => {
  await sequelize.queryInterface.bulkDelete('Users', null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
  await sequelize.close();
});

let adminToken;
let userToken;

describe('POST /api/register', () => {
  test('201 - success register', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ username: 'newuser', email: 'newuser@mail.com', password: 'new123' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('email', 'newuser@mail.com');
  });

  test('400 - email already exists', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ username: 'newuser', email: 'newuser@mail.com', password: 'new123' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('400 - empty email', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ username: 'test', email: '', password: 'test123' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('400 - empty password', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ username: 'test', email: 'test2@mail.com', password: '' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('400 - empty username', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ username: '', email: 'test3@mail.com', password: 'test123' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('400 - invalid email format', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ username: 'test', email: 'invalidemail', password: 'test123' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('400 - password too short', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ username: 'test', email: 'short@mail.com', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
});

describe('POST /api/login', () => {
  test('200 - success login admin', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'testadmin@mail.com', password: 'admin123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('access_token');
    expect(res.body).toHaveProperty('role', 'admin');
    adminToken = res.body.access_token;
  });

  test('200 - success login user', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'testuser@mail.com', password: 'user123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('access_token');
    expect(res.body).toHaveProperty('role', 'user');
    userToken = res.body.access_token;
  });

  test('401 - wrong password', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'testadmin@mail.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Invalid email or password');
  });

  test('401 - email not found', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'notfound@mail.com', password: 'test123' });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Invalid email or password');
  });

  test('400 - empty email', async () => {
    const res = await request(app).post('/api/login').send({ email: '', password: 'test123' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Email and password are required');
  });

  test('400 - empty password', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'testadmin@mail.com', password: '' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Email and password are required');
  });
});

describe('GET /api/user/profile', () => {
  test('200 - success get profile', async () => {
    const res = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email', 'testadmin@mail.com');
    expect(res.body).not.toHaveProperty('password');
  });

  test('401 - no token', async () => {
    const res = await request(app).get('/api/user/profile');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message');
  });

  test('401 - invalid token', async () => {
    const res = await request(app)
      .get('/api/user/profile')
      .set('Authorization', 'Bearer invalidtoken123');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message');
  });
});

describe('POST /api/google-login', () => {
  test('400 - no google token', async () => {
    const res = await request(app).post('/api/google-login').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Google token is required');
  });

  test('500 - invalid google token', async () => {
    const res = await request(app).post('/api/google-login').send({ googleToken: 'invalidtoken' });
    expect(res.status).toBe(500);
  });
});
