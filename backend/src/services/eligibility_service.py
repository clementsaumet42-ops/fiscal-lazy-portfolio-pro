"""
Service d'éligibilité automatique des ETFs par enveloppe.
Vérifie automatiquement si un ISIN est éligible dans PEA, CTO, AV, PER.
"""

from typing import Dict, List
import json
from pathlib import Path

from models.etf import ETF
from models.enveloppe import EnveloppeType
from models.enveloppe_isin_mapping import EligibiliteResult


class EligibilityService:
    """
    Service de vérification d'éligibilité des ETFs/ISINs selon l'enveloppe.
    
    Règles:
    - PEA: Éligible si ≥75% actions UE (CGI Art. 150-0 A)
    - CTO: Tous les ETFs éligibles (pas de restriction)
    - Assurance-Vie: Tous les OPCVM éligibles
    - PER: Tous les OPCVM éligibles
    - Société IS: OPCVM Actions si ≥90% actions (CGI Art. 209-0 A)
    """
    
    # Cache des ETFs chargés depuis universe.json
    _etf_cache: Dict[str, ETF] = {}
    
    @classmethod
    def load_etf_universe(cls, universe_path: str = None) -> None:
        """Charge l'univers d'ETFs depuis JSON"""
        if not universe_path:
            base_path = Path(__file__).parent.parent.parent.parent
            universe_path = base_path / "data" / "etfs" / "universe.json"
        
        try:
            with open(universe_path, 'r', encoding='utf-8') as f:
                etfs_data = json.load(f)
                for etf_data in etfs_data:
                    etf = ETF(**etf_data)
                    cls._etf_cache[etf.isin] = etf
        except Exception as e:
            print(f"Warning: Could not load ETF universe: {e}")
    
    @classmethod
    def get_etf_by_isin(cls, isin: str) -> ETF:
        """Récupère un ETF par son ISIN"""
        if not cls._etf_cache:
            cls.load_etf_universe()
        
        return cls._etf_cache.get(isin)
    
    @classmethod
    def check_eligibility(
        cls,
        isin: str,
        enveloppe_type: EnveloppeType,
        is_societe_is: bool = False
    ) -> EligibiliteResult:
        """
        Vérifie l'éligibilité d'un ISIN pour une enveloppe donnée.
        
        Args:
            isin: Code ISIN de l'ETF
            enveloppe_type: Type d'enveloppe (PEA, CTO, AV, PER)
            is_societe_is: True si c'est pour une société à l'IS
        
        Returns:
            EligibiliteResult avec détails de l'éligibilité
        """
        etf = cls.get_etf_by_isin(isin)
        
        if not etf:
            return EligibiliteResult(
                isin=isin,
                enveloppe_type=enveloppe_type.value,
                eligible=False,
                raison=f"ISIN {isin} non trouvé dans l'univers d'ETFs",
                regles_applicables=[]
            )
        
        # PEA: Seuil ≥75% actions UE
        if enveloppe_type == EnveloppeType.PEA:
            if etf.eligible_pea:
                return EligibiliteResult(
                    isin=isin,
                    enveloppe_type=enveloppe_type.value,
                    eligible=True,
                    pourcentage_actions=etf.pourcentage_actions,
                    raison=f"ETF éligible PEA (≥75% actions UE). Pourcentage actions: {etf.pourcentage_actions}%",
                    regles_applicables=["CGI Art. 150-0 A"]
                )
            else:
                return EligibiliteResult(
                    isin=isin,
                    enveloppe_type=enveloppe_type.value,
                    eligible=False,
                    pourcentage_actions=etf.pourcentage_actions,
                    raison=f"ETF non éligible PEA. Nécessite ≥75% actions UE. Actuel: {etf.pourcentage_actions}%",
                    regles_applicables=["CGI Art. 150-0 A"]
                )
        
        # CTO: Tous éligibles
        elif enveloppe_type == EnveloppeType.CTO:
            return EligibiliteResult(
                isin=isin,
                enveloppe_type=enveloppe_type.value,
                eligible=True,
                pourcentage_actions=etf.pourcentage_actions,
                raison="Tous les ETFs sont éligibles en CTO",
                regles_applicables=["CGI Art. 200 A"]
            )
        
        # Assurance-Vie: Tous OPCVM éligibles
        elif enveloppe_type == EnveloppeType.ASSURANCE_VIE:
            return EligibiliteResult(
                isin=isin,
                enveloppe_type=enveloppe_type.value,
                eligible=True,
                pourcentage_actions=etf.pourcentage_actions,
                raison="OPCVM éligible en Assurance-Vie",
                regles_applicables=["CGI Art. 125-0 A", "CGI Art. 990 I"]
            )
        
        # PER: Tous OPCVM éligibles
        elif enveloppe_type == EnveloppeType.PER:
            return EligibiliteResult(
                isin=isin,
                enveloppe_type=enveloppe_type.value,
                eligible=True,
                pourcentage_actions=etf.pourcentage_actions,
                raison="OPCVM éligible en PER",
                regles_applicables=["CGI Art. 163 quatervicies"]
            )
        
        # Fallback
        return EligibiliteResult(
            isin=isin,
            enveloppe_type=enveloppe_type.value,
            eligible=False,
            raison="Type d'enveloppe non reconnu",
            regles_applicables=[]
        )
    
    @classmethod
    def check_eligibility_societe_is(cls, isin: str) -> EligibiliteResult:
        """
        Vérifie l'éligibilité d'un OPCVM pour une société IS.
        Seuil: ≥90% actions pour OPCVM Actions (CGI Art. 209-0 A).
        
        Args:
            isin: Code ISIN de l'ETF
        
        Returns:
            EligibiliteResult avec détails
        """
        etf = cls.get_etf_by_isin(isin)
        
        if not etf:
            return EligibiliteResult(
                isin=isin,
                enveloppe_type="societe_is",
                eligible=False,
                raison=f"ISIN {isin} non trouvé",
                regles_applicables=[]
            )
        
        if etf.eligible_opcvm_actions_is:
            return EligibiliteResult(
                isin=isin,
                enveloppe_type="societe_is",
                eligible=True,
                pourcentage_actions=etf.pourcentage_actions,
                raison=f"OPCVM Actions éligible (≥90% actions). Pourcentage: {etf.pourcentage_actions}%",
                regles_applicables=["CGI Art. 209-0 A", "BOFiP-IS-BASE-10-20-10"]
            )
        else:
            return EligibiliteResult(
                isin=isin,
                enveloppe_type="societe_is",
                eligible=False,
                pourcentage_actions=etf.pourcentage_actions,
                raison=f"OPCVM non éligible pour taxation à la réalisation. Nécessite ≥90% actions. Actuel: {etf.pourcentage_actions}%",
                regles_applicables=["CGI Art. 209-0 A"]
            )
    
    @classmethod
    def get_eligible_etfs(
        cls,
        enveloppe_type: EnveloppeType,
        classe_actif: str = None,
        is_societe_is: bool = False
    ) -> List[ETF]:
        """
        Retourne la liste des ETFs éligibles pour une enveloppe.
        
        Args:
            enveloppe_type: Type d'enveloppe
            classe_actif: Filtre optionnel par classe d'actif
            is_societe_is: True si société IS
        
        Returns:
            Liste des ETFs éligibles
        """
        if not cls._etf_cache:
            cls.load_etf_universe()
        
        eligible_etfs = []
        
        for etf in cls._etf_cache.values():
            # Filtre par classe d'actif si spécifié
            if classe_actif and etf.classe_actif.value != classe_actif:
                continue
            
            # Vérification d'éligibilité
            eligibility = cls.check_eligibility(
                isin=etf.isin,
                enveloppe_type=enveloppe_type,
                is_societe_is=is_societe_is
            )
            
            if eligibility.eligible:
                eligible_etfs.append(etf)
        
        return eligible_etfs
    
    @classmethod
    def get_etf_count_by_enveloppe(cls) -> Dict[str, int]:
        """Retourne le nombre d'ETFs éligibles par type d'enveloppe"""
        if not cls._etf_cache:
            cls.load_etf_universe()
        
        counts = {}
        for env_type in EnveloppeType:
            eligible = cls.get_eligible_etfs(env_type)
            counts[env_type.value] = len(eligible)
        
        return counts
