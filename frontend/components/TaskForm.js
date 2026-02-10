import { useState } from 'react';

export default function TaskForm({ onTaskAdded }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    tags: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (formData.title.length > 200) {
      newErrors.title = 'Task title is too long (max 200 characters)';
    }

    if (formData.description.length > 1000) {
      newErrors.description = 'Description is too long (max 1000 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const newTask = await response.json();
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
        tags: ''
      });
      onTaskAdded();
    } catch (error) {
      console.error('Error creating task:', error);
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="task-form-container">
      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-header">
          <h2>Add New Task</h2>
          <p>Fill in the details to create a new task</p>
        </div>

        <div className="form-group">
          <label htmlFor="title">Task Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="What needs to be done?"
            className={`form-input ${errors.title ? 'error' : ''}`}
            maxLength="200"
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Add more details about the task..."
            className={`form-textarea ${errors.description ? 'error' : ''}`}
            rows="3"
            maxLength="1000"
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
          <div className="char-count">{formData.description.length}/1000</div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="form-select"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="due_date">Due Date</label>
            <input
              type="date"
              id="due_date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="Enter tags separated by commas (e.g., work, urgent, personal)"
            className="form-input"
          />
          <small className="form-help">Separate multiple tags with commas</small>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="spinner" viewBox="0 0 50 50">
                  <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="4"/>
                </svg>
                Creating...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Create Task
              </>
            )}
          </button>
        </div>

        {errors.submit && (
          <div className="error-banner">
            {errors.submit}
          </div>
        )}
      </form>

      <style jsx>{`
        .task-form-container {
          background: var(--surface-light);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .form-header {
          margin-bottom: 1.5rem;
        }

        .form-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .form-header p {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-input, .form-select, .form-textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--surface);
          color: var(--text-primary);
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .form-input:focus, .form-select:focus, .form-textarea:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .form-input.error {
          border-color: var(--danger);
        }

        .form-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .char-count {
          text-align: right;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }

        .form-help {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }

        .form-actions {
          margin-top: 1.5rem;
          display: flex;
          justify-content: flex-end;
        }

        .submit-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid rgba(99, 102, 241, 0.3);
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          animation: spin 1s linear infinite;
        }

        .spinner .path {
          stroke: white;
          stroke-linecap: round;
          animation: dash 1.5s ease-in-out infinite;
        }

        @keyframes spin {
          100% { transform: rotate(360deg); }
        }

        @keyframes dash {
          0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
          50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
          100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
        }

        .error-message {
          display: block;
          color: var(--danger);
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }

        .error-banner {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid var(--danger);
          border-radius: 8px;
          padding: 0.75rem;
          color: var(--danger);
          font-size: 0.875rem;
          margin-top: 1rem;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }
          
          .form-actions {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}