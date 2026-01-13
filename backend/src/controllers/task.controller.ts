// Task controller for handling task operations and event publishing
// Located in backend/src/controllers/task.controller.ts

import { Request, Response } from 'express';
import { DaprHelper } from '../helpers/dapr.helper';
import { v4 as uuidv4 } from 'uuid';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  status: 'pending' | 'in-progress' | 'completed';
  userId: string;
}

export class TaskController {
  private static tasks: Task[] = [];

  static async getAllTasks(req: Request, res: Response): Promise<void> {
    try {
      res.json({ tasks: this.tasks });
    } catch (error) {
      console.error('Error getting tasks:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async createTask(req: Request, res: Response): Promise<void> {
    try {
      const { title, description, priority, dueDate, userId } = req.body;

      // Validate input
      if (\!title || \!userId) {
        res.status(400).json({ error: 'Title and userId are required' });
        return;
      }

      const newTask: Task = {
        id: uuidv4(),
        title,
        description: description || '',
        priority: priority || 'medium',
        dueDate,
        status: 'pending',
        userId
      };

      this.tasks.push(newTask);

      // Publish task created event
      const eventPayload = {
        eventId: uuidv4(),
        eventType: 'task.created',
        source: 'backend',
        timestamp: new Date().toISOString(),
        data: {
          taskId: newTask.id,
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          dueDate: newTask.dueDate,
          userId: newTask.userId
        }
      };

      await DaprHelper.publishEvent('todo-events', eventPayload);

      res.status(201).json({ task: newTask });
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, description, priority, dueDate, status } = req.body;

      const taskIndex = this.tasks.findIndex(task => task.id === id);
      if (taskIndex === -1) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      // Update task
      const updatedTask = {
        ...this.tasks[taskIndex],
        ...(title \!== undefined && { title }),
        ...(description \!== undefined && { description }),
        ...(priority \!== undefined && { priority }),
        ...(dueDate \!== undefined && { dueDate }),
        ...(status \!== undefined && { status })
      };
      this.tasks[taskIndex] = updatedTask;

      // Publish task updated event
      const eventPayload = {
        eventId: uuidv4(),
        eventType: 'task.updated',
        source: 'backend',
        timestamp: new Date().toISOString(),
        data: {
          taskId: id,
          updates: {
            title,
            description,
            priority,
            dueDate,
            status
          },
          userId: updatedTask.userId
        }
      };

      await DaprHelper.publishEvent('todo-events', eventPayload);

      res.json({ task: updatedTask });
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async deleteTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const taskIndex = this.tasks.findIndex(task => task.id === id);
      if (taskIndex === -1) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      const deletedTask = this.tasks.splice(taskIndex, 1)[0];

      // Publish task deleted event
      const eventPayload = {
        eventId: uuidv4(),
        eventType: 'task.deleted',
        source: 'backend',
        timestamp: new Date().toISOString(),
        data: {
          taskId: id,
          userId: deletedTask.userId
        }
      };

      await DaprHelper.publishEvent('todo-events', eventPayload);

      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
