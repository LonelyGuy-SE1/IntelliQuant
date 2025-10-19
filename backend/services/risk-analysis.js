/**
 * Portfolio Risk Analysis Service
 * Computes drift, concentration risk, and flags
 */

import envioClient from './envio-client.js';
import scoringEngine from './scoring-engine.js';

/**
 * Analyze portfolio risk
 * @param {string} userAddress - Smart account address
 * @param {Object} targetAllocation - Target weights {tokenAddress: weight}
 * @returns {Promise<Object>} Risk analysis
 */
export async function analyzePortfolioRisk(userAddress, targetAllocation = {}) {
  try {
    // Get current portfolio
    const portfolio = await envioClient.getUserPortfolio(userAddress);

    if (!portfolio || !portfolio.balances || portfolio.balances.length === 0) {
      return {
        drift: 0,
        concentration: {},
        flags: ['EMPTY_PORTFOLIO'],
        suggestions: ['Fund your smart account to start trading'],
        timestamp: Date.now()
      };
    }

    // Calculate total portfolio value (simplified as sum of balances)
    const totalValue = portfolio.balances.reduce(
      (sum, balance) => sum + BigInt(balance.balance),
      0n
    );

    if (totalValue === 0n) {
      return {
        drift: 0,
        concentration: {},
        flags: ['ZERO_VALUE'],
        suggestions: ['Add liquidity to your portfolio'],
        timestamp: Date.now()
      };
    }

    // Current allocation
    const currentAllocation = {};
    for (const balance of portfolio.balances) {
      const weight = Number(balance.balance) / Number(totalValue);
      currentAllocation[balance.tokenAddress] = weight;
    }

    // Calculate drift (deviation from target)
    const drift = calculateDrift(currentAllocation, targetAllocation);

    // Concentration risk
    const concentration = calculateConcentration(currentAllocation);

    // Risk flags
    const flags = [];
    const suggestions = [];

    if (drift > 0.15) {
      flags.push('HIGH_DRIFT');
      suggestions.push(`Portfolio has drifted ${(drift * 100).toFixed(1)}% from target allocation`);
    }

    if (concentration.maxWeight > 0.5) {
      flags.push('CONCENTRATION_RISK');
      suggestions.push(`${concentration.maxToken} represents ${(concentration.maxWeight * 100).toFixed(1)}% of portfolio - consider diversifying`);
    }

    if (concentration.herfindahl > 0.3) {
      flags.push('UNDER_DIVERSIFIED');
      suggestions.push('Portfolio is concentrated in few assets');
    }

    // Get health scores for held tokens
    const tokenAddresses = portfolio.balances.map(b => b.tokenAddress);
    const scores = await scoringEngine.computeMultipleTokenScores(tokenAddresses);

    // Flag low-health holdings
    for (const score of scores) {
      if (score.score < 40) {
        const holding = portfolio.balances.find(b => b.tokenAddress === score.address);
        if (holding) {
          flags.push('LOW_HEALTH_HOLDING');
          suggestions.push(`Consider reducing ${score.address} (health score: ${score.score})`);
        }
      }
    }

    return {
      drift,
      concentration,
      currentAllocation,
      targetAllocation,
      flags,
      suggestions,
      tokenScores: scores,
      totalValue: totalValue.toString(),
      timestamp: Date.now()
    };

  } catch (error) {
    console.error('Error analyzing portfolio risk:', error.message);
    throw error;
  }
}

/**
 * Calculate drift from target allocation
 * @param {Object} current - Current allocation weights
 * @param {Object} target - Target allocation weights
 * @returns {number} Drift score (0-1)
 */
function calculateDrift(current, target) {
  if (Object.keys(target).length === 0) {
    return 0; // No target set
  }

  let totalDeviation = 0;
  const allTokens = new Set([...Object.keys(current), ...Object.keys(target)]);

  for (const token of allTokens) {
    const currentWeight = current[token] || 0;
    const targetWeight = target[token] || 0;
    totalDeviation += Math.abs(currentWeight - targetWeight);
  }

  // Normalized drift (0-1)
  return totalDeviation / 2;
}

/**
 * Calculate concentration metrics
 * @param {Object} allocation - Token weights
 * @returns {Object} Concentration metrics
 */
function calculateConcentration(allocation) {
  const weights = Object.values(allocation);

  if (weights.length === 0) {
    return { maxWeight: 0, herfindahl: 0, tokens: 0 };
  }

  // Max single position weight
  const maxWeight = Math.max(...weights);
  const maxToken = Object.keys(allocation).find(k => allocation[k] === maxWeight);

  // Herfindahl index (sum of squared weights)
  const herfindahl = weights.reduce((sum, w) => sum + w * w, 0);

  return {
    maxWeight,
    maxToken,
    herfindahl,
    tokens: weights.length
  };
}

/**
 * Compute suggested rebalancing trades
 * @param {Object} current - Current allocation
 * @param {Object} target - Target allocation
 * @param {string} totalValue - Total portfolio value
 * @returns {Array} Trade suggestions
 */
export function computeRebalancingTrades(current, target, totalValue) {
  const trades = [];
  const allTokens = new Set([...Object.keys(current), ...Object.keys(target)]);

  for (const token of allTokens) {
    const currentWeight = current[token] || 0;
    const targetWeight = target[token] || 0;
    const delta = targetWeight - currentWeight;

    if (Math.abs(delta) > 0.01) { // 1% threshold
      const deltaValue = BigInt(Math.floor(Number(totalValue) * delta));

      trades.push({
        token,
        action: delta > 0 ? 'BUY' : 'SELL',
        currentWeight: currentWeight,
        targetWeight: targetWeight,
        delta: delta,
        amount: deltaValue.toString(),
        reason: delta > 0
          ? `Increase allocation to ${(targetWeight * 100).toFixed(1)}%`
          : `Decrease allocation to ${(targetWeight * 100).toFixed(1)}%`
      });
    }
  }

  return trades.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}

export default {
  analyzePortfolioRisk,
  computeRebalancingTrades
};
