from sqlalchemy import inspect
from sqlmodel import create_engine, SQLModel, Session
from .models import *
import os

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL, echo=True)


def is_database_initialized():
    return len(inspect(engine).get_table_names()) != 0


def init_db():
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
