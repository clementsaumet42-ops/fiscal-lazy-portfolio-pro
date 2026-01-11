from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "src"))

from models.etf import ETF, AssetClass
from models.enveloppe import EnveloppeType
from models.enveloppe_isin_mapping import EligibiliteResult
from services.eligibility_service import EligibilityService

router = APIRouter()


@router.get("/", response_model=List[ETF])
def list_etfs(
    enveloppe_type: Optional[str] = Query(None, description="Filtre par type d'enveloppe (pea, cto, av, per)"),
    classe_actif: Optional[str] = Query(None, description="Filtre par classe d'actif"),
    eligible_pea_only: bool = Query(False, description="Uniquement les ETFs éligibles PEA"),
    min_ter: Optional[float] = Query(None, description="TER minimum"),
    max_ter: Optional[float] = Query(None, description="TER maximum")
):
    """
    Liste tous les ETFs de l'univers avec filtres optionnels.
    
    Filtres disponibles:
    - enveloppe_type: pea, cto, av, per
    - classe_actif: actions_monde, actions_europe, actions_usa, obligations_gouvernementales, etc.
    - eligible_pea_only: True pour uniquement les ETFs PEA
    - min_ter/max_ter: Filtres sur les frais
    """
    # Charger l'univers
    EligibilityService.load_etf_universe()
    
    etfs = list(EligibilityService._etf_cache.values())
    
    # Filtre par enveloppe
    if enveloppe_type:
        try:
            env_type = EnveloppeType(enveloppe_type)
            etfs = EligibilityService.get_eligible_etfs(env_type)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Type d'enveloppe invalide: {enveloppe_type}")
    
    # Filtre par classe d'actif
    if classe_actif:
        etfs = [etf for etf in etfs if etf.classe_actif.value == classe_actif]
    
    # Filtre PEA uniquement
    if eligible_pea_only:
        etfs = [etf for etf in etfs if etf.eligible_pea]
    
    # Filtre TER
    if min_ter is not None:
        etfs = [etf for etf in etfs if etf.ter >= min_ter]
    if max_ter is not None:
        etfs = [etf for etf in etfs if etf.ter <= max_ter]
    
    return etfs


@router.get("/{isin}", response_model=ETF)
def get_etf_by_isin(isin: str):
    """
    Récupère les détails d'un ETF par son ISIN.
    """
    EligibilityService.load_etf_universe()
    etf = EligibilityService.get_etf_by_isin(isin)
    
    if not etf:
        raise HTTPException(status_code=404, detail=f"ETF avec ISIN {isin} non trouvé")
    
    return etf


@router.get("/{isin}/eligibility/{enveloppe_type}", response_model=EligibiliteResult)
def check_etf_eligibility(
    isin: str,
    enveloppe_type: str,
    is_societe_is: bool = Query(False, description="True si pour une société IS")
):
    """
    Vérifie l'éligibilité d'un ETF pour une enveloppe donnée.
    
    Args:
        isin: Code ISIN de l'ETF
        enveloppe_type: pea, cto, av, per, ou societe_is
        is_societe_is: True si c'est pour une société à l'IS
    
    Returns:
        Résultat d'éligibilité avec détails et références CGI
    """
    # Cas spécial pour société IS
    if enveloppe_type == "societe_is" or is_societe_is:
        return EligibilityService.check_eligibility_societe_is(isin)
    
    # Validation du type d'enveloppe
    try:
        env_type = EnveloppeType(enveloppe_type)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Type d'enveloppe invalide: {enveloppe_type}")
    
    return EligibilityService.check_eligibility(
        isin=isin,
        enveloppe_type=env_type,
        is_societe_is=is_societe_is
    )


@router.get("/stats/by-enveloppe")
def get_etf_stats_by_enveloppe():
    """
    Retourne le nombre d'ETFs éligibles par type d'enveloppe.
    """
    return {
        "success": True,
        "stats": EligibilityService.get_etf_count_by_enveloppe()
    }


@router.get("/classes/list")
def list_asset_classes():
    """
    Liste toutes les classes d'actifs disponibles.
    """
    return {
        "success": True,
        "classes": [ac.value for ac in AssetClass]
    }


@router.get("/recommandations/{profil_risque}")
def get_etf_recommendations(
    profil_risque: str,
    enveloppe_type: Optional[str] = Query(None, description="Type d'enveloppe pour filtrer"),
    limit: int = Query(10, description="Nombre de recommandations")
):
    """
    Recommandations d'ETFs selon le profil de risque.
    
    Profils: defensif, equilibre, dynamique, agressif
    """
    EligibilityService.load_etf_universe()
    etfs = list(EligibilityService._etf_cache.values())
    
    # Filtre par enveloppe si spécifié
    if enveloppe_type:
        try:
            env_type = EnveloppeType(enveloppe_type)
            etfs = EligibilityService.get_eligible_etfs(env_type)
        except ValueError:
            pass
    
    # Logique simple de recommandation selon profil
    recommendations = []
    
    if profil_risque == "defensif":
        # Privilégier obligations et TER bas
        recommendations = sorted(
            [etf for etf in etfs if "obligations" in etf.classe_actif.value],
            key=lambda x: x.ter
        )[:limit]
    
    elif profil_risque == "equilibre":
        # Mix actions/obligations
        actions = [etf for etf in etfs if "actions" in etf.classe_actif.value][:limit//2]
        obligations = [etf for etf in etfs if "obligations" in etf.classe_actif.value][:limit//2]
        recommendations = actions + obligations
    
    elif profil_risque in ["dynamique", "agressif"]:
        # Privilégier actions, diversification géographique
        recommendations = sorted(
            [etf for etf in etfs if "actions" in etf.classe_actif.value],
            key=lambda x: x.ter
        )[:limit]
    
    else:
        # Par défaut, retourner les ETFs avec les TER les plus bas
        recommendations = sorted(etfs, key=lambda x: x.ter)[:limit]
    
    return {
        "success": True,
        "profil_risque": profil_risque,
        "enveloppe_type": enveloppe_type,
        "count": len(recommendations),
        "recommandations": recommendations
    }
