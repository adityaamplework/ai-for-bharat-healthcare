/**
 * AI Service — proxies requests to the Python FastAPI service
 * powered by LangChain & LangGraph.
 */

import type { Patient, Food } from "../schema";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:5001";

export async function generateDietChart(
  patient: Patient,
  foods: Food[],
  options: {
    chartType: string;
    durationDays: number;
    season: string;
    additionalNotes?: string;
  },
) {
  const response = await fetch(`${AI_SERVICE_URL}/generate-diet-chart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patient, foods, options }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: response.statusText }));
    throw new Error(
      `AI service error: ${error.detail || error.message || "Unknown error"}`,
    );
  }

  return response.json();
}

export async function analyzePrakritiAssessment(
  responses: {
    questionId: string;
    answer: string;
    score: { vata: number; pitta: number; kapha: number };
  }[],
) {
  const response = await fetch(`${AI_SERVICE_URL}/analyze-prakriti`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ responses }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: response.statusText }));
    throw new Error(
      `AI service error: ${error.detail || error.message || "Unknown error"}`,
    );
  }

  return response.json();
}

export async function generateChatResponse(request: {
  message: string;
  history: { role: string; content: string }[];
}) {
  const response = await fetch(`${AI_SERVICE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: response.statusText }));
    throw new Error(
      `AI service error: ${error.detail || error.message || "Unknown error"}`,
    );
  }

  return response.json();
}
