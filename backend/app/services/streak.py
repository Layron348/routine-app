from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.models.task import Task


def compute_streak(db: Session, today: date, user_id: int) -> int:
    """
    Count consecutive days (going backwards from today) where
    every task for that day is done.
    """
    streak = 0
    current = today
    for _ in range(365):
        tasks = db.query(Task).filter(Task.date == current, Task.user_id == user_id).all()
        if not tasks:
            break
        if all(t.done for t in tasks):
            streak += 1
        else:
            break
        current -= timedelta(days=1)
    return streak


def compute_week_stats(db: Session, week_start: date, user_id: int):
    total = 0
    done = 0
    for i in range(7):
        day = week_start + timedelta(days=i)
        tasks = db.query(Task).filter(Task.date == day, Task.user_id == user_id).all()
        total += len(tasks)
        done += sum(1 for t in tasks if t.done)
    percent = round(done / total * 100) if total else 0
    return {"total": total, "done": done, "percent": percent}
