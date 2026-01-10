import pandas as pd
import numpy as np
from typing import Dict, List, Optional
from datetime import datetime
from enum import Enum


class FrequenceReequilibrage(str, Enum):
    MENSUEL = "mensuel"
    TRIMESTRIEL = "trimestriel"
    ANNUEL = "annuel"
    JAMAIS = "jamais"


class BacktestEngine:
    """
    Moteur de backtesting de niveau institutionnel.
    
    Fonctionnalités:
    - Données historiques via yfinance (2000-2024)
    - Calcul métriques: CAGR, volatilité, Sharpe, Sortino, Calmar
    - Maximum drawdown avec tracking temporel
    - VaR et CVaR à 95%
    - Support rééquilibrage périodique
    """
    
    def __init__(self):
        self.data_cache = {}
    
    def calculer_cagr(self, valeur_initiale: float, valeur_finale: float, nb_annees: float) -> float:
        """Calcule le CAGR (Compound Annual Growth Rate)"""
        if valeur_initiale <= 0 or nb_annees <= 0:
            return 0.0
        return ((valeur_finale / valeur_initiale) ** (1 / nb_annees) - 1) * 100
    
    def calculer_volatilite(self, rendements: pd.Series) -> float:
        """Calcule la volatilité annualisée"""
        if len(rendements) < 2:
            return 0.0
        return rendements.std() * np.sqrt(252) * 100  # Annualisé
    
    def calculer_sharpe_ratio(
        self,
        rendements: pd.Series,
        taux_sans_risque: float = 0.02
    ) -> float:
        """
        Calcule le Sharpe Ratio (rendement ajusté du risque).
        
        Sharpe = (Rendement moyen - Taux sans risque) / Volatilité
        """
        if len(rendements) < 2:
            return 0.0
        
        rendement_moyen_annuel = rendements.mean() * 252
        volatilite_annuelle = rendements.std() * np.sqrt(252)
        
        if volatilite_annuelle == 0:
            return 0.0
        
        return (rendement_moyen_annuel - taux_sans_risque) / volatilite_annuelle
    
    def calculer_sortino_ratio(
        self,
        rendements: pd.Series,
        taux_sans_risque: float = 0.02
    ) -> float:
        """
        Calcule le Sortino Ratio (volatilité baisse uniquement).
        
        Sortino = (Rendement moyen - Taux sans risque) / Downside deviation
        """
        if len(rendements) < 2:
            return 0.0
        
        rendement_moyen_annuel = rendements.mean() * 252
        
        # Downside deviation: uniquement rendements négatifs
        rendements_negatifs = rendements[rendements < 0]
        
        if len(rendements_negatifs) == 0:
            return float('inf')  # Aucune baisse
        
        downside_deviation = rendements_negatifs.std() * np.sqrt(252)
        
        if downside_deviation == 0:
            return 0.0
        
        return (rendement_moyen_annuel - taux_sans_risque) / downside_deviation
    
    def calculer_calmar_ratio(self, cagr: float, max_drawdown: float) -> float:
        """
        Calcule le Calmar Ratio.
        
        Calmar = CAGR / |Max Drawdown|
        """
        if max_drawdown == 0:
            return 0.0
        return abs(cagr / max_drawdown)
    
    def calculer_var(self, rendements: pd.Series, niveau_confiance: float = 0.95) -> float:
        """
        Calcule la Value at Risk (VaR) à un niveau de confiance donné.
        
        VaR 95% = perte maximale avec 95% de probabilité
        """
        if len(rendements) < 2:
            return 0.0
        
        return np.percentile(rendements, (1 - niveau_confiance) * 100) * 100
    
    def calculer_cvar(self, rendements: pd.Series, niveau_confiance: float = 0.95) -> float:
        """
        Calcule le Conditional VaR (CVaR / Expected Shortfall).
        
        CVaR = perte moyenne au-delà du VaR
        """
        if len(rendements) < 2:
            return 0.0
        
        var_seuil = np.percentile(rendements, (1 - niveau_confiance) * 100)
        rendements_pires = rendements[rendements <= var_seuil]
        
        if len(rendements_pires) == 0:
            return 0.0
        
        return rendements_pires.mean() * 100
    
    def analyser_annees(self, rendements_annuels: pd.Series) -> dict:
        """Analyse des performances par année"""
        if len(rendements_annuels) == 0:
            return {
                "meilleure_annee": 0.0,
                "pire_annee": 0.0,
                "pct_annees_positives": 0.0
            }
        
        return {
            "meilleure_annee": rendements_annuels.max() * 100,
            "pire_annee": rendements_annuels.min() * 100,
            "pct_annees_positives": (rendements_annuels > 0).sum() / len(rendements_annuels) * 100
        }
    
    def backtester_allocation(
        self,
        allocation: Dict[str, float],
        prix_historiques: Dict[str, pd.Series],
        date_debut: Optional[str] = None,
        date_fin: Optional[str] = None,
        frequence_reequilibrage: FrequenceReequilibrage = FrequenceReequilibrage.TRIMESTRIEL,
        frais_transaction: float = 0.001
    ) -> dict:
        """
        Backtest complet d'une allocation.
        
        Args:
            allocation: Dict {ticker: poids%}
            prix_historiques: Dict {ticker: Series de prix}
            date_debut: Date de début (format YYYY-MM-DD)
            date_fin: Date de fin (format YYYY-MM-DD)
            frequence_reequilibrage: Fréquence de rééquilibrage
            frais_transaction: Frais de transaction (%)
        
        Returns:
            Dict avec toutes les métriques de performance
        """
        # Créer DataFrame de prix alignés
        df_prix = pd.DataFrame(prix_historiques)
        
        if date_debut:
            df_prix = df_prix[df_prix.index >= date_debut]
        if date_fin:
            df_prix = df_prix[df_prix.index <= date_fin]
        
        # Calculer rendements quotidiens
        rendements = df_prix.pct_change().dropna()
        
        # Simuler portefeuille avec rééquilibrage
        valeur_portefeuille = [100.0]  # Valeur initiale normalisée
        
        for i in range(1, len(rendements)):
            # Rendement pondéré du jour
            rendement_jour = sum(
                allocation.get(ticker, 0) / 100 * rendements[ticker].iloc[i]
                for ticker in allocation.keys()
                if ticker in rendements.columns
            )
            
            # Appliquer rendement
            nouvelle_valeur = valeur_portefeuille[-1] * (1 + rendement_jour)
            
            # Simuler rééquilibrage périodique avec frais
            if self._doit_reequilibrer(i, frequence_reequilibrage):
                nouvelle_valeur *= (1 - frais_transaction)
            
            valeur_portefeuille.append(nouvelle_valeur)
        
        # Créer série de valeurs
        serie_valeurs = pd.Series(valeur_portefeuille, index=df_prix.index[:len(valeur_portefeuille)])
        
        # Calculer rendements du portefeuille
        rendements_ptf = serie_valeurs.pct_change().dropna()
        
        # Calculer métriques
        nb_annees = len(df_prix) / 252
        cagr = self.calculer_cagr(100.0, valeur_portefeuille[-1], nb_annees)
        volatilite = self.calculer_volatilite(rendements_ptf)
        sharpe = self.calculer_sharpe_ratio(rendements_ptf)
        sortino = self.calculer_sortino_ratio(rendements_ptf)
        
        # Maximum drawdown
        from .drawdown_analysis import DrawdownAnalyzer
        max_dd, dd_details = DrawdownAnalyzer.calculer_max_drawdown(serie_valeurs)
        
        calmar = self.calculer_calmar_ratio(cagr, max_dd)
        var_95 = self.calculer_var(rendements_ptf)
        cvar_95 = self.calculer_cvar(rendements_ptf)
        
        # Analyse par année
        rendements_annuels = serie_valeurs.resample('Y').last().pct_change().dropna()
        stats_annees = self.analyser_annees(rendements_annuels)
        
        return {
            "valeur_finale": valeur_portefeuille[-1],
            "cagr": round(cagr, 2),
            "volatilite": round(volatilite, 2),
            "sharpe_ratio": round(sharpe, 2),
            "sortino_ratio": round(sortino, 2),
            "calmar_ratio": round(calmar, 2),
            "max_drawdown": round(max_dd, 2),
            "var_95": round(var_95, 2),
            "cvar_95": round(cvar_95, 2),
            "meilleure_annee": round(stats_annees["meilleure_annee"], 2),
            "pire_annee": round(stats_annees["pire_annee"], 2),
            "pct_annees_positives": round(stats_annees["pct_annees_positives"], 1),
            "nb_annees": round(nb_annees, 1),
            "serie_valeurs": serie_valeurs.to_dict(),
            "drawdown_details": dd_details
        }
    
    def _doit_reequilibrer(self, jour_index: int, frequence: FrequenceReequilibrage) -> bool:
        """Détermine si rééquilibrage nécessaire selon fréquence"""
        if frequence == FrequenceReequilibrage.JAMAIS:
            return False
        elif frequence == FrequenceReequilibrage.MENSUEL:
            return jour_index % 21 == 0  # ~21 jours ouvrés par mois
        elif frequence == FrequenceReequilibrage.TRIMESTRIEL:
            return jour_index % 63 == 0  # ~63 jours ouvrés par trimestre
        elif frequence == FrequenceReequilibrage.ANNUEL:
            return jour_index % 252 == 0  # ~252 jours ouvrés par an
        return False
