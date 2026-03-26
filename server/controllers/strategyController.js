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
        await existingVote.update({ type });
      } else {
        await Vote.create({ userId: req.user.id, savedStrategyId, type });
      }

      // Count votes fresh from database
      const upVotes = await Vote.count({ where: { savedStrategyId, type: 'up' } });
      const downVotes = await Vote.count({ where: { savedStrategyId, type: 'down' } });
      const likes = upVotes - downVotes;

      await strategy.update({ likes });

      console.log('upVotes:', upVotes, 'downVotes:', downVotes, 'likes:', likes);
      res.status(200).json({ message: 'Vote recorded', likes });
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

      await vote.destroy();

      // Recalculate likes from remaining votes
      const allVotes = await Vote.findAll({ where: { savedStrategyId } });
      const likes = allVotes.reduce((total, v) => {
        return total + (v.type === 'up' ? 1 : -1);
      }, 0);

      const strategy = await SavedStrategy.findByPk(savedStrategyId);
      await strategy.update({ likes });

      res.status(200).json({ message: 'Vote removed', likes });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = StrategyController;
