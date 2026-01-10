import sys
sys.path.append("backend/src")

import pytest
import pandas as pd
import numpy as np
from analytics.backtesting import BacktestEngine, FrequenceReequilibrage


class TestBacktesting:
    """
    Tests du moteur de backtesting.
    
    Vérifie le calcul correct des métriques:
    - CAGR (Compound Annual Growth Rate)
    - Volatilité annualisée
    - Sharpe Ratio
    - Sortino Ratio
    - Calmar Ratio
    - VaR et CVaR
    """
    
    def test_calcul_cagr(self):
        """Test calcul CAGR"""
        engine = BacktestEngine()
        
        # 100 → 200 en 10 ans
        cagr = engine.calculer_cagr(100, 200, 10)
        
        # CAGR attendu = ((200/100)^(1/10) - 1) * 100 = 7.18%
        assert abs(cagr - 7.18) < 0.1
    
    def test_calcul_volatilite(self):
        """Test calcul volatilité annualisée"""
        engine = BacktestEngine()
        
        # Rendements quotidiens avec volatilité connue
        np.random.seed(42)
        rendements = pd.Series(np.random.normal(0, 0.01, 252))  # Volatilité ~1% quotidien
        
        volatilite = engine.calculer_volatilite(rendements)
        
        # Volatilité annualisée ≈ 1% * sqrt(252) ≈ 15.9%
        assert abs(volatilite - 15.9) < 2.0  # Tolérance 2%
    
    def test_calcul_sharpe_ratio(self):
        """Test calcul Sharpe Ratio"""
        engine = BacktestEngine()
        
        # Rendements avec moyenne positive
        np.random.seed(42)
        rendements = pd.Series(np.random.normal(0.0005, 0.01, 252))  # ~13% annuel
        
        sharpe = engine.calculer_sharpe_ratio(rendements, taux_sans_risque=0.02)
        
        # Sharpe attendu ≈ (0.13 - 0.02) / 0.15 ≈ 0.73
        assert sharpe > 0.5
        assert sharpe < 1.5
    
    def test_calcul_sortino_ratio(self):
        """Test calcul Sortino Ratio"""
        engine = BacktestEngine()
        
        # Rendements asymétriques (plus de gains que de pertes)
        np.random.seed(42)
        rendements = pd.Series(np.random.normal(0.001, 0.01, 252))
        
        sortino = engine.calculer_sortino_ratio(rendements, taux_sans_risque=0.02)
        
        # Sortino devrait être > Sharpe (moins de volatilité baisse)
        assert sortino > 0
    
    def test_calcul_calmar_ratio(self):
        """Test calcul Calmar Ratio"""
        engine = BacktestEngine()
        
        cagr = 10.0
        max_drawdown = -20.0
        
        calmar = engine.calculer_calmar_ratio(cagr, max_drawdown)
        
        # Calmar = 10 / 20 = 0.5
        assert calmar == 0.5
    
    def test_calcul_var(self):
        """Test calcul VaR 95%"""
        engine = BacktestEngine()
        
        # Distribution normale
        np.random.seed(42)
        rendements = pd.Series(np.random.normal(0, 0.02, 1000))
        
        var_95 = engine.calculer_var(rendements, 0.95)
        
        # VaR 95% ≈ -3.3% (1.65 * 2%)
        assert var_95 < -2.5
        assert var_95 > -5.0
    
    def test_calcul_cvar(self):
        """Test calcul CVaR (Expected Shortfall)"""
        engine = BacktestEngine()
        
        np.random.seed(42)
        rendements = pd.Series(np.random.normal(0, 0.02, 1000))
        
        cvar_95 = engine.calculer_cvar(rendements, 0.95)
        
        # CVaR > VaR (moyenne des pires 5%)
        var_95 = engine.calculer_var(rendements, 0.95)
        
        assert cvar_95 < var_95  # CVaR plus négatif que VaR
    
    def test_analyser_annees(self):
        """Test analyse par année"""
        engine = BacktestEngine()
        
        # Rendements annuels
        rendements_annuels = pd.Series([0.10, 0.15, -0.05, 0.08, 0.12])
        
        stats = engine.analyser_annees(rendements_annuels)
        
        assert stats["meilleure_annee"] == 15.0  # +15%
        assert stats["pire_annee"] == -5.0  # -5%
        assert stats["pct_annees_positives"] == 80.0  # 4/5
    
    def test_backtester_allocation_synthetique(self):
        """Test backtest complet avec données synthétiques"""
        engine = BacktestEngine()
        
        # Créer données synthétiques
        dates = pd.date_range("2020-01-01", "2023-01-01", freq='D')
        
        # Actions: 7% annuel, 15% volatilité
        np.random.seed(42)
        rdt_actions = np.random.normal(0.07/252, 0.15/np.sqrt(252), len(dates))
        prix_actions = 100 * np.exp(np.cumsum(rdt_actions))
        
        # Obligations: 3% annuel, 5% volatilité
        rdt_oblig = np.random.normal(0.03/252, 0.05/np.sqrt(252), len(dates))
        prix_oblig = 100 * np.exp(np.cumsum(rdt_oblig))
        
        prix_historiques = {
            "ACTIONS": pd.Series(prix_actions, index=dates),
            "OBLIGATIONS": pd.Series(prix_oblig, index=dates)
        }
        
        # Portfolio 60/40
        allocation = {"ACTIONS": 60.0, "OBLIGATIONS": 40.0}
        
        resultats = engine.backtester_allocation(
            allocation=allocation,
            prix_historiques=prix_historiques,
            frequence_reequilibrage=FrequenceReequilibrage.TRIMESTRIEL,
            frais_transaction=0.001
        )
        
        # Vérifications
        assert "cagr" in resultats
        assert "volatilite" in resultats
        assert "sharpe_ratio" in resultats
        assert "sortino_ratio" in resultats
        assert "calmar_ratio" in resultats
        assert "max_drawdown" in resultats
        assert "var_95" in resultats
        assert "cvar_95" in resultats
        
        # Valeurs raisonnables
        assert resultats["cagr"] > 0  # Rendement positif attendu
        assert resultats["volatilite"] > 0
        assert resultats["max_drawdown"] < 0  # Drawdown négatif
        
        # Portfolio 60/40 devrait avoir volatilité < 100% actions
        # ≈ 0.6*15% + 0.4*5% = 11%
        assert resultats["volatilite"] < 15.0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
