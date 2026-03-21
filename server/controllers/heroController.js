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

  // POST /api/heroes/sync (admin) - Sync from MLBB Stats API
  static async syncFromAPI(req, res, next) {
    try {
      // Step 1: Get hero list (has name, head, hero_id)
      const { data: listRes } = await axios.get(`${BASE_URL}/hero-list`);
      const records = listRes.data?.records || [];

      if (!records.length) {
        throw { name: 'BadRequest', message: 'No heroes found from MLBB Stats API' };
      }

      let success = 0;
      let failed = 0;

      // Step 2: Fetch detail for each hero (has role, lane, abilityshow)
      for (const record of records) {
        try {
          const heroId = record.data?.hero_id;
          if (!heroId) continue;

          const name = record.data?.hero?.data?.name;
          const imageUrl = record.data?.hero?.data?.head;

          // Fetch detail for role, lane, stats
          const { data: detailRes } = await axios.get(`${BASE_URL}/hero-detail/${heroId}`);
          const detail = detailRes.data?.records?.[0]?.data?.hero?.data;

          const abilityShow = detail?.abilityshow || [];
          const role = detail?.sortlabel?.[0] || 'Unknown';
          const lane = detail?.roadsortlabel?.[0] || null;
          const specialty = Array.isArray(detail?.speciality) ? detail.speciality.join('/') : '';

          // Upsert: update if exists, create if not
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
          console.log(`Failed hero_id ${record.data?.hero_id}: ${err.message}`);
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

  // GET /api/heroes/:id/counters - Get counter data from MLBB Stats API
  static async getCounters(req, res, next) {
    try {
      const hero = await Hero.findByPk(req.params.id);
      if (!hero) throw { name: 'NotFound', message: 'Hero not found' };

      const { data: listRes } = await axios.get(`${BASE_URL}/hero-list`);
      const records = listRes.data?.records || [];

      // Find this hero in the list
      const found = records.find((r) => r.data?.hero_id === hero.heroId);
      if (!found || !found.data?.relation) {
        throw { name: 'NotFound', message: 'Counter data not found' };
      }

      const relation = found.data.relation;

      // Filter out 0 values
      const strongIds = (relation.strong?.target_hero_id || []).filter((id) => id !== 0);
      const weakIds = (relation.weak?.target_hero_id || []).filter((id) => id !== 0);
      const assistIds = (relation.assist?.target_hero_id || []).filter((id) => id !== 0);

      // Resolve hero names from local DB
      const allIds = [...new Set([...strongIds, ...weakIds, ...assistIds])];
      const relatedHeroes = await Hero.findAll({
        where: { heroId: allIds },
        attributes: ['heroId', 'name', 'role', 'imageUrl'],
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
