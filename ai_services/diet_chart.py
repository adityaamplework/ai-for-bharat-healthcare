"""
LangGraph workflow for Ayurvedic diet chart generation.

Graph flow:
  analyze_patient → select_foods → generate_meals → validate_output
"""

from __future__ import annotations

import json
from typing import Any, Optional
from typing_extensions import TypedDict

from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.graph import StateGraph, START, END

from ai_services.models.schemas import (
    PatientData,
    FoodItem,
    ChartOptions,
    DietChartResponse,
)


# ── State ───────────────────────────────────────────────────────


class DietChartState(TypedDict):
    """State flowing through the diet-chart graph."""

    patient: dict[str, Any]
    foods: list[dict[str, Any]]
    options: dict[str, Any]
    patient_analysis: str
    selected_foods: list[dict[str, Any]]
    diet_chart_json: str
    result: Optional[dict[str, Any]]
    error: Optional[str]


# ── LLM ─────────────────────────────────────────────────────────


def _get_llm() -> ChatOpenAI:
    return ChatOpenAI(model="gpt-4o-mini", temperature=0.7)


# ── Node: Analyze Patient ──────────────────────────────────────


def analyze_patient(state: DietChartState) -> dict:
    """Analyze the patient's constitution, imbalances, and needs."""
    patient = state["patient"]
    options = state["options"]

    llm = _get_llm()

    prompt = f"""You are an expert Ayurvedic practitioner. Analyze this patient profile and provide a concise assessment.

PATIENT:
- Name: {patient.get('name')}, Age: {patient.get('age')}, Gender: {patient.get('gender')}
- Weight: {patient.get('weight', 'unknown')} kg, Height: {patient.get('height', 'unknown')} cm
- Constitution (Prakriti): {json.dumps(patient.get('constitution')) if patient.get('constitution') else 'Not assessed'}
- Current Imbalance (Vikriti): {json.dumps(patient.get('currentImbalance')) if patient.get('currentImbalance') else 'None reported'}
- Lifestyle: {json.dumps(patient.get('lifestyleFactors')) if patient.get('lifestyleFactors') else 'Standard'}
- Allergies: {json.dumps(patient.get('allergies')) if patient.get('allergies') else 'None'}
- Dietary Restrictions: {json.dumps(patient.get('dietaryRestrictions')) if patient.get('dietaryRestrictions') else 'None'}
- Food Preferences: {json.dumps(patient.get('foodPreferences')) if patient.get('foodPreferences') else 'Standard'}
- Medical History: {json.dumps(patient.get('medicalHistory')) if patient.get('medicalHistory') else 'None'}

CHART TYPE: {options.get('chartType', 'maintenance')}
SEASON: {options.get('season', 'summer')}

Provide a concise analysis covering:
1. Primary and secondary dosha assessment
2. Key imbalances to address
3. Dietary principles to follow for this patient
4. Tastes (rasas) to emphasize and avoid
5. Special considerations based on season and chart type"""

    response = llm.invoke([HumanMessage(content=prompt)])

    return {"patient_analysis": response.content}


# ── Node: Select Foods ─────────────────────────────────────────


def select_foods(state: DietChartState) -> dict:
    """Filter and rank available foods based on patient analysis."""
    foods = state["foods"]
    analysis = state["patient_analysis"]

    llm = _get_llm()

    food_summary = []
    for f in foods[:50]:
        food_summary.append({
            "name": f.get("name"),
            "rasa": f.get("rasa"),
            "virya": f.get("virya"),
            "vipaka": f.get("vipaka"),
            "doshaEffects": f.get("doshaEffects"),
            "category": f.get("foodCategory"),
            "nutritionalData": {
                "calories": f.get("nutritionalData", {}).get("calories", 0),
                "protein": f.get("nutritionalData", {}).get("protein", 0),
                "carbs": f.get("nutritionalData", {}).get("carbs", 0),
                "fat": f.get("nutritionalData", {}).get("fat", 0),
            } if f.get("nutritionalData") else None,
        })

    prompt = f"""Based on the following patient analysis, select and rank the most suitable foods from the available list.

PATIENT ANALYSIS:
{analysis}

AVAILABLE FOODS:
{json.dumps(food_summary, indent=1)}

Return a JSON array of the top 25-30 most suitable food names with brief reasoning, in this format:
{{"selected_foods": [{{"name": "food name", "reason": "why suitable", "meal_types": ["breakfast", "lunch", "dinner"]}}]}}

Consider: dosha compatibility, rasa balance, seasonal appropriateness, and nutritional value."""

    response = llm.invoke([HumanMessage(content=prompt)])

    # Extract the JSON from the response
    content = response.content
    try:
        # Try to parse directly
        selected = json.loads(content)
    except json.JSONDecodeError:
        # Try to find JSON in the response
        start = content.find("{")
        end = content.rfind("}") + 1
        if start >= 0 and end > start:
            selected = json.loads(content[start:end])
        else:
            selected = {"selected_foods": [{"name": f.get("name"), "reason": "default", "meal_types": [
                "lunch"]} for f in food_summary[:25]]}

    return {"selected_foods": selected.get("selected_foods", [])}


# ── Node: Generate Meals ───────────────────────────────────────


def generate_meals(state: DietChartState) -> dict:
    """Generate the complete meal plan using the LLM."""
    patient = state["patient"]
    options = state["options"]
    analysis = state["patient_analysis"]
    selected_foods = state["selected_foods"]

    llm = _get_llm()

    prompt = f"""You are an expert Ayurvedic dietitian. Generate a comprehensive personalized diet chart.

PATIENT ANALYSIS:
{analysis}

SELECTED SUITABLE FOODS:
{json.dumps(selected_foods, indent=1)}

CHART CONFIGURATION:
- Type: {options.get('chartType', 'maintenance')} (therapeutic=treating imbalances, maintenance=daily balance, seasonal=seasonal, detox=cleansing)
- Duration: {options.get('durationDays', 7)} days
- Season: {options.get('season', 'summer')}
{f"- Notes: {options.get('additionalNotes')}" if options.get('additionalNotes') else ""}

AYURVEDIC PRINCIPLES:
1. Balance the six rasas: Sweet, Sour, Salty, Pungent, Bitter, Astringent
2. Consider virya (heating/cooling) and vipaka (post-digestive effect)
3. Foods should pacify aggravated doshas
4. Follow seasonal dietary guidelines (ritucharya)
5. Meal timing according to Ayurvedic clock

Generate a JSON response in EXACTLY this format (no extra text):
{{
  "chartData": {{
    "meals": [
      {{
        "type": "early_morning",
        "time": "06:00",
        "foods": [
          {{"name": "food name", "quantity": "amount with unit", "preparation": "how to prepare"}}
        ],
        "notes": "Ayurvedic reasoning for this meal"
      }}
    ],
    "guidelines": ["list of dietary guidelines"],
    "avoidFoods": ["foods to avoid"]
  }},
  "nutritionalAnalysis": {{
    "totalCalories": 1800,
    "protein": 60,
    "carbs": 250,
    "fat": 55,
    "fiber": 30
  }},
  "ayurvedicAnalysis": {{
    "doshaBalance": "how this diet balances doshas",
    "rasaBalance": ["Sweet", "Bitter"],
    "seasonalAlignment": "alignment with season",
    "therapeuticBenefits": ["benefit 1", "benefit 2"]
  }},
  "confidence": 0.85
}}

Include 5-7 meals: early_morning, breakfast, mid_morning, lunch, afternoon_snack, dinner, bedtime.
Use Indian/Ayurvedic foods from the selected list. Be practical and specific."""

    response = llm.invoke([HumanMessage(content=prompt)])

    return {"diet_chart_json": response.content}


# ── Node: Validate Output ──────────────────────────────────────


def validate_output(state: DietChartState) -> dict:
    """Parse and validate the generated diet chart."""
    raw = state["diet_chart_json"]

    try:
        # Try direct parse
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            # Extract JSON from response text
            start = raw.find("{")
            end = raw.rfind("}") + 1
            if start >= 0 and end > start:
                data = json.loads(raw[start:end])
            else:
                raise ValueError("No valid JSON found in LLM response")

        # Validate using Pydantic
        validated = DietChartResponse(**data)
        return {"result": validated.model_dump(), "error": None}

    except Exception as e:
        # Return a fallback diet chart so the API doesn't crash
        fallback = DietChartResponse(
            chartData={
                "meals": [
                    {
                        "type": "breakfast",
                        "time": "08:00",
                        "foods": [{"name": "Khichdi", "quantity": "1 bowl", "preparation": "Cook rice and moong dal together with turmeric"}],
                        "notes": "Light, easily digestible breakfast suitable for all doshas",
                    },
                    {
                        "type": "lunch",
                        "time": "12:30",
                        "foods": [{"name": "Roti with vegetables", "quantity": "2 rotis + 1 bowl sabji", "preparation": "Freshly prepared with ghee"}],
                        "notes": "Main meal of the day when digestive fire (Agni) is strongest",
                    },
                    {
                        "type": "dinner",
                        "time": "19:00",
                        "foods": [{"name": "Vegetable soup", "quantity": "1 bowl", "preparation": "Light soup with seasonal vegetables"}],
                        "notes": "Light dinner to ensure proper digestion before sleep",
                    },
                ],
                "guidelines": ["Eat freshly prepared meals", "Drink warm water throughout the day"],
                "avoidFoods": ["Processed foods", "Cold beverages"],
            },
            nutritionalAnalysis={
                "totalCalories": 1600, "protein": 50, "carbs": 220, "fat": 45, "fiber": 25},
            ayurvedicAnalysis={
                "doshaBalance": "Balanced tri-dosha approach",
                "rasaBalance": ["Sweet", "Bitter", "Astringent"],
                "seasonalAlignment": "Adapted to current season",
                "therapeuticBenefits": ["Improved digestion", "Dosha balance"],
            },
            confidence=0.6,
        )
        return {"result": fallback.model_dump(), "error": f"Validation warning (used fallback): {str(e)}"}


# ── Build Graph ─────────────────────────────────────────────────


def build_diet_chart_graph() -> StateGraph:
    """Build and compile the diet chart generation graph."""
    builder = StateGraph(DietChartState)

    builder.add_node("analyze_patient", analyze_patient)
    builder.add_node("select_foods", select_foods)
    builder.add_node("generate_meals", generate_meals)
    builder.add_node("validate_output", validate_output)

    builder.add_edge(START, "analyze_patient")
    builder.add_edge("analyze_patient", "select_foods")
    builder.add_edge("select_foods", "generate_meals")
    builder.add_edge("generate_meals", "validate_output")
    builder.add_edge("validate_output", END)

    return builder.compile()


# Compiled graph instance
diet_chart_graph = build_diet_chart_graph()
