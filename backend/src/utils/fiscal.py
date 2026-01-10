from typing import Dict


class FiscalUtils:
    """
    Utilitaires de calcul fiscal.
    """
    
    # Tranches marginales d'imposition 2024
    TMI_TRANCHES = [
        (0, 11294, 0),
        (11294, 28797, 11),
        (28797, 82341, 30),
        (82341, 177106, 41),
        (177106, float('inf'), 45)
    ]
    
    @staticmethod
    def calculer_tmi(revenu_imposable: float, parts_fiscales: float = 1.0) -> float:
        """
        Calcule la Tranche Marginale d'Imposition (TMI).
        
        Args:
            revenu_imposable: Revenu net imposable annuel
            parts_fiscales: Nombre de parts fiscales
        
        Returns:
            TMI en %
        """
        quotient_familial = revenu_imposable / parts_fiscales
        
        for seuil_bas, seuil_haut, taux in FiscalUtils.TMI_TRANCHES:
            if seuil_bas <= quotient_familial < seuil_haut:
                return float(taux)
        
        return 45.0  # Tranche max
    
    @staticmethod
    def calculer_impot_ir(revenu_imposable: float, parts_fiscales: float = 1.0) -> Dict:
        """
        Calcule l'impôt sur le revenu.
        
        Returns:
            Dict avec détail par tranche et total
        """
        quotient_familial = revenu_imposable / parts_fiscales
        
        impot_par_part = 0
        detail_tranches = []
        
        for i, (seuil_bas, seuil_haut, taux) in enumerate(FiscalUtils.TMI_TRANCHES):
            if quotient_familial > seuil_bas:
                montant_tranche = min(quotient_familial, seuil_haut) - seuil_bas
                impot_tranche = montant_tranche * (taux / 100)
                impot_par_part += impot_tranche
                
                if montant_tranche > 0:
                    detail_tranches.append({
                        "tranche": i + 1,
                        "taux": taux,
                        "montant_imposable": round(montant_tranche, 2),
                        "impot": round(impot_tranche, 2)
                    })
            
            if quotient_familial <= seuil_haut:
                break
        
        impot_total = impot_par_part * parts_fiscales
        taux_moyen = (impot_total / revenu_imposable * 100) if revenu_imposable > 0 else 0
        
        return {
            "revenu_imposable": revenu_imposable,
            "parts_fiscales": parts_fiscales,
            "impot_total": round(impot_total, 2),
            "taux_moyen": round(taux_moyen, 2),
            "tmi": FiscalUtils.calculer_tmi(revenu_imposable, parts_fiscales),
            "detail_tranches": detail_tranches
        }
    
    @staticmethod
    def calculer_economie_per(
        versement_per: float,
        tmi: float
    ) -> Dict:
        """
        Calcule l'économie fiscale d'un versement PER.
        
        Args:
            versement_per: Montant versé sur PER
            tmi: Tranche Marginale d'Imposition
        
        Returns:
            Dict avec économie fiscale
        """
        economie_ir = versement_per * (tmi / 100)
        
        # Coût réel du versement après déduction
        cout_reel = versement_per - economie_ir
        
        return {
            "versement_per": versement_per,
            "tmi": tmi,
            "economie_ir": round(economie_ir, 2),
            "cout_reel": round(cout_reel, 2),
            "taux_reduction": round((economie_ir / versement_per) * 100, 2)
        }
    
    @staticmethod
    def calculer_plafond_per(
        revenus_professionnels: float,
        plafonds_non_utilises: float = 0
    ) -> Dict:
        """
        Calcule le plafond de déduction PER.
        
        Plafond = 10% revenus pro (max 35,194€ en 2024)
        
        Returns:
            Dict avec plafond disponible
        """
        PLAFOND_MAX = 35194  # 2024
        
        plafond_annee = min(
            revenus_professionnels * 0.10,
            PLAFOND_MAX
        )
        
        plafond_total_disponible = plafond_annee + plafonds_non_utilises
        
        return {
            "revenus_professionnels": revenus_professionnels,
            "plafond_annee_courante": round(plafond_annee, 2),
            "plafonds_non_utilises_anterieurs": plafonds_non_utilises,
            "plafond_total_disponible": round(plafond_total_disponible, 2)
        }
    
    @staticmethod
    def optimiser_fiscalite_couple(
        revenu_personne1: float,
        revenu_personne2: float,
        situation: str = "marie"
    ) -> Dict:
        """
        Optimise la fiscalité pour un couple.
        
        Args:
            situation: "marie", "pacse", "concubinage"
        
        Returns:
            Dict avec comparaison déclarations séparées vs commune
        """
        # Déclarations séparées
        parts_separees = 1.0
        impot_p1 = FiscalUtils.calculer_impot_ir(revenu_personne1, parts_separees)
        impot_p2 = FiscalUtils.calculer_impot_ir(revenu_personne2, parts_separees)
        impot_total_separe = impot_p1["impot_total"] + impot_p2["impot_total"]
        
        # Déclaration commune (si marié/pacsé)
        if situation in ["marie", "pacse"]:
            parts_commune = 2.0
            revenu_total = revenu_personne1 + revenu_personne2
            impot_commun = FiscalUtils.calculer_impot_ir(revenu_total, parts_commune)
            impot_total_commun = impot_commun["impot_total"]
            
            economie = impot_total_separe - impot_total_commun
            
            return {
                "situation": situation,
                "impot_declarations_separees": round(impot_total_separe, 2),
                "impot_declaration_commune": round(impot_total_commun, 2),
                "economie_fiscale": round(economie, 2),
                "recommandation": "Déclaration commune" if economie > 0 else "Déclarations séparées"
            }
        else:
            return {
                "situation": situation,
                "impot_total": round(impot_total_separe, 2),
                "note": "Déclarations obligatoirement séparées en concubinage"
            }
