FROM python:3.11-slim

WORKDIR /app

# Copier les fichiers du backend
COPY backend/ .

# Installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Copier et rendre exécutable le script de démarrage
COPY backend/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Exposer le port (dynamique)
EXPOSE $PORT

# Démarrer l'application avec le script
CMD ["/app/start.sh"]
