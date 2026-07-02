# SHARIK Digital Bot MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone Python 3.11+ Telegram bot MVP in `bot/` with deep-link support, profile persistence, checklist delivery, mini-diagnostic flow, and admin lead forwarding.

**Architecture:** Keep the bot self-contained and intentionally small: one `bot/` package, one SQLite-backed persistence layer, one conversation flow module, and one env/settings module. The bot will not depend on the site runtime; it only needs to understand the existing deep-link parameters and align its copy with the site funnel.

**Tech Stack:** Python 3.11+, aiogram 3, SQLite, python-dotenv, optional pydantic-settings, pathlib, dataclasses or simple models, no CRM framework.

---

### Task 1: Create the bot package skeleton and environment contract

**Files:**
- Create: `bot/pyproject.toml`
- Create: `bot/.env.example`
- Create: `bot/bot/__init__.py`
- Create: `bot/bot/config.py`
- Create: `bot/bot/__main__.py`
- Create: `bot/README.md`

- [ ] **Step 1: Write the failing import check**

```python
from bot.config import Settings

def test_settings_module_imports():
    assert Settings is not None
```

- [ ] **Step 2: Run the import check to verify it fails**

Run: `python -m pytest bot/tests/test_config.py -v`
Expected: fail because the package and settings module do not exist yet.

- [ ] **Step 3: Write minimal package and settings implementation**

```python
from dataclasses import dataclass
from pathlib import Path
import os

@dataclass(frozen=True)
class Settings:
    bot_token: str
    admin_chat_id: int
    database_path: Path
    checklist_path: Path
    site_url: str | None = None

    @classmethod
    def from_env(cls) -> "Settings":
        return cls(
            bot_token=os.environ["BOT_TOKEN"],
            admin_chat_id=int(os.environ["ADMIN_CHAT_ID"]),
            database_path=Path(os.getenv("DATABASE_URL", "sqlite:///./bot.db").replace("sqlite:///", "")),
            checklist_path=Path(os.getenv("CHECKLIST_FILE", "assets/checklist.pdf")),
            site_url=os.getenv("SITE_URL") or None,
        )
```

- [ ] **Step 4: Run the import check to verify it passes**

Run: `python -m pytest bot/tests/test_config.py -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add bot/pyproject.toml bot/.env.example bot/bot/__init__.py bot/bot/config.py bot/bot/__main__.py bot/README.md bot/tests/test_config.py
git commit -m "feat: scaffold bot package"
```

### Task 2: Add SQLite persistence for users and diagnostic leads

**Files:**
- Create: `bot/bot/storage.py`
- Create: `bot/bot/models.py`
- Create: `bot/tests/test_storage.py`

- [ ] **Step 1: Write the failing storage test**

```python
from pathlib import Path
from bot.storage import BotStorage

def test_save_and_load_user(tmp_path: Path):
    storage = BotStorage(tmp_path / "bot.db")
    storage.upsert_user(telegram_id=123, username="doc", first_name="Ann", last_name="Lee", language_code="ru", start_param="checklist")
    user = storage.get_user(123)
    assert user is not None
    assert user.telegram_id == 123
```

- [ ] **Step 2: Run the storage test to verify it fails**

Run: `python -m pytest bot/tests/test_storage.py -v`
Expected: fail because `BotStorage` is not implemented.

- [ ] **Step 3: Write minimal SQLite layer**

```python
class BotStorage:
    def __init__(self, db_path: Path) -> None: ...
    def upsert_user(...): ...
    def get_user(self, telegram_id: int): ...
    def save_lead(...): ...
```

- [ ] **Step 4: Run the storage test to verify it passes**

Run: `python -m pytest bot/tests/test_storage.py -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add bot/bot/storage.py bot/bot/models.py bot/tests/test_storage.py
git commit -m "feat: add sqlite storage"
```

### Task 3: Implement bot flow handlers and deep-link routing

**Files:**
- Create: `bot/bot/flow.py`
- Create: `bot/bot/keyboards.py`
- Create: `bot/bot/handlers.py`
- Create: `bot/tests/test_flow.py`

- [ ] **Step 1: Write the failing flow test**

```python
from bot.flow import resolve_start_flow

def test_deep_link_resolution():
    assert resolve_start_flow("checklist") == "checklist"
    assert resolve_start_flow("case_eurodent") == "case"
    assert resolve_start_flow("unknown") == "menu"
```

- [ ] **Step 2: Run the flow test to verify it fails**

Run: `python -m pytest bot/tests/test_flow.py -v`
Expected: fail because the resolver does not exist yet.

- [ ] **Step 3: Write minimal handlers and keyboards**

```python
def resolve_start_flow(param: str | None) -> str: ...
def main_menu_keyboard() -> InlineKeyboardMarkup: ...
```

- [ ] **Step 4: Run the flow test to verify it passes**

Run: `python -m pytest bot/tests/test_flow.py -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add bot/bot/flow.py bot/bot/keyboards.py bot/bot/handlers.py bot/tests/test_flow.py
git commit -m "feat: add bot flow routing"
```

### Task 4: Wire the aiogram app entrypoint and admin lead forwarding

**Files:**
- Create: `bot/bot/app.py`
- Create: `bot/bot/messages.py`
- Create: `bot/tests/test_messages.py`

- [ ] **Step 1: Write the failing message-format test**

```python
from bot.messages import format_lead_message

def test_lead_message_contains_key_fields():
    text = format_lead_message(...)
    assert "Telegram ID" in text
    assert "Источник" in text
```

- [ ] **Step 2: Run the message test to verify it fails**

Run: `python -m pytest bot/tests/test_messages.py -v`
Expected: fail because formatter does not exist yet.

- [ ] **Step 3: Write the app wiring**

```python
async def main() -> None:
    ...
    await dp.start_polling(bot)
```

- [ ] **Step 4: Run the message test to verify it passes**

Run: `python -m pytest bot/tests/test_messages.py -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add bot/bot/app.py bot/bot/messages.py bot/tests/test_messages.py
git commit -m "feat: wire aiogram app"
```

### Task 5: Document run instructions and verify the MVP

**Files:**
- Modify: `bot/README.md`
- Modify: `bot/.env.example`
- Create or modify: `bot/tests/test_imports.py`

- [ ] **Step 1: Add a top-level import smoke test**

```python
def test_bot_package_imports():
    import bot
```

- [ ] **Step 2: Run the full bot test suite**

Run: `python -m pytest bot/tests -v`
Expected: all tests pass.

- [ ] **Step 3: Run a static import/lint check if available**

Run: `python -m compileall bot`
Expected: no syntax errors.

- [ ] **Step 4: Update README with exact launch steps**

```md
python -m venv .venv
.venv\Scripts\activate
pip install -e .
python -m bot
```

- [ ] **Step 5: Commit**

```bash
git add bot/README.md bot/.env.example bot/tests/test_imports.py
git commit -m "docs: add bot run instructions"
```

**Coverage check:** This plan covers `/start`, deep links, profile persistence, checklist delivery, mini-diagnostic flow, admin lead forwarding, `/cancel`, `/menu`, env config, and README instructions. The only manual dependency left is the checklist PDF asset and the real bot token/admin chat id.
