const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 8000;

// In-memory storage for tasks
let tasks = [
  {
    id: '1',
    title: 'Sample Task',
    description: 'This is a sample task',
    status: false,
    priority: 'medium',
    tags: ['sample'],
    due_date: '2024-12-31',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
let nextId = 2;

// Middleware
app.use(cors());
app.use(express.json());

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
  let filteredTasks = [...tasks];
  
  // Apply filters
  if (req.query.search) {
    const searchTerm = req.query.search.toLowerCase();
    filteredTasks = filteredTasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm) || 
      (task.description && task.description.toLowerCase().includes(searchTerm))
    );
  }
  
  if (req.query.status !== undefined) {
    const status = req.query.status === 'true';
    filteredTasks = filteredTasks.filter(task => task.status === status);
  }
  
  if (req.query.priority) {
    filteredTasks = filteredTasks.filter(task => task.priority === req.query.priority);
  }
  
  if (req.query.sort_by) {
    filteredTasks.sort((a, b) => {
      if (req.query.sort_by === 'due_date') {
        return new Date(a.due_date) - new Date(b.due_date);
      } else if (req.query.sort_by === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return 0;
    });
  }
  
  res.json(filteredTasks);
});

// Create a new task
app.post('/tasks/', (req, res) => {
  const { title, description, priority = 'medium', tags = [], due_date, status = false } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  const newTask = {
    id: String(nextId++),
    title,
    description: description || null,
    status,
    priority,
    tags,
    due_date: due_date || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// Get a specific task
app.get('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

// Update a task
app.put('/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const { title, description, status, priority, tags, due_date } = req.body;
  
  // Update only provided fields
  if (title !== undefined) tasks[taskIndex].title = title;
  if (description !== undefined) tasks[taskIndex].description = description;
  if (status !== undefined) tasks[taskIndex].status = status;
  if (priority !== undefined) tasks[taskIndex].priority = priority;
  if (tags !== undefined) tasks[taskIndex].tags = tags;
  if (due_date !== undefined) tasks[taskIndex].due_date = due_date;
  
  tasks[taskIndex].updated_at = new Date().toISOString();
  
  res.json(tasks[taskIndex]);
});

// Delete a task
app.delete('/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  tasks.splice(taskIndex, 1);
  res.json({ message: 'Task deleted successfully' });
});

app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
  console.log('Dapr sidecar endpoint: http://localhost:3500');
});

module.exports = app;