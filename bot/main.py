import asyncio
import logging
import sys
from pathlib import Path

# Allow importing backend models / services from the shared DB
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env")

from aiogram import Bot, Dispatcher
from config import BOT_TOKEN
from handlers.start import router as start_router
from handlers.tasks import router as tasks_router

logging.basicConfig(level=logging.INFO)


async def main():
    bot = Bot(token=BOT_TOKEN)
    dp = Dispatcher()
    dp.include_router(start_router)
    dp.include_router(tasks_router)
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
