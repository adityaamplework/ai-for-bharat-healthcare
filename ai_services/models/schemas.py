"""Pydantic models for request/response schemas."""

from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, Field


# ── Request Models ──────────────────────────────────────────────


class NutritionalData(BaseModel):
    calories: float = 0
    protein: float = 0
    carbs: float = 0
    fat: float = 0
    fiber: float = 0
    vitamins: dict[str, float] = Field(default_factory=dict)
    minerals: dict[str, float] = Field(default_factory=dict)


class DoshaEffects(BaseModel):
    vata: str = ""
    pitta: str = ""
    kapha: str = ""


class FoodItem(BaseModel):
    id: int
    name: str
    nameHindi: Optional[str] = None
    nutritionalData: Optional[NutritionalData] = None
    rasa: Optional[list[str]] = None
    virya: Optional[str] = None
    vipaka: Optional[str] = None
    prabhava: Optional[str] = None
    doshaEffects: Optional[DoshaEffects] = None
    foodCategory: Optional[str] = None
    cuisineType: Optional[str] = None
    seasonalAvailability: Optional[list[str]] = None
    cookingMethods: Optional[list[str]] = None
    isVegetarian: Optional[bool] = True


class ConstitutionData(BaseModel):
    primary_dosha: str
    secondary_dosha: Optional[str] = None
    scores: dict[str, float] = Field(default_factory=dict)
    constitution_type: str = ""
    confidence: float = 0.0


class ImbalanceData(BaseModel):
    dosha: str = ""
    severity: str = ""
    symptoms: list[str] = Field(default_factory=list)


class DietaryHabits(BaseModel):
    meal_frequency: int = 3
    preferred_cuisine: list[str] = Field(default_factory=list)
    cooking_methods: list[str] = Field(default_factory=list)
    eating_schedule: str = ""


class LifestyleFactors(BaseModel):
    activity_level: str = ""
    sleep_pattern: str = ""
    stress_level: str = ""
    occupation: str = ""


class MedicalHistory(BaseModel):
    conditions: list[str] = Field(default_factory=list)
    medications: list[str] = Field(default_factory=list)
    surgeries: list[str] = Field(default_factory=list)


class FoodPreferences(BaseModel):
    vegetarian: bool = False
    vegan: bool = False
    preferred_foods: list[str] = Field(default_factory=list)
    disliked_foods: list[str] = Field(default_factory=list)


class PatientData(BaseModel):
    id: int
    name: str
    age: int
    gender: str
    weight: Optional[float] = None
    height: Optional[float] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    constitution: Optional[ConstitutionData] = None
    currentImbalance: Optional[ImbalanceData] = None
    dietaryHabits: Optional[DietaryHabits] = None
    lifestyleFactors: Optional[LifestyleFactors] = None
    medicalHistory: Optional[MedicalHistory] = None
    foodPreferences: Optional[FoodPreferences] = None
    allergies: Optional[list[str]] = None
    dietaryRestrictions: Optional[list[str]] = None


class ChartOptions(BaseModel):
    chartType: str = "maintenance"
    durationDays: int = 7
    season: str = "summer"
    additionalNotes: Optional[str] = None


class GenerateDietChartRequest(BaseModel):
    patient: PatientData
    foods: list[FoodItem]
    options: ChartOptions


class DoshaScore(BaseModel):
    vata: float = 0
    pitta: float = 0
    kapha: float = 0


class AssessmentResponse(BaseModel):
    questionId: str
    answer: str
    score: DoshaScore


class AnalyzePrakritiRequest(BaseModel):
    responses: list[AssessmentResponse]


# ── Response Models ─────────────────────────────────────────────


class MealFood(BaseModel):
    name: str
    quantity: str
    preparation: str


class Meal(BaseModel):
    type: str
    time: str
    foods: list[MealFood]
    notes: str = ""


class ChartData(BaseModel):
    meals: list[Meal]
    guidelines: list[str] = Field(default_factory=list)
    avoidFoods: list[str] = Field(default_factory=list)


class NutritionalAnalysis(BaseModel):
    totalCalories: float = 0
    protein: float = 0
    carbs: float = 0
    fat: float = 0
    fiber: float = 0


class AyurvedicAnalysis(BaseModel):
    doshaBalance: str = ""
    rasaBalance: list[str] = Field(default_factory=list)
    seasonalAlignment: str = ""
    therapeuticBenefits: list[str] = Field(default_factory=list)


class DietChartResponse(BaseModel):
    chartData: ChartData
    nutritionalAnalysis: NutritionalAnalysis
    ayurvedicAnalysis: AyurvedicAnalysis
    confidence: float = 0.85


class PrakritiResult(BaseModel):
    primary_dosha: str
    secondary_dosha: Optional[str] = None
    scores: dict[str, float]
    constitution_type: str
    confidence: float
    recommendations: list[str] = Field(default_factory=list)


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = Field(default_factory=list)


class ChatResponse(BaseModel):
    response: str
