import os
import hmac
import hashlib
import urllib.parse
import json
from typing import Optional, Dict

BOT_TOKEN = os.getenv("BOT_TOKEN", "")


def parse_init_data(init_data: str) -> Dict[str, str]:
    result = {}
    for pair in init_data.split("&"):
        if "=" not in pair:
            continue
        key, value = pair.split("=", 1)
        result[urllib.parse.unquote(key)] = urllib.parse.unquote(value)
    return result


def _is_dev_mode() -> bool:
    """Skip cryptographic validation when no real bot token is configured."""
    return not BOT_TOKEN or BOT_TOKEN in ("dev_token", "your_telegram_bot_token_here")


def validate_telegram_init_data(init_data: str) -> Optional[Dict[str, str]]:
    """Validate Telegram WebApp initData and return user info."""
    data = parse_init_data(init_data)

    if _is_dev_mode():
        if "user" not in data:
            return None
        user = json.loads(data["user"])
        return {
            "telegram_id": user.get("id"),
            "name": user.get("first_name", "User"),
            "username": user.get("username"),
        }

    received_hash = data.pop("hash", "")
    data_check_arr = [f"{k}={v}" for k, v in sorted(data.items())]
    data_check_string = "\n".join(data_check_arr)

    secret_key = hmac.new(b"WebAppData", BOT_TOKEN.encode(), hashlib.sha256).digest()
    calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

    if not hmac.compare_digest(calculated_hash, received_hash):
        return None

    if "user" not in data:
        return None

    user = json.loads(data["user"])
    return {
        "telegram_id": user.get("id"),
        "name": user.get("first_name", "User"),
        "username": user.get("username"),
    }
