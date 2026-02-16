"""
Data migration tool from Phase I to Phase II.
Transfers data from memory to PostgreSQL.
"""
import json
from typing import List, Dict, Any
from sqlmodel import Session, create_engine
from apps.cli.models.task import Task
from apps.cli.repositories.memory_repository import MemoryRepository
from apps.cli.repositories.postgres_repository import PostgresTaskRepository


class MigrationTool:
    """
    Data migration from Phase I in-memory format to Phase II PostgreSQL format.
    
    Provides migration tool that transfers existing in-memory data to the PostgreSQL database.
    """
    
    def __init__(self, source_db_url: str = "", dest_db_url: str):
        """
        Initialize the migration tool.
        
        Args:
            source_db_url: URL for source database (if applicable)
            dest_db_url: URL for destination database
        """
        self.source_db_url = source_db_url
        self.dest_engine = create_engine(dest_db_url)
        
    def migrate_from_memory_to_postgres(self, tasks: List[Task]) -> bool:
        """
        Migrate tasks from in-memory representation to PostgreSQL.
        
        Args:
            tasks: List of tasks to migrate
            
        Returns:
            True if migration was successful, False otherwise
        """
        try:
            # Create a session for the destination database
            with Session(self.dest_engine) as session:
                # Create the PostgresTaskRepository
                dest_repo = PostgresTaskRepository(session)
                
                # Migrate each task
                for task in tasks:
                    # Add the task to the destination repository
                    dest_repo.add(task)
                    
            return True
        except Exception as e:
            print(f"Migration failed: {str(e)}")
            return False
    
    def migrate_from_json_to_postgres(self, json_file_path: str) -> bool:
        """
        Migrate tasks from a JSON file to PostgreSQL.
        
        Args:
            json_file_path: Path to the JSON file containing tasks to migrate
            
        Returns:
            True if migration was successful, False otherwise
        """
        try:
            # Read tasks from JSON file
            with open(json_file_path, 'r') as file:
                tasks_data = json.load(file)
            
            # Convert the data to Task objects
            tasks = []
            for task_data in tasks_data:
                task = Task(
                    id=task_data.get('id'),
                    title=task_data.get('title'),
                    description=task_data.get('description'),
                    status=task_data.get('status', 'incomplete')
                )
                tasks.append(task)
            
            # Migrate the tasks
            return self.migrate_from_memory_to_postgres(tasks)
        except Exception as e:
            print(f"Migration from JSON failed: {str(e)}")
            return False


def main():
    """
    Main function to run the migration tool.
    
    Usage examples:
    - python migration_tool.py --source memory --destination postgres
    - python migration_tool.py --source json:tasks.json --destination postgres
    """
    import sys
    import os
    
    # Check if DATABASE_URL is set
    dest_db_url = os.getenv("DATABASE_URL")
    if not dest_db_url:
        print("Error: DATABASE_URL environment variable is not set")
        sys.exit(1)
    
    # Create the migration tool
    migrator = MigrationTool(dest_db_url=dest_db_url)
    
    # For now, we'll demonstrate with a simple example
    # In a real scenario, we would read from the source specified by command line args
    print("Starting migration from memory to PostgreSQL...")
    
    # Example: Create some dummy tasks for demonstration
    # In a real scenario, these would come from the source (memory, JSON file, etc.)
    example_tasks = [
        Task(id=1, title="Example Task 1", description="This is an example task", status="incomplete"),
        Task(id=2, title="Example Task 2", description="This is another example task", status="complete")
    ]
    
    # Perform the migration
    success = migrator.migrate_from_memory_to_postgres(example_tasks)
    
    if success:
        print("Migration completed successfully!")
    else:
        print("Migration failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()