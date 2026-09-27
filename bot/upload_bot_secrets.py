"""Загружает секреты воркера из bot/.env.

Значения не печатаются: команда выводит только факт успеха.
Скрипт существует, потому что `wrangler secret put` читает значение из
стандартного ввода, и передавать его через PowerShell пришлось бы
кавычками, которые там ломаются.
"""

import os
import subprocess
import sys
from pathlib import Path

# npx на Windows — это npx.cmd, и обычный поиск по PATH его не находит:
# CreateProcess ищет исполняемый файл, а не пакетный.
NPX = os.path.join(os.path.dirname(os.path.abspath(sys.executable)), "npx.cmd")
if not os.path.exists(NPX):
    NPX = "npx.cmd"

ROOT = Path(__file__).resolve().parent.parent  # корень sharik-digital-site
ENV_FILE = ROOT / "bot" / ".env"

SECRETS = ("BOT_TOKEN", "ADMIN_CHAT_ID", "WEBHOOK_SECRET")


def read_env() -> dict[str, str]:
    values: dict[str, str] = {}
    for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip()
    return values


def main() -> int:
    if not ENV_FILE.exists():
        print("нет bot/.env — положите токен, ADMIN_CHAT_ID и WEBHOOK_SECRET")
        return 1

    env = read_env()
    failed = False

    for name in SECRETS:
        value = env.get(name)
        if not value:
            print(f"{name}: нет значения, пропущено")
            failed = True
            continue
        proc = subprocess.run(
            [NPX, "wrangler", "secret", "put", name],
            input=value,
            text=True,
            capture_output=True,
            cwd=str(ROOT / "workers" / "telegram-bot"),
        )
        output = (proc.stdout or "") + (proc.stderr or "")
        ok = "Success" in output
        print(f"{name}: {'ок' if ok else 'ошибка'} (длина {len(value)})")
        if not ok:
            failed = True
            print("  " + output.strip().splitlines()[-1][:120])

    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
