from datetime import date, timedelta
from aiogram import Router, F
from aiogram.filters import Command
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State

from app.db import SessionLocal
from app.models.task import Task
from app.models.user import User
from app.services.streak import compute_streak, compute_week_stats
from app.services.schedule import seed_week, get_week_start

router = Router()

CAT_EMOJI = {"work": "💼", "train": "🏋️", "project": "🚀", "rest": "😴", "routine": "☀️"}
CAT_NAMES = {"work": "Work", "train": "Workout", "project": "Project", "rest": "Rest", "routine": "Routine"}
PRIO_LABELS = {"high": "🔴 High", "medium": "🟡 Medium", "low": "⚪ Low"}
DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


class AddTaskStates(StatesGroup):
    waiting_category = State()
    waiting_priority = State()


def get_user(telegram_id: int, name: str) -> User:
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.telegram_id == telegram_id).first()
        if not user:
            user = User(
                telegram_id=telegram_id,
                name=name,
                email=f"tg_{telegram_id}@routine.local",
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        return user
    finally:
        db.close()


def cat_kb():
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text=f"{CAT_EMOJI[c]} {CAT_NAMES[c]}", callback_data=f"cat:{c}") for c in ("work", "train", "project")],
        [InlineKeyboardButton(text=f"{CAT_EMOJI[c]} {CAT_NAMES[c]}", callback_data=f"cat:{c}") for c in ("routine", "rest")],
    ])


def prio_kb():
    return InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(text=PRIO_LABELS[p], callback_data=f"prio:{p}")
        for p in ("high", "medium", "low")
    ]])


@router.message(Command("today"))
async def cmd_today(message: Message):
    user = get_user(message.from_user.id, message.from_user.first_name or "User")
    db = SessionLocal()
    try:
        today = date.today()
        seed_week(db, get_week_start(today), user.id)
        tasks = db.query(Task).filter(Task.date == today, Task.user_id == user.id).order_by(Task.id).all()
        if not tasks:
            await message.answer("✨ No tasks for today.\nAdd one via /add or open the Mini App:")
            return
        done = sum(1 for t in tasks if t.done)
        lines = [f"📅 <b>Today's tasks</b>  {done}/{len(tasks)}\n"]
        for t in tasks:
            check = "✅" if t.done else "☐"
            time_s = f" 🕐 {t.time_start}" if t.time_start else ""
            lines.append(f"{check} {CAT_EMOJI.get(t.category, '📌')} {t.title}{time_s}")
        await message.answer("\n".join(lines), parse_mode="HTML")
    finally:
        db.close()


@router.message(Command("week"))
async def cmd_week(message: Message):
    user = get_user(message.from_user.id, message.from_user.first_name or "User")
    db = SessionLocal()
    try:
        today = date.today()
        ws = get_week_start(today)
        seed_week(db, ws, user.id)
        lines = [f"📊 <b>Week {ws.strftime('%d.%m')}–{(ws + timedelta(6)).strftime('%d.%m')}</b>\n"]
        total_all = 0; done_all = 0
        for i in range(7):
            day = ws + timedelta(days=i)
            tasks = db.query(Task).filter(Task.date == day, Task.user_id == user.id).all()
            total = len(tasks); done = sum(1 for t in tasks if t.done)
            total_all += total; done_all += done
            bar_len = 8
            filled = round(done / total * bar_len) if total else 0
            bar = "🟩" * filled + "⬜" * (bar_len - filled)
            mark = "📌" if day == today else "  "
            lines.append(f"{mark}{DAY_NAMES[i]}: {bar} {done}/{total}")
        pct = round(done_all / total_all * 100) if total_all else 0
        lines.append(f"\n<b>Total:</b> {done_all}/{total_all} · {pct}%")
        await message.answer("\n".join(lines), parse_mode="HTML")
    finally:
        db.close()


@router.message(Command("stats"))
async def cmd_stats(message: Message):
    user = get_user(message.from_user.id, message.from_user.first_name or "User")
    db = SessionLocal()
    try:
        today = date.today()
        ws = get_week_start(today)
        seed_week(db, ws, user.id)
        streak = compute_streak(db, today, user.id)
        week = compute_week_stats(db, ws, user.id)
        await message.answer(
            f"🔥 <b>Streak:</b> {streak} days\n"
            f"📊 <b>Week:</b> {week['done']}/{week['total']} · {week['percent']}%\n\n"
            f"Details in Mini App 👇",
            parse_mode="HTML",
        )
    finally:
        db.close()


@router.message(Command("add"))
async def cmd_add(message: Message, state: FSMContext):
    title = message.text.removeprefix("/add").strip()
    if not title:
        await message.answer("Usage: /add Task name\nExample: /add Buy groceries")
        return
    await state.update_data(title=title)
    await state.set_state(AddTaskStates.waiting_category)
    await message.answer(
        f"Task: <b>{title}</b>\n\nChoose a category:",
        reply_markup=cat_kb(), parse_mode="HTML",
    )


@router.callback_query(AddTaskStates.waiting_category, F.data.startswith("cat:"))
async def pick_category(cb: CallbackQuery, state: FSMContext):
    cat = cb.data.split(":", 1)[1]
    await state.update_data(category=cat)
    await state.set_state(AddTaskStates.waiting_priority)
    await cb.message.edit_text(
        f"{CAT_EMOJI.get(cat, '📌')} <b>{CAT_NAMES.get(cat, cat)}</b>\n\nNow choose priority:",
        reply_markup=prio_kb(), parse_mode="HTML",
    )
    await cb.answer()


@router.callback_query(AddTaskStates.waiting_priority, F.data.startswith("prio:"))
async def pick_priority(cb: CallbackQuery, state: FSMContext):
    prio = cb.data.split(":", 1)[1]
    data = await state.get_data()
    user = get_user(cb.from_user.id, cb.from_user.first_name or "User")
    db = SessionLocal()
    try:
        task = Task(
            user_id=user.id, date=date.today(),
            category=data["category"], title=data["title"],
            priority=prio, done=False, status="todo",
        )
        db.add(task); db.commit()
        await cb.message.edit_text(
            f"✅ <b>Task added!</b>\n\n"
            f"{CAT_EMOJI.get(data['category'], '📌')} {data['title']}\n"
            f"📂 {CAT_NAMES.get(data['category'])}\n"
            f"🏷 {PRIO_LABELS.get(prio)}",
            parse_mode="HTML",
        )
    finally:
        db.close()
    await state.clear()
    await cb.answer()


@router.message(Command("done"))
async def cmd_done(message: Message):
    parts = message.text.split(maxsplit=1)
    if len(parts) < 2 or not parts[1].strip().isdigit():
        await message.answer("Usage: /done <id>\nGet task IDs via /tasks")
        return
    task_id = int(parts[1].strip())
    user = get_user(message.from_user.id, message.from_user.first_name or "User")
    db = SessionLocal()
    try:
        task = db.query(Task).filter(Task.id == task_id, Task.user_id == user.id).first()
        if not task:
            await message.answer("❌ Task not found. Check the ID via /tasks")
            return
        task.done = not task.done
        task.status = "done" if task.done else "todo"
        db.commit()
        status = "✅ Done" if task.done else "🔄 Restored"
        await message.answer(f"{status}: {CAT_EMOJI.get(task.category, '📌')} {task.title}")
    finally:
        db.close()


@router.message(Command("tasks"))
async def cmd_tasks(message: Message):
    user = get_user(message.from_user.id, message.from_user.first_name or "User")
    db = SessionLocal()
    try:
        today = date.today()
        ws = get_week_start(today)
        seed_week(db, ws, user.id)
        lines = [f"📋 <b>Week tasks</b>\n"]
        for i in range(7):
            day = ws + timedelta(days=i)
            tasks = db.query(Task).filter(Task.date == day, Task.user_id == user.id).order_by(Task.id).all()
            mark = "📌" if day == today else "  "
            lines.append(f"\n{mark}<b>{DAY_NAMES[i]} {day.strftime('%d.%m')}</b>:")
            if not tasks:
                lines.append("  (empty)")
            else:
                for t in tasks:
                    check = "✅" if t.done else "☐"
                    lines.append(f"  {check} <code>{t.id}</code> {CAT_EMOJI.get(t.category, '📌')} {t.title}")
        await message.answer("\n".join(lines), parse_mode="HTML")
    finally:
        db.close()
