from typing import Dict
from enum import Enum


class StrategieGlidePath(str, Enum):
    CONSERVATEUR = "conservateur"
    EQUILIBRE = "equilibre"
    AGRESSIF = "agressif"
    LIFECYCLE_OPTIMAL = "lifecycle_optimal"


class LifecycleInvestor:
    """
    Implémente les stratégies de Lifecycle Investing avec glide path dynamique.
    
    Ajuste l'allocation actions/obligations selon l'âge et l'horizon.
    """
    
    @staticmethod
    def calculer_allocation_lifecycle(
        age: int,
        horizon_annees: int,
        strategie: StrategieGlidePath = StrategieGlidePath.LIFECYCLE_OPTIMAL
    ) -> Dict[str, float]:
        """
        Calcule l'allocation actions/obligations selon l'âge et la stratégie.
        
        Args:
            age: Âge actuel
            horizon_annees: Horizon d'investissement en années
            strategie: Stratégie de glide path
        
        Returns:
            Dict avec allocation: {"actions": %, "obligations": %, "or": %}
        """
        age_retraite = age + horizon_annees
        
        if strategie == StrategieGlidePath.CONSERVATEUR:
            # Formule conservatrice: Actions = 50 - âge/2
            pct_actions = max(20, 50 - age / 2)
            
        elif strategie == StrategieGlidePath.EQUILIBRE:
            # Formule classique: Actions = 100 - âge
            pct_actions = max(30, 100 - age)
            
        elif strategie == StrategieGlidePath.AGRESSIF:
            # Formule agressive: Actions = 120 - âge
            pct_actions = max(40, 120 - age)
            
        else:  # LIFECYCLE_OPTIMAL
            # Formule optimale avec courbe non-linéaire
            # Plus d'actions quand jeune, décroissance progressive
            if age < 40:
                pct_actions = 100
            elif age < 50:
                pct_actions = 90
            elif age < 60:
                pct_actions = 80 - (age - 50)
            elif age < 70:
                pct_actions = 70 - 2 * (age - 60)
            else:
                pct_actions = max(30, 50 - (age - 70))
        
        pct_actions = max(20, min(100, pct_actions))
        pct_obligations = max(0, 95 - pct_actions)
        pct_or = max(0, 100 - pct_actions - pct_obligations)
        
        return {
            "actions": round(pct_actions, 1),
            "obligations": round(pct_obligations, 1),
            "or": round(pct_or, 1)
        }
    
    @staticmethod
    def generer_glide_path(
        age_debut: int,
        age_fin: int,
        strategie: StrategieGlidePath = StrategieGlidePath.LIFECYCLE_OPTIMAL
    ) -> list:
        """
        Génère une courbe de glide path complète.
        
        Returns:
            Liste de dicts avec age, pct_actions, pct_obligations
        """
        glide_path = []
        
        for age in range(age_debut, age_fin + 1):
            horizon = age_fin - age
            allocation = LifecycleInvestor.calculer_allocation_lifecycle(
                age=age,
                horizon_annees=horizon,
                strategie=strategie
            )
            
            glide_path.append({
                "age": age,
                "pct_actions": allocation["actions"],
                "pct_obligations": allocation["obligations"],
                "pct_or": allocation.get("or", 0)
            })
        
        return glide_path
    
    @staticmethod
    def arbitrage_fonds_euros_etf_obligations(
        montant_obligations_cible: float,
        taux_fonds_euros: float = 2.5,
        taux_etf_obligations: float = 3.5,
        frais_av: float = 0.5
    ) -> Dict[str, float]:
        """
        Optimise l'arbitrage entre Fonds Euros (AV) et ETF Obligations.
        
        Args:
            montant_obligations_cible: Montant total à investir en obligations
            taux_fonds_euros: Taux de rendement Fonds Euros (%)
            taux_etf_obligations: Taux de rendement ETF Obligations (%)
            frais_av: Frais de gestion AV (%)
        
        Returns:
            Dict avec répartition optimale
        """
        # Rendement net Fonds Euros
        rendement_net_fe = taux_fonds_euros - frais_av
        
        # Rendement net ETF Obligations (pas de frais AV)
        rendement_net_etf = taux_etf_obligations
        
        if rendement_net_etf > rendement_net_fe:
            # ETF plus performant
            pct_etf = 80.0  # Privilégier ETF
            pct_fonds_euros = 20.0  # Garder un peu de sécurité
        else:
            # Fonds Euros plus performant (rare)
            pct_etf = 30.0
            pct_fonds_euros = 70.0
        
        return {
            "montant_fonds_euros": montant_obligations_cible * (pct_fonds_euros / 100),
            "montant_etf_obligations": montant_obligations_cible * (pct_etf / 100),
            "pct_fonds_euros": pct_fonds_euros,
            "pct_etf_obligations": pct_etf,
            "rendement_net_fonds_euros": rendement_net_fe,
            "rendement_net_etf": rendement_net_etf
        }
