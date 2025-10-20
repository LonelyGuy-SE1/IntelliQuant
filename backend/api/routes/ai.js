// AI Testing Routes
import express from "express";

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

    // Crestal is now handled in frontend directly
    res.json({
      success: true,
      message: "Crestal AI is integrated in frontend",
      prompt: prompt,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("AI test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
