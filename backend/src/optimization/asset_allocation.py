from typing import Dict, List
from enum import Enum
import numpy as np


class StrategieAllocation(str, Enum):
    DEFENSIF = "defensif"
    EQUILIBRE = "equilibre"
    DYNAMIQUE = "dynamique"
    AGRESSIF = "agressif"


class AssetAllocator:
    """
    Moteur d'allocation d'actifs.
    
    Définit les allocations cibles selon différentes stratégies.
    """
    
    @staticmethod
    def get_allocation_cible(strategie: StrategieAllocation) -> Dict[str, float]:
        """
        Retourne l'allocation cible selon la stratégie.
        
        Returns:
            Dict avec keys: actions, obligations, or
        """
        allocations = {
            StrategieAllocation.DEFENSIF: {
                "actions": 30.0,
                "obligations": 65.0,
                "or": 5.0
            },
            StrategieAllocation.EQUILIBRE: {
                "actions": 60.0,
                "obligations": 35.0,
                "or": 5.0
            },
            StrategieAllocation.DYNAMIQUE: {
                "actions": 80.0,
                "obligations": 15.0,
                "or": 5.0
            },
            StrategieAllocation.AGRESSIF: {
                "actions": 100.0,
                "obligations": 0.0,
                "or": 0.0
            }
        }
        
        return allocations[strategie]
    
    @staticmethod
    def calculer_allocation_actuelle(positions: List[dict], etfs: Dict[str, dict]) -> Dict[str, float]:
        """
        Calcule l'allocation actuelle d'un portefeuille.
        
        Args:
            positions: Liste des positions avec isin et valeur_actuelle
            etfs: Dict des ETFs avec isin -> classe_actif
        
        Returns:
            Dict avec allocation par classe d'actifs (%)
        """
        valeur_totale = sum(p.get("valeur_actuelle", 0) for p in positions)
        
        if valeur_totale == 0:
            return {"actions": 0.0, "obligations": 0.0, "or": 0.0}
        
        valeur_actions = 0.0
        valeur_obligations = 0.0
        valeur_or = 0.0
        
        for position in positions:
            isin = position.get("isin")
            valeur = position.get("valeur_actuelle", 0)
            
            if isin in etfs:
                classe_actif = etfs[isin].get("classe_actif", "")
                if "actions" in classe_actif:
                    valeur_actions += valeur
                elif "obligations" in classe_actif:
                    valeur_obligations += valeur
                elif "or" in classe_actif:
                    valeur_or += valeur
        
        return {
            "actions": (valeur_actions / valeur_totale) * 100,
            "obligations": (valeur_obligations / valeur_totale) * 100,
            "or": (valeur_or / valeur_totale) * 100
        }
    
    @staticmethod
    def calculer_ecart_allocation(
        allocation_actuelle: Dict[str, float],
        allocation_cible: Dict[str, float]
    ) -> Dict[str, float]:
        """
        Calcule l'écart entre allocation actuelle et cible.
        
        Returns:
            Dict avec écart par classe d'actifs (%)
        """
        ecarts = {}
        for classe in allocation_cible:
            actuelle = allocation_actuelle.get(classe, 0.0)
            cible = allocation_cible[classe]
            ecarts[classe] = actuelle - cible
        
        return ecarts
    
    @staticmethod
    def calculer_montants_reequilibrage(
        allocation_actuelle: Dict[str, float],
        allocation_cible: Dict[str, float],
        valeur_totale: float
    ) -> Dict[str, float]:
        """
        Calcule les montants à acheter/vendre pour rééquilibrer.
        
        Returns:
            Dict avec montants par classe (+ = acheter, - = vendre)
        """
        montants = {}
        
        for classe in allocation_cible:
            valeur_actuelle_classe = (allocation_actuelle.get(classe, 0.0) / 100) * valeur_totale
            valeur_cible_classe = (allocation_cible[classe] / 100) * valeur_totale
            montants[classe] = valeur_cible_classe - valeur_actuelle_classe
        
        return montants
