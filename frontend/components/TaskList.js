import { useState } from 'react';
import TaskItem from './TaskItem';

export default function TaskList({ tasks, onTaskUpdated, onTaskDeleted }) {
  const [expandedTask, setExpandedTask] = useState(null);

  const groupedTasks = tasks.reduce((acc, task) => {
    const date = task.due_date || 'No due date';
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(task);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedTasks).sort((a, b) => {
    if (a === 'No due date') return 1;
    if (b === 'No due date') return -1;
    return new Date(a) - new Date(b);
  });

  const toggleExpand = (taskId) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  return (
    <div className="task-list">
      {sortedDates.map(date => (
        <div key={date} className="task-group">
          <h3 className="group-header">
            {date === 'No due date' ? 'No due date' : new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            <span className="task-count">({groupedTasks[date].length})</span>
          </h3>
          <div className="tasks">
            {groupedTasks[date].map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onTaskUpdated={onTaskUpdated} 
                onTaskDeleted={onTaskDeleted}
                isExpanded={expandedTask === task.id}
                onToggleExpand={toggleExpand}
              />
            ))}
          </div>
        </div>
      ))}

      {tasks.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="8" y1="12" x2="16" y2="12"></line>
              <line x1="8" y1="16" x2="16" y2="16"></line>
            </svg>
          </div>
          <h3>No tasks yet</h3>
          <p>Add your first task to get started with your productivity journey</p>
        </div>
      )}

      <style jsx>{`
        .task-list {
          margin-top: 2rem;
        }

        .task-group {
          margin-bottom: 2rem;
        }

        .group-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border);
        }

        .task-count {
          background: var(--surface-light);
          color: var(--text-secondary);
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .tasks {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--text-secondary);
        }

        .empty-icon {
          margin: 0 auto 1.5rem;
          opacity: 0.6;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          font-size: 1rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}