from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

from models.position import Position
from models.enveloppe import PEA, CTO, AssuranceVie, PER

router = APIRouter()

# Stockage en mémoire
portfolios_db = {}


class PortfolioRequest(BaseModel):
    client_id: str
    enveloppes: List[dict]
    positions: List[dict]


@router.post("/")
def creer_portfolio(portfolio: PortfolioRequest):
    """Crée ou met à jour le portefeuille d'un client"""
    portfolio_id = f"ptf_{portfolio.client_id}"
    
    portfolios_db[portfolio_id] = {
        "client_id": portfolio.client_id,
        "enveloppes": portfolio.enveloppes,
        "positions": portfolio.positions
    }
    
    return {
        "success": True,
        "portfolio_id": portfolio_id,
        "message": "Portefeuille créé/mis à jour"
    }


@router.get("/{client_id}")
def get_portfolio(client_id: str):
    """Récupère le portefeuille d'un client"""
    portfolio_id = f"ptf_{client_id}"
    
    if portfolio_id not in portfolios_db:
        return {
            "success": True,
            "portfolio": {
                "client_id": client_id,
                "enveloppes": [],
                "positions": []
            }
        }
    
    return {
        "success": True,
        "portfolio": portfolios_db[portfolio_id]
    }


@router.post("/{client_id}/positions")
def ajouter_position(client_id: str, position: Position):
    """Ajoute une position au portefeuille"""
    portfolio_id = f"ptf_{client_id}"
    
    if portfolio_id not in portfolios_db:
        portfolios_db[portfolio_id] = {
            "client_id": client_id,
            "enveloppes": [],
            "positions": []
        }
    
    position.calculer_valeurs()
    portfolios_db[portfolio_id]["positions"].append(position.dict())
    
    return {
        "success": True,
        "message": "Position ajoutée"
    }


@router.get("/{client_id}/valorisation")
def get_valorisation(client_id: str):
    """Calcule la valorisation totale du portefeuille"""
    portfolio_id = f"ptf_{client_id}"
    
    if portfolio_id not in portfolios_db:
        return {
            "success": True,
            "valorisation_totale": 0,
            "par_enveloppe": {}
        }
    
    portfolio = portfolios_db[portfolio_id]
    positions = portfolio.get("positions", [])
    
    valorisation_totale = sum(p.get("valeur_actuelle", 0) for p in positions)
    
    # Par enveloppe
    par_enveloppe = {}
    for position in positions:
        env_id = position.get("enveloppe_id", "unknown")
        if env_id not in par_enveloppe:
            par_enveloppe[env_id] = 0
        par_enveloppe[env_id] += position.get("valeur_actuelle", 0)
    
    return {
        "success": True,
        "valorisation_totale": round(valorisation_totale, 2),
        "par_enveloppe": {k: round(v, 2) for k, v in par_enveloppe.items()}
    }


@router.post("/import-csv")
async def import_csv(file_data: dict):
    """Importe des positions depuis CSV"""
    # Simplifié - parser CSV en production
    return {
        "success": True,
        "message": "Import CSV effectué",
        "positions_importees": 0
    }
