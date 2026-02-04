FROM node:18-slim

# Set working directory
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json ./
COPY server.js ./

# Install dependencies
RUN npm install --production

# Create data directory for SQLite if needed
RUN mkdir -p /app/data

# Create non-root user
RUN groupadd -r todoapp && useradd -r -g todoapp -d /app todoapp
RUN chown -R todoapp:todoapp /app

# Switch to non-root user
USER todoapp

# Expose port
EXPOSE 8000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Add labels
LABEL maintainer="Evolution of Todo Team"
LABEL description="Todo Application Backend Service (Node.js)"
LABEL version="1.0.0"

# Start the server
CMD ["npm", "start"]
