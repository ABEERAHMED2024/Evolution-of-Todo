// Test for event-driven communication
// Located in backend/src/__tests__/event-communication.test.ts

import { DaprHelper } from '../helpers/dapr.helper';

describe('Event-driven communication', () => {
  test('should successfully publish an event to Kafka via Dapr', async () => {
    const eventPayload = {
      eventId: 'test-event-123',
      eventType: 'task.created',
      source: 'test-suite',
      timestamp: new Date().toISOString(),
      data: {
        taskId: 'test-task-123',
        title: 'Test Task',
        userId: 'test-user-123'
      }
    };

    // Mock the axios post to avoid actual network calls in tests
    jest.mock('axios');
    const mockedAxios = require('axios');
    mockedAxios.post.mockResolvedValue({ status: 200 });

    await expect(DaprHelper.publishEvent('todo-events', eventPayload)).resolves.not.toThrow();

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/publish/todo-events'),
      eventPayload,
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      })
    );
  });

  test('should successfully invoke another service via Dapr', async () => {
    const testData = { message: 'hello from test' };
    
    jest.mock('axios');
    const mockedAxios = require('axios');
    mockedAxios.post.mockResolvedValue({ data: { result: 'success' } });

    const result = await DaprHelper.invokeService(
      'some-method', 
      testData, 
      'other-service', 
      'process-data'
    );

    expect(result).toEqual({ result: 'success' });
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/invoke/other-service/method/process-data'),
      testData,
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      })
    );
  });
});
