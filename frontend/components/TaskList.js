import { useState } from 'react';
import TaskItem from './TaskItem';

export default function TaskList({ tasks, onTaskUpdated, onTaskDeleted }) {
  return (
    <div className="task-list-container">
      <h2>Task List ({tasks.length})</h2>
      
      {tasks.length === 0 ? (
        <p>No tasks found. Add a new task to get started!</p>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onTaskUpdated={onTaskUpdated}
              onTaskDeleted={onTaskDeleted}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        .task-list-container {
          width: 100%;
          max-width: 800px;
        }
        
        .task-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
      `}</style>
    </div>
  );
}