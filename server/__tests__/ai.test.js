const request = require('supertest');
const app = require('../app');
const { sequelize, User, Hero, Item } = require('../models');
const { hashPassword } = require('../helpers/bcrypt');
const { signToken } = require('../helpers/jwt');

jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => 'Mock AI recommendation: Pick Esmeralda to counter enemy team.',
          },
        }),
      }),
    })),
  };
});

let userToken;

beforeAll(async () => {
  const user = await User.create({
    username: 'aiuser',
    email: 'aiuser@mail.com',
    password: hashPassword('user123'),
    role: 'user',
  });
  userToken = signToken({ id: user.id });

  await Hero.bulkCreate([
    {
      heroId: 1,
      name: 'Miya',
      role: 'Marksman',
      specialty: 'Damage',
      lane: 'Gold',
      durability: 4,
      offense: 9,
      controlEffect: 2,
      difficulty: 2,
    },
    {
      heroId: 2,
      name: 'Balmond',
      role: 'Fighter',
      specialty: 'Damage',
      lane: 'EXP',
      durability: 7,
      offense: 7,
      controlEffect: 3,
      difficulty: 3,
    },
    {
      heroId: 3,
      name: 'Saber',
      role: 'Assassin',
      specialty: 'Burst',
      lane: 'Jungle',
      durability: 3,
      offense: 9,
      controlEffect: 5,
      difficulty: 4,
    },
  ]);

  await Item.bulkCreate([
    { name: 'Blade of Despair', type: 'attack', price: 3010, stats: { physicalAttack: 160 } },
    { name: 'Holy Crystal', type: 'magic', price: 3000, stats: { magicPower: 100 } },
  ]);
});

afterAll(async () => {
  await sequelize.queryInterface.bulkDelete('Items', null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
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

describe('POST /api/ai/counter-strategy', () => {
  test('200 - success get AI recommendation', async () => {
    const res = await request(app)
      .post('/api/ai/counter-strategy')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ enemyHeroIds: [1, 2] });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('enemyComposition');
    expect(res.body).toHaveProperty('recommendation');
    expect(res.body.enemyComposition.length).toBe(2);
  });

  test('400 - empty enemyHeroIds', async () => {
    const res = await request(app)
      .post('/api/ai/counter-strategy')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ enemyHeroIds: [] });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('400 - missing enemyHeroIds', async () => {
    const res = await request(app)
      .post('/api/ai/counter-strategy')
      .set('Authorization', `Bearer ${userToken}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('400 - enemyHeroIds not array', async () => {
    const res = await request(app)
      .post('/api/ai/counter-strategy')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ enemyHeroIds: 'not array' });
    expect(res.status).toBe(400);
  });

  test('400 - more than 5 heroes', async () => {
    const res = await request(app)
      .post('/api/ai/counter-strategy')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ enemyHeroIds: [1, 2, 3, 1, 2, 3] });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Maximum 5 enemy heroes allowed');
  });

  test('404 - hero ids not found', async () => {
    const res = await request(app)
      .post('/api/ai/counter-strategy')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ enemyHeroIds: [9999] });
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message');
  });

  test('401 - no token', async () => {
    const res = await request(app)
      .post('/api/ai/counter-strategy')
      .send({ enemyHeroIds: [1, 2] });
    expect(res.status).toBe(401);
  });
});
