FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM python:3.11-slim
WORKDIR /app

RUN mkdir -p /data

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .
COPY start.sh .
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

ENV DATABASE_URL=sqlite:////data/routine.db

EXPOSE 8000

CMD ["bash", "start.sh"]
