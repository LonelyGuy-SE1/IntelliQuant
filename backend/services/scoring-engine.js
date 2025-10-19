/**
 * AI Token Health Scoring Engine
 * Computes 0-100 health scores with component breakdown
 */

import envioClient from './envio-client.js';
import dotenv from 'dotenv';

dotenv.config();

// Scoring weights from environment or defaults
const WEIGHTS = {
  liquidity: parseFloat(process.env.LIQUIDITY_WEIGHT || 0.3),
  stability: parseFloat(process.env.STABILITY_WEIGHT || 0.2),
  demand: parseFloat(process.env.DEMAND_WEIGHT || 0.3),
  slippage: parseFloat(process.env.SLIPPAGE_WEIGHT || 0.2)
};

/**
 * Compute token health score (0-100)
 * @param {string} tokenAddress - Token contract address
 * @returns {Promise<Object>} Score and component breakdown
 */
export async function computeTokenScore(tokenAddress) {
  try {
    // Get all pools containing this token
    const pools = await envioClient.getTokenPools(tokenAddress);

    if (pools.length === 0) {
      return {
        score: 0,
        components: {
          liquidity: 0,
          stability: 0,
          demand: 0,
          slippage: 0
        },
        explanation: 'No liquidity pools found for this token',
        timestamp: Date.now()
      };
    }

    // Aggregate data from all pools
    let totalLiquidity = 0n;
    let totalVolume24h = 0n;
    let totalSwaps24h = 0;
    const poolData = [];

    for (const pool of pools) {
      const volume = await envioClient.get24hVolume(pool.address);
      const snapshots = await envioClient.getPoolSnapshots(pool.address, 24);

      poolData.push({
        address: pool.address,
        reserve0: BigInt(pool.reserve0 || 0),
        reserve1: BigInt(pool.reserve1 || 0),
        volume24h: volume.volume0 + volume.volume1,
        swapCount24h: volume.swapCount,
        snapshots: snapshots
      });

      // Accumulate metrics
      totalLiquidity += BigInt(pool.reserve0 || 0) + BigInt(pool.reserve1 || 0);
      totalVolume24h += volume.volume0 + volume.volume1;
      totalSwaps24h += volume.swapCount;
    }

    // Compute component scores
    const liquidityScore = computeLiquidityScore(totalLiquidity);
    const stabilityScore = computeStabilityScore(poolData);
    const demandScore = computeDemandScore(totalVolume24h, totalSwaps24h);
    const slippageScore = computeSlippageScore(totalLiquidity, totalVolume24h);

    // Weighted final score
    const finalScore = Math.round(
      liquidityScore * WEIGHTS.liquidity +
      stabilityScore * WEIGHTS.stability +
      demandScore * WEIGHTS.demand +
      slippageScore * WEIGHTS.slippage
    );

    return {
      score: Math.min(100, Math.max(0, finalScore)),
      components: {
        liquidity: liquidityScore,
        stability: stabilityScore,
        demand: demandScore,
        slippage: slippageScore
      },
      weights: WEIGHTS,
      metrics: {
        totalLiquidity: totalLiquidity.toString(),
        volume24h: totalVolume24h.toString(),
        swapCount24h: totalSwaps24h,
        poolCount: pools.length
      },
      explanation: generateExplanation(liquidityScore, stabilityScore, demandScore, slippageScore),
      timestamp: Date.now()
    };

  } catch (error) {
    console.error('Error computing token score:', error.message);
    throw error;
  }
}

/**
 * Liquidity Component (0-100)
 * Higher liquidity = higher score
 */
function computeLiquidityScore(totalLiquidity) {
  const liquidityUSD = Number(totalLiquidity) / 1e18; // Simplified conversion

  // Thresholds (in USD equivalent)
  const thresholds = [
    { min: 10000000, score: 100 },  // $10M+
    { min: 5000000, score: 90 },    // $5M
    { min: 1000000, score: 80 },    // $1M
    { min: 500000, score: 70 },     // $500K
    { min: 100000, score: 60 },     // $100K
    { min: 50000, score: 50 },      // $50K
    { min: 10000, score: 30 },      // $10K
    { min: 1000, score: 10 },       // $1K
    { min: 0, score: 0 }
  ];

  for (const threshold of thresholds) {
    if (liquidityUSD >= threshold.min) {
      return threshold.score;
    }
  }

  return 0;
}

/**
 * Stability Component (0-100)
 * Lower price volatility = higher score
 */
function computeStabilityScore(poolData) {
  if (poolData.length === 0 || poolData[0].snapshots.length < 2) {
    return 50; // Neutral score if insufficient data
  }

  // Calculate price volatility from snapshots
  const prices = [];

  for (const pool of poolData) {
    for (const snapshot of pool.snapshots) {
      if (snapshot.reserve0 && snapshot.reserve1) {
        const price = Number(snapshot.reserve1) / Number(snapshot.reserve0);
        prices.push(price);
      } else if (snapshot.sqrtPriceX96) {
        // V3 price calculation
        const price = (Number(snapshot.sqrtPriceX96) / (2 ** 96)) ** 2;
        prices.push(price);
      }
    }
  }

  if (prices.length < 2) {
    return 50;
  }

  // Calculate standard deviation
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
  const stdDev = Math.sqrt(variance);
  const volatility = (stdDev / mean) * 100; // Coefficient of variation

  // Score based on volatility (lower is better)
  if (volatility < 1) return 100;
  if (volatility < 3) return 90;
  if (volatility < 5) return 80;
  if (volatility < 10) return 70;
  if (volatility < 15) return 60;
  if (volatility < 20) return 50;
  if (volatility < 30) return 40;
  if (volatility < 50) return 20;
  return 10;
}

/**
 * Demand Component (0-100)
 * Higher volume and transaction frequency = higher score
 */
function computeDemandScore(volume24h, swapCount24h) {
  const volumeUSD = Number(volume24h) / 1e18; // Simplified

  // Volume score (0-70 points)
  let volumeScore = 0;
  if (volumeUSD >= 10000000) volumeScore = 70;       // $10M+
  else if (volumeUSD >= 1000000) volumeScore = 60;   // $1M
  else if (volumeUSD >= 100000) volumeScore = 50;    // $100K
  else if (volumeUSD >= 10000) volumeScore = 40;     // $10K
  else if (volumeUSD >= 1000) volumeScore = 25;      // $1K
  else if (volumeUSD >= 100) volumeScore = 10;       // $100

  // Frequency score (0-30 points)
  let frequencyScore = 0;
  if (swapCount24h >= 1000) frequencyScore = 30;
  else if (swapCount24h >= 500) frequencyScore = 25;
  else if (swapCount24h >= 100) frequencyScore = 20;
  else if (swapCount24h >= 50) frequencyScore = 15;
  else if (swapCount24h >= 10) frequencyScore = 10;
  else if (swapCount24h >= 1) frequencyScore = 5;

  return Math.min(100, volumeScore + frequencyScore);
}

/**
 * Slippage Component (0-100)
 * Lower expected slippage = higher score
 */
function computeSlippageScore(totalLiquidity, volume24h) {
  if (totalLiquidity === 0n) return 0;

  // Volume-to-Liquidity ratio as slippage proxy
  const ratio = Number(volume24h) / Number(totalLiquidity);

  // Lower ratio = less slippage = higher score
  if (ratio < 0.01) return 100;  // Very deep liquidity
  if (ratio < 0.05) return 90;
  if (ratio < 0.1) return 80;
  if (ratio < 0.2) return 70;
  if (ratio < 0.5) return 60;
  if (ratio < 1.0) return 50;
  if (ratio < 2.0) return 30;
  if (ratio < 5.0) return 10;
  return 5;
}

/**
 * Generate human-readable explanation
 */
function generateExplanation(liquidity, stability, demand, slippage) {
  const components = [];

  if (liquidity >= 80) components.push('excellent liquidity');
  else if (liquidity >= 60) components.push('good liquidity');
  else if (liquidity >= 40) components.push('moderate liquidity');
  else components.push('low liquidity');

  if (stability >= 80) components.push('high price stability');
  else if (stability >= 60) components.push('moderate stability');
  else components.push('high volatility');

  if (demand >= 80) components.push('strong trading demand');
  else if (demand >= 60) components.push('moderate demand');
  else components.push('low demand');

  if (slippage >= 80) components.push('minimal slippage expected');
  else if (slippage >= 60) components.push('acceptable slippage');
  else components.push('high slippage risk');

  return `Token shows ${components.join(', ')}.`;
}

/**
 * Get scores for multiple tokens
 * @param {Array<string>} tokenAddresses - List of token addresses
 * @returns {Promise<Array>} Array of scores
 */
export async function computeMultipleTokenScores(tokenAddresses) {
  const scores = await Promise.all(
    tokenAddresses.map(async (address) => {
      try {
        const score = await computeTokenScore(address);
        return { address, ...score };
      } catch (error) {
        console.error(`Error scoring token ${address}:`, error.message);
        return { address, score: 0, error: error.message };
      }
    })
  );

  return scores;
}

export default {
  computeTokenScore,
  computeMultipleTokenScores
};
