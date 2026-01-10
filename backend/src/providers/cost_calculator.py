from typing import Dict


class CostCalculator:
    """
    Calculateur de coûts détaillés pour différents providers.
    """
    
    @staticmethod
    def calculer_cout_pea(
        provider_config: dict,
        montant_investissement: float,
        nb_ordres_annuel: int = 12
    ) -> Dict:
        """
        Calcule le coût total d'un PEA.
        
        Returns:
            Dict avec détail des coûts
        """
        frais_courtage = provider_config["frais_courtage"]
        
        # Frais par ordre
        cout_fixe_par_ordre = frais_courtage.get("fixe", 0)
        cout_variable_pct = frais_courtage.get("variable_pct", 0)
        
        montant_par_ordre = montant_investissement / nb_ordres_annuel if nb_ordres_annuel > 0 else 0
        
        # Total frais courtage
        cout_courtage_fixe = cout_fixe_par_ordre * nb_ordres_annuel
        cout_courtage_variable = montant_investissement * (cout_variable_pct / 100)
        cout_courtage_total = cout_courtage_fixe + cout_courtage_variable
        
        # Frais tenue compte
        frais_tenue_compte = provider_config.get("frais_tenue_compte", 0)
        
        # Total
        cout_total = cout_courtage_total + frais_tenue_compte
        
        # Ratio coût/investissement
        ratio_cout = (cout_total / montant_investissement * 100) if montant_investissement > 0 else 0
        
        return {
            "cout_courtage_fixe": round(cout_courtage_fixe, 2),
            "cout_courtage_variable": round(cout_courtage_variable, 2),
            "cout_courtage_total": round(cout_courtage_total, 2),
            "frais_tenue_compte": frais_tenue_compte,
            "cout_total_annuel": round(cout_total, 2),
            "ratio_cout_pct": round(ratio_cout, 2)
        }
    
    @staticmethod
    def calculer_cout_av(
        provider_config: dict,
        montant_investi_uc: float,
        montant_investi_fonds_euros: float,
        duree_annees: int = 10
    ) -> Dict:
        """
        Calcule le coût total d'une Assurance-Vie sur durée.
        
        Returns:
            Dict avec projection des coûts
        """
        frais_versement = provider_config.get("frais_versement", 0)
        frais_gestion_uc = provider_config.get("frais_gestion_uc", 0)
        frais_gestion_fe = provider_config.get("frais_gestion_fonds_euros", 0)
        
        # Coûts annuels
        cout_gestion_uc_annuel = montant_investi_uc * (frais_gestion_uc / 100)
        cout_gestion_fe_annuel = montant_investi_fonds_euros * (frais_gestion_fe / 100)
        cout_gestion_annuel = cout_gestion_uc_annuel + cout_gestion_fe_annuel
        
        # Projection sur durée
        cout_total_sur_duree = cout_gestion_annuel * duree_annees
        
        # Impact sur performance (simplifié: frais réduit le rendement)
        montant_total = montant_investi_uc + montant_investi_fonds_euros
        impact_performance_annuel = (cout_gestion_annuel / montant_total * 100) if montant_total > 0 else 0
        
        return {
            "frais_versement": frais_versement,
            "cout_gestion_uc_annuel": round(cout_gestion_uc_annuel, 2),
            "cout_gestion_fonds_euros_annuel": round(cout_gestion_fe_annuel, 2),
            "cout_gestion_annuel": round(cout_gestion_annuel, 2),
            "cout_total_sur_duree": round(cout_total_sur_duree, 2),
            "impact_performance_annuel_pct": round(impact_performance_annuel, 2)
        }
    
    @staticmethod
    def comparer_couts_providers(
        providers: list,
        type_enveloppe: str,
        montant: float
    ) -> list:
        """
        Compare les coûts de plusieurs providers.
        
        Returns:
            Liste triée par coût croissant
        """
        comparaison = []
        
        for provider in providers:
            if type_enveloppe == "pea":
                couts = CostCalculator.calculer_cout_pea(provider, montant)
                cout_total = couts["cout_total_annuel"]
            elif type_enveloppe == "av":
                # Simplification: tout en UC
                couts = CostCalculator.calculer_cout_av(provider, montant, 0)
                cout_total = couts["cout_gestion_annuel"]
            else:
                cout_total = 0
            
            comparaison.append({
                "nom": provider.get("nom", ""),
                "cout_total_annuel": cout_total,
                "details": couts
            })
        
        # Trier par coût croissant
        comparaison.sort(key=lambda x: x["cout_total_annuel"])
        
        return comparaison
