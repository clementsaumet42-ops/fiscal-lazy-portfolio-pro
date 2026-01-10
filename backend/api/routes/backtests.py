from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, List, Optional
import sys
sys.path.append("backend/src")

from analytics.backtesting import BacktestEngine, FrequenceReequilibrage
from analytics.monte_carlo import MonteCarloSimulator

router = APIRouter()


class BacktestRequest(BaseModel):
    allocation: Dict[str, float]  # {ticker: poids%}
    date_debut: Optional[str] = None
    date_fin: Optional[str] = None
    frequence_reequilibrage: str = "trimestriel"
    frais_transaction: float = 0.001


class MonteCarloRequest(BaseModel):
    valeur_initiale: float
    rendement_moyen_annuel: float
    volatilite_annuelle: float
    nb_annees: int = 30
    nb_simulations: int = 10000
    apports_annuels: float = 0
    retraits_annuels: float = 0
    objectif_capital: Optional[float] = None


@router.post("/backtest")
def lancer_backtest(request: BacktestRequest):
    """Lance un backtest complet d'une allocation"""
    try:
        engine = BacktestEngine()
        
        # Pour démo: générer des données synthétiques
        # En production: utiliser vraies données via yfinance
        import pandas as pd
        import numpy as np
        from datetime import datetime, timedelta
        
        # Générer données synthétiques
        date_debut = pd.to_datetime(request.date_debut) if request.date_debut else pd.to_datetime("2020-01-01")
        date_fin = pd.to_datetime(request.date_fin) if request.date_fin else pd.to_datetime("2024-01-01")
        
        dates = pd.date_range(date_debut, date_fin, freq='D')
        
        prix_historiques = {}
        for ticker in request.allocation.keys():
            # Prix synthétique: brownian motion
            nb_jours = len(dates)
            rendements = np.random.normal(0.0003, 0.01, nb_jours)
            prix = 100 * np.exp(np.cumsum(rendements))
            prix_historiques[ticker] = pd.Series(prix, index=dates)
        
        # Lancer backtest
        freq = FrequenceReequilibrage(request.frequence_reequilibrage)
        
        resultats = engine.backtester_allocation(
            allocation=request.allocation,
            prix_historiques=prix_historiques,
            date_debut=request.date_debut,
            date_fin=request.date_fin,
            frequence_reequilibrage=freq,
            frais_transaction=request.frais_transaction
        )
        
        return {
            "success": True,
            "resultats": resultats
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.post("/monte-carlo")
def lancer_monte_carlo(request: MonteCarloRequest):
    """Lance une simulation Monte Carlo"""
    try:
        simulator = MonteCarloSimulator()
        
        resultats = simulator.analyser_simulation_complete(
            valeur_initiale=request.valeur_initiale,
            rendement_moyen_annuel=request.rendement_moyen_annuel,
            volatilite_annuelle=request.volatilite_annuelle,
            nb_annees=request.nb_annees,
            nb_simulations=request.nb_simulations,
            apports_annuels=request.apports_annuels,
            retraits_annuels=request.retraits_annuels,
            objectif_capital=request.objectif_capital
        )
        
        return {
            "success": True,
            "resultats": resultats
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.get("/demo/backtest-60-40")
def demo_backtest_60_40():
    """Démo: backtest d'un portefeuille 60/40"""
    try:
        engine = BacktestEngine()
        
        # Portfolio 60% actions / 40% obligations
        allocation = {
            "EWLD.PA": 60.0,  # Actions monde
            "AGGH.PA": 40.0   # Obligations
        }
        
        # Générer données synthétiques pour démo
        import pandas as pd
        import numpy as np
        
        dates = pd.date_range("2020-01-01", "2024-01-01", freq='D')
        
        # Actions: rendement 7%, volatilité 15%
        rdt_actions = np.random.normal(0.07/252, 0.15/np.sqrt(252), len(dates))
        prix_actions = 100 * np.exp(np.cumsum(rdt_actions))
        
        # Obligations: rendement 3%, volatilité 5%
        rdt_oblig = np.random.normal(0.03/252, 0.05/np.sqrt(252), len(dates))
        prix_oblig = 100 * np.exp(np.cumsum(rdt_oblig))
        
        prix_historiques = {
            "EWLD.PA": pd.Series(prix_actions, index=dates),
            "AGGH.PA": pd.Series(prix_oblig, index=dates)
        }
        
        resultats = engine.backtester_allocation(
            allocation=allocation,
            prix_historiques=prix_historiques,
            frequence_reequilibrage=FrequenceReequilibrage.TRIMESTRIEL
        )
        
        return {
            "success": True,
            "portfolio": "60/40 Actions/Obligations",
            "resultats": resultats
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.get("/demo/monte-carlo")
def demo_monte_carlo():
    """Démo: simulation Monte Carlo 30 ans"""
    try:
        simulator = MonteCarloSimulator(seed=42)
        
        resultats = simulator.analyser_simulation_complete(
            valeur_initiale=100000,
            rendement_moyen_annuel=0.07,
            volatilite_annuelle=0.15,
            nb_annees=30,
            nb_simulations=10000,
            apports_annuels=5000,
            retraits_annuels=0
        )
        
        return {
            "success": True,
            "scenario": "100k€ + 5k€/an sur 30 ans",
            "resultats": resultats
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
