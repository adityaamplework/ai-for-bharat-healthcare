import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import {
  generateDietChart,
  analyzePrakritiAssessment,
  generateChatResponse,
} from "./ai-service";
import { insertPatientSchema } from "../schema";
import { z } from "zod";

export async function registerRoutes(server: Server, app: Express) {
  app.get("/api/patients", async (_req, res) => {
    const patients = await storage.getPatients();
    res.json(patients);
  });

  app.get("/api/patients/:id", async (req, res) => {
    const patient = await storage.getPatient(parseInt(req.params.id));
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  });

  app.post("/api/patients", async (req, res) => {
    try {
      const data = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(data);
      res.status(201).json(patient);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.patch("/api/patients/:id", async (req, res) => {
    const patient = await storage.updatePatient(
      parseInt(req.params.id),
      req.body,
    );
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  });

  app.delete("/api/patients/:id", async (req, res) => {
    const deleted = await storage.deletePatient(parseInt(req.params.id));
    if (!deleted) return res.status(404).json({ message: "Patient not found" });
    res.json({ success: true });
  });

  app.get("/api/foods", async (_req, res) => {
    const foods = await storage.getFoods();
    res.json(foods);
  });

  app.get("/api/foods/:id", async (req, res) => {
    const food = await storage.getFood(parseInt(req.params.id));
    if (!food) return res.status(404).json({ message: "Food not found" });
    res.json(food);
  });

  app.get("/api/diet-charts", async (_req, res) => {
    const charts = await storage.getDietCharts();
    res.json(charts);
  });

  app.get("/api/diet-charts/:id", async (req, res) => {
    const chart = await storage.getDietChart(parseInt(req.params.id));
    if (!chart)
      return res.status(404).json({ message: "Diet chart not found" });
    res.json(chart);
  });

  app.post("/api/diet-charts/generate", async (req, res) => {
    try {
      const { patientId, chartType, durationDays, season, additionalNotes } =
        req.body;

      if (!patientId)
        return res.status(400).json({ message: "Patient ID is required" });

      const patient = await storage.getPatient(patientId);
      if (!patient)
        return res.status(404).json({ message: "Patient not found" });

      const foods = await storage.getFoods();

      const aiResult = await generateDietChart(patient, foods, {
        chartType: chartType || "maintenance",
        durationDays: durationDays || 7,
        season: season || "summer",
        additionalNotes,
      });

      const chart = await storage.createDietChart({
        patientId,
        chartData: aiResult.chartData,
        nutritionalAnalysis: aiResult.nutritionalAnalysis,
        ayurvedicAnalysis: aiResult.ayurvedicAnalysis,
        chartType: chartType || "maintenance",
        durationDays: durationDays || 7,
        status: "active",
        aiConfidence: aiResult.confidence || 0.85,
        expiresAt: null,
      });

      res.status(201).json(chart);
    } catch (err: any) {
      console.error("Diet chart generation error:", err);
      res
        .status(500)
        .json({
          message:
            "Failed to generate diet chart: " +
            (err.message || "Unknown error"),
        });
    }
  });

  app.post("/api/prakriti-assessment", async (req, res) => {
    try {
      const { patientId, responses } = req.body;

      if (!responses || !Array.isArray(responses)) {
        return res.status(400).json({ message: "Responses are required" });
      }

      const result = await analyzePrakritiAssessment(responses);

      const assessment = await storage.createPrakritiAssessment({
        patientId: patientId || null,
        responses,
        result,
      });

      if (patientId) {
        await storage.updatePatient(patientId, {
          constitution: {
            primary_dosha: result.primary_dosha,
            secondary_dosha: result.secondary_dosha,
            scores: result.scores,
            constitution_type: result.constitution_type,
            confidence: result.confidence,
          },
        });
      }

      res.status(201).json(assessment);
    } catch (err: any) {
      console.error("Prakriti assessment error:", err);
      res
        .status(500)
        .json({
          message: "Assessment failed: " + (err.message || "Unknown error"),
        });
    }
  });

  // Chat Routes
  app.get("/api/chat/conversations", async (_req, res) => {
    const conversations = await storage.getConversations();
    res.json(conversations);
  });

  app.post("/api/chat/conversations", async (req, res) => {
    try {
      const { title } = req.body;
      const conversation = await storage.createConversation({
        title: title || "New Chat",
      });
      res.status(201).json(conversation);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.get("/api/chat/conversations/:id/messages", async (req, res) => {
    const messages = await storage.getMessages(parseInt(req.params.id));
    res.json(messages);
  });

  app.post("/api/chat/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ message: "Message content is required" });
      }

      // Save user message
      const userMessage = await storage.addMessage({
        conversationId,
        role: "user",
        content,
      });

      // Get history to pass to AI
      const history = await storage.getMessages(conversationId);

      // Call AI Service
      try {
        const aiResponse = await generateChatResponse({
          message: content,
          history: history
            .filter((m) => m.id !== userMessage.id)
            .map((m) => ({
              role: m.role,
              content: m.content,
            })),
        });

        // Save AI message
        const aiMessage = await storage.addMessage({
          conversationId,
          role: "assistant",
          content: aiResponse.response,
        });

        res.status(201).json({ userMessage, aiMessage });
      } catch (aiErr: any) {
        console.error("AI service error during chat:", aiErr);
        // Save an error message if the AI fails
        const aiMessage = await storage.addMessage({
          conversationId,
          role: "assistant",
          content:
            "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later.",
        });
        res.status(201).json({ userMessage, aiMessage, error: aiErr.message });
      }
    } catch (err: any) {
      console.error("Chat message processing error:", err);
      res
        .status(500)
        .json({
          message:
            "Failed to process chat: " + (err.message || "Unknown error"),
        });
    }
  });
}
