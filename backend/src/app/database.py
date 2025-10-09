from sqlalchemy import inspect
from sqlmodel import create_engine, SQLModel
from .models.tables import *
import os

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL, echo=True)

def is_database_initialized():
    return len(inspect(engine).get_table_names()) != 0

def init_db():
    if is_database_initialized():
        print('Database already initialized')
        return
    else:
        SQLModel.metadata.create_all(engine)
        print("Database initialized")
        