import numpy as np
import pandas as pd
from typing import Dict


class RiskMetrics:
    """
    Calcul des métriques de risque avancées.
    """
    
    @staticmethod
    def calculer_var(
        rendements: pd.Series,
        niveau_confiance: float = 0.95
    ) -> float:
        """
        Calcule la Value at Risk (VaR).
        
        VaR = perte maximale avec un niveau de confiance donné
        """
        if len(rendements) < 2:
            return 0.0
        
        return np.percentile(rendements, (1 - niveau_confiance) * 100) * 100
    
    @staticmethod
    def calculer_cvar(
        rendements: pd.Series,
        niveau_confiance: float = 0.95
    ) -> float:
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
    
    @staticmethod
    def calculer_beta(
        rendements_actif: pd.Series,
        rendements_marche: pd.Series
    ) -> float:
        """
        Calcule le Beta (sensibilité au marché).
        
        Beta = Cov(actif, marché) / Var(marché)
        """
        if len(rendements_actif) < 2 or len(rendements_marche) < 2:
            return 1.0
        
        # Aligner les séries
        df = pd.DataFrame({
            'actif': rendements_actif,
            'marche': rendements_marche
        }).dropna()
        
        if len(df) < 2:
            return 1.0
        
        covariance = df['actif'].cov(df['marche'])
        variance_marche = df['marche'].var()
        
        if variance_marche == 0:
            return 1.0
        
        return covariance / variance_marche
    
    @staticmethod
    def calculer_tracking_error(
        rendements_actif: pd.Series,
        rendements_benchmark: pd.Series
    ) -> float:
        """
        Calcule la Tracking Error (écart vs benchmark).
        
        TE = volatilité de (Rendements actif - Rendements benchmark)
        """
        df = pd.DataFrame({
            'actif': rendements_actif,
            'benchmark': rendements_benchmark
        }).dropna()
        
        if len(df) < 2:
            return 0.0
        
        ecarts = df['actif'] - df['benchmark']
        tracking_error = ecarts.std() * np.sqrt(252) * 100
        
        return tracking_error
    
    @staticmethod
    def calculer_information_ratio(
        rendements_actif: pd.Series,
        rendements_benchmark: pd.Series
    ) -> float:
        """
        Calcule l'Information Ratio.
        
        IR = (Rendement actif - Rendement benchmark) / Tracking Error
        """
        df = pd.DataFrame({
            'actif': rendements_actif,
            'benchmark': rendements_benchmark
        }).dropna()
        
        if len(df) < 2:
            return 0.0
        
        rendement_actif_annuel = df['actif'].mean() * 252
        rendement_benchmark_annuel = df['benchmark'].mean() * 252
        
        ecarts = df['actif'] - df['benchmark']
        tracking_error = ecarts.std() * np.sqrt(252)
        
        if tracking_error == 0:
            return 0.0
        
        return (rendement_actif_annuel - rendement_benchmark_annuel) / tracking_error
    
    @staticmethod
    def calculer_skewness(rendements: pd.Series) -> float:
        """
        Calcule le Skewness (asymétrie de la distribution).
        
        Skewness > 0: distribution asymétrique à droite (plus de gains extrêmes)
        Skewness < 0: distribution asymétrique à gauche (plus de pertes extrêmes)
        """
        if len(rendements) < 3:
            return 0.0
        
        return rendements.skew()
    
    @staticmethod
    def calculer_kurtosis(rendements: pd.Series) -> float:
        """
        Calcule le Kurtosis (épaisseur des queues de distribution).
        
        Kurtosis > 3: fat tails (plus d'événements extrêmes)
        Kurtosis < 3: thin tails
        """
        if len(rendements) < 4:
            return 3.0
        
        return rendements.kurtosis() + 3  # Ajouter 3 pour kurtosis normale
    
    @staticmethod
    def analyse_risque_complete(
        rendements: pd.Series,
        rendements_benchmark: Optional[pd.Series] = None
    ) -> Dict:
        """
        Analyse de risque complète.
        
        Returns:
            Dict avec toutes les métriques de risque
        """
        resultats = {
            "var_95": round(RiskMetrics.calculer_var(rendements, 0.95), 2),
            "cvar_95": round(RiskMetrics.calculer_cvar(rendements, 0.95), 2),
            "var_99": round(RiskMetrics.calculer_var(rendements, 0.99), 2),
            "cvar_99": round(RiskMetrics.calculer_cvar(rendements, 0.99), 2),
            "skewness": round(RiskMetrics.calculer_skewness(rendements), 2),
            "kurtosis": round(RiskMetrics.calculer_kurtosis(rendements), 2)
        }
        
        if rendements_benchmark is not None and len(rendements_benchmark) > 0:
            resultats.update({
                "beta": round(RiskMetrics.calculer_beta(rendements, rendements_benchmark), 2),
                "tracking_error": round(RiskMetrics.calculer_tracking_error(rendements, rendements_benchmark), 2),
                "information_ratio": round(RiskMetrics.calculer_information_ratio(rendements, rendements_benchmark), 2)
            })
        
        return resultats
