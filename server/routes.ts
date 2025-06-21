import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { processImageToTasks, processAudioToTasks } from "./services/openai";
import multer from "multer";
import { insertTaskSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for image uploads
const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Configure multer for audio uploads
const uploadAudio = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Image scanning routes
  app.post('/api/scan-image', isAuthenticated, uploadImage.single('image'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Convert buffer to base64
      const base64Image = req.file.buffer.toString('base64');
      
      // Process image with OpenAI
      const extractedTasks = await processImageToTasks(base64Image);
      
      // Note: Images are not stored in database per user request

      res.json({
        tasks: extractedTasks,
        message: `Extracted ${extractedTasks.length} tasks from image`
      });
    } catch (error) {
      console.error("Error processing image:", error);
      res.status(500).json({ 
        message: "Failed to process image: " + (error as Error).message 
      });
    }
  });

  // Voice recording routes
  app.post('/api/voice-to-tasks', isAuthenticated, uploadAudio.single('audio'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      if (!req.file) {
        return res.status(400).json({ message: "No audio file provided" });
      }

      // Process audio with OpenAI
      const extractedTasks = await processAudioToTasks(req.file.buffer);
      
      // Save tasks to database
      const savedTasks = [];
      for (const taskData of extractedTasks) {
        try {
          const task = insertTaskSchema.parse({ 
            ...taskData, 
            userId,
            dueDate: taskData.suggestedDeadline ? parseSuggestedDeadline(taskData.suggestedDeadline) : null
          });
          const savedTask = await storage.createTask(task);
          savedTasks.push(savedTask);
        } catch (parseError) {
          console.warn("Skipping invalid task:", taskData, parseError);
        }
      }

      res.json({
        tasks: savedTasks,
        message: `Created ${savedTasks.length} tasks from voice recording`
      });
    } catch (error) {
      console.error("Error processing voice recording:", error);
      res.status(500).json({ 
        message: "Failed to process audio: " + (error as Error).message 
      });
    }
  });

  // Task management routes
  app.get('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tasks = await storage.getTasksByUserId(userId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get('/api/tasks/week', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { week } = req.query;
      
      // Calculate week dates
      const now = new Date();
      let startDate = new Date(now);
      let weekOffset = 0;
      
      if (week === 'last') weekOffset = -1;
      else if (week === 'next') weekOffset = 1;
      
      startDate.setDate(now.getDate() - now.getDay() + (weekOffset * 7));
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);

      const tasks = await storage.getTasksByUserIdAndDateRange(userId, startDate, endDate);
      res.json({ tasks, startDate, endDate });
    } catch (error) {
      console.error("Error fetching weekly tasks:", error);
      res.status(500).json({ message: "Failed to fetch weekly tasks" });
    }
  });

  app.post('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const taskData = insertTaskSchema.parse({ ...req.body, userId });
      
      // Parse suggested deadline to actual date
      if (req.body.suggestedDeadline && !req.body.dueDate) {
        const dueDate = parseSuggestedDeadline(req.body.suggestedDeadline);
        taskData.dueDate = dueDate;
      }
      
      const task = await storage.createTask(taskData);
      res.json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.patch('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const taskId = parseInt(req.params.id);
      
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }

      const updates = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTaskForUser(taskId, userId, updates);
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.post('/api/tasks/:id/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const taskId = parseInt(req.params.id);
      
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }

      const task = await storage.completeTask(taskId, userId);
      res.json({ task, celebration: true });
    } catch (error) {
      console.error("Error completing task:", error);
      res.status(500).json({ message: "Failed to complete task" });
    }
  });

  app.delete('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const taskId = parseInt(req.params.id);
      
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }

      await storage.deleteTaskForUser(taskId, userId);
      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Bulk delete tasks
  app.delete('/api/tasks/bulk', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { taskIds } = req.body;
      
      if (!Array.isArray(taskIds)) {
        return res.status(400).json({ message: "taskIds must be an array" });
      }

      for (const taskId of taskIds) {
        await storage.deleteTask(parseInt(taskId));
      }
      
      res.json({ message: `Successfully deleted ${taskIds.length} tasks` });
    } catch (error) {
      console.error("Error bulk deleting tasks:", error);
      res.status(500).json({ message: "Failed to delete tasks" });
    }
  });

  // Delete all tasks for user
  app.delete('/api/tasks/all', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.deleteAllTasksForUser(userId);
      res.json({ message: "All tasks deleted successfully" });
    } catch (error) {
      console.error("Error deleting all tasks:", error);
      res.status(500).json({ message: "Failed to delete all tasks" });
    }
  });

  // Voice transcription route
  app.post('/api/transcribe', isAuthenticated, uploadAudio.single('audio'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No audio file provided" });
      }

      const userId = req.user.claims.sub;
      
      // Process audio with OpenAI
      const extractedTasks = await processAudioToTasks(req.file.buffer);
      
      // Note: Audio files are not stored in database per user request

      res.json({
        tasks: extractedTasks,
        message: `Extracted ${extractedTasks.length} tasks from audio`
      });
    } catch (error) {
      console.error("Error processing audio:", error);
      res.status(500).json({ 
        message: "Failed to process audio: " + (error as Error).message 
      });
    }
  });

  // Stats routes
  app.get('/api/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to parse suggested deadlines
function parseSuggestedDeadline(suggestion: string): Date {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);
  
  const thisWeekEnd = new Date(now);
  thisWeekEnd.setDate(now.getDate() + (7 - now.getDay()));
  
  const suggestionLower = suggestion.toLowerCase();
  
  if (suggestionLower.includes('tomorrow')) {
    return tomorrow;
  } else if (suggestionLower.includes('this week')) {
    return thisWeekEnd;
  } else if (suggestionLower.includes('next week')) {
    return nextWeek;
  } else if (suggestionLower.includes('monday')) {
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + (1 + 7 - now.getDay()) % 7);
    return nextMonday;
  }
  
  // Default to next week if we can't parse
  return nextWeek;
}
