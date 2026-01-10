from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import sys
sys.path.append("backend/src")

from providers.comparator import ProviderComparator
from providers.cost_calculator import CostCalculator
from providers.recommender import ProviderRecommender

router = APIRouter()


class ProfilPEA(BaseModel):
    montant_investissement: float = 10000
    frequence_ordres: str = "mensuel"
    experience: str = "debutant"


class ProfilAV(BaseModel):
    montant: float = 50000
    gestion_souhaitee: str = "libre"
    horizon_annees: int = 10


class ProfilPER(BaseModel):
    tmi: float = 30
    gestion_souhaitee: str = "libre"


@router.get("/comparer/pea")
def comparer_pea(montant_annuel: float = 10000):
    """Compare les providers PEA"""
    try:
        comparator = ProviderComparator()
        comparaison = comparator.comparer_pea(montant_annuel)
        
        return {
            "success": True,
            "comparaison": comparaison
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.get("/comparer/cto")
def comparer_cto(montant_annuel: float = 10000):
    """Compare les providers CTO"""
    try:
        comparator = ProviderComparator()
        comparaison = comparator.comparer_cto(montant_annuel)
        
        return {
            "success": True,
            "comparaison": comparaison
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.get("/comparer/av")
def comparer_av(montant: float = 50000):
    """Compare les contrats Assurance-Vie"""
    try:
        comparator = ProviderComparator()
        comparaison = comparator.comparer_av(montant)
        
        return {
            "success": True,
            "comparaison": comparaison
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.get("/comparer/per")
def comparer_per(montant: float = 30000):
    """Compare les PER"""
    try:
        comparator = ProviderComparator()
        comparaison = comparator.comparer_per(montant)
        
        return {
            "success": True,
            "comparaison": comparaison
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.get("/comparer/tous")
def comparer_tous(
    montant_pea: float = 10000,
    montant_cto: float = 10000,
    montant_av: float = 50000,
    montant_per: float = 30000
):
    """Comparaison complète de tous les providers"""
    try:
        comparator = ProviderComparator()
        comparaison = comparator.comparaison_complete(
            montant_pea=montant_pea,
            montant_cto=montant_cto,
            montant_av=montant_av,
            montant_per=montant_per
        )
        
        return {
            "success": True,
            "comparaison": comparaison
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.post("/recommander/pea")
def recommander_pea(profil: ProfilPEA):
    """Recommande les meilleurs providers PEA selon profil"""
    try:
        comparator = ProviderComparator()
        providers_pea = comparator.providers_data.get("pea", [])
        
        recommender = ProviderRecommender()
        recommandations = recommender.recommander_pea(
            profil=profil.dict(),
            providers=providers_pea
        )
        
        return {
            "success": True,
            "recommandations": recommandations
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.post("/recommander/av")
def recommander_av(profil: ProfilAV):
    """Recommande les meilleurs contrats AV selon profil"""
    try:
        comparator = ProviderComparator()
        providers_av = comparator.providers_data.get("av", [])
        
        recommender = ProviderRecommender()
        recommandations = recommender.recommander_av(
            profil=profil.dict(),
            providers=providers_av
        )
        
        return {
            "success": True,
            "recommandations": recommandations
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.post("/recommander/per")
def recommander_per(profil: ProfilPER):
    """Recommande les meilleurs PER selon profil"""
    try:
        comparator = ProviderComparator()
        providers_per = comparator.providers_data.get("per", [])
        
        recommender = ProviderRecommender()
        recommandations = recommender.recommander_per(
            profil=profil.dict(),
            providers=providers_per
        )
        
        return {
            "success": True,
            "recommandations": recommandations
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.get("/universe/etfs")
def get_universe_etfs(
    eligible_pea: Optional[bool] = None,
    classe_actif: Optional[str] = None
):
    """Retourne l'univers d'ETFs disponibles"""
    try:
        from data.isin_database import ISINDatabase
        
        db = ISINDatabase()
        etfs = db.rechercher(
            eligible_pea=eligible_pea,
            classe_actif=classe_actif
        )
        
        stats = db.get_stats_universe()
        
        return {
            "success": True,
            "etfs": etfs,
            "stats": stats
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.get("/universe/stats")
def get_universe_stats():
    """Retourne les statistiques de l'univers d'ETFs"""
    try:
        from data.isin_database import ISINDatabase
        
        db = ISINDatabase()
        stats = db.get_stats_universe()
        
        return {
            "success": True,
            "stats": stats
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
