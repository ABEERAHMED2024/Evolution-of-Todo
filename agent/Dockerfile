FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user for security
RUN groupadd -r todoagent && useradd -r -g todoagent todoagent
RUN chown -R todoagent:todoagent /app
USER todoagent

# Expose port
EXPOSE 8001

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8001/health || exit 1

# Labels
LABEL maintainer="Evolution of Todo Team"
LABEL description="Todo Application AI Agent Service"
LABEL version="1.0.0"

# Start application
CMD ["python", "main.py"]
