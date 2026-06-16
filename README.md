# 📅 Routine Week

Telegram Mini App для управления недельным планом: смены, тренировки, проект, задачи, стрик.

---

## Структура проекта

```
routine-week/
├── .env.example
├── README.md
├── bot/            # Telegram Bot (aiogram)
│   ├── requirements.txt
│   ├── config.py
│   ├── main.py
│   └── handlers/
│       └── start.py
├── backend/        # FastAPI + SQLite
│   ├── requirements.txt
│   └── app/
│       ├── main.py
│       ├── db.py
│       ├── api/routes.py
│       ├── models/task.py
│       └── services/
│           ├── schedule.py
│           └── streak.py
└── frontend/       # React + TypeScript + Vite
    ├── package.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── styles.css
        ├── types/index.ts
        ├── hooks/usePlan.ts
        └── components/
            ├── Header.tsx
            ├── StreakPanel.tsx
            ├── WeekTimeline.tsx
            └── DayCard.tsx
```

---

## Быстрый старт

### 1. Переменные окружения

```bash
cp .env.example .env
# Вставь свой BOT_TOKEN от @BotFather
```

### 2. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Проверка: [http://localhost:8000/api/health](http://localhost:8000/api/health)

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### 4. Bot (опционально для локального теста)

```bash
cd bot
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python main.py
```

> ⚠️ Для Telegram Mini App кнопка `web_app` требует **HTTPS** URL.
> Для локальной разработки используй [ngrok](https://ngrok.com/):
> ```bash
> ngrok http 5173
> ```
> Затем поставь https-адрес в `.env` → `MINI_APP_URL`.

---

## API

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/health` | Проверка сервера |
| GET | `/api/plan` | Недельный план с задачами |
| GET | `/api/stats` | Стрик и статистика |
| POST | `/api/tasks/toggle` | Переключить статус задачи |

### POST `/api/tasks/toggle`
```json
{ "task_id": 1 }
```

---

## Логика расписания

По умолчанию (настраивается в `backend/app/services/schedule.py`):

| День | Смена | Тренировка |
|------|-------|------------|
| Пн   | 13:00 | ✅ |
| Вт   | 10:00 | — |
| Ср   | —     | ✅ |
| Чт   | 9:00  | — |
| Пт   | 13:00 | ✅ |
| Сб   | 10:00 | — |
| Вс   | —     | — |

---

## Что дальше

- [ ] Напоминания в боте
- [ ] Вкладка "Проект" с таймером
- [ ] Режимы дня (утро / вечер)
- [ ] Привычки и трекер
- [ ] Календарь на месяц
- [ ] Push-уведомления
