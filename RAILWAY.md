# 🚂 Guide de déploiement Railway

Ce guide explique comment déployer Fiscal Lazy Portfolio Pro sur Railway.

## 📋 Prérequis

- Compte Railway ([railway.app](https://railway.app))
- Repository GitHub connecté à Railway

## 🚀 Déploiement sur Railway

### Option 1 : Déploiement depuis GitHub (Recommandé)

1. **Connectez votre repository**
   - Allez sur [railway.app/new](https://railway.app/new)
   - Cliquez sur "Deploy from GitHub repo"
   - Sélectionnez `clementsaumet42-ops/fiscal-lazy-portfolio-pro`

2. **Configuration automatique**
   - Railway détectera automatiquement les fichiers de configuration :
     - `Procfile` : Commande de démarrage
     - `railway.json` : Configuration du service
     - `nixpacks.toml` : Configuration de build

3. **Variables d'environnement (optionnel)**
   - Railway configurera automatiquement `PORT`
   - `PYTHONPATH` est déjà défini dans `nixpacks.toml`

4. **Déploiement**
   - Railway lancera automatiquement le build et le déploiement
   - Vous obtiendrez une URL publique (ex: `https://votre-app.up.railway.app`)

### Option 2 : Déploiement via CLI Railway

```bash
# Installation de la CLI Railway
npm i -g @railway/cli

# Login
railway login

# Lien avec le projet
railway link

# Déploiement
railway up
```

## 📦 Fichiers de configuration

### Procfile
Définit la commande de démarrage pour Railway :
```
web: cd backend && uvicorn api.main:app --host 0.0.0.0 --port $PORT
```

### railway.json
Configuration du service Railway :
- Builder : Nixpacks
- Build command : Installation des dépendances Python
- Start command : Lancement de l'API avec uvicorn

### nixpacks.toml
Configuration de l'environnement de build :
- Python 3.11
- PYTHONPATH configuré
- Installation des requirements

## 🔧 Configuration manuelle (si nécessaire)

Si Railway ne détecte pas automatiquement la configuration :

1. **Settings → Deploy**
   - Build Command : `cd backend && pip install -r requirements.txt`
   - Start Command : `cd backend && uvicorn api.main:app --host 0.0.0.0 --port $PORT`

2. **Settings → Environment Variables**
   - `PYTHONPATH` = `/app/backend/src:/app/backend`
   - `PYTHON_VERSION` = `3.11`

## ✅ Vérification du déploiement

Après le déploiement, vérifiez :

1. **Status du service**
   - Vert ✓ : Service actif
   - Rouge ✗ : Erreur (voir les logs)

2. **Test de l'API**
   - Accédez à `https://votre-app.up.railway.app/`
   - Documentation : `https://votre-app.up.railway.app/docs`
   - Health check : `https://votre-app.up.railway.app/health`

3. **Logs**
   - Via le dashboard Railway : View Logs
   - Via CLI : `railway logs`

## 🐛 Dépannage

### Erreur : Module not found

**Solution** : Vérifiez que `PYTHONPATH` est correctement configuré dans les variables d'environnement :
```
PYTHONPATH=/app/backend/src:/app/backend
```

### Erreur : Port binding

**Solution** : Railway fournit automatiquement la variable `$PORT`. Assurez-vous que uvicorn utilise `--port $PORT`.

### Build échoue

**Solution** : 
1. Vérifiez les logs de build dans Railway
2. Assurez-vous que `backend/requirements.txt` est présent
3. Essayez "Clear Build Cache" dans Railway settings

## 🔄 Redéploiement

### Automatique
Pushez vos changements sur GitHub :
```bash
git push origin main
```
Railway redéploiera automatiquement.

### Manuel
Via le dashboard Railway :
1. Cliquez sur votre service
2. "Deploy" → "Redeploy"

Via CLI :
```bash
railway up
```

## 📊 Monitoring

Railway fournit :
- **Metrics** : CPU, RAM, Network
- **Logs** : Logs en temps réel
- **Deployments** : Historique des déploiements

## 💰 Coûts

Railway offre :
- **Plan gratuit** : $5 de crédits/mois
- **Plan Pro** : $20/mois avec crédits inclus

Le plan gratuit est suffisant pour tester l'application.

## 📚 Ressources

- [Documentation Railway](https://docs.railway.app/)
- [Railway Discord](https://discord.gg/railway)
- [Nixpacks](https://nixpacks.com/)

## ✅ Configuration validée

- ✓ API démarre correctement (47 routes)
- ✓ Tests passent (7/7)
- ✓ Configuration PYTHONPATH correcte
- ✓ Compatible Python 3.11
