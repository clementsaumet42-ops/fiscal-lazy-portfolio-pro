import pandas as pd
import numpy as np
from typing import Tuple, Dict


class DrawdownAnalyzer:
    """
    Analyse des drawdowns (baisses de valeur) d'un portefeuille.
    """
    
    @staticmethod
    def calculer_max_drawdown(serie_valeurs: pd.Series) -> Tuple[float, dict]:
        """
        Calcule le maximum drawdown et ses détails.
        
        Args:
            serie_valeurs: Série temporelle des valeurs du portefeuille
        
        Returns:
            Tuple (max_drawdown_pct, details_dict)
        """
        if len(serie_valeurs) < 2:
            return 0.0, {}
        
        # Calculer running maximum
        running_max = serie_valeurs.expanding().max()
        
        # Calculer drawdown à chaque point
        drawdown = (serie_valeurs - running_max) / running_max * 100
        
        # Trouver maximum drawdown
        max_dd = drawdown.min()
        idx_max_dd = drawdown.idxmin()
        
        # Trouver le pic avant le max drawdown
        mask_avant_creux = serie_valeurs.index <= idx_max_dd
        idx_pic = serie_valeurs[mask_avant_creux].idxmax()
        
        # Trouver la récupération (si elle existe)
        valeur_pic = serie_valeurs[idx_pic]
        mask_apres_creux = serie_valeurs.index > idx_max_dd
        serie_apres = serie_valeurs[mask_apres_creux]
        
        idx_recuperation = None
        duree_recuperation = None
        
        if len(serie_apres) > 0:
            recuperations = serie_apres[serie_apres >= valeur_pic]
            if len(recuperations) > 0:
                idx_recuperation = recuperations.index[0]
                duree_recuperation = (idx_recuperation - idx_pic).days
        
        details = {
            "max_drawdown_pct": round(max_dd, 2),
            "date_pic": str(idx_pic.date()) if hasattr(idx_pic, 'date') else str(idx_pic),
            "date_creux": str(idx_max_dd.date()) if hasattr(idx_max_dd, 'date') else str(idx_max_dd),
            "valeur_pic": round(serie_valeurs[idx_pic], 2),
            "valeur_creux": round(serie_valeurs[idx_max_dd], 2),
            "duree_chute_jours": (idx_max_dd - idx_pic).days if hasattr(idx_max_dd, 'date') else 0,
        }
        
        if idx_recuperation:
            details["date_recuperation"] = str(idx_recuperation.date()) if hasattr(idx_recuperation, 'date') else str(idx_recuperation)
            details["duree_recuperation_jours"] = duree_recuperation
        else:
            details["recuperation"] = "Non récupéré"
        
        return max_dd, details
    
    @staticmethod
    def calculer_serie_drawdowns(serie_valeurs: pd.Series) -> pd.Series:
        """
        Calcule la série temporelle complète des drawdowns.
        
        Returns:
            Série des drawdowns (%)
        """
        running_max = serie_valeurs.expanding().max()
        drawdown = (serie_valeurs - running_max) / running_max * 100
        return drawdown
    
    @staticmethod
    def identifier_tous_drawdowns(
        serie_valeurs: pd.Series,
        seuil_pct: float = -5.0
    ) -> list:
        """
        Identifie tous les drawdowns significatifs.
        
        Args:
            serie_valeurs: Série temporelle des valeurs
            seuil_pct: Seuil minimal de drawdown à considérer (%)
        
        Returns:
            Liste de dicts avec détails de chaque drawdown
        """
        drawdowns_serie = DrawdownAnalyzer.calculer_serie_drawdowns(serie_valeurs)
        
        # Identifier périodes de drawdown
        en_drawdown = drawdowns_serie < 0
        
        # Trouver débuts et fins de périodes
        changements = en_drawdown.astype(int).diff()
        debuts_dd = changements[changements == 1].index
        fins_dd = changements[changements == -1].index
        
        tous_drawdowns = []
        
        for debut in debuts_dd:
            # Trouver la fin correspondante
            fins_possibles = fins_dd[fins_dd > debut]
            
            if len(fins_possibles) > 0:
                fin = fins_possibles[0]
            else:
                fin = serie_valeurs.index[-1]
            
            # Extraire la période
            periode = drawdowns_serie[debut:fin]
            
            if len(periode) > 0:
                dd_min = periode.min()
                
                if dd_min < seuil_pct:
                    idx_creux = periode.idxmin()
                    
                    # Trouver pic avant
                    idx_pic = serie_valeurs[:debut].idxmax()
                    
                    tous_drawdowns.append({
                        "drawdown_pct": round(dd_min, 2),
                        "date_pic": str(idx_pic.date()) if hasattr(idx_pic, 'date') else str(idx_pic),
                        "date_creux": str(idx_creux.date()) if hasattr(idx_creux, 'date') else str(idx_creux),
                        "duree_jours": (idx_creux - idx_pic).days if hasattr(idx_creux, 'date') else 0
                    })
        
        # Trier par drawdown (plus important en premier)
        tous_drawdowns.sort(key=lambda x: x["drawdown_pct"])
        
        return tous_drawdowns
