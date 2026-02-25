import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  serial,
  integer,
  real,
  jsonb,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  weight: real("weight"),
  height: real("height"),
  phone: text("phone"),
  email: text("email"),
  constitution: jsonb("constitution").$type<{
    primary_dosha: string;
    secondary_dosha: string | null;
    scores: { Vata: number; Pitta: number; Kapha: number };
    constitution_type: string;
    confidence: number;
  }>(),
  currentImbalance: jsonb("current_imbalance").$type<{
    dosha: string;
    severity: string;
    symptoms: string[];
  }>(),
  dietaryHabits: jsonb("dietary_habits").$type<{
    meal_frequency: number;
    preferred_cuisine: string[];
    cooking_methods: string[];
    eating_schedule: string;
  }>(),
  lifestyleFactors: jsonb("lifestyle_factors").$type<{
    activity_level: string;
    sleep_pattern: string;
    stress_level: string;
    occupation: string;
  }>(),
  medicalHistory: jsonb("medical_history").$type<{
    conditions: string[];
    medications: string[];
    surgeries: string[];
  }>(),
  foodPreferences: jsonb("food_preferences").$type<{
    vegetarian: boolean;
    vegan: boolean;
    preferred_foods: string[];
    disliked_foods: string[];
  }>(),
  allergies: jsonb("allergies").$type<string[]>(),
  dietaryRestrictions: jsonb("dietary_restrictions").$type<string[]>(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const foods = pgTable("foods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameHindi: text("name_hindi"),
  nameRegional: jsonb("name_regional").$type<Record<string, string>>(),
  nutritionalData: jsonb("nutritional_data").$type<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    vitamins: Record<string, number>;
    minerals: Record<string, number>;
  }>(),
  servingSizes:
    jsonb("serving_sizes").$type<{ name: string; grams: number }[]>(),
  rasa: jsonb("rasa").$type<string[]>(),
  virya: text("virya"),
  vipaka: text("vipaka"),
  prabhava: text("prabhava"),
  doshaEffects: jsonb("dosha_effects").$type<{
    vata: string;
    pitta: string;
    kapha: string;
  }>(),
  foodCategory: text("food_category"),
  cuisineType: text("cuisine_type"),
  seasonalAvailability: jsonb("seasonal_availability").$type<string[]>(),
  cookingMethods: jsonb("cooking_methods").$type<string[]>(),
  preparationTime: integer("preparation_time"),
  isVegetarian: boolean("is_vegetarian").default(true),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const dietCharts = pgTable("diet_charts", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  chartData: jsonb("chart_data").$type<{
    meals: {
      type: string;
      time: string;
      foods: { name: string; quantity: string; preparation: string }[];
      notes: string;
    }[];
    guidelines: string[];
    avoidFoods: string[];
  }>(),
  nutritionalAnalysis: jsonb("nutritional_analysis").$type<{
    totalCalories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  }>(),
  ayurvedicAnalysis: jsonb("ayurvedic_analysis").$type<{
    doshaBalance: string;
    rasaBalance: string[];
    seasonalAlignment: string;
    therapeuticBenefits: string[];
  }>(),
  chartType: text("chart_type").notNull().default("maintenance"),
  durationDays: integer("duration_days").default(7),
  status: text("status").default("active"),
  aiConfidence: real("ai_confidence"),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  expiresAt: timestamp("expires_at"),
});

export const prakritiAssessments = pgTable("prakriti_assessments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id, {
    onDelete: "cascade",
  }),
  responses:
    jsonb("responses").$type<
      {
        questionId: string;
        answer: string;
        score: { vata: number; pitta: number; kapha: number };
      }[]
    >(),
  result: jsonb("result").$type<{
    primary_dosha: string;
    secondary_dosha: string | null;
    scores: { Vata: number; Pitta: number; Kapha: number };
    constitution_type: string;
    confidence: number;
    recommendations: string[];
  }>(),
  completedAt: timestamp("completed_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFoodSchema = createInsertSchema(foods).omit({
  id: true,
  createdAt: true,
});

export const insertDietChartSchema = createInsertSchema(dietCharts).omit({
  id: true,
  createdAt: true,
});

export const insertPrakritiAssessmentSchema = createInsertSchema(
  prakritiAssessments,
).omit({
  id: true,
  completedAt: true,
});

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Food = typeof foods.$inferSelect;
export type InsertFood = z.infer<typeof insertFoodSchema>;
export type DietChart = typeof dietCharts.$inferSelect;
export type InsertDietChart = z.infer<typeof insertDietChartSchema>;
export type PrakritiAssessment = typeof prakritiAssessments.$inferSelect;
export type InsertPrakritiAssessment = z.infer<
  typeof insertPrakritiAssessmentSchema
>;

// Export chat schemas
export * from "./schema-chat";
