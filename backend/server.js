const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for tasks (SQLite alternative for quick start)
let tasks = [];

// Root endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Todo API' });
});

// GET /tasks - Get all tasks with optional filtering and sorting
app.get('/tasks', (req, res) => {
    const { search, status, priority, sort_by = 'created_at', skip = 0, limit = 100 } = req.query;

    let filteredTasks = [...tasks];

    // Apply search filter
    if (search) {
        const searchLower = search.toLowerCase();
        filteredTasks = filteredTasks.filter(task =>
            task.title.toLowerCase().includes(searchLower) ||
            (task.description && task.description.toLowerCase().includes(searchLower))
        );
    }

    // Apply status filter
    if (status !== undefined) {
        const statusBool = status === 'true';
        filteredTasks = filteredTasks.filter(task => task.status === statusBool);
    }

    // Apply priority filter
    if (priority) {
        filteredTasks = filteredTasks.filter(task => task.priority === priority);
    }

    // Apply sorting
    if (sort_by === 'due_date') {
        filteredTasks.sort((a, b) => {
            if (!a.due_date) return 1;
            if (!b.due_date) return -1;
            return new Date(a.due_date) - new Date(b.due_date);
        });
    } else if (sort_by === 'priority') {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        filteredTasks.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));
    } else if (sort_by === 'created_at') {
        filteredTasks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    // Apply pagination
    const startIndex = parseInt(skip);
    const endIndex = startIndex + parseInt(limit);
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

    res.json(paginatedTasks);
});

// GET /tasks/:id - Get a specific task
app.get('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const task = tasks.find(t => t.id === id);

    if (!task) {
        return res.status(404).json({ detail: 'Task not found' });
    }

    res.json(task);
});

// POST /tasks - Create a new task
app.post('/tasks', (req, res) => {
    const { title, description, priority = 'medium', tags = [], due_date } = req.body;

    if (!title) {
        return res.status(400).json({ detail: 'Title is required' });
    }

    const newTask = {
        id: uuidv4(),
        title,
        description: description || null,
        status: false,
        priority,
        tags: Array.isArray(tags) ? tags : [],
        due_date: due_date || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    tasks.push(newTask);
    res.status(201).json(newTask);
});

// PUT /tasks/:id - Update a task
app.put('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
        return res.status(404).json({ detail: 'Task not found' });
    }

    const { title, description, status, priority, tags, due_date } = req.body;

    // Update only provided fields
    const updatedTask = { ...tasks[taskIndex] };

    if (title !== undefined) updatedTask.title = title;
    if (description !== undefined) updatedTask.description = description;
    if (status !== undefined) updatedTask.status = status;
    if (priority !== undefined) updatedTask.priority = priority;
    if (tags !== undefined) updatedTask.tags = Array.isArray(tags) ? tags : [];
    if (due_date !== undefined) updatedTask.due_date = due_date;

    updatedTask.updated_at = new Date().toISOString();

    tasks[taskIndex] = updatedTask;
    res.json(updatedTask);
});

// DELETE /tasks/:id - Delete a task
app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
        return res.status(404).json({ detail: 'Task not found' });
    }

    tasks.splice(taskIndex, 1);
    res.json({ message: 'Task deleted successfully' });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Todo API server is running on http://0.0.0.0:${PORT}`);
    console.log(`📝 API Documentation available at http://localhost:${PORT}/`);
    console.log(`🔍 Try: http://localhost:${PORT}/tasks`);
});

module.exports = app;
