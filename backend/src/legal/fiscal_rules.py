from typing import Dict, List
from models.enveloppe import EnveloppeType


class FiscalRules:
    """
    Implémentation des règles fiscales françaises (CGI).
    
    Références:
    - PEA: CGI Art. 150-0 A
    - AV: CGI Art. 125-0 A, 990 I
    - Société IS: CGI Art. 219, 209-0 A
    - CTO: CGI Art. 150-0 A, 200 A
    """
    
    # Plafonds réglementaires
    PLAFOND_PEA = 150000.0
    PLAFOND_PEA_PME = 225000.0
    PLAFOND_PER_DEDUCTION = 0.10  # 10% revenus pro
    
    # Taux d'imposition
    PRELEVEMENTS_SOCIAUX = 0.172  # 17.2%
    FLAT_TAX = 0.30  # 30% (12.8% IR + 17.2% PS)
    
    @staticmethod
    def verifier_eligibilite_pea(etf: dict) -> Dict[str, any]:
        """
        Vérifie l'éligibilité d'un ETF au PEA.
        
        Règles:
        - Actions UE
        - ETF ≥75% actions UE
        - Émetteur établi dans UE
        
        Returns:
            Dict avec eligible (bool) et raisons
        """
        eligible = etf.get("eligible_pea", False)
        
        raisons = []
        
        if not eligible:
            # Analyser pourquoi
            classe_actif = etf.get("classe_actif", "")
            
            if "usa" in classe_actif.lower():
                raisons.append("Actions USA non éligibles PEA (hors UE)")
            elif "emergents" in classe_actif.lower():
                raisons.append("Actions émergentes non éligibles PEA")
            elif "obligations" in classe_actif.lower():
                raisons.append("Obligations non éligibles PEA")
            else:
                raisons.append("ETF <75% actions UE")
        else:
            raisons.append("ETF éligible: ≥75% actions UE")
        
        return {
            "eligible": eligible,
            "raisons": raisons,
            "reference_legale": "CGI Art. 150-0 A, 2°"
        }
    
    @staticmethod
    def verifier_plafond_pea(montant_verse: float, nouveau_versement: float = 0) -> Dict:
        """
        Vérifie le respect du plafond PEA.
        
        Returns:
            Dict avec respect_plafond (bool) et détails
        """
        total_apres_versement = montant_verse + nouveau_versement
        
        respect_plafond = total_apres_versement <= FiscalRules.PLAFOND_PEA
        capacite_restante = max(0, FiscalRules.PLAFOND_PEA - montant_verse)
        
        return {
            "respect_plafond": respect_plafond,
            "plafond": FiscalRules.PLAFOND_PEA,
            "montant_actuel": montant_verse,
            "capacite_restante": capacite_restante,
            "nouveau_versement_max": min(nouveau_versement, capacite_restante),
            "reference_legale": "CGI Art. 150-0 A, I-1°"
        }
    
    @staticmethod
    def calculer_fiscalite_pea_retrait(
        montant_retrait: float,
        plus_value: float,
        anciennete_annees: float,
        tmi: float
    ) -> Dict:
        """
        Calcule la fiscalité d'un retrait PEA.
        
        Returns:
            Dict avec détails fiscaux
        """
        prelevement_sociaux = plus_value * FiscalRules.PRELEVEMENTS_SOCIAUX
        
        if anciennete_annees < 5:
            # Retrait avant 5 ans: clôture + IR + PS
            impot_ir = plus_value * (tmi / 100)
            impot_total = impot_ir + prelevement_sociaux
            
            return {
                "impot_ir": round(impot_ir, 2),
                "prelevement_sociaux": round(prelevement_sociaux, 2),
                "impot_total": round(impot_total, 2),
                "taux_effectif": round((impot_total / plus_value) * 100, 2) if plus_value > 0 else 0,
                "cloture_plan": True,
                "regime": "PEA <5 ans: IR + PS + Clôture",
                "reference_legale": "CGI Art. 150-0 A, II-1°"
            }
        else:
            # Retrait après 5 ans: exonération IR
            return {
                "impot_ir": 0,
                "prelevement_sociaux": round(prelevement_sociaux, 2),
                "impot_total": round(prelevement_sociaux, 2),
                "taux_effectif": 17.2,
                "cloture_plan": False,
                "regime": "PEA >5 ans: Exonération IR",
                "reference_legale": "CGI Art. 150-0 A, II-5°"
            }
    
    @staticmethod
    def calculer_fiscalite_av(
        montant_retrait: float,
        plus_value: float,
        anciennete_annees: float,
        versements_avant_2017: float,
        tmi: float,
        couple: bool = False
    ) -> Dict:
        """
        Calcule la fiscalité Assurance-Vie.
        
        Régime selon ancienneté (CGI Art. 125-0 A):
        - <4 ans: 35% ou IR + PS
        - 4-8 ans: 15% ou IR + PS
        - >8 ans: 7.5% après abattement (4,600€ / 9,200€ couple) + PS
        """
        abattement_annuel = 9200 if couple else 4600
        prelevement_sociaux = plus_value * FiscalRules.PRELEVEMENTS_SOCIAUX
        
        if anciennete_annees < 4:
            taux_prelevement = min(35, tmi) / 100
            impot_ir = plus_value * taux_prelevement
            
            return {
                "impot_ir": round(impot_ir, 2),
                "prelevement_sociaux": round(prelevement_sociaux, 2),
                "impot_total": round(impot_ir + prelevement_sociaux, 2),
                "taux_effectif": round(((impot_ir + prelevement_sociaux) / plus_value) * 100, 2) if plus_value > 0 else 0,
                "regime": "AV <4 ans",
                "reference_legale": "CGI Art. 125-0 A, II-1°"
            }
        elif anciennete_annees < 8:
            taux_prelevement = min(15, tmi) / 100
            impot_ir = plus_value * taux_prelevement
            
            return {
                "impot_ir": round(impot_ir, 2),
                "prelevement_sociaux": round(prelevement_sociaux, 2),
                "impot_total": round(impot_ir + prelevement_sociaux, 2),
                "taux_effectif": round(((impot_ir + prelevement_sociaux) / plus_value) * 100, 2) if plus_value > 0 else 0,
                "regime": "AV 4-8 ans",
                "reference_legale": "CGI Art. 125-0 A, II-2°"
            }
        else:
            # >8 ans: abattement applicable
            pv_imposable = max(0, plus_value - abattement_annuel)
            impot_ir = pv_imposable * 0.075  # 7.5%
            
            return {
                "impot_ir": round(impot_ir, 2),
                "prelevement_sociaux": round(prelevement_sociaux, 2),
                "impot_total": round(impot_ir + prelevement_sociaux, 2),
                "abattement_utilise": round(min(plus_value, abattement_annuel), 2),
                "taux_effectif": round(((impot_ir + prelevement_sociaux) / plus_value) * 100, 2) if plus_value > 0 else 0,
                "regime": "AV >8 ans avec abattement",
                "reference_legale": "CGI Art. 125-0 A, II-5°"
            }
    
    @staticmethod
    def calculer_fiscalite_cto(
        plus_value: float,
        tmi: float,
        option_bareme: bool = False
    ) -> Dict:
        """
        Calcule la fiscalité CTO.
        
        Choix: Flat tax 30% OU Barème IR + PS
        """
        if option_bareme:
            impot_ir = plus_value * (tmi / 100)
            prelevement_sociaux = plus_value * FiscalRules.PRELEVEMENTS_SOCIAUX
            impot_total = impot_ir + prelevement_sociaux
            
            return {
                "impot_ir": round(impot_ir, 2),
                "prelevement_sociaux": round(prelevement_sociaux, 2),
                "impot_total": round(impot_total, 2),
                "taux_effectif": round((impot_total / plus_value) * 100, 2) if plus_value > 0 else 0,
                "regime": "Barème IR + PS",
                "reference_legale": "CGI Art. 200 A"
            }
        else:
            impot_total = plus_value * FiscalRules.FLAT_TAX
            
            return {
                "impot_ir": round(plus_value * 0.128, 2),
                "prelevement_sociaux": round(plus_value * FiscalRules.PRELEVEMENTS_SOCIAUX, 2),
                "impot_total": round(impot_total, 2),
                "taux_effectif": 30.0,
                "regime": "Flat tax 30%",
                "reference_legale": "CGI Art. 200 A"
            }
