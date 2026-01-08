import { useState } from 'react';

export default function TaskItem({ task, onTaskUpdated, onTaskDeleted }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    tags: task.tags.join(', '),
    due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : ''
  });

  const handleToggleComplete = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: !task.status
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (onTaskUpdated) {
        onTaskUpdated();
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/tasks/${task.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (onTaskDeleted) {
          onTaskDeleted();
        }
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();

    // Parse tags into an array
    const tagsArray = editData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

    const updatedTask = {
      title: editData.title,
      description: editData.description,
      priority: editData.priority,
      tags: tagsArray,
      due_date: editData.due_date ? new Date(editData.due_date).toISOString() : null
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setIsEditing(false);
      if (onTaskUpdated) {
        onTaskUpdated();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className={`task-item ${task.status ? 'completed' : ''}`}>
      {isEditing ? (
        <form onSubmit={handleSaveEdit} className="edit-form">
          <div className="form-row">
            <input
              type="text"
              name="title"
              value={editData.title}
              onChange={handleEditChange}
              required
              className="edit-input title-input"
            />
          </div>
          
          <div className="form-row">
            <textarea
              name="description"
              value={editData.description}
              onChange={handleEditChange}
              className="edit-input description-input"
            />
          </div>
          
          <div className="form-row">
            <select
              name="priority"
              value={editData.priority}
              onChange={handleEditChange}
              className="edit-input priority-select"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            
            <input
              type="date"
              name="due_date"
              value={editData.due_date}
              onChange={handleEditChange}
              className="edit-input date-input"
            />
          </div>
          
          <div className="form-row">
            <input
              type="text"
              name="tags"
              value={editData.tags}
              onChange={handleEditChange}
              placeholder="Tags (comma-separated)"
              className="edit-input tags-input"
            />
          </div>
          
          <div className="form-actions">
            <button type="submit" className="save-btn">Save</button>
            <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
          </div>
        </form>
      ) : (
        <>
          <div className="task-header">
            <div className="task-title-section">
              <input
                type="checkbox"
                checked={task.status}
                onChange={handleToggleComplete}
                className="status-checkbox"
              />
              <h3 className={`task-title ${task.status ? 'completed' : ''}`}>
                {task.title}
              </h3>
            </div>
            <div className="task-actions">
              <button onClick={() => setIsEditing(true)} className="edit-btn">Edit</button>
              <button onClick={handleDelete} className="delete-btn">Delete</button>
            </div>
          </div>
          
          <div className="task-details">
            {task.description && (
              <p className="task-description">{task.description}</p>
            )}
            
            <div className="task-meta">
              <span className={`priority-badge priority-${task.priority}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
              
              {task.due_date && (
                <span className="due-date">Due: {formatDate(task.due_date)}</span>
              )}
              
              {task.tags && task.tags.length > 0 && (
                <div className="tags">
                  {task.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .task-item {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 15px;
          background-color: #fff;
        }
        
        .task-item.completed {
          opacity: 0.7;
          background-color: #f9f9f9;
        }
        
        .task-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
        }
        
        .task-title-section {
          display: flex;
          align-items: flex-start;
          flex-grow: 1;
        }
        
        .status-checkbox {
          margin-right: 10px;
          transform: scale(1.2);
        }
        
        .task-title {
          margin: 0;
          font-size: 1.2em;
        }
        
        .task-title.completed {
          text-decoration: line-through;
          color: #888;
        }
        
        .task-actions {
          display: flex;
          gap: 8px;
        }
        
        .edit-btn, .delete-btn, .save-btn, .cancel-btn {
          padding: 5px 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9em;
        }
        
        .edit-btn {
          background-color: #ffc107;
          color: #212529;
        }
        
        .delete-btn {
          background-color: #dc3545;
          color: white;
        }
        
        .save-btn {
          background-color: #28a745;
          color: white;
        }
        
        .cancel-btn {
          background-color: #6c757d;
          color: white;
        }
        
        .task-details {
          margin-left: 28px;
        }
        
        .task-description {
          margin: 5px 0 10px 0;
          color: #555;
        }
        
        .task-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }
        
        .priority-badge {
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 0.8em;
          font-weight: bold;
        }
        
        .priority-high {
          background-color: #dc3545;
          color: white;
        }
        
        .priority-medium {
          background-color: #ffc107;
          color: #212529;
        }
        
        .priority-low {
          background-color: #28a745;
          color: white;
        }
        
        .due-date {
          font-size: 0.9em;
          color: #666;
        }
        
        .tags {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
        }
        
        .tag {
          background-color: #e9ecef;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.8em;
        }
        
        /* Edit form styles */
        .edit-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .form-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        
        .edit-input, .priority-select {
          padding: 5px 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 1em;
        }
        
        .title-input {
          flex-grow: 1;
          font-size: 1.2em;
        }
        
        .description-input {
          flex-grow: 1;
          min-height: 60px;
          resize: vertical;
        }
        
        .date-input {
          width: 140px;
        }
        
        .tags-input {
          flex-grow: 1;
        }
        
        .priority-select {
          width: 120px;
        }
        
        .form-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
}