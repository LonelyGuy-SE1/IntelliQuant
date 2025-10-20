/**
 * Crestal Network Agent Integration
 * API Docs: https://open.service.crestal.network/v1/redoc
 */

import dotenv from "dotenv";

dotenv.config();

const CRESTAL_API_KEY = process.env.CRESTAL_API_KEY || "";
const CRESTAL_BASE_URL = "https://open.service.crestal.network/v1";

/**
 * Analyze portfolio using Crestal Agent
 */
export async function analyzePortfolioWithCrestal(portfolio) {
  if (!portfolio || !portfolio.balances || portfolio.balances.length === 0) {
    return generateEmptyResponse();
  }

  try {
    const chatId = await createChat();
    const prompt = buildPortfolioPrompt(portfolio);
    const response = await sendMessage(chatId, prompt);
    return parseAgentResponse(response, portfolio);
  } catch (error) {
    console.error("Crestal error:", error.message);
    return generateFallback(portfolio);
  }
}

/**
 * Generate recommendations using Crestal Agent
 */
export async function generateCrestalRecommendations(
  tokens,
  portfolioData = null
) {
  try {
    const chatId = await createChat();
    const prompt = buildRecommendationsPrompt(tokens, portfolioData);
    const response = await sendMessage(chatId, prompt);
    return parseRecommendations(response);
  } catch (error) {
    console.error("Crestal recommendations error:", error.message);
    return [
      {
        action: "HOLD",
        reason: "Monitor market conditions",
        confidence: "medium",
      },
    ];
  }
}

async function createChat() {
  const response = await fetch(`${CRESTAL_BASE_URL}/chats`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CRESTAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  return data.id;
}

async function sendMessage(chatId, message) {
  const response = await fetch(`${CRESTAL_BASE_URL}/chats/${chatId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CRESTAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, stream: true }),
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  // Handle streaming response like popup.js
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n").filter((line) => line.trim());

    for (const line of lines) {
      try {
        const json = JSON.parse(line);
        if (json.content) fullText += json.content;
      } catch (e) {
        // Skip non-JSON lines
      }
    }
  }

  return fullText || "Analysis complete";
}

function buildPortfolioPrompt(portfolio) {
  const total = portfolio.balances.reduce(
    (sum, b) => sum + Number(b.balance),
    0
  );
  const positions = portfolio.balances
    .map((b, i) => {
      const pct = ((Number(b.balance) / total) * 100).toFixed(1);
      return `${i + 1}. ${b.token || "Token"}: ${pct}%`;
    })
    .join("\n");

  return `Analyze DeFi portfolio on Monad:\n${positions}\n\nProvide JSON: {riskLevel, diversification, insights[], recommendations[]}`;
}

function buildRecommendationsPrompt(tokens, portfolioData) {
  return `Generate trading recommendations for tokens: ${tokens.join(
    ", "
  )}.\nFormat: JSON array with {action, token, reason, confidence}`;
}

function parseAgentResponse(text, portfolio) {
  const metrics = calculateMetrics(portfolio);
  let parsed = {};

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
  } catch (e) {}

  return {
    summary: `${
      metrics.numberOfTokens
    } tokens, ${metrics.diversificationScore.toFixed(0)}% diversified`,
    riskLevel: parsed.riskLevel || determineRisk(metrics),
    diversification: parsed.diversification || metrics.diversificationScore,
    insights: parsed.insights || ["Portfolio analyzed"],
    recommendations: parsed.recommendations || ["Monitor allocations"],
    metrics: {
      totalTokens: metrics.numberOfTokens,
      concentration: metrics.concentration,
      topHolding: metrics.topHolding,
    },
    aiPowered: true,
    provider: "Crestal",
  };
}

function parseRecommendations(text) {
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch (e) {}
  return [{ action: "ANALYZE", reason: "Review tokens", confidence: "medium" }];
}

function calculateMetrics(portfolio) {
  const total = portfolio.balances.reduce(
    (sum, b) => sum + Number(b.balance),
    0
  );
  const positions = portfolio.balances
    .map((b) => ({
      token: b.tokenAddress,
      value: Number(b.balance),
      percentage: (Number(b.balance) / total) * 100,
    }))
    .sort((a, b) => b.value - a.value);

  const expectedWeight = 100 / portfolio.balances.length;
  const divScore =
    portfolio.balances.length === 1
      ? 0
      : 100 -
        positions.reduce(
          (sum, p) => sum + Math.abs(p.percentage - expectedWeight),
          0
        ) /
          2;

  return {
    diversificationScore: Math.max(0, Math.min(100, divScore)),
    concentration: positions.reduce(
      (sum, p) => sum + Math.pow(p.percentage / 100, 2),
      0
    ),
    topHolding: positions[0],
    largestPositionPercent: positions[0].percentage,
    numberOfTokens: portfolio.balances.length,
  };
}

function determineRisk(metrics) {
  let score = 0;
  if (metrics.numberOfTokens === 1) score += 40;
  if (metrics.largestPositionPercent > 70) score += 30;
  score += (100 - metrics.diversificationScore) / 3;

  if (score >= 60) return "high";
  if (score >= 30) return "medium";
  return "low";
}

function generateFallback(portfolio) {
  const metrics = calculateMetrics(portfolio);
  return {
    summary: `${portfolio.balances.length} tokens`,
    riskLevel: determineRisk(metrics),
    diversification: metrics.diversificationScore,
    insights: ["Portfolio analyzed"],
    recommendations: ["Monitor positions"],
    metrics: {
      totalTokens: portfolio.balances.length,
      concentration: metrics.concentration,
      topHolding: metrics.topHolding,
    },
    aiPowered: false,
  };
}

function generateEmptyResponse() {
  return {
    summary: "No portfolio found",
    riskLevel: "unknown",
    diversification: 0,
    insights: ["Acquire tokens to start"],
    recommendations: ["Get WMON first"],
    metrics: { totalTokens: 0, concentration: 0, topHolding: null },
    aiPowered: false,
  };
}

export default {
  analyzePortfolioWithCrestal,
  generateCrestalRecommendations,
  createChat,
  sendMessage,
};
