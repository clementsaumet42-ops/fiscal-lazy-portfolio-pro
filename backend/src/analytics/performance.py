import pandas as pd
import numpy as np
from typing import Dict, Optional


class PerformanceAnalyzer:
    """
    Analyseur de performance de portefeuille.
    """
    
    @staticmethod
    def calculer_rendement_total(
        valeur_initiale: float,
        valeur_finale: float
    ) -> float:
        """Calcule le rendement total (%)"""
        if valeur_initiale == 0:
            return 0.0
        return ((valeur_finale - valeur_initiale) / valeur_initiale) * 100
    
    @staticmethod
    def calculer_rendement_annualise(
        valeur_initiale: float,
        valeur_finale: float,
        nb_annees: float
    ) -> float:
        """Calcule le rendement annualisé (CAGR) (%)"""
        if valeur_initiale <= 0 or nb_annees <= 0:
            return 0.0
        return ((valeur_finale / valeur_initiale) ** (1 / nb_annees) - 1) * 100
    
    @staticmethod
    def calculer_volatilite_annualisee(rendements: pd.Series) -> float:
        """Calcule la volatilité annualisée (%)"""
        if len(rendements) < 2:
            return 0.0
        return rendements.std() * np.sqrt(252) * 100
    
    @staticmethod
    def analyser_periodes(serie_valeurs: pd.Series) -> Dict:
        """
        Analyse les performances sur différentes périodes.
        
        Returns:
            Dict avec performances 1M, 3M, 6M, 1Y, 3Y, 5Y
        """
        valeur_actuelle = serie_valeurs.iloc[-1]
        date_actuelle = serie_valeurs.index[-1]
        
        resultats = {}
        
        periodes = {
            "1M": 21,  # ~21 jours ouvrés
            "3M": 63,
            "6M": 126,
            "1Y": 252,
            "3Y": 756,
            "5Y": 1260
        }
        
        for nom_periode, nb_jours in periodes.items():
            if len(serie_valeurs) > nb_jours:
                valeur_debut = serie_valeurs.iloc[-nb_jours]
                rendement = ((valeur_actuelle - valeur_debut) / valeur_debut) * 100
                resultats[nom_periode] = round(rendement, 2)
            else:
                resultats[nom_periode] = None
        
        return resultats
    
    @staticmethod
    def comparer_avec_benchmark(
        serie_portefeuille: pd.Series,
        serie_benchmark: pd.Series
    ) -> Dict:
        """
        Compare les performances avec un benchmark.
        
        Returns:
            Dict avec comparaison détaillée
        """
        # Aligner les séries
        df = pd.DataFrame({
            'portefeuille': serie_portefeuille,
            'benchmark': serie_benchmark
        }).dropna()
        
        if len(df) < 2:
            return {}
        
        # Rendements
        rendements_ptf = df['portefeuille'].pct_change().dropna()
        rendements_bm = df['benchmark'].pct_change().dropna()
        
        # Performance totale
        perf_ptf = ((df['portefeuille'].iloc[-1] / df['portefeuille'].iloc[0]) - 1) * 100
        perf_bm = ((df['benchmark'].iloc[-1] / df['benchmark'].iloc[0]) - 1) * 100
        
        # Volatilité
        vol_ptf = rendements_ptf.std() * np.sqrt(252) * 100
        vol_bm = rendements_bm.std() * np.sqrt(252) * 100
        
        # Sharpe Ratio
        sharpe_ptf = (rendements_ptf.mean() * 252) / (rendements_ptf.std() * np.sqrt(252)) if rendements_ptf.std() > 0 else 0
        sharpe_bm = (rendements_bm.mean() * 252) / (rendements_bm.std() * np.sqrt(252)) if rendements_bm.std() > 0 else 0
        
        # Alpha et Beta
        from analytics.risk_metrics import RiskMetrics
        beta = RiskMetrics.calculer_beta(rendements_ptf, rendements_bm)
        
        rendement_annuel_ptf = rendements_ptf.mean() * 252 * 100
        rendement_annuel_bm = rendements_bm.mean() * 252 * 100
        alpha = rendement_annuel_ptf - (beta * rendement_annuel_bm)
        
        return {
            "performance_portefeuille": round(perf_ptf, 2),
            "performance_benchmark": round(perf_bm, 2),
            "surperformance": round(perf_ptf - perf_bm, 2),
            "volatilite_portefeuille": round(vol_ptf, 2),
            "volatilite_benchmark": round(vol_bm, 2),
            "sharpe_portefeuille": round(sharpe_ptf, 2),
            "sharpe_benchmark": round(sharpe_bm, 2),
            "alpha": round(alpha, 2),
            "beta": round(beta, 2)
        }
    
    @staticmethod
    def rapport_performance_complet(
        serie_valeurs: pd.Series,
        rendements: pd.Series,
        serie_benchmark: Optional[pd.Series] = None
    ) -> Dict:
        """
        Génère un rapport de performance complet.
        
        Returns:
            Dict avec toutes les métriques de performance
        """
        valeur_initiale = serie_valeurs.iloc[0]
        valeur_finale = serie_valeurs.iloc[-1]
        nb_annees = len(serie_valeurs) / 252
        
        rapport = {
            "valeur_initiale": round(valeur_initiale, 2),
            "valeur_finale": round(valeur_finale, 2),
            "rendement_total": round(PerformanceAnalyzer.calculer_rendement_total(valeur_initiale, valeur_finale), 2),
            "cagr": round(PerformanceAnalyzer.calculer_rendement_annualise(valeur_initiale, valeur_finale, nb_annees), 2),
            "volatilite": round(PerformanceAnalyzer.calculer_volatilite_annualisee(rendements), 2),
            "performances_periodes": PerformanceAnalyzer.analyser_periodes(serie_valeurs)
        }
        
        if serie_benchmark is not None and len(serie_benchmark) > 0:
            rapport["comparaison_benchmark"] = PerformanceAnalyzer.comparer_avec_benchmark(
                serie_valeurs, serie_benchmark
            )
        
        return rapport
