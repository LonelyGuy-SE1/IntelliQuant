/**
 * Recommendations API Routes
 */

import express from 'express';
import recommendations from '../../services/recommendations.js';

const router = express.Router();

/**
 * POST /api/recommendations
 * Generate trading recommendations
 * Body: { tokens: ["0x...", "0x..."], limit: 5 }
 */
router.post('/', async (req, res) => {
  try {
    const { tokens, limit } = req.body;

    if (!Array.isArray(tokens)) {
      return res.status(400).json({ success: false, error: 'tokens must be an array' });
    }

    const recs = await recommendations.generateRecommendations(tokens, limit || 5);
    res.json({ success: true, data: recs });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/recommendations/healthiest
 * Get healthiest tokens
 * Body: { tokens: ["0x...", "0x..."], limit: 10 }
 */
router.post('/healthiest', async (req, res) => {
  try {
    const { tokens, limit } = req.body;

    if (!Array.isArray(tokens)) {
      return res.status(400).json({ success: false, error: 'tokens must be an array' });
    }

    const healthiest = await recommendations.getHealthiestTokens(tokens, limit || 10);
    res.json({ success: true, data: healthiest });
  } catch (error) {
    console.error('Error fetching healthiest tokens:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
