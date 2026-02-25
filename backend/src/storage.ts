import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import {
  patients,
  foods,
  dietCharts,
  prakritiAssessments,
  type Patient,
  type InsertPatient,
  type Food,
  type InsertFood,
  type DietChart,
  type InsertDietChart,
  type PrakritiAssessment,
  type InsertPrakritiAssessment,
  conversations,
  messages,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
} from "../schema";

export interface IStorage {
  getPatients(): Promise<Patient[]>;
  getPatient(id: number): Promise<Patient | undefined>;
  createPatient(data: InsertPatient): Promise<Patient>;
  updatePatient(
    id: number,
    data: Partial<InsertPatient>,
  ): Promise<Patient | undefined>;
  deletePatient(id: number): Promise<boolean>;

  getFoods(): Promise<Food[]>;
  getFood(id: number): Promise<Food | undefined>;
  createFood(data: InsertFood): Promise<Food>;

  getDietCharts(): Promise<DietChart[]>;
  getDietChart(id: number): Promise<DietChart | undefined>;
  createDietChart(data: InsertDietChart): Promise<DietChart>;

  createPrakritiAssessment(
    data: InsertPrakritiAssessment,
  ): Promise<PrakritiAssessment>;
  getPrakritiAssessments(patientId: number): Promise<PrakritiAssessment[]>;

  getConversations(): Promise<Conversation[]>;
  getConversation(id: number): Promise<Conversation | undefined>;
  createConversation(data: InsertConversation): Promise<Conversation>;

  getMessages(conversationId: number): Promise<Message[]>;
  addMessage(data: InsertMessage): Promise<Message>;
}

export class DatabaseStorage implements IStorage {
  async getPatients(): Promise<Patient[]> {
    return db.select().from(patients).orderBy(desc(patients.createdAt));
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    const [patient] = await db
      .select()
      .from(patients)
      .where(eq(patients.id, id));
    return patient;
  }

  async createPatient(data: InsertPatient): Promise<Patient> {
    const [patient] = await db.insert(patients).values(data).returning();
    return patient;
  }

  async updatePatient(
    id: number,
    data: Partial<InsertPatient>,
  ): Promise<Patient | undefined> {
    const [patient] = await db
      .update(patients)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(patients.id, id))
      .returning();
    return patient;
  }

  async deletePatient(id: number): Promise<boolean> {
    const result = await db
      .delete(patients)
      .where(eq(patients.id, id))
      .returning();
    return result.length > 0;
  }

  async getFoods(): Promise<Food[]> {
    return db.select().from(foods).orderBy(foods.name);
  }

  async getFood(id: number): Promise<Food | undefined> {
    const [food] = await db.select().from(foods).where(eq(foods.id, id));
    return food;
  }

  async createFood(data: InsertFood): Promise<Food> {
    const [food] = await db.insert(foods).values(data).returning();
    return food;
  }

  async getDietCharts(): Promise<DietChart[]> {
    return db.select().from(dietCharts).orderBy(desc(dietCharts.createdAt));
  }

  async getDietChart(id: number): Promise<DietChart | undefined> {
    const [chart] = await db
      .select()
      .from(dietCharts)
      .where(eq(dietCharts.id, id));
    return chart;
  }

  async createDietChart(data: InsertDietChart): Promise<DietChart> {
    const [chart] = await db.insert(dietCharts).values(data).returning();
    return chart;
  }

  async createPrakritiAssessment(
    data: InsertPrakritiAssessment,
  ): Promise<PrakritiAssessment> {
    const [assessment] = await db
      .insert(prakritiAssessments)
      .values(data)
      .returning();
    return assessment;
  }

  async getPrakritiAssessments(
    patientId: number,
  ): Promise<PrakritiAssessment[]> {
    return db
      .select()
      .from(prakritiAssessments)
      .where(eq(prakritiAssessments.patientId, patientId));
  }

  async getConversations(): Promise<Conversation[]> {
    return db
      .select()
      .from(conversations)
      .orderBy(desc(conversations.createdAt));
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));
    return conversation;
  }

  async createConversation(data: InsertConversation): Promise<Conversation> {
    const [conversation] = await db
      .insert(conversations)
      .values(data)
      .returning();
    return conversation;
  }

  async getMessages(conversationId: number): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async addMessage(data: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(data).returning();
    return message;
  }
}

export const storage = new DatabaseStorage();
