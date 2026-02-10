from fastapi import FastAPI, HTTPException, Query
from typing import Optional, List
import sqlite3
import json
from datetime import datetime
import os

app = FastAPI()

# Initialize SQLite database
DB_PATH = os.getenv("DB_PATH", "todo.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create tasks table if it doesn't exist
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            status BOOLEAN DEFAULT 0,
            priority TEXT DEFAULT 'medium',
            tags TEXT,
            due_date TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create indexes
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority)')
    
    conn.commit()
    conn.close()

# Initialize the database when the app starts
init_db()

class Task:
    def __init__(self, id, title, description, status, priority, tags, due_date, created_at, updated_at):
        self.id = id
        self.title = title
        self.description = description
        self.status = bool(status)
        self.priority = priority
        self.tags = json.loads(tags) if tags else []
        self.due_date = due_date
        self.created_at = created_at
        self.updated_at = updated_at
    
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "priority": self.priority,
            "tags": self.tags,
            "due_date": self.due_date,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

@app.get("/")
def greet_json():
    return {"Hello": "World!", "service": "Evolution of Todo Backend API", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "Evolution of Todo Backend"}

@app.get("/ready")
def ready_check():
    return {"status": "ready", "service": "Evolution of Todo Backend"}

# Get all tasks with optional filtering
@app.get("/tasks/")
def get_tasks(
    search: Optional[str] = Query(None, description="Search term for title or description"),
    status: Optional[bool] = Query(None, description="Filter by completion status"),
    priority: Optional[str] = Query(None, description="Filter by priority level"),
    sort_by: Optional[str] = Query("due_date", description="Sort by due_date, priority, created_at, title, or status"),
    skip: int = Query(0, ge=0, description="Number of tasks to skip"),
    limit: int = Query(100, le=1000, description="Maximum number of tasks to return")
):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    sql = '''SELECT id, title, description, status, priority, tags, due_date, created_at, updated_at FROM tasks'''
    params = []
    conditions = []
    
    # Apply filters
    if search:
        conditions.append("(LOWER(title) LIKE ? OR LOWER(description) LIKE ?)")
        search_term = f"%{search.lower()}%"
        params.extend([search_term, search_term])
    
    if status is not None:
        conditions.append("status = ?")
        params.append(1 if status else 0)
    
    if priority and priority != 'all':
        conditions.append("priority = ?")
        params.append(priority)
    
    if conditions:
        sql += f" WHERE {' AND '.join(conditions)}"
    
    # Apply sorting
    order_by = "created_at DESC"  # Default sort
    if sort_by:
        if sort_by == "due_date":
            order_by = "due_date ASC"
        elif sort_by == "priority":
            order_by = "CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END ASC, created_at DESC"
        elif sort_by == "title":
            order_by = "title ASC"
        elif sort_by == "status":
            order_by = "status ASC, created_at DESC"
        elif sort_by == "created_at":
            order_by = "created_at DESC"
    
    sql += f" ORDER BY {order_by}"
    
    # Apply pagination
    sql += " LIMIT ? OFFSET ?"
    params.extend([limit, skip])
    
    cursor.execute(sql, params)
    rows = cursor.fetchall()
    conn.close()
    
    tasks = []
    for row in rows:
        task = Task(*row)
        tasks.append(task.to_dict())
    
    return tasks

# Create a new task
@app.post("/tasks/")
def create_task(
    title: str,
    description: Optional[str] = None,
    priority: str = "medium",
    tags: Optional[List[str]] = [],
    due_date: Optional[str] = None,
    status: bool = False
):
    if not title:
        raise HTTPException(status_code=400, detail="Title is required")
    
    # Validate priority
    valid_priorities = ["low", "medium", "high"]
    if priority not in valid_priorities:
        raise HTTPException(status_code=400, detail="Invalid priority. Must be low, medium, or high")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO tasks (title, description, status, priority, tags, due_date)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (title, description, int(status), priority, json.dumps(tags), due_date))
        
        task_id = cursor.lastrowid
        conn.commit()
        
        # Retrieve the created task
        cursor.execute("""
            SELECT id, title, description, status, priority, tags, due_date, created_at, updated_at
            FROM tasks WHERE id = ?
        """, (task_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            task = Task(*row)
            return task.to_dict()
        else:
            raise HTTPException(status_code=500, detail="Error creating task")
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Get a specific task
@app.get("/tasks/{task_id}")
def get_task(task_id: int):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, title, description, status, priority, tags, due_date, created_at, updated_at
        FROM tasks WHERE id = ?
    """, (task_id,))
    
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = Task(*row)
    return task.to_dict()

# Update a task
@app.put("/tasks/{task_id}")
def update_task(
    task_id: int,
    title: Optional[str] = None,
    description: Optional[str] = None,
    status: Optional[bool] = None,
    priority: Optional[str] = None,
    tags: Optional[List[str]] = None,
    due_date: Optional[str] = None
):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if task exists
    cursor.execute("SELECT id FROM tasks WHERE id = ?", (task_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Build update query dynamically
    updates = []
    params = []
    
    if title is not None:
        updates.append("title = ?")
        params.append(title)
    if description is not None:
        updates.append("description = ?")
        params.append(description)
    if status is not None:
        updates.append("status = ?")
        params.append(int(status))
    if priority is not None:
        # Validate priority
        valid_priorities = ["low", "medium", "high"]
        if priority not in valid_priorities:
            conn.close()
            raise HTTPException(status_code=400, detail="Invalid priority. Must be low, medium, or high")
        updates.append("priority = ?")
        params.append(priority)
    if tags is not None:
        updates.append("tags = ?")
        params.append(json.dumps(tags))
    if due_date is not None:
        updates.append("due_date = ?")
        params.append(due_date)
    
    # Add updated_at timestamp
    updates.append("updated_at = CURRENT_TIMESTAMP")
    params.append(task_id)
    
    if not updates:
        conn.close()
        raise HTTPException(status_code=400, detail="No fields provided to update")
    
    query = f"UPDATE tasks SET {', '.join(updates)} WHERE id = ?"
    cursor.execute(query, params)
    
    conn.commit()
    conn.close()
    
    # Return the updated task
    return get_task(task_id)

# Delete a task
@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get the task before deleting to return its data
    cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
    row = cursor.fetchone()
    
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Task not found")
    
    cursor.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    conn.commit()
    conn.close()
    
    return {"message": "Task deleted successfully", "task_id": task_id}

# Get task statistics
@app.get("/tasks/stats")
def get_task_stats():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get counts for different statuses
    cursor.execute("""
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as completed,
            SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as pending
        FROM tasks
    """)
    
    row = cursor.fetchone()
    stats = {
        "total": row[0] or 0,
        "completed": row[1] or 0,
        "pending": row[2] or 0,
        "overdue": 0,
        "byPriority": {"high": 0, "medium": 0, "low": 0},
        "completionRate": 0
    }
    
    # Calculate completion rate
    if stats["total"] > 0:
        stats["completionRate"] = round((stats["completed"] / stats["total"]) * 100)
    
    # Calculate overdue tasks (pending tasks with due date in the past)
    today = datetime.now().strftime("%Y-%m-%d")
    cursor.execute("""
        SELECT COUNT(*) as count
        FROM tasks
        WHERE status = 0 AND due_date IS NOT NULL AND due_date < ?
    """, (today,))
    
    overdue_row = cursor.fetchone()
    stats["overdue"] = overdue_row[0] or 0
    
    # Get priority breakdown
    cursor.execute("""
        SELECT priority, COUNT(*) as count
        FROM tasks
        GROUP BY priority
    """)
    
    priority_rows = cursor.fetchall()
    for priority_row in priority_rows:
        if priority_row[0] in stats["byPriority"]:
            stats["byPriority"][priority_row[0]] = priority_row[1]
    
    conn.close()
    return stats

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)