"""
LangGraph workflow for Prakriti (constitution) assessment.

Graph flow:
  calculate_scores → generate_recommendations
"""

from __future__ import annotations

import json
from typing import Any, Optional
from typing_extensions import TypedDict

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from langgraph.graph import StateGraph, START, END

from ai_services.models.schemas import AssessmentResponse, PrakritiResult


# ── State ───────────────────────────────────────────────────────


class PrakritiState(TypedDict):
    """State flowing through the prakriti assessment graph."""

    responses: list[dict[str, Any]]
    primary_dosha: str
    secondary_dosha: Optional[str]
    scores: dict[str, float]
    constitution_type: str
    confidence: float
    recommendations: list[str]
    error: Optional[str]


# ── Node: Calculate Scores ──────────────────────────────────────


def calculate_scores(state: PrakritiState) -> dict:
    """
    Pure computation node — no LLM call.
    Aggregate dosha scores from assessment responses.
    """
    responses = state["responses"]

    total_scores = {"vata": 0.0, "pitta": 0.0, "kapha": 0.0}

    for r in responses:
        score = r.get("score", {})
        total_scores["vata"] += score.get("vata", 0)
        total_scores["pitta"] += score.get("pitta", 0)
        total_scores["kapha"] += score.get("kapha", 0)

    total = total_scores["vata"] + \
        total_scores["pitta"] + total_scores["kapha"]
    if total == 0:
        total = 1  # avoid division by zero

    normalized = {
        "Vata": total_scores["vata"] / total,
        "Pitta": total_scores["pitta"] / total,
        "Kapha": total_scores["kapha"] / total,
    }

    # Sort by score descending
    sorted_doshas = sorted(
        normalized.items(), key=lambda x: x[1], reverse=True)
    primary = sorted_doshas[0][0]
    secondary = sorted_doshas[1][0] if sorted_doshas[1][1] > 0.25 else None

    # Confidence based on how distinct the primary dosha is
    diff = sorted_doshas[0][1] - sorted_doshas[1][1]
    if diff > 0.2:
        confidence = 0.9
    elif diff > 0.1:
        confidence = 0.75
    else:
        confidence = 0.6

    constitution_type = f"{primary}-{secondary}" if secondary else primary

    return {
        "primary_dosha": primary,
        "secondary_dosha": secondary,
        "scores": normalized,
        "constitution_type": constitution_type,
        "confidence": confidence,
    }


# ── Node: Generate Recommendations ─────────────────────────────


def generate_recommendations(state: PrakritiState) -> dict:
    """Use LLM to generate personalized Ayurvedic recommendations."""
    primary = state["primary_dosha"]
    secondary = state.get("secondary_dosha")
    scores = state["scores"]
    constitution_type = state["constitution_type"]

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)

    prompt = f"""Based on a Prakriti assessment, the patient's dosha scores are:
- Vata: {round(scores.get('Vata', 0) * 100)}%
- Pitta: {round(scores.get('Pitta', 0) * 100)}%
- Kapha: {round(scores.get('Kapha', 0) * 100)}%

Primary dosha: {primary}
Constitution type: {constitution_type}

Provide 5-7 specific Ayurvedic recommendations for this constitution type, covering:
- Diet (what to eat and what to avoid)
- Lifestyle habits
- Exercise and yoga practices
- Daily routine (dinacharya)
- Seasonal adjustments

Return as JSON: {{"recommendations": ["rec1", "rec2", ...]}}"""

    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        content = response.content

        # Parse JSON
        try:
            parsed = json.loads(content)
        except json.JSONDecodeError:
            start = content.find("{")
            end = content.rfind("}") + 1
            if start >= 0 and end > start:
                parsed = json.loads(content[start:end])
            else:
                raise ValueError("No JSON in response")

        recommendations = parsed.get("recommendations", [])

    except Exception:
        # Fallback recommendations
        recommendations = [
            f"Focus on {primary}-pacifying diet and lifestyle",
            "Follow a regular daily routine (dinacharya)",
            "Practice appropriate yoga and breathing exercises (pranayama)",
            "Eat freshly prepared, warm meals at regular times",
            "Get adequate sleep and manage stress through meditation",
        ]

    return {"recommendations": recommendations, "error": None}


# ── Build Graph ─────────────────────────────────────────────────


def build_prakriti_graph() -> StateGraph:
    """Build and compile the prakriti assessment graph."""
    builder = StateGraph(PrakritiState)

    builder.add_node("calculate_scores", calculate_scores)
    builder.add_node("generate_recommendations", generate_recommendations)

    builder.add_edge(START, "calculate_scores")
    builder.add_edge("calculate_scores", "generate_recommendations")
    builder.add_edge("generate_recommendations", END)

    return builder.compile()


# Compiled graph instance
prakriti_graph = build_prakriti_graph()
