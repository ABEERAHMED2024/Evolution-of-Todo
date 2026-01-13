// Dapr service invocation helper for backend
// Located in backend/src/helpers/dapr.helper.ts

import axios from 'axios';

const DAPR_HTTP_ENDPOINT = process.env.DAPR_HTTP_ENDPOINT || 'http://localhost:3500';

export class DaprHelper {
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

  static async invokeService(method: string, data: any, serviceAppId: string, serviceMethod: string): Promise<any> {
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
