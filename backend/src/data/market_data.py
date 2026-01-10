import yfinance as yf
import pandas as pd
from typing import Dict, List, Optional
from datetime import datetime, timedelta


class MarketDataProvider:
    """
    Fournisseur de données de marché via yfinance.
    
    Télécharge prix historiques pour backtesting et analyse.
    """
    
    def __init__(self):
        self.cache = {}
    
    def telecharger_prix_historiques(
        self,
        ticker: str,
        date_debut: Optional[str] = None,
        date_fin: Optional[str] = None,
        periode: str = "max"
    ) -> pd.Series:
        """
        Télécharge les prix historiques d'un ticker.
        
        Args:
            ticker: Ticker Yahoo Finance (ex: "EWLD.PA")
            date_debut: Date de début (format YYYY-MM-DD)
            date_fin: Date de fin (format YYYY-MM-DD)
            periode: Période si pas de dates ("1y", "5y", "max")
        
        Returns:
            Série pandas des prix de clôture ajustés
        """
        cache_key = f"{ticker}_{date_debut}_{date_fin}_{periode}"
        
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        try:
            etf = yf.Ticker(ticker)
            
            if date_debut and date_fin:
                hist = etf.history(start=date_debut, end=date_fin)
            else:
                hist = etf.history(period=periode)
            
            if hist.empty:
                print(f"Pas de données pour {ticker}")
                return pd.Series()
            
            # Prix de clôture ajusté
            prix = hist["Close"]
            
            self.cache[cache_key] = prix
            
            return prix
        
        except Exception as e:
            print(f"Erreur téléchargement {ticker}: {e}")
            return pd.Series()
    
    def telecharger_multiple_tickers(
        self,
        tickers: List[str],
        date_debut: Optional[str] = None,
        date_fin: Optional[str] = None
    ) -> Dict[str, pd.Series]:
        """
        Télécharge les prix de plusieurs tickers.
        
        Returns:
            Dict {ticker: Series}
        """
        prix_dict = {}
        
        for ticker in tickers:
            prix = self.telecharger_prix_historiques(ticker, date_debut, date_fin)
            
            if not prix.empty:
                prix_dict[ticker] = prix
        
        return prix_dict
    
    def get_prix_actuel(self, ticker: str) -> float:
        """Récupère le prix actuel d'un ticker"""
        try:
            etf = yf.Ticker(ticker)
            info = etf.info
            
            # Essayer différents champs
            prix = (
                info.get("currentPrice") or
                info.get("regularMarketPrice") or
                info.get("previousClose", 0)
            )
            
            return float(prix)
        
        except Exception as e:
            print(f"Erreur prix actuel {ticker}: {e}")
            return 0.0
    
    def get_info_etf(self, ticker: str) -> Dict:
        """Récupère les informations d'un ETF"""
        try:
            etf = yf.Ticker(ticker)
            info = etf.info
            
            return {
                "nom": info.get("longName", ""),
                "isin": info.get("isin", ""),
                "devise": info.get("currency", ""),
                "prix_actuel": info.get("currentPrice", 0),
                "variation_jour": info.get("regularMarketChangePercent", 0),
                "volume": info.get("volume", 0),
                "capitalisation": info.get("totalAssets", 0)
            }
        
        except Exception as e:
            print(f"Erreur info {ticker}: {e}")
            return {}
    
    def calculer_rendements(self, prix: pd.Series) -> pd.Series:
        """Calcule les rendements quotidiens"""
        return prix.pct_change().dropna()
    
    def calculer_statistiques_historiques(
        self,
        ticker: str,
        periode: str = "5y"
    ) -> Dict:
        """
        Calcule les statistiques historiques d'un ticker.
        
        Returns:
            Dict avec rendement moyen, volatilité, etc.
        """
        prix = self.telecharger_prix_historiques(ticker, periode=periode)
        
        if prix.empty or len(prix) < 2:
            return {}
        
        rendements = self.calculer_rendements(prix)
        
        # Statistiques annualisées
        rendement_moyen_annuel = rendements.mean() * 252
        volatilite_annuelle = rendements.std() * (252 ** 0.5)
        
        # Performance totale
        perf_totale = (prix.iloc[-1] / prix.iloc[0] - 1) * 100
        
        # Nb années
        nb_jours = len(prix)
        nb_annees = nb_jours / 252
        
        return {
            "ticker": ticker,
            "periode_jours": nb_jours,
            "periode_annees": round(nb_annees, 1),
            "rendement_moyen_annuel": round(rendement_moyen_annuel * 100, 2),
            "volatilite_annuelle": round(volatilite_annuelle * 100, 2),
            "performance_totale": round(perf_totale, 2),
            "prix_debut": round(prix.iloc[0], 2),
            "prix_fin": round(prix.iloc[-1], 2)
        }
