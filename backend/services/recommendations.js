/**
 * AI Recommendations Service
 * Generates trade suggestions based on health scores and smart money activity
 */

import envioClient from './envio-client.js';
import scoringEngine from './scoring-engine.js';
import dotenv from 'dotenv';

dotenv.config();

// Whale addresses from environment
const WHALE_ADDRESSES = (process.env.WHALE_ADDRESSES || '').split(',').filter(a => a.trim());

/**
 * Generate trading recommendations
 * @param {Array<string>} tokenAddresses - List of tokens to analyze
 * @param {number} limit - Max recommendations
 * @returns {Promise<Array>} Recommendations
 */
export async function generateRecommendations(tokenAddresses, limit = 5) {
  try {
    // Get health scores
    const scores = await scoringEngine.computeMultipleTokenScores(tokenAddresses);

    // Get smart money activity
    const whaleActivity = await getWhaleActivity(tokenAddresses);

    // Generate recommendations
    const recommendations = [];

    for (const scoreData of scores) {
      const whaleData = whaleActivity.find(w => w.token === scoreData.address);

      const rec = {
        token: scoreData.address,
        action: null,
        confidence: 0,
        reasons: [],
        healthScore: scoreData.score,
        whaleActivity: whaleData || null
      };

      // Positive momentum: High score + whale buying
      if (scoreData.score >= 70) {
        rec.action = 'BUY';
        rec.reasons.push(`High health score (${scoreData.score}/100)`);
        rec.confidence += 40;

        if (whaleData && whaleData.netFlow > 0) {
          rec.reasons.push('Smart money net buying');
          rec.confidence += 30;
        }
      }

      // Negative momentum: Low score or whale selling
      if (scoreData.score < 40) {
        rec.action = 'SELL';
        rec.reasons.push(`Low health score (${scoreData.score}/100)`);
        rec.confidence += 40;
      }

      if (whaleData && whaleData.netFlow < 0) {
        if (!rec.action) rec.action = 'SELL';
        rec.reasons.push('Smart money net selling');
        rec.confidence += 30;
      }

      // Component-based insights
      if (scoreData.components) {
        if (scoreData.components.liquidity < 30) {
          rec.reasons.push('Low liquidity warning');
          rec.confidence = Math.max(0, rec.confidence - 10);
        }

        if (scoreData.components.stability < 30) {
          rec.reasons.push('High volatility warning');
          rec.confidence = Math.max(0, rec.confidence - 10);
        }

        if (scoreData.components.demand >= 80) {
          rec.reasons.push('Strong trading demand');
          if (rec.action === 'BUY') rec.confidence += 10;
        }
      }

      // Only include if action determined
      if (rec.action) {
        rec.confidence = Math.min(100, rec.confidence);
        recommendations.push(rec);
      }
    }

    // Sort by confidence and limit
    return recommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);

  } catch (error) {
    console.error('Error generating recommendations:', error.message);
    throw error;
  }
}

/**
 * Get whale activity for tokens
 * @param {Array<string>} tokenAddresses - Tokens to check
 * @returns {Promise<Array>} Whale activity data
 */
async function getWhaleActivity(tokenAddresses) {
  if (WHALE_ADDRESSES.length === 0) {
    return tokenAddresses.map(token => ({
      token,
      netFlow: 0,
      largeTransfers: []
    }));
  }

  const activity = [];

  for (const token of tokenAddresses) {
    const largeTransfers = await envioClient.getLargeTransfers(token, "1000000000000000000000", 50);

    // Filter transfers involving whale addresses
    const whaleTransfers = largeTransfers.filter(transfer =>
      WHALE_ADDRESSES.includes(transfer.from.toLowerCase()) ||
      WHALE_ADDRESSES.includes(transfer.to.toLowerCase())
    );

    // Calculate net flow (buys - sells by whales)
    let netFlow = 0n;

    for (const transfer of whaleTransfers) {
      if (WHALE_ADDRESSES.includes(transfer.to.toLowerCase())) {
        netFlow += BigInt(transfer.value); // Whale buying
      }
      if (WHALE_ADDRESSES.includes(transfer.from.toLowerCase())) {
        netFlow -= BigInt(transfer.value); // Whale selling
      }
    }

    activity.push({
      token,
      netFlow: Number(netFlow),
      largeTransfers: whaleTransfers.slice(0, 10), // Top 10
      whaleCount: WHALE_ADDRESSES.length
    });
  }

  return activity;
}

/**
 * Get top healthiest tokens
 * @param {Array<string>} tokenAddresses - Tokens to analyze
 * @param {number} limit - Number to return
 * @returns {Promise<Array>} Top tokens by health score
 */
export async function getHealthiestTokens(tokenAddresses, limit = 10) {
  const scores = await scoringEngine.computeMultipleTokenScores(tokenAddresses);

  return scores
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => ({
      token: s.address,
      score: s.score,
      components: s.components,
      explanation: s.explanation
    }));
}

export default {
  generateRecommendations,
  getHealthiestTokens
};
