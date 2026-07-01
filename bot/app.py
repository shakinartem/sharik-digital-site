from __future__ import annotations

import asyncio

from aiogram import Bot, Dispatcher
from aiogram.fsm.storage.memory import MemoryStorage

from bot.config import load_settings
from bot.handlers import build_router
from bot.storage import BotStorage


async def main() -> None:
    settings = load_settings()
    storage = BotStorage(settings.database_path)

    bot = Bot(token=settings.bot_token)
    dp = Dispatcher(storage=MemoryStorage())
    dp.include_router(build_router(storage, settings))

    await dp.start_polling(bot, allowed_updates=dp.resolve_used_update_types())


def run() -> None:
    asyncio.run(main())
