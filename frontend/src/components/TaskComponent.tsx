// Task component for handling task operations with Dapr integration
// Located in frontend/src/components/TaskComponent.tsx

import React, { useState, useEffect } from 'react';
import DaprService from '../services/dapr.service';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  status: 'pending' | 'in-progress' | 'completed';
  userId: string;
}

interface TaskComponentProps {
  userId: string;
}

const TaskComponent: React.FC<TaskComponentProps> = ({ userId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState('');

  // Load tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      // In a real implementation, we would fetch from our backend
      // For now, we'll use mock data
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Sample Task',
          description: 'This is a sample task',
          priority: 'medium',
          status: 'pending',
          userId: userId
        }
      ];
      setTasks(mockTasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Create task payload
      const newTask = {
        title,
        description,
        priority,
        dueDate,
        userId
      };

      // Call backend to create task (which will publish event)
      const response = await fetch('http://localhost:8080/v1/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      if (response.ok) {
        const result = await response.json();
        setTasks([...tasks, result.task]);
        
        // Publish event via Dapr
        const eventPayload = {
          eventId: 'unique-id-' + Date.now(),
          eventType: 'task.created',
          source: 'frontend',
          timestamp: new Date().toISOString(),
          data: {
            taskId: result.task.id,
            title: result.task.title,
            description: result.task.description,
            priority: result.task.priority,
            dueDate: result.task.dueDate,
            userId: result.task.userId
          }
        };

        await DaprService.publishEvent('todo-events', eventPayload);
        
        // Reset form
        setTitle('');
        setDescription('');
        setPriority('medium');
        setDueDate('');
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      // Delete task from backend
      await fetch(`http://localhost:8080/v1/tasks/${taskId}`, {
        method: 'DELETE',
      });

      // Update local state
      setTasks(tasks.filter(task => task.id !== taskId));
      
      // Publish delete event via Dapr
      const eventPayload = {
        eventId: 'unique-id-' + Date.now(),
        eventType: 'task.deleted',
        source: 'frontend',
        timestamp: new Date().toISOString(),
        data: {
          taskId,
          userId
        }
      };

      await DaprService.publishEvent('todo-events', eventPayload);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  return (
    <div>
      <h2>Task Management</h2>
      
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type='text'
            placeholder='Task title'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <textarea
            placeholder='Task description'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <select value={priority} onChange={(e) => setPriority(e.target.value as any)}>
            <option value='high'>High</option>
            <option value='medium'>Medium</option>
            <option value='low'>Low</option>
          </select>
        </div>
        <div>
          <input
            type='date'
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <button type='submit'>Add Task</button>
      </form>

      <div>
        <h3>Your Tasks</h3>
        {tasks.map((task) => (
          <div key={task.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            <h4>{task.title}</h4>
            <p>{task.description}</p>
            <p>Priority: {task.priority}</p>
            <p>Status: {task.status}</p>
            {task.dueDate && <p>Due: {task.dueDate}</p>}
            <button onClick={() => handleDelete(task.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskComponent;
