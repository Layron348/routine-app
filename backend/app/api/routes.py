from datetime import date, timedelta
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, validator
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.task import Task
from app.models.user import User
from app.services.schedule import seed_week, get_week_start
from app.services.streak import compute_streak, compute_week_stats
from app.auth import get_current_user

router = APIRouter()

# ──────────────────────────────────────
# Schemas
# ──────────────────────────────────────
class TaskOut(BaseModel):
    id: int
    date: date
    category: str
    title: str
    done: bool
    status: str          # todo | in_progress | done | cancelled
    shift: str | None
    priority: str
    time_start: str | None
    time_end: str | None
    is_habit: bool

    class Config:
        orm_mode = True


class DayPlan(BaseModel):
    date: date
    weekday: str
    tasks: list[TaskOut]


class PlanResponse(BaseModel):
    week_start: date
    days: list[DayPlan]


class StatsResponse(BaseModel):
    streak: int
    total: int
    done: int
    percent: int
    by_day: list[dict]


class ToggleRequest(BaseModel):
    task_id: int


class PatchTaskRequest(BaseModel):
    task_id: int
    status: Literal["todo", "in_progress", "done", "cancelled"] | None = None
    title: str | None = None
    priority: Literal["high", "medium", "low"] | None = None
    time_start: str | None = None
    time_end: str | None = None

    @validator("title")
    def title_must_not_be_blank(cls, value: str | None) -> str | None:
        if value is not None and not value.strip():
            raise ValueError("Title must not be blank")
        return value.strip() if value is not None else value


class CreateTaskRequest(BaseModel):
    date: date
    category: Literal["work", "train", "project", "rest", "routine"] = "routine"
    title: str
    shift: str | None = None
    priority: Literal["high", "medium", "low"] = "medium"
    time_start: str | None = None
    time_end: str | None = None
    is_habit: bool = False

    @validator("title")
    def title_must_not_be_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Title must not be blank")
        return value.strip()


class DeleteRequest(BaseModel):
    task_id: int


class SuggestionOut(BaseModel):
    title: str
    category: str
    count: int
    is_smart: bool = False


WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
WEEKDAY_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


# ──────────────────────────────────────
# Routes
# ──────────────────────────────────────
@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/plan", response_model=PlanResponse)
def get_plan(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = date.today()
    week_start = get_week_start(today)
    seed_week(db, week_start, current_user.id)
    days = []
    for i in range(7):
        day = week_start + timedelta(days=i)
        tasks = db.query(Task).filter(Task.date == day, Task.user_id == current_user.id).order_by(Task.id).all()
        days.append(DayPlan(
            date=day,
            weekday=WEEKDAYS[day.weekday()],
            tasks=[TaskOut.from_orm(t) for t in tasks],
        ))
    return PlanResponse(week_start=week_start, days=days)


@router.get("/stats", response_model=StatsResponse)
def get_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = date.today()
    week_start = get_week_start(today)
    seed_week(db, week_start, current_user.id)
    streak = compute_streak(db, today, current_user.id)
    week = compute_week_stats(db, week_start, current_user.id)
    by_day = []
    for i in range(7):
        day = week_start + timedelta(days=i)
        tasks = db.query(Task).filter(Task.date == day, Task.user_id == current_user.id).all()
        total = len(tasks)
        done = sum(1 for t in tasks if t.done)
        by_day.append({
            "weekday": WEEKDAYS[i],
            "weekday_full": WEEKDAY_FULL[i],
            "date": str(day),
            "total": total,
            "done": done,
            "percent": round(done / total * 100) if total else 0,
        })
    return StatsResponse(streak=streak, by_day=by_day, **week)


@router.post("/tasks/toggle", response_model=TaskOut)
def toggle_task(body: ToggleRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == body.task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.done = not task.done
    task.status = "done" if task.done else "todo"
    db.commit(); db.refresh(task)
    return TaskOut.from_orm(task)


@router.patch("/tasks", response_model=TaskOut)
def patch_task(body: PatchTaskRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == body.task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if body.status is not None:
        task.status = body.status
        task.done = body.status == "done"
    if body.title is not None:
        task.title = body.title
    if body.priority is not None:
        task.priority = body.priority
    if body.time_start is not None:
        task.time_start = body.time_start
    if body.time_end is not None:
        task.time_end = body.time_end
    db.commit(); db.refresh(task)
    return TaskOut.from_orm(task)


@router.post("/tasks", response_model=TaskOut)
def create_task(body: CreateTaskRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = Task(
        user_id=current_user.id,
        date=body.date, category=body.category, title=body.title,
        shift=body.shift, priority=body.priority,
        time_start=body.time_start, time_end=body.time_end,
        is_habit=body.is_habit, done=False, status="todo",
    )
    db.add(task); db.commit(); db.refresh(task)
    if body.is_habit:
        week_start = get_week_start(body.date)
        for i in range(7):
            day = week_start + timedelta(days=i)
            if day == body.date:
                continue
            existing = db.query(Task).filter(
                Task.date == day, Task.title == body.title, Task.is_habit == True, Task.user_id == current_user.id
            ).first()
            if not existing:
                db.add(Task(
                    user_id=current_user.id,
                    date=day, category=body.category, title=body.title,
                    priority=body.priority, is_habit=True, done=False, status="todo",
                ))
        db.commit()
    return TaskOut.from_orm(task)


@router.delete("/tasks", response_model=TaskOut)
def delete_task(body: DeleteRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == body.task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task_out = TaskOut.from_orm(task)
    db.delete(task); db.commit()
    return task_out


@router.get("/tasks/suggestions", response_model=list[SuggestionOut])
def get_task_suggestions(
    target_date: date | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Return frequently used tasks for the current user, optionally filtered for a target date."""
    since = date.today() - timedelta(days=60)
    tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.date >= since,
    ).all()

    target = target_date or date.today()
    existing_titles = {
        t.title for t in db.query(Task).filter(
            Task.user_id == current_user.id,
            Task.date == target,
        ).all()
    }

    from collections import Counter
    freq = Counter((t.title, t.category) for t in tasks)
    frequent = [
        {"title": title, "category": cat, "count": count}
        for (title, cat), count in freq.most_common(10)
        if title not in existing_titles
    ]

    # Smart suggestion based on day of week from history
    smart = []
    weekday = target.weekday()
    weekday_tasks = [t for t in tasks if t.date.weekday() == weekday]
    if weekday_tasks:
        wfreq = Counter((t.title, t.category) for t in weekday_tasks)
        for (title, cat), count in wfreq.most_common(3):
            if title not in existing_titles and not any(s["title"] == title for s in frequent):
                smart.append({"title": title, "category": cat, "count": count, "is_smart": True})

    # Keep top suggestions
    result = frequent[:6]
    for s in smart:
        if len(result) >= 8:
            break
        if not any(r["title"] == s["title"] for r in result):
            result.append(s)

    return result
