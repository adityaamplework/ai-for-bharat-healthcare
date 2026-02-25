/**
 * Pure TypeScript types matching the database schema.
 * No Drizzle dependency — these are just interfaces for API responses.
 */

export interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  weight: number | null;
  height: number | null;
  phone: string | null;
  email: string | null;
  constitution: {
    primary_dosha: string;
    secondary_dosha: string | null;
    scores: { Vata: number; Pitta: number; Kapha: number };
    constitution_type: string;
    confidence: number;
  } | null;
  currentImbalance: {
    dosha: string;
    severity: string;
    symptoms: string[];
  } | null;
  dietaryHabits: {
    meal_frequency: number;
    preferred_cuisine: string[];
    cooking_methods: string[];
    eating_schedule: string;
  } | null;
  lifestyleFactors: {
    activity_level: string;
    sleep_pattern: string;
    stress_level: string;
    occupation: string;
  } | null;
  medicalHistory: {
    conditions: string[];
    medications: string[];
    surgeries: string[];
  } | null;
  foodPreferences: {
    vegetarian: boolean;
    vegan: boolean;
    preferred_foods: string[];
    disliked_foods: string[];
  } | null;
  allergies: string[] | null;
  dietaryRestrictions: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface Food {
  id: number;
  name: string;
  nameHindi: string | null;
  nameRegional: Record<string, string> | null;
  nutritionalData: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    vitamins: Record<string, number>;
    minerals: Record<string, number>;
  } | null;
  servingSizes: { name: string; grams: number }[] | null;
  rasa: string[] | null;
  virya: string | null;
  vipaka: string | null;
  prabhava: string | null;
  doshaEffects: {
    vata: string;
    pitta: string;
    kapha: string;
  } | null;
  foodCategory: string | null;
  cuisineType: string | null;
  seasonalAvailability: string[] | null;
  cookingMethods: string[] | null;
  preparationTime: number | null;
  isVegetarian: boolean | null;
  createdAt: string;
}

export interface DietChart {
  id: number;
  patientId: number;
  chartData: {
    meals: {
      type: string;
      time: string;
      foods: { name: string; quantity: string; preparation: string }[];
      notes: string;
    }[];
    guidelines: string[];
    avoidFoods: string[];
  } | null;
  nutritionalAnalysis: {
    totalCalories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  } | null;
  ayurvedicAnalysis: {
    doshaBalance: string;
    rasaBalance: string[];
    seasonalAlignment: string;
    therapeuticBenefits: string[];
  } | null;
  chartType: string;
  durationDays: number | null;
  status: string | null;
  aiConfidence: number | null;
  createdAt: string;
  expiresAt: string | null;
}

export interface PrakritiAssessment {
  id: number;
  patientId: number | null;
  responses:
    | {
        questionId: string;
        answer: string;
        score: { vata: number; pitta: number; kapha: number };
      }[]
    | null;
  result: {
    primary_dosha: string;
    secondary_dosha: string | null;
    scores: { Vata: number; Pitta: number; Kapha: number };
    constitution_type: string;
    confidence: number;
    recommendations: string[];
  } | null;
  completedAt: string;
}
