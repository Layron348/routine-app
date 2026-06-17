import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect, text

from app.db import engine, Base
from app.api.routes import router
from app.api.auth import router as auth_router
import app.models.task  # ensure models are registered before create_all
import app.models.user  # ensure user model is registered

load_dotenv()

app = FastAPI(title="Routine Week API")

allowed_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "*").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials="*" not in allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables on startup. For the current small SQLite app we also add
# missing columns so older local/server databases survive model changes.
Base.metadata.create_all(bind=engine)


def ensure_sqlite_columns() -> None:
    if not engine.url.get_backend_name().startswith("sqlite"):
        return

    inspector = inspect(engine)
    if "tasks" not in inspector.get_table_names():
        return

    existing = {column["name"] for column in inspector.get_columns("tasks")}
    columns = {
        "status": "VARCHAR NOT NULL DEFAULT 'todo'",
        "priority": "VARCHAR NOT NULL DEFAULT 'medium'",
        "time_start": "VARCHAR",
        "time_end": "VARCHAR",
        "is_habit": "BOOLEAN NOT NULL DEFAULT 0",
    }

    with engine.begin() as connection:
        for name, definition in columns.items():
            if name not in existing:
                connection.execute(text(f"ALTER TABLE tasks ADD COLUMN {name} {definition}"))


ensure_sqlite_columns()

app.include_router(router, prefix="/api")
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])

dist_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.isdir(dist_path):
    app.mount("/", StaticFiles(directory=dist_path, html=True), name="frontend")
