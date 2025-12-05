from sqlmodel import SQLModel, create_engine, Session
import os

# Default to SQLite for local dev if Postgres is not configured
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./database.db")

# If using Postgres, remove connect_args
connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
