from sqlalchemy import inspect
from sqlmodel import create_engine, SQLModel, Session
from .models import *
import os

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL, echo=True)


def is_database_initialized():
    """
    Check whether the database has been initialized.
    
    Returns: 
        boolean: is database initialized.
    """
    return len(inspect(engine).get_table_names()) != 0


def init_db():
    """
    Initialize the application's database.

    Checks whether the database has already been initialized by calling
    `is_database_initialized()`. If the database is not initialized, this function
    creates all tables defined on SQLModel.metadata using the module-level `engine`.

    Behavior:
    - If the database is already initialized, prints "Database already initialized".
    - If not, creates tables and prints "Database initialized".
    """
    if is_database_initialized():
        print("Database already initialized")
    else:
        SQLModel.metadata.create_all(engine)
        # populate_database()
        print("Database initialized")


def get_session():
    """
    Dependency for FastAPI routes.
    Yields a database session and ensures it is closed after the request.
    """
    db = Session(engine)
    try:
        yield db
    finally:
        db.close()
