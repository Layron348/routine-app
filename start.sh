#!/bin/bash
set -e

echo "=== Starting Routine Week ==="
echo "WORKDIR: $(pwd)"
echo "DATABASE_URL: $DATABASE_URL"
echo "SECRET_KEY set: $([ -n "$SECRET_KEY" ] && echo YES || echo NO)"
echo "CORS_ORIGINS: $CORS_ORIGINS"
echo "Dist dir exists: $([ -d /app/frontend/dist ] && echo YES || echo NO)"

exec uvicorn app.main:app --host 0.0.0.0 --port 8000
