FROM python:3.11-slim

WORKDIR /app

# Copier les fichiers du backend
COPY backend/ .

# Installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Exposer le port (dynamique)
EXPOSE $PORT

# Démarrer l'application avec le port dynamique de Railway
CMD ["sh", "-c", "uvicorn api.main:app --host 0.0.0.0 --port $PORT"]
