FROM python:3.11-slim

WORKDIR /app

# Copier les fichiers du backend
COPY backend/ .

# Installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Rendre exécutable le script de démarrage
RUN chmod +x /app/start.sh

# Exposer le port (dynamique)
EXPOSE $PORT

# Démarrer l'application avec le script
CMD ["/app/start.sh"]
