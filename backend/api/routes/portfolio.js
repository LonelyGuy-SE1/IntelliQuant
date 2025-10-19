/**
 * Portfolio API Routes
 */

import express from 'express';
import envioClient from '../../services/envio-client.js';
import riskAnalysis from '../../services/risk-analysis.js';

const router = express.Router();

/**
 * GET /api/portfolio/:address
 * Get user portfolio
 */
router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const portfolio = await envioClient.getUserPortfolio(address);

    if (!portfolio) {
      return res.json({
        success: true,
        data: {
          address,
          balances: [],
          totalTokens: 0,
          message: 'No portfolio found for this address'
        }
      });
    }

    res.json({ success: true, data: portfolio });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/portfolio/:address/analyze
 * Analyze portfolio risk
 * Body: { targetAllocation: { "0xToken1": 0.5, "0xToken2": 0.5 } }
 */
router.post('/:address/analyze', async (req, res) => {
  try {
    const { address } = req.params;
    const { targetAllocation } = req.body;

    const analysis = await riskAnalysis.analyzePortfolioRisk(
      address,
      targetAllocation || {}
    );

    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('Error analyzing portfolio:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/portfolio/:address/rebalance
 * Compute rebalancing trades
 * Body: { targetAllocation: {...} }
 */
router.post('/:address/rebalance', async (req, res) => {
  try {
    const { address } = req.params;
    const { targetAllocation } = req.body;

    if (!targetAllocation) {
      return res.status(400).json({
        success: false,
        error: 'targetAllocation is required'
      });
    }

    // Get portfolio first
    const portfolio = await envioClient.getUserPortfolio(address);

    if (!portfolio || !portfolio.balances) {
      return res.json({
        success: true,
        data: {
          trades: [],
          message: 'No portfolio to rebalance'
        }
      });
    }

    // Calculate current allocation
    const totalValue = portfolio.balances.reduce(
      (sum, b) => sum + BigInt(b.balance),
      0n
    );

    const currentAllocation = {};
    for (const balance of portfolio.balances) {
      const weight = Number(balance.balance) / Number(totalValue);
      currentAllocation[balance.tokenAddress] = weight;
    }

    const trades = riskAnalysis.computeRebalancingTrades(
      currentAllocation,
      targetAllocation,
      totalValue.toString()
    );

    res.json({
      success: true,
      data: {
        trades,
        currentAllocation,
        targetAllocation,
        totalValue: totalValue.toString()
      }
    });

  } catch (error) {
    console.error('Error computing rebalance:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
