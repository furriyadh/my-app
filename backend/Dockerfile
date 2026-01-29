# Use Python 3.13 slim image (matches local development)
FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Install system dependencies (including bash for start.sh)
RUN apt-get update && apt-get install -y \
    bash \
    gcc  \
    g++  \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app

# Make start script executable
RUN chmod +x start.sh

USER app

# Expose port
EXPOSE 5000

# Health check - use PORT environment variable (Railway sets this to 8080)
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=5 \
    CMD curl -f http://localhost:${PORT:-5000}/api/health || exit 1

# Set as start command (explicitly via bash to avoid shebang/line-ending issues)
CMD ["bash", "./start.sh"]