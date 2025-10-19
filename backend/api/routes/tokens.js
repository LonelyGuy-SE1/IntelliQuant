/**
 * Token API Routes
 */

import express from 'express';
import scoringEngine from '../../services/scoring-engine.js';
import envioClient from '../../services/envio-client.js';

const router = express.Router();

/**
 * GET /api/tokens/:address/score
 * Get health score for a token
 */
router.get('/:address/score', async (req, res) => {
  try {
    const { address } = req.params;
    const score = await scoringEngine.computeTokenScore(address);
    res.json({ success: true, data: score });
  } catch (error) {
    console.error('Error fetching token score:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/tokens/:address/pools
 * Get all pools containing a token
 */
router.get('/:address/pools', async (req, res) => {
  try {
    const { address } = req.params;
    const pools = await envioClient.getTokenPools(address);
    res.json({ success: true, data: pools });
  } catch (error) {
    console.error('Error fetching token pools:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/tokens/scores
 * Get scores for multiple tokens
 * Body: { tokens: ["0x...", "0x..."] }
 */
router.post('/scores', async (req, res) => {
  try {
    const { tokens } = req.body;

    if (!Array.isArray(tokens)) {
      return res.status(400).json({ success: false, error: 'tokens must be an array' });
    }

    const scores = await scoringEngine.computeMultipleTokenScores(tokens);
    res.json({ success: true, data: scores });
  } catch (error) {
    console.error('Error fetching multiple token scores:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
