from typing import List, Dict


class TaxLossHarvester:
    """
    Implémentation du Tax-Loss Harvesting pour CTO.
    
    Stratégie: vendre positions en moins-value pour compenser gains,
    puis réinvestir dans ETF similaire mais différent (éviter wash sale).
    """
    
    @staticmethod
    def identifier_opportunites_tlh(
        positions_cto: List[dict],
        seuil_perte_min: float = 100.0
    ) -> List[dict]:
        """
        Identifie les positions en moins-value candidates au TLH.
        
        Args:
            positions_cto: Positions sur CTO
            seuil_perte_min: Perte minimale pour considérer TLH (€)
        
        Returns:
            Liste d'opportunités TLH
        """
        opportunites = []
        
        for position in positions_cto:
            pv_latente = position.get("plus_value_latente", 0)
            
            if pv_latente < -seuil_perte_min:
                opportunites.append({
                    "isin": position.get("isin"),
                    "ticker": position.get("ticker"),
                    "nom": position.get("nom"),
                    "perte_latente": abs(pv_latente),
                    "valeur_actuelle": position.get("valeur_actuelle", 0),
                    "quantite": position.get("quantite", 0),
                    "classe_actif": position.get("classe_actif", ""),
                    "economie_fiscale_potentielle": abs(pv_latente) * 0.30  # Flat tax 30%
                })
        
        # Trier par économie fiscale décroissante
        opportunites.sort(key=lambda x: x["economie_fiscale_potentielle"], reverse=True)
        
        return opportunites
    
    @staticmethod
    def suggerer_etf_remplacement(
        etf_vendu: dict,
        universe_etfs: List[dict]
    ) -> List[dict]:
        """
        Suggère des ETFs de remplacement similaires mais différents.
        
        Évite le "wash sale" (rachat immédiat du même titre).
        
        Args:
            etf_vendu: ETF vendu pour TLH
            universe_etfs: Univers d'ETFs disponibles
        
        Returns:
            Liste d'ETFs de remplacement suggérés
        """
        classe_actif_cible = etf_vendu.get("classe_actif", "")
        isin_vendu = etf_vendu.get("isin", "")
        
        suggestions = []
        
        for etf in universe_etfs:
            # Même classe d'actif mais ISIN différent
            if (etf.get("classe_actif") == classe_actif_cible and 
                etf.get("isin") != isin_vendu):
                
                suggestions.append({
                    "isin": etf.get("isin"),
                    "ticker": etf.get("ticker"),
                    "nom": etf.get("nom"),
                    "ter": etf.get("ter", 0),
                    "emetteur": etf.get("emetteur", ""),
                    "raison": f"Alternative {classe_actif_cible} - Émetteur différent"
                })
        
        # Trier par TER croissant
        suggestions.sort(key=lambda x: x["ter"])
        
        return suggestions[:3]  # Top 3 suggestions
    
    @staticmethod
    def calculer_impact_tlh(
        perte_realisee: float,
        gains_annee_en_cours: float,
        taux_imposition: float = 0.30
    ) -> dict:
        """
        Calcule l'impact fiscal du Tax-Loss Harvesting.
        
        Args:
            perte_realisee: Montant de la perte réalisée
            gains_annee_en_cours: Gains déjà réalisés dans l'année
            taux_imposition: Taux d'imposition (flat tax 30%)
        
        Returns:
            Dict avec impact fiscal
        """
        # Compensation gains/pertes
        gains_nets = gains_annee_en_cours - perte_realisee
        
        if gains_nets > 0:
            # Perte compense partiellement ou totalement les gains
            impot_sans_tlh = gains_annee_en_cours * taux_imposition
            impot_avec_tlh = gains_nets * taux_imposition
            economie_immediate = impot_sans_tlh - impot_avec_tlh
            
            return {
                "gains_annee": gains_annee_en_cours,
                "perte_realisee": perte_realisee,
                "gains_nets": gains_nets,
                "impot_sans_tlh": impot_sans_tlh,
                "impot_avec_tlh": impot_avec_tlh,
                "economie_fiscale": economie_immediate,
                "report_perte": 0
            }
        else:
            # Perte supérieure aux gains: report sur 10 ans
            impot_avec_tlh = 0
            report_perte = abs(gains_nets)
            economie_immediate = gains_annee_en_cours * taux_imposition
            
            return {
                "gains_annee": gains_annee_en_cours,
                "perte_realisee": perte_realisee,
                "gains_nets": 0,
                "impot_sans_tlh": gains_annee_en_cours * taux_imposition,
                "impot_avec_tlh": 0,
                "economie_fiscale": economie_immediate,
                "report_perte": report_perte,
                "message": f"Report de {report_perte:.2f}€ de pertes sur 10 ans"
            }
    
    @staticmethod
    def generer_plan_tlh(
        positions_cto: List[dict],
        gains_annee: float,
        universe_etfs: List[dict]
    ) -> dict:
        """
        Génère un plan complet de Tax-Loss Harvesting.
        
        Returns:
            Dict avec plan d'action TLH
        """
        opportunites = TaxLossHarvester.identifier_opportunites_tlh(positions_cto)
        
        if not opportunites:
            return {
                "opportunites_trouvees": 0,
                "message": "Aucune opportunité de TLH détectée"
            }
        
        plan_actions = []
        
        for opp in opportunites:
            # Trouver ETFs de remplacement
            etf_vendu = {
                "isin": opp["isin"],
                "classe_actif": opp["classe_actif"]
            }
            suggestions = TaxLossHarvester.suggerer_etf_remplacement(
                etf_vendu, universe_etfs
            )
            
            impact = TaxLossHarvester.calculer_impact_tlh(
                perte_realisee=opp["perte_latente"],
                gains_annee_en_cours=gains_annee
            )
            
            plan_actions.append({
                "position_a_vendre": opp,
                "etfs_remplacement": suggestions,
                "impact_fiscal": impact
            })
        
        economie_totale_potentielle = sum(
            opp["economie_fiscale_potentielle"] for opp in opportunites
        )
        
        return {
            "opportunites_trouvees": len(opportunites),
            "economie_totale_potentielle": economie_totale_potentielle,
            "plan_actions": plan_actions,
            "recommandation": "Exécuter TLH avant fin d'année fiscale"
        }
