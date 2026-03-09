# Stage 1: Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Stage 2: Backend with built frontend
FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg wget \
    && rm -rf /var/lib/apt/lists/*

# mp4_merge: download the correct binary for the target architecture
ARG TARGETARCH
RUN if [ "$TARGETARCH" = "arm64" ]; then \
      wget -q https://github.com/gyroflow/mp4-merge/releases/download/v0.1.11/mp4_merge-linux-arm64 \
        -O /usr/local/bin/mp4_merge; \
    else \
      wget -q https://github.com/gyroflow/mp4-merge/releases/download/v0.1.11/mp4_merge-linux64 \
        -O /usr/local/bin/mp4_merge; \
    fi && chmod +x /usr/local/bin/mp4_merge

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .
COPY --from=frontend-build /app/frontend/dist /app/static/spa

RUN mkdir -p /app/data

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
