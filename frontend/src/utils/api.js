/**
 * Backend API Client
 * Communicates with IntelliQuant backend API
 */

// Support both Vite (import.meta.env) and plain browser (Live Server)
const API_URL = (import.meta && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : 'http://localhost:3000';

/**
 * Generic API request
 */
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
}

/**
 * Get token health score
 */
export async function getTokenScore(tokenAddress) {
  return await apiRequest(`/api/tokens/${tokenAddress}/score`);
}

/**
 * Get multiple token scores
 */
export async function getMultipleTokenScores(tokenAddresses) {
  return await apiRequest('/api/tokens/scores', {
    method: 'POST',
    body: JSON.stringify({ tokens: tokenAddresses }),
  });
}

/**
 * Get user portfolio
 */
export async function getUserPortfolio(userAddress) {
  return await apiRequest(`/api/portfolio/${userAddress}`);
}

/**
 * Analyze portfolio risk
 */
export async function analyzePortfolio(userAddress, targetAllocation = {}) {
  return await apiRequest(`/api/portfolio/${userAddress}/analyze`, {
    method: 'POST',
    body: JSON.stringify({ targetAllocation }),
  });
}

/**
 * Get rebalancing recommendations
 */
export async function getRebalancingTrades(userAddress, targetAllocation) {
  return await apiRequest(`/api/portfolio/${userAddress}/rebalance`, {
    method: 'POST',
    body: JSON.stringify({ targetAllocation }),
  });
}

/**
 * Get AI recommendations
 */
export async function getRecommendations(tokenAddresses, limit = 5) {
  return await apiRequest('/api/recommendations', {
    method: 'POST',
    body: JSON.stringify({ tokens: tokenAddresses, limit }),
  });
}

/**
 * Get healthiest tokens
 */
export async function getHealthiestTokens(tokenAddresses, limit = 10) {
  return await apiRequest('/api/recommendations/healthiest', {
    method: 'POST',
    body: JSON.stringify({ tokens: tokenAddresses, limit }),
  });
}

export default {
  getTokenScore,
  getMultipleTokenScores,
  getUserPortfolio,
  analyzePortfolio,
  getRebalancingTrades,
  getRecommendations,
  getHealthiestTokens,
};
