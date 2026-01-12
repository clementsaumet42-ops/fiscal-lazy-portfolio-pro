# Use full Python image with pre-compiled scientific libs
FROM python:3.11

WORKDIR /app

# Copy only requirements first for better Docker layer caching
COPY backend/requirements-prod.txt .

# Install dependencies with optimizations
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements-prod.txt

# Copy rest of application
COPY backend/ .

# Make startup script executable
RUN chmod +x /app/start.sh

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import sys; import httpx; sys.exit(0) if httpx.get('http://localhost:8000/health', timeout=5.0).status_code == 200 else sys.exit(1)" || exit 1

# Expose the port (dynamically set)
EXPOSE $PORT

# Start the application with the script
CMD ["/app/start.sh"]
