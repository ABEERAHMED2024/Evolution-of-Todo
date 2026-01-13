// Main backend server file
// Located in backend/src/server.ts

import express, { Request, Response } from 'express';
import cors from 'cors';
import { TaskController } from './controllers/task.controller';
import { daprSubscriptionMiddleware } from './middleware/dapr.middleware';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(daprSubscriptionMiddleware);

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Evolution of Todo Backend API' });
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy' });
});

app.get('/ready', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ready' });
});

// Task routes
app.get('/v1/tasks', TaskController.getAllTasks);
app.post('/v1/tasks', TaskController.createTask);
app.put('/v1/tasks/:id', TaskController.updateTask);
app.delete('/v1/tasks/:id', TaskController.deleteTask);

// Dapr pubsub endpoint - this is where Dapr will send events
app.post('/v1.0/topics/todo-events', (req: Request, res: Response) => {
  console.log('Received event from Dapr pubsub:', req.body);
  
  // Process the event based on its type
  const event = req.body;
  switch (event.eventType) {
    case 'task.created':
      console.log('Processing task created event:', event.data);
      break;
    case 'task.updated':
      console.log('Processing task updated event:', event.data);
      break;
    case 'task.deleted':
      console.log('Processing task deleted event:', event.data);
      break;
    default:
      console.log('Unknown event type:', event.eventType);
  }
  
  // Respond with 200 to acknowledge receipt
  res.status(200).send();
});

app.listen(PORT, () => {
  console.log('Backend server is running on port ' + PORT);
  console.log('Dapr sidecar endpoint: http://localhost:3500');
});
