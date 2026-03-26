const { Item } = require('../models');
const { Op } = require('sequelize');

class ItemController {
  // GET /api/items
  static async getAll(req, res, next) {
    try {
      const { type, search } = req.query;
      const where = {};

      if (type) where.type = type;
      if (search) where.name = { [Op.iLike]: `%${search}%` };

      const items = await Item.findAll({ where, order: [['name', 'ASC']] });
      res.status(200).json(items);
    } catch (err) {
      next(err);
    }
  }

  // GET /api/items/:id
  static async getById(req, res, next) {
    try {
      const item = await Item.findByPk(req.params.id);
      if (!item) throw { name: 'NotFound', message: 'Item not found' };
      res.status(200).json(item);
    } catch (err) {
      next(err);
    }
  }

  // POST /api/items (admin)
  static async create(req, res, next) {
    try {
      const item = await Item.create(req.body);
      res.status(201).json(item);
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/items/:id (admin)
  static async update(req, res, next) {
    try {
      const item = await Item.findByPk(req.params.id);
      if (!item) throw { name: 'NotFound', message: 'Item not found' };
      await item.update(req.body);
      res.status(200).json(item);
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/items/:id (admin)
  static async delete(req, res, next) {
    try {
      const item = await Item.findByPk(req.params.id);
      if (!item) throw { name: 'NotFound', message: 'Item not found' };
      await item.destroy();
      res.status(200).json({ message: `Item ${item.name} has been deleted` });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ItemController;
