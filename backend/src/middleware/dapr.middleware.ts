// Middleware for handling Dapr pubsub subscriptions
// Located in backend/src/middleware/dapr.middleware.ts

import { Request, Response, NextFunction } from 'express';

export const daprSubscriptionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Handle Dapr pubsub subscription validation
  if (req.headers['content-type'] === 'application/cloudevents+json') {
    // This is a Dapr pubsub event, process accordingly
    console.log('Received Dapr pubsub event:', req.body);
    
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
  }
  
  next();
};
