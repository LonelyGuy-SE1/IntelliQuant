/**
 * AI Analysis API - Frontend wrapper for Crestal AI
 * Provides portfolio analysis, token insights, and risk assessment
 */

import { crestalAI } from '../config/crestal.js';

export class AIAnalysisAPI {
  constructor() {
    this.baseUrl = 'http://localhost:3001/api';
  }

  /**
   * Analyze user's portfolio with AI
   * Fetches portfolio data from Envio and provides AI insights
   */
  async analyzePortfolio(userAddress) {
    try {
      // Fetch portfolio data from backend (Envio)
      const response = await fetch(`${this.baseUrl}/portfolio/${userAddress}`);
      const portfolioData = await response.json();

      if (!portfolioData || !portfolioData.balances || portfolioData.balances.length === 0) {
        return {
          success: false,
          message: "No portfolio found",
          insights: ["Your wallet appears to be empty. Start by acquiring some tokens!"]
        };
      }

      // Use Crestal AI for analysis with enhanced context
      const analysis = await crestalAI.analyzePortfolio(userAddress, portfolioData);

      return {
        success: true,
        analysis: analysis.response,
        portfolioData,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error("Portfolio analysis error:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Analyze specific token contract
   */
  async analyzeToken(contractAddress) {
    try {
      // Fetch token data from backend
      const response = await fetch(`${this.baseUrl}/tokens/${contractAddress}/metrics`);
      const tokenData = await response.json();

      // Use Crestal AI for token analysis
      const analysis = await crestalAI.analyzeToken(contractAddress, tokenData);

      return {
        success: true,
        analysis: analysis.response,
        tokenData,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error("Token analysis error:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Perform risk assessment for user's portfolio
   */
  async assessRisk(userAddress) {
    try {
      // Fetch portfolio and token metrics
      const [portfolioRes, metricsRes] = await Promise.all([
        fetch(`${this.baseUrl}/portfolio/${userAddress}`),
        fetch(`${this.baseUrl}/tokens/metrics`)
      ]);

      const portfolioData = await portfolioRes.json();
      const tokenMetrics = await metricsRes.json();

      // Use Crestal AI for risk assessment
      const assessment = await crestalAI.assessRisk(
        userAddress,
        portfolioData,
        tokenMetrics
      );

      return {
        success: true,
        assessment: assessment.response,
        riskData: {
          portfolio: portfolioData,
          metrics: tokenMetrics
        },
        timestamp: Date.now()
      };
    } catch (error) {
      console.error("Risk assessment error:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get smart account optimization advice
   */
  async getSmartAccountAdvice(userAddress) {
    try {
      // Fetch recent transactions/activity
      const response = await fetch(`${this.baseUrl}/portfolio/${userAddress}/activity`);
      const activityData = await response.json();

      // Use Crestal AI for smart account recommendations
      const advice = await crestalAI.getSmartAccountAdvice(userAddress, activityData);

      return {
        success: true,
        advice: advice.response,
        activityData,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error("Smart account advice error:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get AI recommendations based on portfolio
   */
  async getRecommendations(userAddress) {
    try {
      const response = await fetch(`${this.baseUrl}/recommendations/${userAddress}`);
      const data = await response.json();

      return {
        success: true,
        recommendations: data.recommendations || [],
        timestamp: Date.now()
      };
    } catch (error) {
      console.error("Recommendations error:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
export const aiAPI = new AIAnalysisAPI();
