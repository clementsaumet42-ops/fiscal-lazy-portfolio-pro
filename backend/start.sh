#!/bin/sh
# Script de démarrage pour Railway/Docker
# Définit un port par défaut si $PORT n'est pas défini

# Port par défaut si non défini par Railway
export PORT=${PORT:-8000}

echo "🚀 Starting Fiscal Lazy Portfolio Pro API on port $PORT"

# Lancer uvicorn
exec uvicorn api.main:app --host 0.0.0.0 --port $PORT
