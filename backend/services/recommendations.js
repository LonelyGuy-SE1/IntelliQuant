/**
 * AI Recommendations Service
 */

import scoringEngine from "./scoring-engine.js";
import crestalAI from "./ai-crestal.js";

export async function generateRecommendations(tokenAddresses, limit = 5) {
  try {
    const scores = await scoringEngine.computeMultipleTokenScores(
      tokenAddresses
    );
    const aiRecs = await crestalAI.generateCrestalRecommendations(
      tokenAddresses
    );

    const recommendations = scores.map((score, idx) => {
      const aiRec = aiRecs[idx] || {
        action: "HOLD",
        reason: "Monitor",
        confidence: "medium",
      };

      return {
        token: score.address,
        score: score.score,
        action:
          score.score >= 80 ? "BUY" : score.score >= 60 ? "HOLD" : "AVOID",
        reason: aiRec.reason || score.explanation,
        confidence: aiRec.confidence || "medium",
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
