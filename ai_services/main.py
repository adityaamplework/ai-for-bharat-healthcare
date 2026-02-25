"""
FastAPI entry point for the AyurDiet AI service.

Exposes two endpoints:
  POST /generate-diet-chart
  POST /analyze-prakriti
  GET  /health
"""

from __future__ import annotations
from ai_services.graph.prakriti import prakriti_graph
from ai_services.graph.diet_chart import diet_chart_graph
from ai_services.graph.chat import chat_graph
from ai_services.models.schemas import (
    GenerateDietChartRequest,
    AnalyzePrakritiRequest,
    DietChartResponse,
    PrakritiResult,
    ChatRequest,
    ChatResponse,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException

import os
import logging

from dotenv import load_dotenv

# Load .env from the project root (one level up from ai_services/)
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai_services")

app = FastAPI(
    title="AyurDiet AI Service",
    description="Ayurvedic diet planning powered by LangChain & LangGraph",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "service": "ayurdiet-ai", "engine": "langgraph"}


@app.post("/generate-diet-chart")
async def generate_diet_chart(request: GenerateDietChartRequest):
    """Generate an Ayurvedic diet chart using LangGraph workflow."""
    logger.info(
        "Generating diet chart for patient: %s (type: %s)",
        request.patient.name,
        request.options.chartType,
    )

    try:
        # Prepare initial state
        initial_state = {
            "patient": request.patient.model_dump(),
            "foods": [f.model_dump() for f in request.foods],
            "options": request.options.model_dump(),
            "patient_analysis": "",
            "selected_foods": [],
            "diet_chart_json": "",
            "result": None,
            "error": None,
        }

        # Run the LangGraph workflow
        final_state = diet_chart_graph.invoke(initial_state)

        if final_state.get("error"):
            logger.warning(
                "Diet chart generated with warning: %s", final_state["error"])

        if final_state.get("result") is None:
            raise HTTPException(
                status_code=500, detail="Failed to generate diet chart")

        return final_state["result"]

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Diet chart generation failed: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Diet chart generation failed: {str(e)}")


@app.post("/analyze-prakriti")
async def analyze_prakriti(request: AnalyzePrakritiRequest):
    """Analyze Prakriti assessment using LangGraph workflow."""
    logger.info("Analyzing prakriti assessment with %d responses",
                len(request.responses))

    try:
        # Prepare initial state
        initial_state = {
            "responses": [r.model_dump() for r in request.responses],
            "primary_dosha": "",
            "secondary_dosha": None,
            "scores": {},
            "constitution_type": "",
            "confidence": 0.0,
            "recommendations": [],
            "error": None,
        }

        # Run the LangGraph workflow
        final_state = prakriti_graph.invoke(initial_state)

        if final_state.get("error"):
            logger.warning("Prakriti analysis warning: %s",
                           final_state["error"])

        return PrakritiResult(
            primary_dosha=final_state["primary_dosha"],
            secondary_dosha=final_state.get("secondary_dosha"),
            scores=final_state["scores"],
            constitution_type=final_state["constitution_type"],
            confidence=final_state["confidence"],
            recommendations=final_state.get("recommendations", []),
        ).model_dump()

    except Exception as e:
        logger.error("Prakriti analysis failed: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Prakriti analysis failed: {str(e)}")


@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Handle chat messages with the Ayurvedic AI assistant."""
    logger.info("Chat request received: %s", request.message[:50])
    try:
        response = chat_graph(request)
        return response
    except Exception as e:
        logger.error("Chat generation failed: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Chat generation failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("AI_SERVICE_PORT", "5001"))
    logger.info("Starting AyurDiet AI service on port %d", port)
    uvicorn.run(app, host="0.0.0.0", port=port)
