FROM python:3.12-slim

# Create a non-root user
RUN useradd -u 1000 -m -s /bin/bash appuser

WORKDIR /app

# Install uv package manager
RUN pip install --no-cache-dir uv

# Environment settings
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_COMPILE_BYTECODE=1 \
    PATH="/app/.venv/bin:$PATH"

# Ensure /app is owned by appuser
RUN chown -R appuser:appuser /app

# Switch to non-root user early to avoid running package sync as root
USER appuser

# Copy dependency specifications
COPY --chown=appuser:appuser pyproject.toml uv.lock ./

# Install dependencies using uv with pre-compiled bytecode
RUN uv sync --frozen --no-dev --compile-bytecode

# Copy application source
COPY --chown=appuser:appuser app.py ./

# Run Celery worker with remote control, gossip, and events disabled (single queue mode)
CMD ["celery", "-A", "app.app", "worker", "--without-gossip", "--without-mingle", "--without-heartbeat", "--loglevel=info"]
