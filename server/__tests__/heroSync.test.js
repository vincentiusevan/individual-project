const request = require('supertest');
const app = require('../app');
const { sequelize, User, Hero } = require('../models');
const { hashPassword } = require('../helpers/bcrypt');
const { signToken } = require('../helpers/jwt');
const axios = require('axios');

jest.mock('axios');

let adminToken;
let userToken;

beforeAll(async () => {
  const admin = await User.create({
    username: 'syncadmin',
    email: 'syncadmin@mail.com',
    password: hashPassword('admin123'),
    role: 'admin',
  });
  const user = await User.create({
    username: 'syncuser',
    email: 'syncuser@mail.com',
    password: hashPassword('user123'),
    role: 'user',
  });

  adminToken = signToken({ id: admin.id });
  userToken = signToken({ id: user.id });
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

describe('POST /api/heroes/sync', () => {
  test('200 - success sync heroes from API', async () => {
    // Mock hero-list response
    axios.get.mockImplementation((url) => {
      if (url.includes('hero-list')) {
        return Promise.resolve({
          data: {
            data: {
              records: [
                {
                  data: {
                    hero_id: 1,
                    hero: { data: { name: 'Miya', head: 'https://example.com/miya.png' } },
                  },
                },
                {
                  data: {
                    hero_id: 2,
                    hero: { data: { name: 'Balmond', head: 'https://example.com/balmond.png' } },
                  },
                },
              ],
            },
          },
        });
      }
      // Mock hero-detail response
      if (url.includes('hero-detail/1')) {
        return Promise.resolve({
          data: {
            data: {
              records: [
                {
                  data: {
                    hero: {
                      data: {
                        name: 'Miya',
                        head: 'https://example.com/miya.png',
                        sortlabel: ['Marksman', ''],
                        roadsortlabel: ['Gold Lane', ''],
                        speciality: ['Finisher', 'Damage'],
                        abilityshow: ['10', '70', '40', '10'],
                      },
                    },
                  },
                },
              ],
            },
          },
        });
      }
      if (url.includes('hero-detail/2')) {
        return Promise.resolve({
          data: {
            data: {
              records: [
                {
                  data: {
                    hero: {
                      data: {
                        name: 'Balmond',
                        head: 'https://example.com/balmond.png',
                        sortlabel: ['Fighter', ''],
                        roadsortlabel: ['EXP Lane', ''],
                        speciality: ['Damage', 'Regen'],
                        abilityshow: ['70', '70', '30', '30'],
                      },
                    },
                  },
                },
              ],
            },
          },
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const res = await request(app)
      .post('/api/heroes/sync')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.total).toBe(2);
  });

  test('200 - sync updates existing heroes', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('hero-list')) {
        return Promise.resolve({
          data: {
            data: {
              records: [
                {
                  data: {
                    hero_id: 1,
                    hero: { data: { name: 'Miya Updated', head: 'https://example.com/miya2.png' } },
                  },
                },
              ],
            },
          },
        });
      }
      if (url.includes('hero-detail/1')) {
        return Promise.resolve({
          data: {
            data: {
              records: [
                {
                  data: {
                    hero: {
                      data: {
                        name: 'Miya Updated',
                        head: 'https://example.com/miya2.png',
                        sortlabel: ['Marksman', ''],
                        roadsortlabel: ['Gold Lane', ''],
                        speciality: ['Finisher', 'Damage'],
                        abilityshow: ['10', '70', '40', '10'],
                      },
                    },
                  },
                },
              ],
            },
          },
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const res = await request(app)
      .post('/api/heroes/sync')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
  });

  test('400 - empty hero list from API', async () => {
    axios.get.mockResolvedValue({
      data: { data: { records: [] } },
    });

    const res = await request(app)
      .post('/api/heroes/sync')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('403 - user cannot sync', async () => {
    const res = await request(app)
      .post('/api/heroes/sync')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  test('401 - no token', async () => {
    const res = await request(app).post('/api/heroes/sync');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/heroes/:id/counters', () => {
  test('200 - get counters for hero', async () => {
    axios.get.mockResolvedValue({
      data: {
        data: {
          records: [
            {
              data: {
                hero_id: 1,
                hero: { data: { name: 'Miya' } },
                relation: {
                  strong: { target_hero_id: [2, 0] },
                  weak: { target_hero_id: [3, 0] },
                  assist: { target_hero_id: [2, 0] },
                },
              },
            },
            {
              data: {
                hero_id: 2,
                hero: { data: { name: 'Balmond' } },
                relation: {
                  strong: { target_hero_id: [1] },
                  weak: { target_hero_id: [3] },
                  assist: { target_hero_id: [1] },
                },
              },
            },
          ],
        },
      },
    });

    const hero = await Hero.findOne({ where: { heroId: 1 } });
    const res = await request(app).get(`/api/heroes/${hero.id}/counters`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('hero');
    expect(res.body).toHaveProperty('strong');
    expect(res.body).toHaveProperty('weak');
    expect(res.body).toHaveProperty('assist');
  });

  test('404 - hero not found for counters', async () => {
    const res = await request(app).get('/api/heroes/9999/counters');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Hero not found');
  });

  test('404 - counter data not found', async () => {
    axios.get.mockResolvedValue({
      data: {
        data: {
          records: [
            {
              data: {
                hero_id: 999,
                hero: { data: { name: 'Other' } },
                relation: {
                  strong: { target_hero_id: [] },
                  weak: { target_hero_id: [] },
                  assist: { target_hero_id: [] },
                },
              },
            },
          ],
        },
      },
    });

    const hero = await Hero.findOne({ where: { heroId: 1 } });
    const res = await request(app).get(`/api/heroes/${hero.id}/counters`);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Counter data not found');
  });
});
