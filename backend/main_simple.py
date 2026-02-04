import os
from datetime import datetime
from typing import Generator, List, Optional

import uvicorn
from fastapi import Depends, FastAPI, HTTPException
from models.task import Task, TaskCreate, TaskSQLModel, TaskUpdate
from sqlalchemy import create_engine
from sqlmodel import Session, SQLModel, select

# SQLite database setup for local development
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todo.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})


def create_db_and_tables():
    SQLModel.metadata.create_all(bind=engine)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


# FastAPI app
app = FastAPI(title="Todo API", version="1.0.0")


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.get("/")
def read_root():
    return {"message": "Welcome to the Todo API"}


@app.post("/tasks/", response_model=Task)
def create_task(task: TaskCreate, session: Session = Depends(get_session)):
    # Convert tags list to JSON string for storage
    db_task = TaskSQLModel(
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        due_date=task.due_date,
    )
    db_task.set_tags_list(task.tags)  # Store tags as JSON string

    session.add(db_task)
    session.commit()
    session.refresh(db_task)

    # Convert back to response model
    return Task(
        id=db_task.id,
        title=db_task.title,
        description=db_task.description,
        status=db_task.status,
        priority=db_task.priority,
        tags=db_task.get_tags_list(),
        due_date=db_task.due_date,
    )


@app.get("/tasks/", response_model=List[Task])
def read_tasks(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    status: Optional[bool] = None,
    priority: Optional[str] = None,
    sort_by: Optional[str] = "due_date",
    session: Session = Depends(get_session),
):
    query = select(TaskSQLModel)

    # Apply search filter
    if search:
        query = query.where(
            (TaskSQLModel.title.contains(search))
            | (TaskSQLModel.description.contains(search))
        )

    # Apply status filter
    if status is not None:
        query = query.where(TaskSQLModel.status == status)

    # Apply priority filter
    if priority:
        query = query.where(TaskSQLModel.priority == priority)

    # Apply sorting
    if sort_by == "due_date":
        query = query.order_by(TaskSQLModel.due_date.asc())
    elif sort_by == "priority":
        query = query.order_by(TaskSQLModel.priority.asc())

    # Apply pagination
    query = query.offset(skip).limit(limit)

    db_tasks = session.exec(query).all()

    # Convert to response models
    tasks = []
    for db_task in db_tasks:
        task = Task(
            id=db_task.id,
            title=db_task.title,
            description=db_task.description,
            status=db_task.status,
            priority=db_task.priority,
            tags=db_task.get_tags_list(),
            due_date=db_task.due_date,
        )
        tasks.append(task)

    return tasks


@app.get("/tasks/{task_id}", response_model=Task)
def read_task(task_id: int, session: Session = Depends(get_session)):
    db_task = session.get(TaskSQLModel, task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    return Task(
        id=db_task.id,
        title=db_task.title,
        description=db_task.description,
        status=db_task.status,
        priority=db_task.priority,
        tags=db_task.get_tags_list(),
        due_date=db_task.due_date,
    )


@app.put("/tasks/{task_id}", response_model=Task)
def update_task(
    task_id: int, task_update: TaskUpdate, session: Session = Depends(get_session)
):
    db_task = session.get(TaskSQLModel, task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Update only provided fields
    update_data = task_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field == "tags":
            # Handle tags separately as they need JSON conversion
            db_task.set_tags_list(value)
        else:
            setattr(db_task, field, value)

    session.add(db_task)
    session.commit()
    session.refresh(db_task)

    return Task(
        id=db_task.id,
        title=db_task.title,
        description=db_task.description,
        status=db_task.status,
        priority=db_task.priority,
        tags=db_task.get_tags_list(),
        due_date=db_task.due_date,
    )


@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, session: Session = Depends(get_session)):
    db_task = session.get(TaskSQLModel, task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    session.delete(db_task)
    session.commit()
    return {"message": "Task deleted successfully"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
