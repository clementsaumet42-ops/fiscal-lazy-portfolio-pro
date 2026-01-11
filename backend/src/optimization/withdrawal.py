from typing import Dict, List, Tuple
from models.enveloppe import EnveloppeType


class WithdrawalOptimizer:
    """
    Optimisation de l'ordre de retrait pour minimiser la fiscalité.
    """
    
    @staticmethod
    def calculer_cout_fiscal_retrait(
        enveloppe: dict,
        montant: float,
        tmi: float
    ) -> float:
        """
        Calcule le coût fiscal d'un retrait sur une enveloppe.
        
        Returns:
            Coût fiscal total
        """
        type_env = enveloppe.get("type")
        anciennete = enveloppe.get("anciennete_annees", 0)
        plus_value_latente = enveloppe.get("plus_value_latente", 0)
        valeur_totale = enveloppe.get("valeur_totale", 1)
        
        # Proportion de plus-value dans le retrait
        if valeur_totale > 0:
            pv_dans_retrait = montant * (plus_value_latente / valeur_totale)
        else:
            pv_dans_retrait = 0
        
        if type_env == EnveloppeType.PEA:
            if anciennete >= 5:
                # PEA >5 ans: uniquement 17.2% PS
                return pv_dans_retrait * 0.172
            else:
                # PEA <5 ans: TMI + 17.2% PS + clôture
                return pv_dans_retrait * ((tmi / 100) + 0.172)
        
        elif type_env == EnveloppeType.CTO:
            # CTO: flat tax 30%
            return pv_dans_retrait * 0.30
        
        elif type_env == EnveloppeType.ASSURANCE_VIE:
            if anciennete >= 8:
                # AV >8 ans: 7.5% + 17.2% PS (après abattement)
                return pv_dans_retrait * 0.247  # Simplifié
            elif anciennete >= 4:
                # AV 4-8 ans: 15% + 17.2% PS
                return pv_dans_retrait * 0.322
            else:
                # AV <4 ans: 35% + 17.2% PS
                return pv_dans_retrait * 0.522
        
        elif type_env == EnveloppeType.PER:
            # PER: taxation à l'IR
            return montant * ((tmi / 100) + 0.172)
        
        return 0
    
    @staticmethod
    def ordre_retrait_optimal(
        enveloppes: List[dict],
        montant_total: float,
        tmi: float
    ) -> List[Tuple[str, float, float]]:
        """
        Détermine l'ordre optimal de retrait pour minimiser la fiscalité.
        
        Args:
            enveloppes: Liste des enveloppes disponibles
            montant_total: Montant total à retirer
            tmi: Tranche Marginale d'Imposition
        
        Returns:
            Liste de tuples (enveloppe_id, montant, cout_fiscal)
        """
        # Calculer le coût fiscal par euro retiré pour chaque enveloppe
        couts_fiscaux = []
        
        for env in enveloppes:
            if env.get("valeur_totale", 0) > 0:
                cout = WithdrawalOptimizer.calculer_cout_fiscal_retrait(
                    enveloppe=env,
                    montant=1000,  # Montant de référence
                    tmi=tmi
                )
                taux_fiscal = cout / 1000
                
                couts_fiscaux.append({
                    "id": env.get("id"),
                    "type": env.get("type"),
                    "taux_fiscal": taux_fiscal,
                    "valeur_disponible": env.get("valeur_totale", 0),
                    "anciennete": env.get("anciennete_annees", 0)
                })
        
        # Trier par taux fiscal croissant
        couts_fiscaux.sort(key=lambda x: x["taux_fiscal"])
        
        # Répartir les retraits
        plan_retrait = []
        montant_restant = montant_total
        
        for env in couts_fiscaux:
            if montant_restant <= 0:
                break
            
            montant_a_retirer = min(montant_restant, env["valeur_disponible"])
            
            if montant_a_retirer > 0:
                cout_fiscal = WithdrawalOptimizer.calculer_cout_fiscal_retrait(
                    enveloppe=env,
                    montant=montant_a_retirer,
                    tmi=tmi
                )
                
                plan_retrait.append((
                    env["id"],
                    montant_a_retirer,
                    cout_fiscal
                ))
                
                montant_restant -= montant_a_retirer
        
        return plan_retrait
    
    @staticmethod
    def recommandations_retrait(
        enveloppes: List[dict],
        montant_souhaite: float,
        tmi: float
    ) -> dict:
        """
        Génère des recommandations détaillées pour un retrait.
        
        Returns:
            Dict avec plan optimal et alternatives
        """
        plan_optimal = WithdrawalOptimizer.ordre_retrait_optimal(
            enveloppes=enveloppes,
            montant_total=montant_souhaite,
            tmi=tmi
        )
        
        cout_fiscal_total = sum(cout for _, _, cout in plan_optimal)
        montant_net = montant_souhaite - cout_fiscal_total
        taux_fiscal_effectif = (cout_fiscal_total / montant_souhaite) * 100 if montant_souhaite > 0 else 0
        
        details_plan = []
        for env_id, montant, cout in plan_optimal:
            env_info = next((e for e in enveloppes if e.get("id") == env_id), None)
            if env_info:
                details_plan.append({
                    "enveloppe_id": env_id,
                    "type_enveloppe": env_info.get("type"),
                    "montant_retrait": montant,
                    "cout_fiscal": cout,
                    "montant_net": montant - cout,
                    "anciennete_annees": env_info.get("anciennete_annees", 0)
                })
        
        return {
            "montant_souhaite": montant_souhaite,
            "cout_fiscal_total": cout_fiscal_total,
            "montant_net": montant_net,
            "taux_fiscal_effectif": taux_fiscal_effectif,
            "plan_retrait": details_plan,
            "recommandation": "Ordre optimal pour minimiser la fiscalité"
        }
