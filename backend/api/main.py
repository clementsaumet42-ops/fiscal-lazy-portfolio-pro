from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
from pathlib import Path

# Add paths for imports
backend_path = str(Path(__file__).parent.parent)
src_path = str(Path(__file__).parent.parent / "src")
sys.path.insert(0, backend_path)
sys.path.insert(0, src_path)

from api.routes import clients, portfolios, optimization, backtests, compliance, providers, etfs, audit, parametres_fiscaux, ged

app = FastAPI(
    title="Fiscal Lazy Portfolio Pro API",
    description="""
    **API B2B pour experts-comptables français**
    
    Plateforme professionnelle d'optimisation fiscale et d'allocation d'actifs.
    
    ## Fonctionnalités Principales
    
    ### 1. Gestion ETFs
    - Listing complet de l'univers d'ETFs (24 ETFs)
    - Vérification automatique d'éligibilité par enveloppe (PEA, CTO, AV, PER)
    - Recommandations personnalisées selon profil de risque
    - Détails complets (TER, classe d'actif, distribution, etc.)
    
    ### 2. Audit de Portefeuille
    - Analyse complète de l'allocation (par classe d'actif, enveloppe, zone géo)
    - Calcul des scores (diversification, fiscal, global)
    - Détection des problèmes d'éligibilité
    - Estimation des économies fiscales
    - Recommandations personnalisées
    
    ### 3. Optimisation Fiscale
    - Asset Location optimale
    - Tax-Loss Harvesting pour CTO
    - Calcul de l'ordre de retrait optimal
    - Lifecycle investing avec glide paths
    - Rééquilibrage intelligent
    
    ### 4. Backtesting & Analytics
    - Backtests historiques (2000-2024)
    - Simulations Monte Carlo
    - Métriques institutionnelles (Sharpe, Sortino, Calmar, VaR, CVaR)
    - Maximum Drawdown avec tracking
    
    ### 5. Conformité Juridique
    - Vérification automatique selon CGI (Code Général des Impôts)
    - Références légales: Art. 150-0 A (PEA), 209-0 A (IS), 125-0 A (AV), etc.
    - Rapports de conformité
    
    ## Déploiement
    
    - **Backend API**: Déployé sur Railway (https://railway.app)
    - **Frontend**: Déployé sur Vercel (https://vercel.com)
    
    ## Support
    
    Pour questions techniques: Voir documentation complète dans /docs
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    contact={
        "name": "Fiscal Lazy Portfolio Pro",
        "url": "https://github.com/clementsaumet42-ops/fiscal-lazy-portfolio-pro"
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT"
    }
)

# CORS pour frontend Next.js
# NOTE: In production, replace with specific Vercel domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        # TODO: Replace with actual Vercel domain in production
        # "https://your-app.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(clients.router, prefix="/api/clients", tags=["Clients"])
app.include_router(portfolios.router, prefix="/api/portfolios", tags=["Portfolios"])
app.include_router(optimization.router, prefix="/api/optimization", tags=["Optimization"])
app.include_router(backtests.router, prefix="/api/backtests", tags=["Backtests"])
app.include_router(compliance.router, prefix="/api/compliance", tags=["Compliance"])
app.include_router(providers.router, prefix="/api/providers", tags=["Providers"])
app.include_router(etfs.router, prefix="/api/etfs", tags=["ETFs"])
app.include_router(audit.router, prefix="/api/audit", tags=["Audit"])
app.include_router(parametres_fiscaux.router, prefix="/api/parametres-fiscaux", tags=["Paramètres Fiscaux"])
app.include_router(ged.router, prefix="/api/ged", tags=["GED"])


@app.get("/")
def root():
    return {
        "message": "Fiscal Lazy Portfolio Pro API",
        "version": "1.0.0",
        "documentation": "/docs",
        "target": "Experts-comptables français"
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
