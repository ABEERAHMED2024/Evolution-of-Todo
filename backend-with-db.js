const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const dbPath = path.join(__dirname, 'todo.db');
const db = new sqlite3.Database(dbPath);

// Create tasks table if it doesn't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status BOOLEAN DEFAULT 0,
    priority TEXT DEFAULT 'medium',
    tags TEXT,
    due_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create an index on the created_at column for better performance
  db.run(`CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at)`);
  
  // Create an index on the status column
  db.run(`CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)`);
  
  // Create an index on the priority column
  db.run(`CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority)`);
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Evolution of Todo Backend API' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.get('/ready', (req, res) => {
  res.status(200).json({ status: 'ready' });
});

// Get all tasks with optional filtering
app.get('/tasks/', (req, res) => {
  let sql = `SELECT id, title, description, status, priority, tags, due_date, created_at, updated_at FROM tasks`;
  let params = [];
  const conditions = [];

  // Apply filters
  if (req.query.search) {
    const searchTerm = `%${req.query.search.toLowerCase()}%`;
    conditions.push(`(LOWER(title) LIKE ? OR LOWER(description) LIKE ?)`);
    params.push(searchTerm, searchTerm);
  }

  if (req.query.status !== undefined) {
    const status = req.query.status === 'true' ? 1 : 0;
    conditions.push(`status = ?`);
    params.push(status);
  }

  if (req.query.priority && req.query.priority !== 'all') {
    conditions.push(`priority = ?`);
    params.push(req.query.priority);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(' AND ')}`;
  }

  // Apply sorting
  let orderBy = 'created_at DESC'; // Default sort
  if (req.query.sort_by) {
    switch (req.query.sort_by) {
      case 'due_date':
        orderBy = 'due_date ASC';
        break;
      case 'priority':
        // Order by priority: high, medium, low
        orderBy = `CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END ASC, created_at DESC`;
        break;
      case 'title':
        orderBy = 'title ASC';
        break;
      case 'status':
        orderBy = 'status ASC, created_at DESC';
        break;
      default:
        orderBy = 'created_at DESC';
    }
  }

  sql += ` ORDER BY ${orderBy}`;

  // Apply pagination
  const skip = parseInt(req.query.skip) || 0;
  const limit = parseInt(req.query.limit) || 100;
  sql += ` LIMIT ? OFFSET ?`;
  params.push(limit, skip);

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Parse tags from JSON string
    const tasks = rows.map(row => ({
      ...row,
      status: Boolean(row.status),
      tags: row.tags ? JSON.parse(row.tags) : [],
    }));

    res.json(tasks);
  });
});

// Create a new task
app.post('/tasks/', (req, res) => {
  const { title, description, priority = 'medium', tags = [], due_date, status = false } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  // Validate priority
  const validPriorities = ['low', 'medium', 'high'];
  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({ error: 'Invalid priority. Must be low, medium, or high' });
  }

  const stmt = db.prepare(`
    INSERT INTO tasks (title, description, status, priority, tags, due_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run([
    title,
    description || null,
    status ? 1 : 0,
    priority,
    JSON.stringify(tags),
    due_date || null
  ], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Get the newly created task
    db.get(
      `SELECT id, title, description, status, priority, tags, due_date, created_at, updated_at 
       FROM tasks WHERE id = ?`,
      [this.lastID],
      (err, row) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        res.status(201).json({
          ...row,
          status: Boolean(row.status),
          tags: row.tags ? JSON.parse(row.tags) : [],
        });
      }
    );
  });

  stmt.finalize();
});

// Get a specific task
app.get('/tasks/:id', (req, res) => {
  const taskId = req.params.id;

  db.get(
    `SELECT id, title, description, status, priority, tags, due_date, created_at, updated_at 
     FROM tasks WHERE id = ?`,
    [taskId],
    (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!row) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json({
        ...row,
        status: Boolean(row.status),
        tags: row.tags ? JSON.parse(row.tags) : [],
      });
    }
  );
});

// Update a task
app.put('/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const updates = {};

  // Collect fields to update
  if (req.body.title !== undefined) updates.title = req.body.title;
  if (req.body.description !== undefined) updates.description = req.body.description;
  if (req.body.status !== undefined) updates.status = req.body.status ? 1 : 0;
  if (req.body.priority !== undefined) updates.priority = req.body.priority;
  if (req.body.tags !== undefined) updates.tags = JSON.stringify(req.body.tags);
  if (req.body.due_date !== undefined) updates.due_date = req.body.due_date;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No fields provided to update' });
  }

  // Build dynamic SQL query
  const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = Object.values(updates);
  values.push(taskId); // Add ID for WHERE clause

  const sql = `UPDATE tasks SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

  db.run(sql, values, function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Return the updated task
    db.get(
      `SELECT id, title, description, status, priority, tags, due_date, created_at, updated_at 
       FROM tasks WHERE id = ?`,
      [taskId],
      (err, row) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        res.json({
          ...row,
          status: Boolean(row.status),
          tags: row.tags ? JSON.parse(row.tags) : [],
        });
      }
    );
  });
});

// Delete a task
app.delete('/tasks/:id', (req, res) => {
  const taskId = req.params.id;

  db.run(`DELETE FROM tasks WHERE id = ?`, [taskId], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  });
});

// Get task statistics
app.get('/tasks/stats', (req, res) => {
  db.serialize(() => {
    // Get counts for different statuses
    db.all(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as pending
      FROM tasks
    `, [], (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      const stats = rows[0] || { total: 0, completed: 0, pending: 0 };
      stats.overdue = 0; // Will calculate separately
      
      // Calculate overdue tasks (pending tasks with due date in the past)
      const today = new Date().toISOString().split('T')[0];
      db.get(`
        SELECT COUNT(*) as count
        FROM tasks
        WHERE status = 0 AND due_date IS NOT NULL AND due_date < ?
      `, [today], (err, row) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        stats.overdue = row.count || 0;
        stats.byPriority = { high: 0, medium: 0, low: 0 };
        stats.completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

        // Get priority breakdown
        db.all(`
          SELECT priority, COUNT(*) as count
          FROM tasks
          GROUP BY priority
        `, [], (err, rows) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
          }

          rows.forEach(row => {
            if (stats.byPriority.hasOwnProperty(row.priority)) {
              stats.byPriority[row.priority] = row.count;
            }
          });

          res.json(stats);
        });
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
  console.log(`Database file: ${dbPath}`);
  console.log('Dapr sidecar endpoint: http://localhost:3500');
});

// Close database connection when app closes
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});

module.exports = app;