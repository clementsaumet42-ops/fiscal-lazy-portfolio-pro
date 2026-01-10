from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, List
import sys
sys.path.append("backend/src")

from optimization.asset_allocation import AssetAllocator, StrategieAllocation
from optimization.asset_location import AssetLocator
from optimization.lifecycle_investing import LifecycleInvestor, StrategieGlidePath
from optimization.rebalancing import RebalancingEngine
from optimization.withdrawal import WithdrawalOptimizer
from optimization.tax_loss_harvesting import TaxLossHarvester

router = APIRouter()


class AllocationRequest(BaseModel):
    strategie: str  # defensif, equilibre, dynamique, agressif


class AssetLocationRequest(BaseModel):
    etfs_a_placer: List[dict]
    enveloppes_disponibles: List[dict]
    tmi: float = 0


class LifecycleRequest(BaseModel):
    age: int
    horizon_annees: int
    strategie: str = "lifecycle_optimal"


class RebalancingRequest(BaseModel):
    allocation_actuelle: Dict[str, float]
    allocation_cible: Dict[str, float]
    tolerance_pct: float = 5.0


class WithdrawalRequest(BaseModel):
    enveloppes: List[dict]
    montant_total: float
    tmi: float


class TLHRequest(BaseModel):
    positions_cto: List[dict]
    gains_annee: float = 0
    universe_etfs: List[dict] = []


@router.post("/allocation-cible")
def get_allocation_cible(request: AllocationRequest):
    """Retourne l'allocation cible selon stratégie"""
    try:
        strategie = StrategieAllocation(request.strategie)
        allocation = AssetAllocator.get_allocation_cible(strategie)
        
        return {
            "success": True,
            "strategie": request.strategie,
            "allocation": allocation
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.post("/asset-location")
def optimiser_asset_location(request: AssetLocationRequest):
    """Optimise le placement des ETFs dans les enveloppes"""
    try:
        placement = AssetLocator.optimiser_placement(
            etfs_a_placer=request.etfs_a_placer,
            enveloppes_disponibles=request.enveloppes_disponibles,
            tmi=request.tmi
        )
        
        return {
            "success": True,
            "placement_optimal": placement
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.post("/lifecycle")
def calculer_lifecycle(request: LifecycleRequest):
    """Calcule l'allocation lifecycle selon âge et horizon"""
    try:
        strategie = StrategieGlidePath(request.strategie)
        allocation = LifecycleInvestor.calculer_allocation_lifecycle(
            age=request.age,
            horizon_annees=request.horizon_annees,
            strategie=strategie
        )
        
        return {
            "success": True,
            "allocation": allocation,
            "age": request.age,
            "horizon": request.horizon_annees
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.post("/glide-path")
def generer_glide_path(age_debut: int, age_fin: int, strategie: str = "lifecycle_optimal"):
    """Génère une courbe de glide path complète"""
    try:
        strategie_enum = StrategieGlidePath(strategie)
        glide_path = LifecycleInvestor.generer_glide_path(
            age_debut=age_debut,
            age_fin=age_fin,
            strategie=strategie_enum
        )
        
        return {
            "success": True,
            "glide_path": glide_path
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.post("/rebalancing/besoin")
def verifier_besoin_reequilibrage(request: RebalancingRequest):
    """Vérifie si un rééquilibrage est nécessaire"""
    try:
        besoin = RebalancingEngine.besoin_reequilibrage(
            allocation_actuelle=request.allocation_actuelle,
            allocation_cible=request.allocation_cible,
            tolerance_pct=request.tolerance_pct
        )
        
        return {
            "success": True,
            "besoin_reequilibrage": besoin,
            "tolerance_pct": request.tolerance_pct
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.post("/withdrawal/ordre-optimal")
def ordre_retrait_optimal(request: WithdrawalRequest):
    """Détermine l'ordre optimal de retrait"""
    try:
        plan = WithdrawalOptimizer.ordre_retrait_optimal(
            enveloppes=request.enveloppes,
            montant_total=request.montant_total,
            tmi=request.tmi
        )
        
        return {
            "success": True,
            "plan_retrait": [
                {"enveloppe_id": env_id, "montant": montant, "cout_fiscal": cout}
                for env_id, montant, cout in plan
            ]
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.post("/withdrawal/recommandations")
def recommandations_retrait(request: WithdrawalRequest):
    """Génère des recommandations pour un retrait"""
    try:
        reco = WithdrawalOptimizer.recommandations_retrait(
            enveloppes=request.enveloppes,
            montant_souhaite=request.montant_total,
            tmi=request.tmi
        )
        
        return {
            "success": True,
            "recommandations": reco
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.post("/tax-loss-harvesting")
def analyser_tlh(request: TLHRequest):
    """Analyse les opportunités de Tax-Loss Harvesting"""
    try:
        opportunites = TaxLossHarvester.identifier_opportunites_tlh(
            positions_cto=request.positions_cto
        )
        
        return {
            "success": True,
            "nb_opportunites": len(opportunites),
            "opportunites": opportunites
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.post("/tax-loss-harvesting/plan")
def generer_plan_tlh(request: TLHRequest):
    """Génère un plan complet de TLH"""
    try:
        plan = TaxLossHarvester.generer_plan_tlh(
            positions_cto=request.positions_cto,
            gains_annee=request.gains_annee,
            universe_etfs=request.universe_etfs
        )
        
        return {
            "success": True,
            "plan": plan
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
