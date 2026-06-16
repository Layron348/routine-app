# AGENTS.md — Routine Week

High-signal notes for agents working in this repo.

## Stack
- **Backend**: Python 3.11+, FastAPI, SQLAlchemy 2.x, SQLite dev / PostgreSQL prod
- **Frontend**: React 18, TypeScript, Vite 5
- **Bot**: aiogram 3 Telegram bot
- **Auth**: JWT (python-jose) + bcrypt via `/api/auth/*`

## Key files
- Backend entry: `backend/app/main.py`
- DB/session: `backend/app/db.py`
- Auth dependency: `backend/app/auth.py` (reads `SECRET_KEY` from env)
- Routes: `backend/app/api/routes.py`
- Models: `backend/app/models/{task,user}.py`
- Frontend entry: `frontend/src/main.tsx`
- API hook: `frontend/src/hooks/usePlan.ts`

## Env vars
Create `.env` from `.env.example`. Required:
```env
BOT_TOKEN=...
MINI_APP_URL=...       # HTTPS URL for Telegram web_app button
DATABASE_URL=...       # default sqlite:///./routine.db
SECRET_KEY=...         # MUST be set in production; no default fallback allowed
CORS_ORIGINS=...       # comma-separated; default "*"
```

## Dev commands
```bash
# Backend
cd backend
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev           # http://localhost:5173

# Mock API only (no auth required, for quick UI tests)
node dev-mock-api.mjs
```

## Build / verify
```bash
cd frontend
npm run build         # tsc + vite build
```

## Auth & multi-user
- All `/api/*` task routes depend on `get_current_user` and filter by `current_user.id`.
- `Task.user_id` is required and indexed.
- `seed_week()` creates default tasks per user, per week.
- Frontend stores `token` and `user` in `localStorage` and sends `Authorization: Bearer <token>`.

## Safety
- Never commit `.env` or `routine.db`.
- `SECRET_KEY` must be strong in production; current code had a weak fallback that should be removed.

## Frontend proxy
Vite proxies `/api` to `http://localhost:8000` via `frontend/vite.config.ts`.
