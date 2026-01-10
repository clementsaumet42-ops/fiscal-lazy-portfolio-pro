from typing import Dict, List
from enum import Enum


class FrequenceReequilibrage(str, Enum):
    MENSUEL = "mensuel"
    TRIMESTRIEL = "trimestriel"
    ANNUEL = "annuel"
    SUR_SEUIL = "sur_seuil"
    JAMAIS = "jamais"


class RebalancingEngine:
    """
    Moteur de rééquilibrage de portefeuille.
    
    Gère différentes stratégies de rééquilibrage avec prise en compte
    des contraintes fiscales.
    """
    
    @staticmethod
    def besoin_reequilibrage(
        allocation_actuelle: Dict[str, float],
        allocation_cible: Dict[str, float],
        tolerance_pct: float = 5.0
    ) -> bool:
        """
        Détermine si un rééquilibrage est nécessaire.
        
        Args:
            allocation_actuelle: Allocation actuelle (%)
            allocation_cible: Allocation cible (%)
            tolerance_pct: Tolérance d'écart avant rééquilibrage (%)
        
        Returns:
            True si rééquilibrage nécessaire
        """
        for classe in allocation_cible:
            actuelle = allocation_actuelle.get(classe, 0.0)
            cible = allocation_cible[classe]
            ecart = abs(actuelle - cible)
            
            if ecart > tolerance_pct:
                return True
        
        return False
    
    @staticmethod
    def calculer_operations_reequilibrage(
        positions: List[dict],
        allocation_cible: Dict[str, float],
        valeur_totale: float,
        nouvel_apport: float = 0.0,
        ventes_autorisees: bool = True
    ) -> Dict[str, List]:
        """
        Calcule les opérations nécessaires pour rééquilibrer.
        
        Stratégie:
        1. Utiliser nouveaux apports en priorité
        2. Ventes uniquement si autorisé et nécessaire
        
        Args:
            positions: Liste des positions actuelles
            allocation_cible: Allocation cible (%)
            valeur_totale: Valeur totale du portefeuille
            nouvel_apport: Montant du nouvel apport
            ventes_autorisees: True si ventes autorisées
        
        Returns:
            Dict avec "achats" et "ventes"
        """
        operations = {
            "achats": [],
            "ventes": []
        }
        
        valeur_future = valeur_totale + nouvel_apport
        
        # Calculer valeur cible par classe
        valeurs_cibles = {}
        for classe, pct in allocation_cible.items():
            valeurs_cibles[classe] = (pct / 100) * valeur_future
        
        # Calculer valeur actuelle par classe
        valeurs_actuelles = {}
        for position in positions:
            classe = position.get("classe_actif", "")
            if classe:
                valeurs_actuelles[classe] = valeurs_actuelles.get(classe, 0) + position.get("valeur_actuelle", 0)
        
        # Calculer écarts
        ecarts = {}
        for classe in valeurs_cibles:
            actuelle = valeurs_actuelles.get(classe, 0)
            cible = valeurs_cibles[classe]
            ecarts[classe] = cible - actuelle
        
        # Stratégie 1: Utiliser apports pour classes sous-pondérées
        if nouvel_apport > 0:
            apport_restant = nouvel_apport
            classes_sous_ponderees = {k: v for k, v in ecarts.items() if v > 0}
            
            if classes_sous_ponderees:
                total_besoin = sum(classes_sous_ponderees.values())
                
                for classe, besoin in classes_sous_ponderees.items():
                    montant = min(besoin, (besoin / total_besoin) * apport_restant)
                    operations["achats"].append({
                        "classe_actif": classe,
                        "montant": montant,
                        "raison": "Rééquilibrage via nouvel apport"
                    })
                    ecarts[classe] -= montant
        
        # Stratégie 2: Ventes si autorisé et nécessaire
        if ventes_autorisees:
            for classe, ecart in ecarts.items():
                if ecart < -100:  # Seuil minimal pour vente
                    operations["ventes"].append({
                        "classe_actif": classe,
                        "montant": abs(ecart),
                        "raison": "Rééquilibrage - classe sur-pondérée"
                    })
        
        return operations
    
    @staticmethod
    def reequilibrage_fiscal_optimise(
        positions: List[dict],
        allocation_cible: Dict[str, float],
        enveloppes: List[dict]
    ) -> List[dict]:
        """
        Génère un plan de rééquilibrage optimisé fiscalement.
        
        Contraintes:
        - Éviter retrait PEA <5 ans
        - Privilégier ventes à perte sur CTO (tax-loss harvesting)
        - Minimiser fiscalité globale
        
        Returns:
            Liste de recommandations d'actions
        """
        recommandations = []
        
        # Identifier enveloppes avec contraintes
        for env in enveloppes:
            if env["type"] == "pea" and env.get("anciennete_annees", 0) < 5:
                recommandations.append({
                    "type": "warning",
                    "enveloppe": "PEA",
                    "message": "PEA <5 ans: éviter tout retrait pour ne pas déclencher clôture",
                    "action": "Utiliser uniquement nouveaux apports"
                })
            
            if env["type"] == "cto":
                # Rechercher positions en moins-value pour tax-loss harvesting
                positions_perte = [p for p in positions 
                                 if p.get("enveloppe_id") == env["id"] 
                                 and p.get("plus_value_latente", 0) < 0]
                
                if positions_perte:
                    recommandations.append({
                        "type": "opportunity",
                        "enveloppe": "CTO",
                        "message": f"{len(positions_perte)} position(s) en moins-value",
                        "action": "Tax-loss harvesting: vendre et réinvestir dans ETF similaire"
                    })
        
        return recommandations
