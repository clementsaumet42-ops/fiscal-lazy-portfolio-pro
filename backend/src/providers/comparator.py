import json
from typing import Dict, List
from pathlib import Path


class ProviderComparator:
    """
    Comparateur de providers (courtiers et assureurs).
    """
    
    def __init__(self, data_dir: str = "data/providers"):
        self.data_dir = Path(data_dir)
        self.providers_data = self._load_providers_data()
    
    def _load_providers_data(self) -> Dict:
        """Charge les données des providers depuis JSON"""
        providers = {}
        
        for provider_type in ["pea", "cto", "av", "per"]:
            file_path = self.data_dir / f"{provider_type}_providers.json"
            
            if file_path.exists():
                with open(file_path, "r", encoding="utf-8") as f:
                    providers[provider_type] = json.load(f)
        
        return providers
    
    def comparer_pea(self, montant_investissement_annuel: float = 10000) -> List[dict]:
        """
        Compare les providers PEA.
        
        Args:
            montant_investissement_annuel: Montant investi par an
        
        Returns:
            Liste triée par score
        """
        providers_pea = self.providers_data.get("pea", [])
        
        comparaison = []
        
        for provider in providers_pea:
            # Calculer coût annuel estimé
            frais_courtage_fixes = provider["frais_courtage"].get("fixe", 0)
            frais_courtage_pct = provider["frais_courtage"].get("variable_pct", 0)
            
            # Estimation: 4 ordres par an
            nb_ordres = 4
            montant_par_ordre = montant_investissement_annuel / nb_ordres
            
            cout_total_annuel = (
                (frais_courtage_fixes * nb_ordres) +
                (montant_investissement_annuel * frais_courtage_pct / 100) +
                provider["frais_tenue_compte"]
            )
            
            comparaison.append({
                "id": provider["id"],
                "nom": provider["nom"],
                "cout_annuel_estime": round(cout_total_annuel, 2),
                "score": provider["score"],
                "choix_etfs": provider["choix_etfs"],
                "interface_qualite": provider["interface_qualite"],
                "ifu_automatique": provider["ifu_automatique"],
                "note": provider.get("note", "")
            })
        
        # Trier par score décroissant
        comparaison.sort(key=lambda x: x["score"], reverse=True)
        
        return comparaison
    
    def comparer_cto(self, montant_investissement_annuel: float = 10000) -> List[dict]:
        """Compare les providers CTO"""
        providers_cto = self.providers_data.get("cto", [])
        
        comparaison = []
        
        for provider in providers_cto:
            frais_courtage_fixes = provider["frais_courtage"].get("fixe", 0)
            frais_courtage_pct = provider["frais_courtage"].get("variable_pct", 0)
            
            nb_ordres = 4
            montant_par_ordre = montant_investissement_annuel / nb_ordres
            
            cout_total_annuel = (
                (frais_courtage_fixes * nb_ordres) +
                (montant_investissement_annuel * frais_courtage_pct / 100) +
                provider.get("frais_tenue_compte", 0)
            )
            
            comparaison.append({
                "id": provider["id"],
                "nom": provider["nom"],
                "cout_annuel_estime": round(cout_total_annuel, 2),
                "score": provider["score"],
                "acces_marches": provider["acces_marches"],
                "choix_etfs": provider["choix_etfs"],
                "ifu_automatique": provider["ifu_automatique"],
                "note": provider.get("note", "")
            })
        
        comparaison.sort(key=lambda x: x["score"], reverse=True)
        
        return comparaison
    
    def comparer_av(self, montant_investi: float = 50000) -> List[dict]:
        """Compare les contrats Assurance-Vie"""
        providers_av = self.providers_data.get("av", [])
        
        comparaison = []
        
        for provider in providers_av:
            # Estimation coût sur montant investi
            frais_gestion_uc = provider.get("frais_gestion_uc", 0)
            
            cout_annuel = montant_investi * (frais_gestion_uc / 100)
            
            comparaison.append({
                "id": provider["id"],
                "nom": provider["nom"],
                "assureur": provider.get("assureur", ""),
                "cout_annuel_estime": round(cout_annuel, 2),
                "score": provider["score"],
                "frais_gestion_uc": frais_gestion_uc,
                "rendement_fonds_euros_2023": provider.get("rendement_fonds_euros_2023", 0),
                "choix_etfs": provider["choix_etfs"],
                "gestion_pilotee": provider.get("gestion_pilotee", False),
                "note": provider.get("note", "")
            })
        
        comparaison.sort(key=lambda x: x["score"], reverse=True)
        
        return comparaison
    
    def comparer_per(self, montant_investi: float = 30000) -> List[dict]:
        """Compare les PER"""
        providers_per = self.providers_data.get("per", [])
        
        comparaison = []
        
        for provider in providers_per:
            # Gestion libre si disponible, sinon pilotée
            frais_gestion = (
                provider.get("frais_gestion_libre") 
                if provider.get("gestion_libre") 
                else provider.get("frais_gestion_pilotee", 0)
            )
            
            if frais_gestion:
                cout_annuel = montant_investi * (frais_gestion / 100)
            else:
                cout_annuel = 0
            
            comparaison.append({
                "id": provider["id"],
                "nom": provider["nom"],
                "assureur": provider.get("assureur", ""),
                "cout_annuel_estime": round(cout_annuel, 2),
                "score": provider["score"],
                "gestion_libre": provider.get("gestion_libre", False),
                "gestion_pilotee": provider.get("gestion_pilotee", False),
                "choix_etfs": provider["choix_etfs"],
                "portabilite": provider.get("portabilite", False),
                "note": provider.get("note", "")
            })
        
        comparaison.sort(key=lambda x: x["score"], reverse=True)
        
        return comparaison
    
    def comparaison_complete(
        self,
        montant_pea: float = 10000,
        montant_cto: float = 10000,
        montant_av: float = 50000,
        montant_per: float = 30000
    ) -> Dict[str, List]:
        """
        Comparaison complète de tous les types de providers.
        
        Returns:
            Dict avec comparaisons par type d'enveloppe
        """
        return {
            "pea": self.comparer_pea(montant_pea),
            "cto": self.comparer_cto(montant_cto),
            "av": self.comparer_av(montant_av),
            "per": self.comparer_per(montant_per)
        }
