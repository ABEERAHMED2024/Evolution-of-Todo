import { useState, useEffect } from 'react';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import Layout from '../src/layouts/MainLayout';

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('due_date');
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, overdue: 0 });

  // Fetch tasks from the API
 
const fetchTasks = async () => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    let url = `${baseUrl}/tasks/?sort_by=${sortBy}`;

    if (searchTerm) {
      url += `&search=${encodeURIComponent(searchTerm)}`;
    }
    if (filterStatus !== 'all') {
      url += `&status=${filterStatus === 'completed'}`;
    }
    if (filterPriority !== 'all') {
      url += `&priority=${filterPriority}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    setTasks(data);

    const total = data.length;
    const completed = data.filter(task => task.status).length;
    const pending = data.filter(task => !task.status).length;

    const today = new Date().toISOString().split('T')[0];
    const overdue = data.filter(task =>
      !task.status &&
      task.due_date &&
      task.due_date < today
    ).length;

    setStats({ total, completed, pending, overdue });
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
};


  // Fetch tasks on initial load and when filters change
  useEffect(() => {
    fetchTasks();
  }, [searchTerm, filterStatus, filterPriority, sortBy]);

  const refreshTasks = () => {
    fetchTasks();
  };

  // Calculate progress percentage
  const progressPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <Layout title="Evolution of Todo - Dashboard">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h2>Your Tasks</h2>
            <p>Manage your productivity with AI assistance</p>
          </div>
          
          <div className="dashboard-controls">
            <div className="search-container">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>

        <TaskForm onTaskAdded={refreshTasks} />

        <div className="filters">
          <div className="filter-group">
            <label>Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All</option>
              <option value="incomplete">Incomplete</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="filter-select"
            >
              <option value="all">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="due_date">Due Date</option>
              <option value="priority">Priority</option>
              <option value="created_at">Created</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>

        <TaskList tasks={tasks} onTaskUpdated={refreshTasks} onTaskDeleted={refreshTasks} />
      </div>

      <style jsx>{`
        .dashboard-content {
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .dashboard-title h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .dashboard-title p {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .dashboard-controls {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .search-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-input {
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--surface);
          color: var(--text-primary);
          font-size: 0.875rem;
          min-width: 250px;
        }

        .search-input::placeholder {
          color: var(--text-muted);
        }

        .search-container svg {
          position: absolute;
          left: 0.75rem;
          color: var(--text-muted);
        }

        .filters {
          display: flex;
          gap: 1rem;
          margin: 2rem 0;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-group label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 500;
        }

        .filter-select {
          padding: 0.5rem 1rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--surface);
          color: var(--text-primary);
          font-size: 0.875rem;
          min-width: 120px;
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .dashboard-controls {
            width: 100%;
          }
          
          .search-input {
            min-width: 0;
            flex: 1;
          }
          
          .filters {
            flex-direction: column;
          }
          
          .filter-group {
            width: 100%;
          }
        }
      `}</style>
    </Layout>
  );
}