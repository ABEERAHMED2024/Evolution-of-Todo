// Dapr service client for frontend
// Located in frontend/src/services/dapr.service.ts

class DaprService {
  private readonly daprHttpEndpoint: string;
  
  constructor() {
    this.daprHttpEndpoint = process.env.REACT_APP_DAPR_HTTP_ENDPOINT || 'http://localhost:3500';
  }

  async publishEvent(topic: string, data: any): Promise<void> {
    try {
      const response = await fetch(this.daprHttpEndpoint + '/v1.0/publish/' + topic, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (\!response.ok) {
        throw new Error('Failed to publish event: ' + response.statusText);
      }

      console.log('Event published successfully');
    } catch (error) {
      console.error('Failed to publish event:', error);
      throw error;
    }
  }

  async invokeService(serviceAppId: string, serviceMethod: string, data?: any): Promise<any> {
    try {
      const url = this.daprHttpEndpoint + '/v1.0/invoke/' + serviceAppId + '/method/' + serviceMethod;
      const options: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);

      if (\!response.ok) {
        throw new Error('Failed to invoke service: ' + response.statusText);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to invoke service:', error);
      throw error;
    }
  }

  async getState(storeName: string, key: string): Promise<any> {
    try {
      const response = await fetch(this.daprHttpEndpoint + '/v1.0/state/' + storeName + '/' + key);

      if (\!response.ok) {
        if (response.status === 404) {
          return null; // Key doesn't exist
        }
        throw new Error('Failed to get state: ' + response.statusText);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get state:', error);
      throw error;
    }
  }

  async saveState(storeName: string, key: string, value: any): Promise<void> {
    try {
      const response = await fetch(this.daprHttpEndpoint + '/v1.0/state/' + storeName, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{
          key,
          value
        }]),
      });

      if (\!response.ok) {
        throw new Error('Failed to save state: ' + response.statusText);
      }
    } catch (error) {
      console.error('Failed to save state:', error);
      throw error;
    }
  }
}

export default new DaprService();
