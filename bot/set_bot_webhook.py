"""Ставит вебхук Telegram на задеплоенного воркера.

URL собирается из адреса воркера и WEBHOOK_SECRET, который лежит в
bot/.env и уже загружен в воркер как secret. Токен в вывод не
попадает: печатается только результат ответа Telegram.
"""

import json
import os
import subprocess
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ENV_FILE = ROOT / "bot" / ".env"

WORKER_URL = "https://sharik-digital-telegram-bot.sakinartem28.workers.dev"


def read_env() -> dict[str, str]:
    values: dict[str, str] = {}
    for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip()
    return values


def call(token: str, method: str, payload: dict | None = None) -> dict:
    url = f"https://api.telegram.org/bot{token}/{method}"
    data = json.dumps(payload).encode() if payload is not None else b""
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())


def main() -> int:
    env = read_env()
    token = env.get("BOT_TOKEN")
    secret = env.get("WEBHOOK_SECRET")
    if not token or not secret:
        print("нет BOT_TOKEN или WEBHOOK_SECRET в bot/.env")
        return 1

    url = f"{WORKER_URL}/webhook/{secret}"

    info = call(token, "getWebhookInfo")
    print("текущий вебхук:", info.get("result", {}).get("url") or "не задан")
    print("ошибок доставки:", info.get("result", {}).get("last_error_message") or "нет")

    result = call(token, "setWebhook", {"url": url, "secret_token": secret, "drop_pending_updates": True})
    if not result.get("ok"):
        print("setWebhook не удался:", result.get("description"))
        return 1
    print("вебхук установлен:", url)

    check = call(token, "getWebhookInfo")["result"]
    print("подтверждено Telegram:", check.get("url") == url)
    print("pending_updates:", check.get("pending_update_count"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
