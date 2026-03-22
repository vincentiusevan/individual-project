const { SavedStrategy, Vote, User, sequelize } = require('../models');

class StrategyController {
  // GET /api/strategies
  static async getAll(req, res, next) {
    try {
      const strategies = await SavedStrategy.findAll({
        include: [{ model: User, attributes: ['id', 'username', 'avatarUrl'] }, { model: Vote }],
        order: [['createdAt', 'DESC']],
      });
      res.status(200).json(strategies);
    } catch (err) {
      next(err);
    }
  }

  // POST /api/strategies
  static async create(req, res, next) {
    try {
      const { title, enemyComp, recommendation, itemBuild } = req.body;

      const strategy = await SavedStrategy.create({
        userId: req.user.id,
        title,
        enemyComp,
        recommendation,
        itemBuild: itemBuild || null,
        likes: 0,
      });

      res.status(201).json(strategy);
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/strategies/:id
  static async update(req, res, next) {
    try {
      const strategy = await SavedStrategy.findByPk(req.params.id);
      if (!strategy) throw { name: 'NotFound', message: 'Strategy not found' };

      if (strategy.userId !== req.user.id) {
        throw { name: 'Forbidden', message: 'You can only edit your own strategy' };
      }

      const { title } = req.body;
      await strategy.update({ title });
      res.status(200).json(strategy);
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/strategies/:id
  static async delete(req, res, next) {
    try {
      const strategy = await SavedStrategy.findByPk(req.params.id);
      if (!strategy) throw { name: 'NotFound', message: 'Strategy not found' };

      if (strategy.userId !== req.user.id) {
        throw { name: 'Forbidden', message: 'You can only delete your own strategy' };
      }

      await strategy.destroy();
      res.status(200).json({ message: 'Strategy deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/strategies/:id/vote
  static async vote(req, res, next) {
    try {
      const { type } = req.body;
      const savedStrategyId = req.params.id;

      if (!type || !['up', 'down'].includes(type)) {
        throw { name: 'BadRequest', message: 'Vote type must be "up" or "down"' };
      }

      const strategy = await SavedStrategy.findByPk(savedStrategyId);
      if (!strategy) throw { name: 'NotFound', message: 'Strategy not found' };

      const existingVote = await Vote.findOne({
        where: { userId: req.user.id, savedStrategyId },
      });

      if (existingVote) {
        if (existingVote.type === type) {
          throw { name: 'BadRequest', message: 'You already voted this way' };
        }
        // Change vote direction
        await existingVote.update({ type });

        // Update likes count: changing from down to up = +2, up to down = -2
        const likeChange = type === 'up' ? 2 : -2;
        await strategy.update({ likes: strategy.likes + likeChange });
      } else {
        // New vote
        await Vote.create({
          userId: req.user.id,
          savedStrategyId,
          type,
        });

        const likeChange = type === 'up' ? 1 : -1;
        await strategy.update({ likes: strategy.likes + likeChange });
      }

      const updated = await SavedStrategy.findByPk(savedStrategyId);
      res.status(200).json({ message: 'Vote recorded', likes: updated.likes });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/strategies/:id/vote
  static async removeVote(req, res, next) {
    try {
      const savedStrategyId = req.params.id;

      const vote = await Vote.findOne({
        where: { userId: req.user.id, savedStrategyId },
      });

      if (!vote) throw { name: 'NotFound', message: 'Vote not found' };

      const strategy = await SavedStrategy.findByPk(savedStrategyId);
      const likeChange = vote.type === 'up' ? -1 : 1;
      await strategy.update({ likes: strategy.likes + likeChange });

      await vote.destroy();
      res.status(200).json({ message: 'Vote removed', likes: strategy.likes + likeChange });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = StrategyController;
