#!/bin/bash
# Startup script for Render deployment

# Set Python path to include backend/src
export PYTHONPATH=/opt/render/project/src/backend/src:/opt/render/project/src/backend:$PYTHONPATH

# Change to backend directory
cd backend

# Start uvicorn
exec uvicorn api.main:app --host 0.0.0.0 --port ${PORT:-8000}
