import { useState } from 'react';

export default function TaskItem({ task, onTaskUpdated, onTaskDeleted, isExpanded, onToggleExpand }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    due_date: task.due_date || ''
  });

  const handleToggleComplete = async () => {
    try {
      const response = await fetch(`/api/tasks?id=${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...task,
          status: !task.status
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedTask = await response.json();
      onTaskUpdated();
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const response = await fetch(`/api/tasks?id=${task.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        onTaskDeleted();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleEdit = async () => {
    try {
      const response = await fetch(`/api/tasks?id=${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedTask = await response.json();
      setIsEditing(false);
      onTaskUpdated();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div className={`task-item ${task.status ? 'completed' : ''} ${isExpanded ? 'expanded' : ''}`}>
      <div className="task-header" onClick={() => onToggleExpand(task.id)}>
        <div className="task-checkbox">
          <input
            type="checkbox"
            checked={task.status}
            onChange={handleToggleComplete}
            className="checkbox"
          />
          <span className="checkmark"></span>
        </div>
        
        <div className="task-info">
          <h3 className={`task-title ${task.status ? 'completed' : ''}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="task-description">
              {isExpanded ? task.description : task.description.substring(0, 100) + (task.description.length > 100 ? '...' : '')}
            </p>
          )}
        </div>
        
        <div className="task-meta">
          <div className="task-priority" style={{ backgroundColor: getPriorityColor(task.priority) }}>
            {task.priority}
          </div>
          <div className="task-due">
            {formatDate(task.due_date)}
          </div>
        </div>
        
        <div className="task-actions">
          <button 
            className="action-btn edit-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            aria-label="Edit task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
            </svg>
          </button>
          <button 
            className="action-btn delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            aria-label="Delete task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </button>
          <button 
            className="action-btn expand-btn"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(task.id);
            }}
            aria-label={isExpanded ? "Collapse task" : "Expand task"}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className={isExpanded ? 'rotated' : ''}
            >
              <path d="m6 9 6 6 6-6"></path>
            </svg>
          </button>
        </div>
      </div>
      
      {isEditing && (
        <div className="task-edit">
          <div className="edit-form">
            <input
              type="text"
              name="title"
              value={editData.title}
              onChange={handleInputChange}
              className="edit-input"
              placeholder="Task title"
            />
            <textarea
              name="description"
              value={editData.description}
              onChange={handleInputChange}
              className="edit-textarea"
              placeholder="Task description"
            />
            <div className="edit-controls">
              <select
                name="priority"
                value={editData.priority}
                onChange={handleInputChange}
                className="edit-select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <input
                type="date"
                name="due_date"
                value={editData.due_date}
                onChange={handleInputChange}
                className="edit-input date-input"
              />
              <div className="edit-buttons">
                <button onClick={() => setIsEditing(false)} className="btn-cancel">Cancel</button>
                <button onClick={handleEdit} className="btn-save">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {isExpanded && !isEditing && task.description && (
        <div className="task-details">
          <p>{task.description}</p>
        </div>
      )}

      <style jsx>{`
        .task-item {
          background: var(--surface-light);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .task-item:hover {
          border-color: var(--primary);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .task-item.completed {
          opacity: 0.7;
        }

        .task-header {
          display: flex;
          align-items: flex-start;
          padding: 1rem;
          cursor: pointer;
          gap: 0.75rem;
        }

        .task-checkbox {
          position: relative;
          margin-top: 0.25rem;
        }

        .checkbox {
          opacity: 0;
          position: absolute;
        }

        .checkmark {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border: 2px solid var(--text-muted);
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .checkbox:checked + .checkmark {
          background: var(--primary);
          border-color: var(--primary);
        }

        .checkbox:checked + .checkmark::after {
          content: '';
          display: block;
          width: 6px;
          height: 10px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
          position: absolute;
        }

        .task-info {
          flex: 1;
        }

        .task-title {
          font-size: 1rem;
          font-weight: 500;
          color: var(--text-primary);
          margin: 0 0 0.25rem 0;
        }

        .task-title.completed {
          text-decoration: line-through;
          color: var(--text-muted);
        }

        .task-description {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.4;
        }

        .task-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.5rem;
        }

        .task-priority {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .task-due {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-align: right;
        }

        .task-actions {
          display: flex;
          gap: 0.5rem;
          margin-left: 1rem;
        }

        .action-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: var(--surface);
          color: var(--text-primary);
        }

        .expand-btn.rotated {
          transform: rotate(180deg);
        }

        .task-edit {
          padding: 1rem;
          border-top: 1px solid var(--border);
          background: var(--surface);
        }

        .edit-form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .edit-input, .edit-textarea, .edit-select {
          padding: 0.5rem;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--surface);
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .edit-textarea {
          min-height: 80px;
          resize: vertical;
        }

        .edit-controls {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .edit-buttons {
          display: flex;
          gap: 0.5rem;
          margin-left: auto;
        }

        .btn-cancel, .btn-save {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          border: none;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-cancel {
          background: var(--surface);
          color: var(--text-secondary);
        }

        .btn-cancel:hover {
          background: var(--surface-light);
        }

        .btn-save {
          background: var(--primary);
          color: white;
        }

        .btn-save:hover {
          background: var(--primary-dark);
        }

        .task-details {
          padding: 0 1rem 1rem 1rem;
          border-top: 1px solid var(--border);
          color: var(--text-secondary);
          font-size: 0.875rem;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .task-header {
            flex-direction: column;
            gap: 0.75rem;
          }

          .task-meta {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }

          .task-actions {
            margin-left: 0;
          }

          .edit-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .edit-buttons {
            margin-left: 0;
            justify-content: flex-end;
          }
        }
      `}</style>
    </div>
  );
}