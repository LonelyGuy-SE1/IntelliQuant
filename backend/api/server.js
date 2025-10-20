/**
 * IntelliQuant API Server
 * Express server exposing portfolio analytics and AI recommendations
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import routes
import tokensRouter from "./routes/tokens.js";
import portfolioRouter from "./routes/portfolio.js";
import recommendationsRouter from "./routes/recommendations.js";
import aiRouter from "./routes/ai.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: Date.now(),
    service: "IntelliQuant API",
    version: "1.0.0",
  });
});

// Test AI endpoint (GET)
app.get("/api/ai/test", async (req, res) => {
  try {
    const { analyzePortfolioWithCrestal } = await import(
      "../services/ai-crestal.js"
    );
    const testPortfolio = {
      userAddress: "0xTest",
      balances: [
        {
          tokenAddress: "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701",
          token: "WMON",
          balance: "1000000",
        },
        {
          tokenAddress: "0x836047a99e11f376522b447bffb6e3495dd0637c",
          token: "ETH",
          balance: "500000",
        },
      ],
    };
    const result = await analyzePortfolioWithCrestal(testPortfolio);
    res.json({ success: true, analysis: result });
  } catch (error) {
    console.error("AI test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Crestal API key may be invalid or network issue",
    });
  }
});

// Test AI endpoint (POST) for chatbox
app.post("/api/ai/test", async (req, res) => {
  try {
    const aiCrestal = await import("../services/ai-crestal.js");
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: "Prompt is required",
      });
    }

    console.log("Crestal chat request:", prompt);
    const chatId = await aiCrestal.default.createChat();
    const response = await aiCrestal.default.sendMessage(chatId, prompt);

    res.json({
      success: true,
      chatId: chatId,
      analysis: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Crestal chat error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      fallback: "Crestal API unavailable - check API key and network",
    });
  }
});

// API Routes
app.use("/api/tokens", tokensRouter);
app.use("/api/portfolio", portfolioRouter);
app.use("/api/recommendations", recommendationsRouter);

// Root route
app.get("/", (req, res) => {
  res.json({
    name: "IntelliQuant API",
    version: "1.0.0",
    description: "AI-powered portfolio management on Monad",
    endpoints: {
      health: "GET /health",
      tokens: {
        score: "GET /api/tokens/:address/score",
        pools: "GET /api/tokens/:address/pools",
        scores: "POST /api/tokens/scores",
      },
      portfolio: {
        get: "GET /api/portfolio/:address",
        analyze: "POST /api/portfolio/:address/analyze",
        rebalance: "POST /api/portfolio/:address/rebalance",
      },
      recommendations: {
        generate: "POST /api/recommendations",
        healthiest: "POST /api/recommendations/healthiest",
      },
    },
    docs: "https://github.com/intelliquant/docs",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    path: req.path,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║         IntelliQuant API Server               ║
║                                               ║
║  Port: ${PORT}                                  ║
║  Environment: ${process.env.NODE_ENV || "development"}                     ║
║                                               ║
║  Endpoints:                                   ║
║  - GET  /health                               ║
║  - GET  /api/tokens/:address/score            ║
║  - POST /api/tokens/scores                    ║
║  - GET  /api/portfolio/:address               ║
║  - POST /api/portfolio/:address/analyze       ║
║  - POST /api/recommendations                  ║
║                                               ║
║  Envio Indexers:                              ║
║  - Portfolio: ${process.env.ENVIO_PORTFOLIO_ENDPOINT || "Not configured"}
║  - DEX: ${process.env.ENVIO_DEX_ENDPOINT || "Not configured"}
║                                               ║
╚═══════════════════════════════════════════════╝
  `);
});

export default app;
