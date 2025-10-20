// AI Testing Routes
import express from "express";
import aiCrestal from "../../services/ai-crestal.js";

const router = express.Router();

// POST /api/ai/test - Test Crestal API
router.post("/test", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: "Prompt is required",
      });
    }

    console.log("Testing Crestal with prompt:", prompt);

    // Test with simple chat
    const chatId = await aiCrestal.createChat();
    const response = await aiCrestal.sendMessage(chatId, prompt);

    res.json({
      success: true,
      chatId: chatId,
      analysis: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Crestal test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      fallback: "Using local analysis - Crestal API unavailable",
    });
  }
});

export default router;
