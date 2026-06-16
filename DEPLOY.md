# Deploy Routine Week

Практичный вариант для запуска сегодня: один Ubuntu-сервер, nginx отдаёт `frontend/dist`, а `/api` проксируется в FastAPI на `127.0.0.1:8000`. Бот запускается отдельным systemd-сервисом.

## 1. Подготовка сервера

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip nodejs npm nginx
```

Скопируй проект на сервер, например в `/opt/routine-week`.

## 2. `.env`

В корне проекта:

```bash
cp .env.example .env
nano .env
```

Для production обычно достаточно:

```env
BOT_TOKEN=token_from_botfather
MINI_APP_URL=https://your-domain.com
BACKEND_URL=https://your-domain.com/api
DATABASE_URL=sqlite:////opt/routine-week/backend/routine.db
CORS_ORIGINS=https://your-domain.com
VITE_API_BASE_URL=/api
```

## 3. Backend

```bash
cd /opt/routine-week/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Проверка:

```bash
curl http://127.0.0.1:8000/api/health
```

## 4. Frontend

```bash
cd /opt/routine-week/frontend
npm ci
npm run build
```

## 5. nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /opt/routine-week/frontend/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri /index.html;
    }
}
```

После добавления конфига:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Для Telegram Mini App нужен HTTPS. Самый быстрый путь:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 6. systemd services

Backend `/etc/systemd/system/routine-week-api.service`:

```ini
[Unit]
Description=Routine Week API
After=network.target

[Service]
WorkingDirectory=/opt/routine-week/backend
EnvironmentFile=/opt/routine-week/.env
ExecStart=/opt/routine-week/backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Bot `/etc/systemd/system/routine-week-bot.service`:

```ini
[Unit]
Description=Routine Week Telegram Bot
After=network.target

[Service]
WorkingDirectory=/opt/routine-week/bot
EnvironmentFile=/opt/routine-week/.env
ExecStart=/opt/routine-week/bot/.venv/bin/python main.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Bot dependencies:

```bash
cd /opt/routine-week/bot
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Enable services:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now routine-week-api
sudo systemctl enable --now routine-week-bot
sudo systemctl status routine-week-api routine-week-bot
```

