// Main agent server file
// Located in agent/src/server.ts

import express, { Request, Response } from 'express';
import cors from 'cors';
import { ChatController } from './controllers/chat.controller';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Evolution of Todo AI Agent Service' });
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy' });
});

app.get('/ready', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ready' });
});

// Chat endpoint
app.post('/v1/chat', ChatController.handleChat);

// Voice command endpoint
app.post('/v1/voice-command', ChatController.handleVoiceCommand);

// Dapr pubsub endpoint - this is where Dapr will send events
app.post('/v1.0/topics/todo-events', (req: Request, res: Response) => {
  console.log('Received event from Dapr pubsub in agent:', req.body);
  
  // Process the event based on its type
  const event = req.body;
  switch (event.eventType) {
    case 'task.created':
      console.log('Agent received task created event:', event.data);
      break;
    case 'task.updated':
      console.log('Agent received task updated event:', event.data);
      break;
    case 'task.deleted':
      console.log('Agent received task deleted event:', event.data);
      break;
    case 'task.command.received':
      console.log('Agent received task command:', event.data);
      break;
    case 'voice.command.processed':
      console.log('Agent received voice command processed event:', event.data);
      break;
    default:
      console.log('Agent received unknown event type:', event.eventType);
  }
  
  // Respond with 200 to acknowledge receipt
  res.status(200).send();
});

app.listen(PORT, () => {
  console.log('Agent server is running on port ' + PORT);
  console.log('Dapr sidecar endpoint: http://localhost:3500');
});
