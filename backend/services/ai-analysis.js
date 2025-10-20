/**
 * AI Portfolio Analysis Service
 * Uses Crestal Network Agent for intelligent insights
 */

import envioClient from "./envio-client.js";
import crestalAI from "./ai-crestal.js";

/**
 * Generate AI-powered portfolio insights
 * @param {string} userAddress - User wallet address
 * @returns {Promise<Object>} AI analysis with insights and recommendations
 */
export async function analyzePortfolioWithAI(userAddress) {
  try {
    // Fetch portfolio data from Envio
    const portfolio = await envioClient.getUserPortfolio(userAddress);

    if (!portfolio || !portfolio.balances || portfolio.balances.length === 0) {
      return generateEmptyPortfolioInsights();
    }

    // Use Crestal Agent for analysis
    console.log("🤖 Using Crestal AI Agent");
    return await crestalAI.analyzePortfolioWithCrestal(portfolio);
  } catch (error) {
    console.error("AI analysis error:", error);
    throw error;
  }
}

/**
 * Calculate key portfolio metrics
 */
function calculatePortfolioMetrics(balances) {
  const totalValue = balances.reduce((sum, b) => sum + Number(b.balance), 0);

  // Calculate each position's percentage
  const positions = balances
    .map((b) => ({
      token: b.tokenAddress,
      value: Number(b.balance),
      percentage: (Number(b.balance) / totalValue) * 100,
    }))
    .sort((a, b) => b.value - a.value);

  // Diversification score (0-100)
  // Perfect diversification = equal weights, Poor = concentrated
  const expectedWeight = 100 / balances.length;
  const diversificationScore =
    balances.length === 1
      ? 0
      : 100 -
        positions.reduce(
          (sum, p) => sum + Math.abs(p.percentage - expectedWeight),
          0
        ) /
          2;

  // Concentration (Herfindahl index)
  const concentration = positions.reduce(
    (sum, p) => sum + Math.pow(p.percentage / 100, 2),
    0
  );

  return {
    totalValue,
    positions,
    diversificationScore: Math.max(0, Math.min(100, diversificationScore)),
    concentration,
    topHolding: positions[0],
    largestPositionPercent: positions[0].percentage,
    numberOfTokens: balances.length,
  };
}

/**
 * Generate intelligent insights
 */
function generateInsights(metrics, balances) {
  const insights = [];

  // Diversification insights
  if (metrics.numberOfTokens === 1) {
    insights.push(
      "⚠️ Single-token portfolio detected. This carries high concentration risk."
    );
    insights.push(
      "💡 Consider diversifying into 2-4 additional assets to reduce risk."
    );
  } else if (metrics.numberOfTokens <= 3) {
    insights.push(
      `📊 You hold ${metrics.numberOfTokens} tokens. Good start on diversification!`
    );
  } else if (metrics.numberOfTokens <= 6) {
    insights.push(
      `✅ Well-diversified portfolio with ${metrics.numberOfTokens} tokens.`
    );
  } else {
    insights.push(
      `🎯 Highly diversified with ${metrics.numberOfTokens} tokens. Watch for over-diversification.`
    );
  }

  // Concentration insights
  if (metrics.largestPositionPercent > 70) {
    insights.push(
      `⚠️ Your largest position (${metrics.largestPositionPercent.toFixed(
        1
      )}%) is heavily concentrated.`
    );
  } else if (metrics.largestPositionPercent > 50) {
    insights.push(
      `📊 Top holding represents ${metrics.largestPositionPercent.toFixed(
        1
      )}% - moderate concentration.`
    );
  } else if (metrics.largestPositionPercent > 30) {
    insights.push(
      `✅ Balanced position sizing with top holding at ${metrics.largestPositionPercent.toFixed(
        1
      )}%.`
    );
  } else {
    insights.push(`🎯 Well-balanced allocations across your portfolio.`);
  }

  // Diversification score insight
  if (metrics.diversificationScore < 30) {
    insights.push("🔴 Low diversification score suggests uneven allocation.");
  } else if (metrics.diversificationScore < 60) {
    insights.push(
      "🟡 Moderate diversification - room for improvement in balance."
    );
  } else {
    insights.push(
      "🟢 Strong diversification score indicates well-balanced positions."
    );
  }

  return insights;
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(metrics, balances) {
  const recommendations = [];

  // Diversification recommendations
  if (metrics.numberOfTokens === 1) {
    recommendations.push(
      "Add 2-3 more tokens to build a diversified portfolio"
    );
    recommendations.push(
      "Research liquid pools on Monad DEXs for trading opportunities"
    );
  } else if (metrics.numberOfTokens < 3) {
    recommendations.push(
      "Consider adding 1-2 more tokens for better risk distribution"
    );
  }

  // Position sizing recommendations
  if (metrics.largestPositionPercent > 60) {
    recommendations.push(
      `Reduce concentration in top holding from ${metrics.largestPositionPercent.toFixed(
        1
      )}% to <50%`
    );
    recommendations.push(
      "Gradually rebalance by taking profits from largest position"
    );
  }

  // Rebalancing recommendations
  if (metrics.diversificationScore < 50 && metrics.numberOfTokens > 2) {
    recommendations.push("Rebalance portfolio to achieve more even allocation");
    recommendations.push(
      "Target 20-35% allocation per position for balanced risk"
    );
  }

  // General recommendations
  recommendations.push("Monitor DEX pool liquidity before making large trades");
  recommendations.push("Set up alerts for significant portfolio value changes");

  if (metrics.numberOfTokens >= 3) {
    recommendations.push(
      "Review and rebalance quarterly to maintain target allocations"
    );
  }

  return recommendations;
}

/**
 * Determine overall risk level
 */
function determineRiskLevel(metrics) {
  let riskScore = 0;

  // Factor 1: Number of tokens (less tokens = more risk)
  if (metrics.numberOfTokens === 1) riskScore += 40;
  else if (metrics.numberOfTokens === 2) riskScore += 25;
  else if (metrics.numberOfTokens <= 4) riskScore += 10;
  else riskScore += 0;

  // Factor 2: Concentration
  if (metrics.largestPositionPercent > 70) riskScore += 30;
  else if (metrics.largestPositionPercent > 50) riskScore += 20;
  else if (metrics.largestPositionPercent > 35) riskScore += 10;
  else riskScore += 0;

  // Factor 3: Diversification score (inverse)
  riskScore += Math.max(0, (100 - metrics.diversificationScore) / 3);

  // Classify risk
  if (riskScore >= 60) return "high";
  if (riskScore >= 30) return "medium";
  return "low";
}

/**
 * Generate executive summary
 */
function generateSummary(metrics, riskLevel) {
  const tokenCount = metrics.numberOfTokens;
  const divScore = metrics.diversificationScore.toFixed(0);
  const topPercent = metrics.largestPositionPercent.toFixed(1);

  const riskEmoji =
    riskLevel === "high" ? "🔴" : riskLevel === "medium" ? "🟡" : "🟢";

  return (
    `${riskEmoji} ${tokenCount}-token portfolio with ${divScore}% diversification score. ` +
    `Top position: ${topPercent}%. Risk level: ${riskLevel.toUpperCase()}. ` +
    (riskLevel === "high"
      ? "Consider rebalancing to reduce concentration."
      : riskLevel === "medium"
      ? "Moderate risk profile - monitor closely."
      : "Well-balanced portfolio structure.")
  );
}

function generateEmptyPortfolioInsights() {
  return {
    summary:
      "No portfolio detected. Start by acquiring some tokens on Monad testnet!",
    riskLevel: "unknown",
    diversification: 0,
    insights: [
      "💡 Your wallet is empty. Consider acquiring some tokens to get started.",
      "🎯 A well-diversified portfolio typically holds 3-8 different assets.",
      "🛡️ Always research tokens before investing.",
    ],
    recommendations: [
      "Acquire WMON (Wrapped MON) as a base asset",
      "Consider adding 2-3 other tokens for diversification",
      "Monitor market conditions on DEX pools",
    ],
    metrics: {
      totalTokens: 0,
      concentration: 0,
      topHolding: null,
    },
    aiPowered: false,
    provider: "local",
    timestamp: Date.now(),
  };
}

export default {
  analyzePortfolioWithAI,
};
