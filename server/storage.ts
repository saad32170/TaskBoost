import {
  users,
  tasks,
  type User,
  type UpsertUser,
  type Task,
  type InsertTask,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Task operations
  createTask(task: InsertTask): Promise<Task>;
  getTasksByUserId(userId: string): Promise<Task[]>;
  getTasksByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<Task[]>;
  updateTask(id: number, updates: Partial<InsertTask>): Promise<Task>;
  updateTaskForUser(id: number, userId: string, updates: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: number): Promise<void>;
  deleteTaskForUser(id: number, userId: string): Promise<void>;
  deleteAllTasksForUser(userId: string): Promise<void>;
  completeTask(id: number, userId: string): Promise<Task>;
  

  
  // Stats operations
  getUserStats(userId: string): Promise<{
    totalCompleted: number;
    completedThisWeek: number;
    overdueTasks: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Task operations
  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async getTasksByUserId(userId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt));
  }

  async getTasksByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          gte(tasks.dueDate, startDate),
          lte(tasks.dueDate, endDate)
        )
      )
      .orderBy(tasks.dueDate);
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<Task> {
    const [updatedTask] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  async updateTaskForUser(id: number, userId: string, updates: Partial<InsertTask>): Promise<Task> {
    const [updatedTask] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();
    
    if (!updatedTask) {
      throw new Error("Task not found or access denied");
    }
    
    return updatedTask;
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async deleteTaskForUser(id: number, userId: string): Promise<void> {
    const result = await db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
  }

  async deleteAllTasksForUser(userId: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.userId, userId));
  }

  async completeTask(id: number, userId: string): Promise<Task> {
    const [completedTask] = await db
      .update(tasks)
      .set({ 
        status: "completed", 
        completedAt: new Date(),
        updatedAt: new Date()
      })
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();

    if (!completedTask) {
      throw new Error("Task not found or access denied");
    }

    return completedTask;
  }



  // Stats operations
  async getUserStats(userId: string): Promise<{
    totalCompleted: number;
    completedThisWeek: number;
    overdueTasks: number;
    currentStreak: number;
    treeLevel: number;
  }> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const completedThisWeek = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          eq(tasks.status, "completed"),
          gte(tasks.completedAt, weekStart)
        )
      );

    const overdueTasks = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          eq(tasks.status, "pending"),
          lte(tasks.dueDate, now)
        )
      );

    // Get all completed tasks for total count
    const allCompletedTasks = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          eq(tasks.status, "completed")
        )
      );

    return {
      totalCompleted: allCompletedTasks.length,
      completedThisWeek: completedThisWeek.length,
      overdueTasks: overdueTasks.length,
    };
  }
}

export const storage = new DatabaseStorage();
