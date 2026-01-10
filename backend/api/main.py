from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
from pathlib import Path

# Add paths for imports
backend_path = str(Path(__file__).parent.parent)
src_path = str(Path(__file__).parent.parent / "src")
sys.path.insert(0, backend_path)
sys.path.insert(0, src_path)

from api.routes import clients, portfolios, optimization, backtests, compliance, providers

app = FastAPI(
    title="Fiscal Lazy Portfolio Pro API",
    description="API B2B pour experts-comptables - Optimisation fiscale et allocation d'actifs",
    version="1.0.0"
)

# CORS pour frontend Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
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
