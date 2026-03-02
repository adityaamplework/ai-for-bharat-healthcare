# ============================================
# Stage: frontend
# ============================================
FROM node:20-alpine AS frontend-build

WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM nginx:alpine AS frontend
COPY --from=frontend-build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1
CMD ["nginx", "-g", "daemon off;"]

# ============================================
# Stage: backend
# ============================================
FROM node:20-alpine AS backend

WORKDIR /app
RUN apk add --no-cache wget

COPY backend/package*.json ./
RUN npm ci --prefer-offline --no-audit

COPY backend/tsconfig.json ./
COPY backend/drizzle.config.ts ./
COPY backend/build.ts ./
COPY backend/schema.ts ./
COPY backend/schema-chat.ts ./
COPY backend/src ./src
COPY backend/start.sh ./start.sh
RUN chmod +x ./start.sh

EXPOSE 5000
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1
CMD ["./start.sh"]

# ============================================
# Stage: ai-service
# ============================================
FROM python:3.12-slim AS ai-service

WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy project definition and lock file
COPY ai_services/pyproject.toml ai_services/uv.lock ai_services/.python-version ./ai_services/

# Install dependencies via uv (cached layer)
RUN cd ai_services && uv sync --frozen --no-dev

# Copy application code
COPY ai_services/ ./ai_services/

EXPOSE 5001
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5001/health').read()"
CMD ["uv", "run", "--project", "ai_services", "python", "-m", "uvicorn", "ai_services.main:app", "--host", "0.0.0.0", "--port", "5001"]
