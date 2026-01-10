from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
import sys
sys.path.append("src")

from legal.compliance_engine import ComplianceEngine
from legal.fiscal_rules import FiscalRules

router = APIRouter()


class ComplianceRequest(BaseModel):
    enveloppes: List[dict]
    positions: List[dict]
    etfs_db: dict


@router.post("/verifier")
def verifier_conformite(request: ComplianceRequest):
    """Vérifie la conformité complète d'un portefeuille"""
    try:
        engine = ComplianceEngine()
        
        resultats = engine.verifier_conformite_portefeuille(
            enveloppes=request.enveloppes,
            positions=request.positions,
            etfs_db=request.etfs_db
        )
        
        return {
            "success": True,
            "conformite": resultats
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.post("/rapport")
def generer_rapport_conformite(request: ComplianceRequest):
    """Génère un rapport de conformité pour expert-comptable"""
    try:
        engine = ComplianceEngine()
        
        rapport = engine.generer_rapport_conformite(
            enveloppes=request.enveloppes,
            positions=request.positions,
            etfs_db=request.etfs_db
        )
        
        return {
            "success": True,
            "rapport": rapport
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.post("/pea/eligibilite")
def verifier_eligibilite_pea(etf: dict):
    """Vérifie l'éligibilité PEA d'un ETF"""
    try:
        resultat = FiscalRules.verifier_eligibilite_pea(etf)
        
        return {
            "success": True,
            "eligibilite": resultat
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.post("/pea/plafond")
def verifier_plafond_pea(montant_verse: float, nouveau_versement: float = 0):
    """Vérifie le respect du plafond PEA"""
    try:
        resultat = FiscalRules.verifier_plafond_pea(montant_verse, nouveau_versement)
        
        return {
            "success": True,
            "plafond": resultat
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.post("/fiscalite/pea")
def calculer_fiscalite_pea(
    montant_retrait: float,
    plus_value: float,
    anciennete_annees: float,
    tmi: float
):
    """Calcule la fiscalité d'un retrait PEA"""
    try:
        resultat = FiscalRules.calculer_fiscalite_pea_retrait(
            montant_retrait=montant_retrait,
            plus_value=plus_value,
            anciennete_annees=anciennete_annees,
            tmi=tmi
        )
        
        return {
            "success": True,
            "fiscalite": resultat
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.post("/fiscalite/av")
def calculer_fiscalite_av(
    montant_retrait: float,
    plus_value: float,
    anciennete_annees: float,
    versements_avant_2017: float,
    tmi: float,
    couple: bool = False
):
    """Calcule la fiscalité Assurance-Vie"""
    try:
        resultat = FiscalRules.calculer_fiscalite_av(
            montant_retrait=montant_retrait,
            plus_value=plus_value,
            anciennete_annees=anciennete_annees,
            versements_avant_2017=versements_avant_2017,
            tmi=tmi,
            couple=couple
        )
        
        return {
            "success": True,
            "fiscalite": resultat
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.post("/fiscalite/cto")
def calculer_fiscalite_cto(
    plus_value: float,
    tmi: float,
    option_bareme: bool = False
):
    """Calcule la fiscalité CTO"""
    try:
        resultat = FiscalRules.calculer_fiscalite_cto(
            plus_value=plus_value,
            tmi=tmi,
            option_bareme=option_bareme
        )
        
        return {
            "success": True,
            "fiscalite": resultat
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.get("/cgi/articles")
def get_cgi_articles():
    """Retourne les extraits des articles CGI"""
    import json
    from pathlib import Path
    
    try:
        cgi_file = Path("data/legal/cgi_extracts.json")
        if cgi_file.exists():
            with open(cgi_file, "r", encoding="utf-8") as f:
                articles = json.load(f)
            
            return {
                "success": True,
                "articles": articles
            }
        else:
            return {"success": False, "error": "Fichier CGI non trouvé"}
    except Exception as e:
        return {"success": False, "error": str(e)}
