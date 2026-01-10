import numpy as np
import pandas as pd
from typing import Dict, List, Optional
from datetime import datetime


class MonteCarloSimulator:
    """
    Simulateur Monte Carlo pour projections de portefeuille.
    
    Fonctionnalités:
    - 10,000+ simulations
    - Distribution normale des rendements (basée sur historique)
    - Projections 30 ans
    - Percentiles: 10%, 25%, 50%, 75%, 90%
    - Probabilité de succès (capital préservé)
    - Données pour fan chart
    """
    
    def __init__(self, seed: Optional[int] = None):
        if seed:
            np.random.seed(seed)
    
    def simuler_trajectoires(
        self,
        valeur_initiale: float,
        rendement_moyen_annuel: float,
        volatilite_annuelle: float,
        nb_annees: int,
        nb_simulations: int = 10000,
        apports_annuels: float = 0.0,
        retraits_annuels: float = 0.0
    ) -> Dict[str, any]:
        """
        Simule des trajectoires de portefeuille avec Monte Carlo.
        
        Args:
            valeur_initiale: Capital initial
            rendement_moyen_annuel: Rendement moyen annuel attendu (décimal, ex: 0.07 pour 7%)
            volatilite_annuelle: Volatilité annuelle (décimal, ex: 0.15 pour 15%)
            nb_annees: Horizon de projection
            nb_simulations: Nombre de simulations
            apports_annuels: Apports annuels
            retraits_annuels: Retraits annuels
        
        Returns:
            Dict avec trajectoires et statistiques
        """
        # Paramètres de simulation
        nb_periodes = nb_annees * 12  # Simulation mensuelle
        rendement_mensuel = rendement_moyen_annuel / 12
        volatilite_mensuelle = volatilite_annuelle / np.sqrt(12)
        
        # Matrice de simulations (simulations x périodes)
        trajectoires = np.zeros((nb_simulations, nb_periodes + 1))
        trajectoires[:, 0] = valeur_initiale
        
        # Génerer rendements aléatoires
        rendements_aleatoires = np.random.normal(
            loc=rendement_mensuel,
            scale=volatilite_mensuelle,
            size=(nb_simulations, nb_periodes)
        )
        
        # Simuler chaque trajectoire
        for mois in range(nb_periodes):
            # Appliquer rendement du mois
            trajectoires[:, mois + 1] = trajectoires[:, mois] * (1 + rendements_aleatoires[:, mois])
            
            # Ajouter apports/retraits mensuels
            if mois % 12 == 11:  # Chaque année
                trajectoires[:, mois + 1] += (apports_annuels - retraits_annuels)
            
            # Empêcher valeurs négatives
            trajectoires[:, mois + 1] = np.maximum(trajectoires[:, mois + 1], 0)
        
        # Extraire valeurs annuelles pour analyse
        indices_annuels = [i * 12 for i in range(nb_annees + 1)]
        trajectoires_annuelles = trajectoires[:, indices_annuels]
        
        return {
            "trajectoires_completes": trajectoires,
            "trajectoires_annuelles": trajectoires_annuelles,
            "nb_simulations": nb_simulations,
            "nb_annees": nb_annees
        }
    
    def calculer_percentiles(
        self,
        trajectoires_annuelles: np.ndarray,
        percentiles: List[int] = [10, 25, 50, 75, 90]
    ) -> Dict[int, np.ndarray]:
        """
        Calcule les percentiles des trajectoires.
        
        Returns:
            Dict {percentile: array de valeurs par année}
        """
        resultats = {}
        
        for p in percentiles:
            resultats[p] = np.percentile(trajectoires_annuelles, p, axis=0)
        
        return resultats
    
    def calculer_probabilite_succes(
        self,
        trajectoires_annuelles: np.ndarray,
        objectif: float = None
    ) -> Dict[str, float]:
        """
        Calcule la probabilité de succès.
        
        Succès = capital final > capital initial (ou objectif si spécifié)
        
        Args:
            trajectoires_annuelles: Matrice des trajectoires
            objectif: Objectif de capital final (optionnel)
        
        Returns:
            Dict avec probabilités de succès
        """
        valeur_initiale = trajectoires_annuelles[0, 0]
        valeurs_finales = trajectoires_annuelles[:, -1]
        
        if objectif is None:
            objectif = valeur_initiale
        
        # Probabilité de maintenir le capital
        nb_succes_maintien = np.sum(valeurs_finales >= valeur_initiale)
        prob_maintien = (nb_succes_maintien / len(valeurs_finales)) * 100
        
        # Probabilité d'atteindre objectif
        nb_succes_objectif = np.sum(valeurs_finales >= objectif)
        prob_objectif = (nb_succes_objectif / len(valeurs_finales)) * 100
        
        # Probabilité de ruine (capital < 10% initial)
        nb_ruine = np.sum(valeurs_finales < valeur_initiale * 0.1)
        prob_ruine = (nb_ruine / len(valeurs_finales)) * 100
        
        return {
            "prob_maintien_capital": round(prob_maintien, 1),
            "prob_atteindre_objectif": round(prob_objectif, 1),
            "prob_ruine": round(prob_ruine, 1),
            "valeur_mediane_finale": round(np.median(valeurs_finales), 2),
            "valeur_moyenne_finale": round(np.mean(valeurs_finales), 2)
        }
    
    def generer_fan_chart_data(
        self,
        trajectoires_annuelles: np.ndarray,
        percentiles: List[int] = [10, 25, 50, 75, 90]
    ) -> List[dict]:
        """
        Génère les données pour un fan chart.
        
        Returns:
            Liste de dicts avec année et percentiles
        """
        nb_annees = trajectoires_annuelles.shape[1]
        percentiles_data = self.calculer_percentiles(trajectoires_annuelles, percentiles)
        
        fan_chart_data = []
        
        for annee in range(nb_annees):
            point = {"annee": annee}
            
            for p in percentiles:
                point[f"p{p}"] = round(percentiles_data[p][annee], 2)
            
            fan_chart_data.append(point)
        
        return fan_chart_data
    
    def analyser_simulation_complete(
        self,
        valeur_initiale: float,
        rendement_moyen_annuel: float,
        volatilite_annuelle: float,
        nb_annees: int = 30,
        nb_simulations: int = 10000,
        apports_annuels: float = 0.0,
        retraits_annuels: float = 0.0,
        objectif_capital: Optional[float] = None
    ) -> dict:
        """
        Analyse Monte Carlo complète avec toutes les statistiques.
        
        Returns:
            Dict complet avec résultats simulation
        """
        # Lancer simulations
        resultats_simulation = self.simuler_trajectoires(
            valeur_initiale=valeur_initiale,
            rendement_moyen_annuel=rendement_moyen_annuel,
            volatilite_annuelle=volatilite_annuelle,
            nb_annees=nb_annees,
            nb_simulations=nb_simulations,
            apports_annuels=apports_annuels,
            retraits_annuels=retraits_annuels
        )
        
        trajectoires_annuelles = resultats_simulation["trajectoires_annuelles"]
        
        # Calculer percentiles
        percentiles_data = self.calculer_percentiles(trajectoires_annuelles)
        
        # Probabilités de succès
        proba_succes = self.calculer_probabilite_succes(
            trajectoires_annuelles,
            objectif=objectif_capital
        )
        
        # Fan chart data
        fan_chart = self.generer_fan_chart_data(trajectoires_annuelles)
        
        # Statistiques finales
        valeurs_finales = trajectoires_annuelles[:, -1]
        
        return {
            "parametres": {
                "valeur_initiale": valeur_initiale,
                "rendement_moyen_annuel": rendement_moyen_annuel * 100,
                "volatilite_annuelle": volatilite_annuelle * 100,
                "nb_annees": nb_annees,
                "nb_simulations": nb_simulations,
                "apports_annuels": apports_annuels,
                "retraits_annuels": retraits_annuels
            },
            "percentiles": {
                "p10": round(percentiles_data[10][-1], 2),
                "p25": round(percentiles_data[25][-1], 2),
                "p50": round(percentiles_data[50][-1], 2),
                "p75": round(percentiles_data[75][-1], 2),
                "p90": round(percentiles_data[90][-1], 2)
            },
            "probabilites": proba_succes,
            "statistiques_finales": {
                "valeur_min": round(np.min(valeurs_finales), 2),
                "valeur_max": round(np.max(valeurs_finales), 2),
                "valeur_mediane": round(np.median(valeurs_finales), 2),
                "valeur_moyenne": round(np.mean(valeurs_finales), 2),
                "ecart_type": round(np.std(valeurs_finales), 2)
            },
            "fan_chart_data": fan_chart,
            "nb_simulations_reussies": nb_simulations
        }
