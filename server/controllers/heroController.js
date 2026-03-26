const { Hero } = require('../models');
const axios = require('axios');
const { Op } = require('sequelize');

const BASE_URL = 'https://mlbb-stats.rone.dev/api';

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
      // Fetch ALL pages from hero-list
      let allRecords = [];
      let page = 1;
      let totalFetched = 0;
      let total = 999;

      while (totalFetched < total) {
        const { data: listRes } = await axios.get(`${BASE_URL}/hero-list?page=${page}`);
        const records = listRes.data?.records || [];
        total = listRes.data?.total || 0;

        if (records.length === 0) break;

        allRecords = allRecords.concat(records);
        totalFetched += records.length;
        page++;
      }

      if (allRecords.length === 0) {
        throw { name: 'BadRequest', message: 'No heroes found from MLBB Stats API' };
      }

      let success = 0;
      let failed = 0;

      for (const record of allRecords) {
        try {
          const heroId = record.data?.hero_id;
          if (!heroId) continue;

          const name = record.data?.hero?.data?.name;
          const imageUrl = record.data?.hero?.data?.head;

          const { data: detailRes } = await axios.get(`${BASE_URL}/hero-detail/${heroId}`);
          const detail = detailRes.data?.records?.[0]?.data?.hero?.data;

          const abilityShow = detail?.abilityshow || [];
          const role = detail?.sortlabel?.[0] || 'Unknown';
          const lane = detail?.roadsortlabel?.[0] || null;
          const specialty = Array.isArray(detail?.speciality) ? detail.speciality.join('/') : '';

          const [hero, created] = await Hero.findOrCreate({
            where: { heroId },
            defaults: {
              heroId,
              name: name || detail?.name || 'Unknown',
              role,
              specialty,
              imageUrl: imageUrl || detail?.head || null,
              lane: lane === '' ? null : lane,
              durability: parseInt(abilityShow[0]) || 0,
              offense: parseInt(abilityShow[1]) || 0,
              controlEffect: parseInt(abilityShow[2]) || 0,
              difficulty: parseInt(abilityShow[3]) || 0,
            },
          });

          if (!created) {
            await hero.update({
              name: name || detail?.name || hero.name,
              role,
              specialty,
              imageUrl: imageUrl || detail?.head || hero.imageUrl,
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

      const { data: relationRes } = await axios.get(`${BASE_URL}/hero-relation/${hero.heroId}`);
      const record = relationRes.data?.records?.[0];

      if (!record || !record.data?.relation) {
        throw { name: 'NotFound', message: 'Counter data not found' };
      }

      const relation = record.data.relation;

      const strongIds = (relation.strong?.target_hero_id || []).filter((id) => id !== 0);
      const weakIds = (relation.weak?.target_hero_id || []).filter((id) => id !== 0);
      const assistIds = (relation.assist?.target_hero_id || []).filter((id) => id !== 0);

      const allIds = [...new Set([...strongIds, ...weakIds, ...assistIds])];
      const relatedHeroes = await Hero.findAll({
        where: { heroId: allIds },
        attributes: ['id', 'heroId', 'name', 'role', 'imageUrl'],
      });

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
