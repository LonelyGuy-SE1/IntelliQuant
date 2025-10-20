// Crestal AI Configuration
// Purple Network Agent for blockchain analysis

export const CRESTAL_CONFIG = {
  // API Configuration
  apiKey: "pk-7a4dbd1aa8d5b8a7b9bb320acee0bc25deab56639c84ddf88e1b82fd2e8dc4c9",
  baseUrl: "https://open.service.crestal.network/v1",
  model: "purple-agent",

  // Session Management
  sessionTimeout: 5 * 60 * 1000, // 5 minutes - clear memory to avoid poisoning
  maxHistoryLength: 10, // Keep last 10 messages per session

  // Agent Contexts - Prompt engineering for different analysis types
  contexts: {
    portfolioAnalysis: {
      systemPrompt: `You are a DeFi portfolio analyst. Analyze the provided wallet data and provide insights on:
- Token distribution and diversification
- Risk assessment based on holdings
- Performance trends
- Recommendations for optimization

Format your response in clear, actionable points.`,
      userPromptTemplate: (address, data) => `Analyze this DeFi portfolio:

Wallet Address: ${address}

Portfolio Data:
${JSON.stringify(data, null, 2)}

Provide analysis on diversification, risk profile, and recommendations.`
    },

    tokenAnalysis: {
      systemPrompt: `You are a blockchain token analyst. Analyze the provided token contract and provide insights on:
- Token metrics and statistics
- Holder distribution
- Trading activity patterns
- Risk factors and red flags

Be concise and focus on actionable intelligence.`,
      userPromptTemplate: (contractAddress, tokenData) => `Analyze this token contract:

Contract Address: ${contractAddress}
Network: Monad Testnet (Chain ID: 10143)

Token Data:
${JSON.stringify(tokenData, null, 2)}

Provide analysis on token health, holder concentration, and any risk factors.`
    },

    riskAnalysis: {
      systemPrompt: `You are a DeFi risk assessment specialist. Evaluate the provided data and identify:
- Security risks
- Smart contract risks
- Liquidity risks
- Market risks

Rate risks on a scale of 1-10 and explain your reasoning.`,
      userPromptTemplate: (userAddress, portfolioData, tokenMetrics) => `Perform risk analysis:

User: ${userAddress}

Portfolio Holdings:
${JSON.stringify(portfolioData, null, 2)}

Token Metrics:
${JSON.stringify(tokenMetrics, null, 2)}

Provide comprehensive risk assessment with severity ratings.`
    },

    smartAccountAdvice: {
      systemPrompt: `You are a smart account optimization expert. Help users leverage:
- Account abstraction benefits
- Gas optimization strategies
- Batch transaction opportunities
- Security best practices

Provide practical, actionable advice.`,
      userPromptTemplate: (userAddress, recentActivity) => `Provide smart account optimization advice:

User Address: ${userAddress}

Recent Activity:
${JSON.stringify(recentActivity, null, 2)}

Suggest ways to optimize gas usage and improve security using smart account features.`
    },

    generalChat: {
      systemPrompt: `You are IntelliQuant AI, a helpful DeFi assistant on Monad testnet. You help users:
- Understand their portfolio
- Make informed decisions
- Learn about DeFi concepts
- Navigate the platform

Be friendly, concise, and educational.`,
      userPromptTemplate: (message) => message
    }
  }
};

// Session storage for managing multiple chat contexts
const sessions = new Map();

export class CrestalAIService {
  constructor() {
    this.config = CRESTAL_CONFIG;
  }

  // Create or get existing session
  getSession(sessionId = 'default', contextType = 'generalChat') {
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, {
        id: sessionId,
        contextType,
        chatId: null,
        history: [],
        lastActivity: Date.now()
      });
    }

    const session = sessions.get(sessionId);
    
    // Clear old sessions (prevent memory poisoning)
    if (Date.now() - session.lastActivity > this.config.sessionTimeout) {
      console.log(`Session ${sessionId} expired, creating new one`);
      sessions.delete(sessionId);
      return this.getSession(sessionId, contextType);
    }

    session.lastActivity = Date.now();
    return session;
  }

  // Clear session to start fresh analysis
  clearSession(sessionId) {
    sessions.delete(sessionId);
    console.log(`Session ${sessionId} cleared`);
  }

  // Send message with context-aware prompt engineering
  async sendMessage(message, contextType = 'generalChat', contextData = {}, sessionId = 'default') {
    try {
      const session = this.getSession(sessionId, contextType);
      const context = this.config.contexts[contextType];

      if (!context) {
        throw new Error(`Unknown context type: ${contextType}`);
      }

      // Build prompt with context
      const userPrompt = typeof context.userPromptTemplate === 'function'
        ? context.userPromptTemplate(message, contextData)
        : message;

      // Create chat with Purple agent
      const chatResponse = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { role: "system", content: context.systemPrompt },
            ...session.history,
            { role: "user", content: userPrompt }
          ]
        }),
      });

      if (!chatResponse.ok) {
        throw new Error(`API error: ${chatResponse.status}`);
      }

      const data = await chatResponse.json();
      const aiResponse = data.choices?.[0]?.message?.content 
        || data.response 
        || "No response received";

      // Update session history (trim if too long)
      session.history.push(
        { role: "user", content: userPrompt },
        { role: "assistant", content: aiResponse }
      );

      if (session.history.length > this.config.maxHistoryLength * 2) {
        session.history = session.history.slice(-this.config.maxHistoryLength * 2);
      }

      return {
        success: true,
        response: aiResponse,
        sessionId: session.id,
        contextType
      };

    } catch (error) {
      console.error("Crestal AI error:", error);
      return {
        success: false,
        error: error.message,
        response: `Sorry, I encountered an error: ${error.message}`
      };
    }
  }

  // Analyze portfolio with enhanced context
  async analyzePortfolio(userAddress, portfolioData) {
    const sessionId = `portfolio_${userAddress}`;
    this.clearSession(sessionId); // Fresh analysis each time
    
    return this.sendMessage(
      userAddress,
      'portfolioAnalysis',
      portfolioData,
      sessionId
    );
  }

  // Analyze token contract
  async analyzeToken(contractAddress, tokenData) {
    const sessionId = `token_${contractAddress}`;
    this.clearSession(sessionId);
    
    return this.sendMessage(
      contractAddress,
      'tokenAnalysis',
      tokenData,
      sessionId
    );
  }

  // Risk assessment
  async assessRisk(userAddress, portfolioData, tokenMetrics) {
    const sessionId = `risk_${userAddress}`;
    this.clearSession(sessionId);
    
    return this.sendMessage(
      userAddress,
      'riskAnalysis',
      { portfolioData, tokenMetrics },
      sessionId
    );
  }

  // Smart account optimization advice
  async getSmartAccountAdvice(userAddress, recentActivity) {
    const sessionId = `smartaccount_${userAddress}`;
    
    return this.sendMessage(
      userAddress,
      'smartAccountAdvice',
      recentActivity,
      sessionId
    );
  }
}

// Export singleton instance
export const crestalAI = new CrestalAIService();
