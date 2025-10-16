import os

if not os.getenv("DATABASE_URL"):
    os.environ["DATABASE_URL"] = "sqlite:///test.db"