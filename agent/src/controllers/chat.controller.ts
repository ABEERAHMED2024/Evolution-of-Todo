// Chat controller for agent service
// Located in agent/src/controllers/chat.controller.ts

import { Request, Response } from 'express';
import { DaprService } from '../services/dapr.service';
import { v4 as uuidv4 } from 'uuid';

export class ChatController {
  static async handleChat(req: Request, res: Response): Promise<void> {
    try {
      const { message, userId, language = 'en' } = req.body;

      // Process the message based on language
      let processedMessage = message;
      let detectedLanguage = language;

      // If message is in Urdu, process accordingly
      if (this.isUrduText(message)) {
        detectedLanguage = 'ur';
        processedMessage = await this.processUrduMessage(message);
      }

      // Create a response based on the message
      let responseMessage = '';
      if (processedMessage.toLowerCase().includes('task') || processedMessage.toLowerCase().includes('کام')) {
        responseMessage = this.generateTaskResponse(processedMessage, detectedLanguage);
      } else {
        responseMessage = this.generateGeneralResponse(processedMessage, detectedLanguage);
      }

      // If the message involves a task operation, publish an event
      if (this.isTaskRelated(processedMessage)) {
        const eventPayload = {
          eventId: uuidv4(),
          eventType: 'task.command.received',
          source: 'agent',
          timestamp: new Date().toISOString(),
          data: {
            userId,
            command: processedMessage,
            language: detectedLanguage,
            response: responseMessage
          }
        };

        await DaprService.publishEvent('todo-events', eventPayload);
      }

      res.json({ 
        response: responseMessage,
        language: detectedLanguage,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error handling chat:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async handleVoiceCommand(req: Request, res: Response): Promise<void> {
    try {
      // In a real implementation, we would process the audio data
      // For now, we'll simulate voice command processing
      const { audioData, userId } = req.body;

      // Simulate speech-to-text conversion
      const transcription = this.simulateSpeechToText(audioData);
      
      // Process the transcribed text
      const result = await this.processTextCommand(transcription, userId);

      // Publish event for voice command
      const eventPayload = {
        eventId: uuidv4(),
        eventType: 'voice.command.processed',
        source: 'agent',
        timestamp: new Date().toISOString(),
        data: {
          userId,
          originalAudio: audioData,
          transcription,
          result
        }
      };

      await DaprService.publishEvent('todo-events', eventPayload);

      res.json(result);
    } catch (error) {
      console.error('Error handling voice command:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private static isUrduText(text: string): boolean {
    // Check if text contains Urdu characters (Unicode range 0600-06FF)
    const urduRegex = /[\u0600-\u06FF]/;
    return urduRegex.test(text);
  }

  private static async processUrduMessage(message: string): Promise<string> {
    // In a real implementation, we would use NLP to process Urdu text
    // For now, we'll return the message as is
    console.log('Processing Urdu message:', message);
    return message;
  }

  private static generateTaskResponse(message: string, language: string): string {
    if (language === 'ur') {
      // Urdu response
      return 'میں آپ کے کام کے بارے میں معلومات حاصل کر رہا ہوں۔';
    } else {
      // English response
      return 'I\'m processing your task request.';
    }
  }

  private static generateGeneralResponse(message: string, language: string): string {
    if (language === 'ur') {
      // Urdu response
      return 'مجھے آپ کا پیغام موصول ہو گیا ہے۔';
    } else {
      // English response
      return 'I received your message.';
    }
  }

  private static isTaskRelated(message: string): boolean {
    const taskKeywords = ['task', 'todo', 'add', 'create', 'delete', 'remove', 'complete', 'done', 'کام', 'کریں', 'شامل'];
    return taskKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private static simulateSpeechToText(audioData: any): string {
    // In a real implementation, we would use speech recognition
    // For now, we'll return a placeholder
    return 'Add a new task to buy groceries';
  }

  private static async processTextCommand(command: string, userId: string): Promise<any> {
    // Process the command text and return appropriate response
    return {
      command,
      processed: true,
      userId,
      timestamp: new Date().toISOString()
    };
  }
}
