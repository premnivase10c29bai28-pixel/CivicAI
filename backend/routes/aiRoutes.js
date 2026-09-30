import express from "express";
import { analyzeComplaint, generateDevelopmentInsight } from "../services/geminiService.js";

const router = express.Router();

/**
 * POST /api/ai/analyze
 * Analyzes citizen complaint text using Google Gemini with Tamil & English NLP
 */
router.post("/analyze", async (req, res) => {
  try {
    const { text, language } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameter: text is required."
      });
    }

    const analysis = await analyzeComplaint(text.trim(), language);

    return res.status(200).json({
      success: true,
      data: {
        ...analysis,
        requiresConfirmation: true, // Citizen MUST review & confirm before submission
        analyzedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("[AIRoutes] /api/ai/analyze error:", error.message || error);
    return res.status(500).json({
      success: false,
      error: "AI analysis failed. Please try again or fill in the category manually."
    });
  }
});

/**
 * POST /api/ai/development-insight
 * Synthesizes Gemini-powered municipal decision support for verified civic hotspot clusters.
 */
router.post("/development-insight", async (req, res) => {
  try {
    const { hotspot } = req.body;

    if (!hotspot || typeof hotspot !== "object") {
      return res.status(400).json({
        success: false,
        error: "Missing required parameter: hotspot object is required."
      });
    }

    const insight = await generateDevelopmentInsight(hotspot);

    return res.status(200).json({
      success: true,
      data: insight
    });
  } catch (error) {
    console.error("[AIRoutes] /api/ai/development-insight error:", error.message || error);
    return res.status(500).json({
      success: false,
      error: "Failed to generate development insight."
    });
  }
});

export default router;
