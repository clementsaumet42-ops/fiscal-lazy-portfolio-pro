FROM python:3.11-slim

WORKDIR /app

# Copier les fichiers du backend
COPY backend/ .

# Installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Exposer le port
EXPOSE 8000

# Démarrer l'application
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
