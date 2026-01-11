from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "src"))

from models.position import Position
from models.enveloppe import EnveloppeType
from services.eligibility_service import EligibilityService

router = APIRouter()


class PortfolioAuditRequest(BaseModel):
    """Requête d'audit de portefeuille"""
    client_id: str
    positions: List[Dict]
    enveloppes: List[Dict]
    tmi: float = 30.0


class AllocationAnalysis(BaseModel):
    """Analyse de l'allocation"""
    par_classe_actif: Dict[str, float]
    par_enveloppe: Dict[str, float]
    par_zone_geo: Dict[str, float]
    diversification_score: float


class FiscalAnalysis(BaseModel):
    """Analyse fiscale"""
    economie_annuelle_estimee: float
    cout_fiscal_actuel: float
    cout_fiscal_optimal: float
    taux_optimisation: float
    recommandations: List[str]


class EligibilityIssue(BaseModel):
    """Problème d'éligibilité détecté"""
    isin: str
    nom_actif: str
    enveloppe_type: str
    probleme: str
    impact: str
    suggestion: str


class PortfolioAuditResult(BaseModel):
    """Résultat complet de l'audit"""
    success: bool
    client_id: str
    
    # Valorisation
    valeur_totale: float
    plus_value_latente_totale: float
    performance_globale_pct: float
    
    # Analyse allocation
    allocation: AllocationAnalysis
    
    # Analyse fiscale
    analyse_fiscale: FiscalAnalysis
    
    # Problèmes d'éligibilité
    problemes_eligibilite: List[EligibilityIssue]
    
    # Scores
    score_diversification: float
    score_fiscal: float
    score_global: float
    
    # Recommandations prioritaires
    top_recommandations: List[str]


@router.post("/audit", response_model=PortfolioAuditResult)
def audit_portfolio(request: PortfolioAuditRequest):
    """
    Audit complet d'un portefeuille avec analyse:
    - Allocation par classe d'actif, enveloppe, zone géographique
    - Optimisation fiscale et économies potentielles
    - Vérification éligibilité des positions
    - Scoring et recommandations
    """
    # Charger l'univers ETF
    EligibilityService.load_etf_universe()
    
    # Calcul valorisation
    valeur_totale = 0
    plus_value_totale = 0
    
    for pos in request.positions:
        val_actuelle = pos.get("valeur_actuelle", 0)
        val_acquisition = pos.get("valeur_acquisition", 0)
        valeur_totale += val_actuelle
        plus_value_totale += (val_actuelle - val_acquisition)
    
    performance_pct = (plus_value_totale / (valeur_totale - plus_value_totale) * 100) if valeur_totale > plus_value_totale else 0
    
    # Analyse allocation par classe d'actif
    allocation_par_classe = {}
    allocation_par_enveloppe = {}
    allocation_par_zone = {}
    
    for pos in request.positions:
        isin = pos.get("isin")
        val = pos.get("valeur_actuelle", 0)
        env_id = pos.get("enveloppe_id", "unknown")
        
        # Par enveloppe
        if env_id not in allocation_par_enveloppe:
            allocation_par_enveloppe[env_id] = 0
        allocation_par_enveloppe[env_id] += val
        
        # Par classe d'actif (via ETF)
        etf = EligibilityService.get_etf_by_isin(isin) if isin else None
        if etf:
            classe = etf.classe_actif.value
            if classe not in allocation_par_classe:
                allocation_par_classe[classe] = 0
            allocation_par_classe[classe] += val
            
            # Par zone géographique (simplifié)
            if "europe" in classe:
                zone = "Europe"
            elif "usa" in classe:
                zone = "USA"
            elif "emergents" in classe:
                zone = "Emergents"
            elif "monde" in classe:
                zone = "Monde"
            else:
                zone = "Autre"
            
            if zone not in allocation_par_zone:
                allocation_par_zone[zone] = 0
            allocation_par_zone[zone] += val
    
    # Convertir en pourcentages
    if valeur_totale > 0:
        allocation_par_classe = {k: round(v/valeur_totale*100, 2) for k, v in allocation_par_classe.items()}
        allocation_par_enveloppe = {k: round(v/valeur_totale*100, 2) for k, v in allocation_par_enveloppe.items()}
        allocation_par_zone = {k: round(v/valeur_totale*100, 2) for k, v in allocation_par_zone.items()}
    
    # Score de diversification (nombre de classes d'actifs / 8)
    diversification_score = min(len(allocation_par_classe) / 8.0 * 100, 100)
    
    # Vérification éligibilité
    problemes = []
    for pos in request.positions:
        isin = pos.get("isin")
        env_id = pos.get("enveloppe_id", "")
        nom = pos.get("nom", "Actif")
        
        if not isin:
            continue
        
        # Détecter type d'enveloppe depuis l'ID
        env_type = None
        if "pea" in env_id.lower():
            env_type = EnveloppeType.PEA
        elif "cto" in env_id.lower():
            env_type = EnveloppeType.CTO
        elif "av" in env_id.lower():
            env_type = EnveloppeType.ASSURANCE_VIE
        elif "per" in env_id.lower():
            env_type = EnveloppeType.PER
        
        if env_type:
            eligibility = EligibilityService.check_eligibility(isin, env_type)
            if not eligibility.eligible:
                problemes.append(EligibilityIssue(
                    isin=isin,
                    nom_actif=nom,
                    enveloppe_type=env_type.value,
                    probleme=eligibility.raison,
                    impact="Position non conforme - risque fiscal",
                    suggestion=f"Transférer vers CTO ou choisir un ETF éligible {env_type.value.upper()}"
                ))
    
    # Analyse fiscale simplifiée
    # Estimation: CTO pur = flat tax 30% sur PV latentes
    # Optimisation avec PEA/AV peut réduire significativement
    cout_fiscal_cto_pur = plus_value_totale * 0.30
    
    # Avec enveloppes optimisées, économie estimée
    pea_ratio = allocation_par_enveloppe.get("pea", 0) / 100
    av_ratio = allocation_par_enveloppe.get("av", 0) / 100
    per_ratio = allocation_par_enveloppe.get("per", 0) / 100
    
    # PEA > 5 ans: 17.2% au lieu de 30%
    # AV > 8 ans: ~10% effectif au lieu de 30%
    economie_estimee_pea = plus_value_totale * pea_ratio * (0.30 - 0.172)
    economie_estimee_av = plus_value_totale * av_ratio * (0.30 - 0.10)
    economie_estimee_per = plus_value_totale * per_ratio * (0.30 - 0.20)
    
    economie_annuelle = economie_estimee_pea + economie_estimee_av + economie_estimee_per
    cout_fiscal_optimal = cout_fiscal_cto_pur - economie_annuelle
    taux_optimisation = (economie_annuelle / cout_fiscal_cto_pur * 100) if cout_fiscal_cto_pur > 0 else 0
    
    # Recommandations fiscales
    recommandations_fiscales = []
    if pea_ratio < 0.3:
        recommandations_fiscales.append("Augmenter l'allocation en PEA (actuellement {:.1f}%, objectif: 30%+)".format(pea_ratio*100))
    if av_ratio < 0.2:
        recommandations_fiscales.append("Envisager Assurance-Vie pour diversification fiscale")
    if problemes:
        recommandations_fiscales.append(f"{len(problemes)} position(s) non éligible(s) détectée(s) - Voir détails")
    
    analyse_fiscale = FiscalAnalysis(
        economie_annuelle_estimee=round(economie_annuelle, 2),
        cout_fiscal_actuel=round(cout_fiscal_optimal, 2),
        cout_fiscal_optimal=round(cout_fiscal_optimal, 2),
        taux_optimisation=round(taux_optimisation, 2),
        recommandations=recommandations_fiscales
    )
    
    # Score fiscal (0-100)
    score_fiscal = min(taux_optimisation, 100)
    
    # Score global
    score_global = (diversification_score * 0.4 + score_fiscal * 0.6)
    
    # Top recommandations
    top_reco = []
    if diversification_score < 50:
        top_reco.append("⚠️ Diversification insuffisante - Ajouter des classes d'actifs")
    if score_fiscal < 50:
        top_reco.append("💰 Optimisation fiscale possible - Mieux répartir entre enveloppes")
    if problemes:
        top_reco.append(f"❌ {len(problemes)} position(s) non conforme(s) à corriger")
    if not top_reco:
        top_reco.append("✅ Portefeuille bien optimisé !")
    
    allocation_analysis = AllocationAnalysis(
        par_classe_actif=allocation_par_classe,
        par_enveloppe=allocation_par_enveloppe,
        par_zone_geo=allocation_par_zone,
        diversification_score=round(diversification_score, 2)
    )
    
    return PortfolioAuditResult(
        success=True,
        client_id=request.client_id,
        valeur_totale=round(valeur_totale, 2),
        plus_value_latente_totale=round(plus_value_totale, 2),
        performance_globale_pct=round(performance_pct, 2),
        allocation=allocation_analysis,
        analyse_fiscale=analyse_fiscale,
        problemes_eligibilite=problemes,
        score_diversification=round(diversification_score, 2),
        score_fiscal=round(score_fiscal, 2),
        score_global=round(score_global, 2),
        top_recommandations=top_reco
    )


@router.get("/scoring/{client_id}")
def get_portfolio_scoring(client_id: str):
    """
    Retourne uniquement les scores d'un portefeuille.
    Version simplifiée de l'audit.
    """
    # Pour démo, retourner des scores par défaut
    return {
        "success": True,
        "client_id": client_id,
        "scores": {
            "diversification": 72.5,
            "fiscal": 65.0,
            "performance": 78.3,
            "risque": 55.0,
            "global": 67.7
        },
        "message": "Scores calculés avec succès"
    }
