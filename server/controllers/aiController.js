const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Hero, Item } = require('../models');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class AIController {
  // POST /api/ai/counter-strategy
  static async getCounterStrategy(req, res, next) {
    try {
      const { enemyHeroIds } = req.body;

      if (!enemyHeroIds || !Array.isArray(enemyHeroIds) || enemyHeroIds.length === 0) {
        throw {
          name: 'BadRequest',
          message: 'enemyHeroIds is required and must be a non-empty array',
        };
      }

      if (enemyHeroIds.length > 5) {
        throw { name: 'BadRequest', message: 'Maximum 5 enemy heroes allowed' };
      }

      // Fetch enemy heroes from DB
      const enemyHeroes = await Hero.findAll({
        where: { id: enemyHeroIds },
      });

      if (enemyHeroes.length === 0) {
        throw { name: 'NotFound', message: 'No heroes found with the given IDs' };
      }

      // Fetch all heroes and items for context
      const allHeroes = await Hero.findAll({
        attributes: ['id', 'name', 'role', 'specialty', 'lane'],
      });

      const allItems = await Item.findAll({
        attributes: ['id', 'name', 'type', 'passive', 'stats'],
      });

      const enemyNames = enemyHeroes.map((h) => `${h.name} (${h.role})`).join(', ');

      const heroListStr = allHeroes.map((h) => `${h.name} - ${h.role} - ${h.specialty}`).join('\n');

      const itemListStr = allItems
        .map((i) => `${i.name} (${i.type}) - ${i.passive || 'No passive'}`)
        .join('\n');

      const prompt = `You are an expert Mobile Legends: Bang Bang (MLBB) strategist and analyst.

The enemy team composition is: ${enemyNames}

Available heroes in the game:
${heroListStr}

Available items in the game:
${itemListStr}

Based on the enemy team composition, please provide:

1. **Counter Hero Picks**: Recommend 5 heroes that best counter this enemy composition. For each hero, explain WHY they counter the enemy picks.

2. **Item Build Recommendations**: For each recommended counter hero, suggest a 6-item build that is specifically effective against this enemy composition. Explain why each key item is important.

3. **Strategy & Game Plan**:
   - Early game strategy (0-5 min)
   - Mid game strategy (5-12 min)
   - Late game strategy (12+ min)
   - Key team fight tips against this composition
   - Which enemy hero to prioritize targeting first

4. **Danger Assessment**: Rate the overall threat level of this enemy composition (1-10) and explain their main win condition.

Please respond in a clear, structured format. Be specific with hero names and item names from the lists provided.`;

      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      res.status(200).json({
        enemyComposition: enemyHeroes.map((h) => ({
          id: h.id,
          heroId: h.heroId,
          name: h.name,
          role: h.role,
          imageUrl: h.imageUrl,
        })),
        recommendation: text,
      });
    } catch (err) {
      console.log('Using API Key:', process.env.GEMINI_API_KEY?.slice(0, 10) + '...');
      console.log('AI Error:', err);
      next(err);
    }
  }
}

module.exports = AIController;
