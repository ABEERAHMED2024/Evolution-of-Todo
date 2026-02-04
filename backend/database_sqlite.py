import os
from typing import Generator

from models.task import TaskSQLModel
from sqlalchemy import create_engine
from sqlmodel import Session, SQLModel

# SQLite database setup for local development
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todo.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})


def create_db_and_tables():
    SQLModel.metadata.create_all(bind=engine)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
