// Dapr service for agent
// Located in agent/src/services/dapr.service.ts

import axios from 'axios';

const DAPR_HTTP_ENDPOINT = process.env.DAPR_HTTP_ENDPOINT || 'http://localhost:3500';

export class DaprService {
  static async publishEvent(topic: string, data: any): Promise<void> {
    try {
      const response = await axios.post(
        '\/v1.0/publish/\',
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Event published successfully:', response.status);
    } catch (error) {
      console.error('Failed to publish event:', error);
      throw error;
    }
  }

  static async subscribeToTopic(topic: string, handler: (data: any) => void): Promise<void> {
    // This would typically be handled by Dapr sidecar
    // In practice, Dapr would call our endpoint when events arrive
    console.log('Subscribed to topic: ' + topic);
  }

  static async invokeService(serviceAppId: string, serviceMethod: string, data?: any): Promise<any> {
    try {
      const response = await axios.post(
        '\/v1.0/invoke/\/method/\',
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to invoke service:', error);
      throw error;
    }
  }

  static async getState(storeName: string, key: string): Promise<any> {
    try {
      const response = await axios.get(
        '\/v1.0/state/\/\'
      );

      return response.data;
    } catch (error) {
      console.error('Failed to get state:', error);
      return null;
    }
  }

  static async saveState(storeName: string, key: string, value: any): Promise<void> {
    try {
      await axios.post(
        '\/v1.0/state/\',
        [{
          key,
          value
        }],
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      console.error('Failed to save state:', error);
      throw error;
    }
  }
}
