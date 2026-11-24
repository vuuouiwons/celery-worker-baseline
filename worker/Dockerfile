# Stage 1: Build virtual environment with uv
FROM python:3.14-alpine AS builder

WORKDIR /app

# Install uv package manager in builder only
RUN pip install --no-cache-dir uv

ENV UV_COMPILE_BYTECODE=1 \
    UV_NO_CACHE=1

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --compile-bytecode

# Stage 2: Minimal production runtime image
FROM python:3.14-alpine AS runner

RUN adduser -D -u 1000 appuser

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/app/.venv/bin:$PATH"

COPY --from=builder --chown=appuser:appuser /app/.venv /app/.venv
COPY --chown=appuser:appuser app.py ./

USER appuser

# Run Celery worker with remote control, gossip, and events disabled (single queue mode)
CMD ["celery", "-A", "app.app", "worker", "--without-gossip", "--without-mingle", "--without-heartbeat", "--loglevel=info"]
