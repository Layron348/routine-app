from aiogram import Router
from aiogram.filters import CommandStart, Command
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from config import MINI_APP_URL

router = Router()


@router.message(CommandStart())
async def cmd_start(message: Message):
    kb = InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(
            text="📅 Open Routine Week",
            web_app=WebAppInfo(url=MINI_APP_URL),
        )
    ]])
    await message.answer(
        "👋 Hi! This is <b>Routine Week</b> — your weekly planner.\n\n"
        "Commands:\n"
        "• /today — today's tasks\n"
        "• /add &lt;text&gt; — add a task\n"
        "• /week — week progress\n"
        "• /tasks — all tasks\n"
        "• /stats — statistics\n"
        "• /help — help\n\n"
        "Or tap the button below to open the Mini App 👇",
        parse_mode="HTML",
        reply_markup=kb,
    )


@router.message(Command("help"))
async def cmd_help(message: Message):
    await message.answer(
        "ℹ️ <b>Routine Week</b>\n\n"
        "📱 <b>Mini App</b>\n"
        "• /start — open Mini App\n\n"
        "📋 <b>Tasks</b>\n"
        "• /today — today's tasks\n"
        "• /week — week progress\n"
        "• /tasks — all week tasks\n"
        "• /add &lt;text&gt; — add a task\n"
        "• /done &lt;id&gt; — mark done ✔️\n\n"
        "📊 <b>Stats</b>\n"
        "• /stats — streak & stats\n\n"
        "📌 Get task IDs via /tasks",
        parse_mode="HTML",
    )
