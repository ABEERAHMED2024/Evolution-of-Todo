import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('due_date');

  // Fetch tasks from the API
  const fetchTasks = async () => {
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/tasks/?sort_by=${sortBy}`;
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

  return (
    <div className="container">
      <Head>
        <title>Evolution of Todo - Phase III</title>
        <meta name="description" content="AI-powered task management assistant" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="main">
        <h1 className="title">Evolution of Todo - Phase III</h1>

        <div className="nav-links">
          <Link href="/chat" className="nav-link">
            💬 Chat with AI Assistant
          </Link>
        </div>

        <TaskForm onTaskAdded={refreshTasks} />

        <div className="filters">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="incomplete">Incomplete</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="due_date">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
          </select>
        </div>

        <TaskList tasks={tasks} onTaskUpdated={refreshTasks} onTaskDeleted={refreshTasks} />
      </main>

      <footer className="footer">
        <p>Evolution of Todo - Phase III</p>
      </footer>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
          line-height: 1.6;
          font-size: 18px;
        }

        * {
          box-sizing: border-box;
        }

        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .main {
          padding: 2rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 100%;
          max-width: 800px;
        }

        .title {
          margin: 0 0 1rem 0;
          line-height: 1.15;
          font-size: 2.5rem;
          text-align: center;
        }

        .nav-links {
          margin-bottom: 1.5rem;
        }

        .nav-link {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background-color: #0070f3;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
          transition: background-color 0.2s;
        }

        .nav-link:hover {
          background-color: #0060d3;
        }

        .filters {
          display: flex;
          gap: 10px;
          margin: 20px 0;
          flex-wrap: wrap;
          justify-content: center;
        }

        .search-input, .filter-select {
          padding: 8px 12px;
          border-radius: 4px;
          border: 1px solid #ccc;
          font-size: 16px;
        }

        .search-input {
          min-width: 250px;
        }

        .footer {
          width: 100%;
          height: 80px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `}</style>
    </div>
  );
}