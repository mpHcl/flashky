from sqlalchemy import inspect
from sqlmodel import create_engine, SQLModel, Session
from .models import *
import os

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL, echo=True)


from sqlmodel import create_engine, Session
import os

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL, echo=True)

def get_session():
    with Session(engine) as session:
        yield session

