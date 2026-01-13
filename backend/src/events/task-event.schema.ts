export interface TaskEvent {
  eventId: string;
  eventType: 'task.created' | 'task.updated' | 'task.deleted' | 'task.completed';
  source: string;
  timestamp: Date;
  data: TaskEventData;
  correlationId?: string;
}

export interface TaskEventData {
  taskId: string;
  title?: string;
  description?: string;
  priority?: 'high' | 'medium' | 'low';
  dueDate?: string;
  status?: 'pending' | 'in-progress' | 'completed';
  userId: string;
  updates?: Partial<TaskEventData>;
}

export interface TaskCreatedEvent extends TaskEvent {
  eventType: 'task.created';
  data: Omit<TaskEventData, 'updates'>;
}

export interface TaskUpdatedEvent extends TaskEvent {
  eventType: 'task.updated';
  data: Required<Pick<TaskEventData, 'taskId' | 'updates' | 'userId'>>;
}

export interface TaskDeletedEvent extends TaskEvent {
  eventType: 'task.deleted';
  data: Pick<TaskEventData, 'taskId' | 'userId'>;
}
