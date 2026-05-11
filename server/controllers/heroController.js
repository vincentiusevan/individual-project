const { Hero } = require('../models');
const axios = require('axios');
const { Op } = require('sequelize');

const LEGACY_BASE_URL = 'https://mlbb-stats.rone.dev/api';
const MLBB_ALTERNATIVE_API_URL = 'https://openmlbb.fastapicloud.dev/api';
const MLBB_API_URL = 'https://mlbb.rone.dev/api';

async function fetchHeroRelation(heroId) {
  const urls = [
    `${MLBB_ALTERNATIVE_API_URL}/heroes/${heroId}/relations`,
    `${MLBB_API_URL}/heroes/${heroId}/relations`,
    `${LEGACY_BASE_URL}/hero-relation/${heroId}`,
    `https://mlbb-stats.ridwaanhall.com/api/hero-relation/${heroId}`,
  ];

  for (const url of urls) {
    try {
      const { data } = await axios.get(url);
      return data;
    } catch (err) {
      // Try the next known provider URL before failing the request.
    }
  }

  throw { name: 'ExternalApiError', message: 'Failed to fetch counter data' };
}

class HeroController {
  // GET /api/heroes
  static async getAll(req, res, next) {
    try {
      const { role, lane, search } = req.query;
      const where = {};

      if (role) where.role = role;
      if (lane) where.lane = lane;
      if (search) where.name = { [Op.iLike]: `%${search}%` };

      const heroes = await Hero.findAll({ where, order: [['name', 'ASC']] });
      res.status(200).json(heroes);
    } catch (err) {
      next(err);
    }
  }

  // GET /api/heroes/:id
  static async getById(req, res, next) {
    try {
      const hero = await Hero.findByPk(req.params.id);
      if (!hero) throw { name: 'NotFound', message: 'Hero not found' };
      res.status(200).json(hero);
    } catch (err) {
      next(err);
    }
  }

  // POST /api/heroes (admin)
  static async create(req, res, next) {
    try {
      const hero = await Hero.create(req.body);
      res.status(201).json(hero);
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/heroes/:id (admin)
  static async update(req, res, next) {
    try {
      const hero = await Hero.findByPk(req.params.id);
      if (!hero) throw { name: 'NotFound', message: 'Hero not found' };
      await hero.update(req.body);
      res.status(200).json(hero);
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/heroes/:id (admin)
  static async delete(req, res, next) {
    try {
      const hero = await Hero.findByPk(req.params.id);
      if (!hero) throw { name: 'NotFound', message: 'Hero not found' };
      await hero.destroy();
      res.status(200).json({ message: `Hero ${hero.name} has been deleted` });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/heroes/sync
  static async syncFromAPI(req, res, next) {
    try {
      // Get hero IDs from hero-list (only returns 20, but we get the total)
      const { data: listRes } = await axios.get(`${LEGACY_BASE_URL}/hero-list`);
      const total = listRes.data?.total || 132;

      // Also collect names/images from the list we do have
      const listRecords = listRes.data?.records || [];
      const listMap = {};
      listRecords.forEach((r) => {
        listMap[r.data?.hero_id] = {
          name: r.data?.hero?.data?.name,
          imageUrl: r.data?.hero?.data?.head,
        };
      });

      let success = 0;
      let failed = 0;

      // Fetch each hero by ID (1 to total)
      for (let heroId = 1; heroId <= total; heroId++) {
        try {
          const { data: detailRes } = await axios.get(`${LEGACY_BASE_URL}/hero-detail/${heroId}`);
          const detail = detailRes.data?.records?.[0]?.data?.hero?.data;

          if (!detail || !detail.name) continue;

          const abilityShow = detail.abilityshow || [];
          const role = detail.sortlabel?.[0] || 'Unknown';
          const lane = detail.roadsortlabel?.[0] || null;
          const specialty = Array.isArray(detail.speciality) ? detail.speciality.join('/') : '';

          const listInfo = listMap[heroId] || {};

          const [hero, created] = await Hero.findOrCreate({
            where: { heroId },
            defaults: {
              heroId,
              name: listInfo.name || detail.name || 'Unknown',
              role,
              specialty,
              imageUrl: listInfo.imageUrl || detail.head || null,
              lane: lane === '' ? null : lane,
              durability: parseInt(abilityShow[0]) || 0,
              offense: parseInt(abilityShow[1]) || 0,
              controlEffect: parseInt(abilityShow[2]) || 0,
              difficulty: parseInt(abilityShow[3]) || 0,
            },
          });

          if (!created) {
            await hero.update({
              name: listInfo.name || detail.name || hero.name,
              role,
              specialty,
              imageUrl: listInfo.imageUrl || detail.head || hero.imageUrl,
              lane: lane === '' ? null : lane,
              durability: parseInt(abilityShow[0]) || 0,
              offense: parseInt(abilityShow[1]) || 0,
              controlEffect: parseInt(abilityShow[2]) || 0,
              difficulty: parseInt(abilityShow[3]) || 0,
            });
          }

          success++;
        } catch (err) {
          failed++;
        }
      }

      res.status(200).json({
        message: `Sync complete. ${success} heroes synced, ${failed} failed.`,
        total: success,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/heroes/:id/counters
  static async getCounters(req, res, next) {
    try {
      const hero = await Hero.findByPk(req.params.id);
      if (!hero) throw { name: 'NotFound', message: 'Hero not found' };

      const relationRes = await fetchHeroRelation(hero.heroId);
      const records = relationRes.data?.records || [];
      const record = records.find((r) => Number(r.data?.hero_id) === Number(hero.heroId));

      if (!record || !record.data?.relation) {
        throw { name: 'NotFound', message: 'Counter data not found' };
      }

      const relation = record.data.relation;

      const getTargetHeroIds = (group) =>
        (group?.target_hero_id || []).map(Number).filter((id) => id !== 0);

      const strongIds = getTargetHeroIds(relation.strong);
      const weakIds = getTargetHeroIds(relation.weak);
      const assistIds = getTargetHeroIds(relation.assist);

      const allIds = [...new Set([...strongIds, ...weakIds, ...assistIds])];
      const relatedHeroes = allIds.length
        ? await Hero.findAll({
            where: { heroId: allIds },
            attributes: ['id', 'heroId', 'name', 'role', 'imageUrl'],
          })
        : [];

      const heroMap = {};
      relatedHeroes.forEach((h) => {
        heroMap[h.heroId] = h;
      });

      res.status(200).json({
        hero: { id: hero.id, heroId: hero.heroId, name: hero.name, role: hero.role },
        strong: strongIds.map((id) => heroMap[id] || { heroId: id, name: 'Unknown' }),
        weak: weakIds.map((id) => heroMap[id] || { heroId: id, name: 'Unknown' }),
        assist: assistIds.map((id) => heroMap[id] || { heroId: id, name: 'Unknown' }),
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = HeroController;
