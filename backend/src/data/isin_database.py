import json
from typing import Dict, List, Optional
from pathlib import Path


class ISINDatabase:
    """
    Base de données des ETFs avec ISIN.
    
    Gère l'univers d'ETFs disponibles.
    """
    
    def __init__(self, data_file: str = "data/etfs/universe.json"):
        self.data_file = Path(data_file)
        self.etfs = self._load_etfs()
        self.isin_index = {etf["isin"]: etf for etf in self.etfs}
        self.ticker_index = {etf["ticker"]: etf for etf in self.etfs}
    
    def _load_etfs(self) -> List[dict]:
        """Charge la base d'ETFs depuis JSON"""
        if self.data_file.exists():
            with open(self.data_file, "r", encoding="utf-8") as f:
                return json.load(f)
        return []
    
    def get_by_isin(self, isin: str) -> Optional[dict]:
        """Récupère un ETF par ISIN"""
        return self.isin_index.get(isin)
    
    def get_by_ticker(self, ticker: str) -> Optional[dict]:
        """Récupère un ETF par ticker"""
        return self.ticker_index.get(ticker)
    
    def rechercher(
        self,
        query: str = "",
        eligible_pea: Optional[bool] = None,
        classe_actif: Optional[str] = None,
        type_distribution: Optional[str] = None
    ) -> List[dict]:
        """
        Recherche des ETFs selon critères.
        
        Args:
            query: Recherche texte (nom, ticker, ISIN)
            eligible_pea: Filtrer par éligibilité PEA
            classe_actif: Filtrer par classe d'actifs
            type_distribution: Filtrer par type (capitalisant/distributif)
        
        Returns:
            Liste d'ETFs correspondants
        """
        resultats = self.etfs.copy()
        
        # Filtre texte
        if query:
            query_lower = query.lower()
            resultats = [
                etf for etf in resultats
                if (query_lower in etf["nom"].lower() or
                    query_lower in etf["ticker"].lower() or
                    query_lower in etf["isin"].lower())
            ]
        
        # Filtre éligibilité PEA
        if eligible_pea is not None:
            resultats = [etf for etf in resultats if etf["eligible_pea"] == eligible_pea]
        
        # Filtre classe d'actifs
        if classe_actif:
            resultats = [etf for etf in resultats if etf["classe_actif"] == classe_actif]
        
        # Filtre type distribution
        if type_distribution:
            resultats = [etf for etf in resultats if etf["type_distribution"] == type_distribution]
        
        return resultats
    
    def get_etfs_pea(self) -> List[dict]:
        """Retourne tous les ETFs éligibles PEA"""
        return [etf for etf in self.etfs if etf["eligible_pea"]]
    
    def get_etfs_by_classe(self, classe_actif: str) -> List[dict]:
        """Retourne les ETFs d'une classe d'actifs"""
        return [etf for etf in self.etfs if etf["classe_actif"] == classe_actif]
    
    def get_stats_universe(self) -> Dict:
        """Statistiques sur l'univers d'ETFs"""
        return {
            "nb_total": len(self.etfs),
            "nb_eligible_pea": len([e for e in self.etfs if e["eligible_pea"]]),
            "nb_opcvm_actions_is": len([e for e in self.etfs if e["eligible_opcvm_actions_is"]]),
            "nb_capitalisants": len([e for e in self.etfs if e["type_distribution"] == "capitalisant"]),
            "classes_actifs": list(set(e["classe_actif"] for e in self.etfs)),
            "emetteurs": list(set(e["emetteur"] for e in self.etfs)),
            "ter_moyen": round(sum(e["ter"] for e in self.etfs) / len(self.etfs), 2) if self.etfs else 0
        }
    
    def suggerer_etfs_allocation(
        self,
        allocation_cible: Dict[str, float],
        eligible_pea_only: bool = False
    ) -> Dict[str, List[dict]]:
        """
        Suggère des ETFs pour une allocation cible.
        
        Args:
            allocation_cible: Dict {"actions": %, "obligations": %, ...}
            eligible_pea_only: Uniquement ETFs éligibles PEA
        
        Returns:
            Dict {classe: [etfs suggérés]}
        """
        suggestions = {}
        
        for classe, pct in allocation_cible.items():
            if pct > 0:
                # Rechercher ETFs de cette classe
                if "actions" in classe:
                    # Actions: monde, europe, usa, emergents
                    etfs_classe = [
                        e for e in self.etfs
                        if "actions" in e["classe_actif"]
                    ]
                elif "obligations" in classe:
                    etfs_classe = [
                        e for e in self.etfs
                        if "obligations" in e["classe_actif"]
                    ]
                elif "or" in classe:
                    etfs_classe = [
                        e for e in self.etfs
                        if "or" in e["classe_actif"]
                    ]
                else:
                    etfs_classe = []
                
                # Filtrer PEA si nécessaire
                if eligible_pea_only:
                    etfs_classe = [e for e in etfs_classe if e["eligible_pea"]]
                
                # Trier par TER croissant (frais bas)
                etfs_classe.sort(key=lambda x: x["ter"])
                
                suggestions[classe] = etfs_classe[:5]  # Top 5
        
        return suggestions
