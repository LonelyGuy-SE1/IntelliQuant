/**
 * AI Recommendations Service (Crestal integration now in frontend)
 */

import scoringEngine from "./scoring-engine.js";

export async function generateRecommendations(tokenAddresses, limit = 5) {
  try {
    const scores = await scoringEngine.computeMultipleTokenScores(
      tokenAddresses
    );

    const recommendations = scores.map((score) => {
      return {
        token: score.address,
        score: score.score,
        action:
          score.score >= 80 ? "BUY" : score.score >= 60 ? "HOLD" : "AVOID",
        reason: score.explanation || "Based on token metrics analysis",
        confidence:
          score.score >= 80 ? "high" : score.score >= 60 ? "medium" : "low",
        components: score.components,
      };
    });

    return recommendations.slice(0, limit);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export async function getHealthiestTokens(tokenAddresses, limit = 10) {
  const scores = await scoringEngine.computeMultipleTokenScores(tokenAddresses);
  return scores
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export default {
  generateRecommendations,
  getHealthiestTokens,
};
