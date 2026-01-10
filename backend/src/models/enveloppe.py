from enum import Enum
from typing import Optional, List
from datetime import datetime, date
from pydantic import BaseModel, Field


class EnveloppeType(str, Enum):
    PEA = "pea"
    CTO = "cto"
    ASSURANCE_VIE = "av"
    PER = "per"


class Enveloppe(BaseModel):
    """Classe de base pour toutes les enveloppes fiscales"""
    id: Optional[str] = None
    type_enveloppe: EnveloppeType
    date_ouverture: date
    valeur_totale: float = Field(default=0.0, ge=0)
    montant_verse: float = Field(default=0.0, ge=0)
    plus_value_latente: float = Field(default=0.0)
    
    def get_anciennete_annees(self) -> float:
        """Calcule l'ancienneté de l'enveloppe en années"""
        delta = datetime.now().date() - self.date_ouverture
        return delta.days / 365.25
    
    def get_fiscalite_retrait(self, montant_retrait: float) -> dict:
        """Méthode abstraite à surcharger dans les sous-classes"""
        raise NotImplementedError


class PEA(Enveloppe):
    """
    Plan d'Épargne en Actions (PEA)
    
    Règles fiscales (CGI Art. 150-0 A):
    - Plafond versements: 150,000€
    - <5 ans: clôture + taxation IR (TMI) + 17.2% PS
    - >5 ans: exonération IR, uniquement 17.2% PS
    - Éligibilité: actions UE, ETF ≥75% actions UE
    """
    type_enveloppe: EnveloppeType = Field(default=EnveloppeType.PEA)
    plafond_versements: float = Field(default=150000.0)
    
    def get_fiscalite_retrait(self, montant_retrait: float, tmi: float = 0) -> dict:
        """
        Calcule la fiscalité d'un retrait PEA.
        
        Args:
            montant_retrait: Montant du retrait
            tmi: Tranche Marginale d'Imposition (%)
        """
        anciennete = self.get_anciennete_annees()
        
        # Calcul de la plus-value dans le retrait
        if self.valeur_totale > 0:
            ratio_pv = self.plus_value_latente / self.valeur_totale
            pv_dans_retrait = montant_retrait * ratio_pv
        else:
            pv_dans_retrait = 0
        
        prelevement_sociaux = pv_dans_retrait * 0.172
        
        if anciennete < 5:
            # Retrait avant 5 ans: taxation IR + PS + clôture
            impot_ir = pv_dans_retrait * (tmi / 100)
            impot_total = impot_ir + prelevement_sociaux
            return {
                "impot_ir": impot_ir,
                "prelevement_sociaux": prelevement_sociaux,
                "impot_total": impot_total,
                "taux_effectif": (impot_total / pv_dans_retrait * 100) if pv_dans_retrait > 0 else 0,
                "cloture": True,
                "regime": "PEA <5 ans - IR + PS + Clôture"
            }
        else:
            # Retrait après 5 ans: exonération IR, uniquement PS
            return {
                "impot_ir": 0,
                "prelevement_sociaux": prelevement_sociaux,
                "impot_total": prelevement_sociaux,
                "taux_effectif": 17.2,
                "cloture": False,
                "regime": "PEA >5 ans - Exonération IR"
            }


class CTO(Enveloppe):
    """
    Compte-Titres Ordinaire (CTO)
    
    Règles fiscales:
    - Flat tax 30% (12.8% IR + 17.2% PS) ou barème IR + PS
    - Tax-loss harvesting possible
    - Abattement pour durée de détention supprimé
    """
    type_enveloppe: EnveloppeType = Field(default=EnveloppeType.CTO)
    
    def get_fiscalite_retrait(self, montant_retrait: float, tmi: float = 0, flat_tax: bool = True) -> dict:
        """
        Calcule la fiscalité d'une plus-value CTO.
        
        Args:
            montant_retrait: Montant de la plus-value réalisée
            tmi: Tranche Marginale d'Imposition (%)
            flat_tax: True pour flat tax 30%, False pour barème IR
        """
        if flat_tax:
            impot_total = montant_retrait * 0.30
            return {
                "impot_ir": montant_retrait * 0.128,
                "prelevement_sociaux": montant_retrait * 0.172,
                "impot_total": impot_total,
                "taux_effectif": 30.0,
                "regime": "Flat tax 30%"
            }
        else:
            impot_ir = montant_retrait * (tmi / 100)
            prelevement_sociaux = montant_retrait * 0.172
            impot_total = impot_ir + prelevement_sociaux
            return {
                "impot_ir": impot_ir,
                "prelevement_sociaux": prelevement_sociaux,
                "impot_total": impot_total,
                "taux_effectif": tmi + 17.2,
                "regime": "Barème IR + PS"
            }


class AssuranceVie(Enveloppe):
    """
    Assurance-Vie (AV)
    
    Règles fiscales (CGI Art. 125-0 A, 990 I):
    - <4 ans: 35% ou IR + 17.2% PS
    - 4-8 ans: 15% ou IR + 17.2% PS
    - >8 ans: 7.5% sur PV >4,600€ (9,200€ couple) + 17.2% PS
    - Abattement annuel >8 ans
    """
    type_enveloppe: EnveloppeType = Field(default=EnveloppeType.ASSURANCE_VIE)
    montant_fonds_euros: float = Field(default=0.0, ge=0)
    montant_uc: float = Field(default=0.0, ge=0)
    
    def get_fiscalite_retrait(
        self,
        montant_retrait: float,
        tmi: float = 0,
        couple: bool = False
    ) -> dict:
        """
        Calcule la fiscalité d'un retrait AV.
        
        Args:
            montant_retrait: Montant du retrait
            tmi: Tranche Marginale d'Imposition (%)
            couple: True si couple marié/pacsé
        """
        anciennete = self.get_anciennete_annees()
        
        # Calcul de la plus-value dans le retrait
        if self.valeur_totale > 0:
            ratio_pv = self.plus_value_latente / self.valeur_totale
            pv_dans_retrait = montant_retrait * ratio_pv
        else:
            pv_dans_retrait = 0
        
        abattement = 9200 if couple else 4600
        prelevement_sociaux = pv_dans_retrait * 0.172
        
        if anciennete < 4:
            # <4 ans: 35% ou IR
            taux_prelevement = min(35, tmi) / 100
            impot_ir = pv_dans_retrait * taux_prelevement
            impot_total = impot_ir + prelevement_sociaux
            return {
                "impot_ir": impot_ir,
                "prelevement_sociaux": prelevement_sociaux,
                "impot_total": impot_total,
                "taux_effectif": (impot_total / pv_dans_retrait * 100) if pv_dans_retrait > 0 else 0,
                "regime": "AV <4 ans"
            }
        elif anciennete < 8:
            # 4-8 ans: 15% ou IR
            taux_prelevement = min(15, tmi) / 100
            impot_ir = pv_dans_retrait * taux_prelevement
            impot_total = impot_ir + prelevement_sociaux
            return {
                "impot_ir": impot_ir,
                "prelevement_sociaux": prelevement_sociaux,
                "impot_total": impot_total,
                "taux_effectif": (impot_total / pv_dans_retrait * 100) if pv_dans_retrait > 0 else 0,
                "regime": "AV 4-8 ans"
            }
        else:
            # >8 ans: 7.5% après abattement
            pv_imposable = max(0, pv_dans_retrait - abattement)
            impot_ir = pv_imposable * 0.075
            impot_total = impot_ir + prelevement_sociaux
            return {
                "impot_ir": impot_ir,
                "prelevement_sociaux": prelevement_sociaux,
                "impot_total": impot_total,
                "abattement_utilise": min(pv_dans_retrait, abattement),
                "taux_effectif": (impot_total / pv_dans_retrait * 100) if pv_dans_retrait > 0 else 0,
                "regime": "AV >8 ans - Abattement"
            }


class PER(Enveloppe):
    """
    Plan d'Épargne Retraite (PER)
    
    Règles fiscales:
    - Versements déductibles du revenu imposable
    - Sortie en rente ou capital à la retraite
    - Taxation à l'IR au moment de la sortie
    """
    type_enveloppe: EnveloppeType = Field(default=EnveloppeType.PER)
    age_depart_retraite: int = Field(default=62, ge=60, le=70)
    
    def get_fiscalite_retrait(self, montant_retrait: float, tmi: float = 0) -> dict:
        """
        Calcule la fiscalité d'un retrait PER.
        
        Args:
            montant_retrait: Montant du retrait
            tmi: Tranche Marginale d'Imposition (%)
        """
        # Sortie en capital: taxation des versements déductibles à l'IR
        # Plus-values taxées comme AV >8 ans
        
        # Simplifié: on considère que tout est taxé à l'IR
        impot_ir = montant_retrait * (tmi / 100)
        prelevement_sociaux = montant_retrait * 0.172
        impot_total = impot_ir + prelevement_sociaux
        
        return {
            "impot_ir": impot_ir,
            "prelevement_sociaux": prelevement_sociaux,
            "impot_total": impot_total,
            "taux_effectif": tmi + 17.2,
            "regime": "PER - Sortie capital"
        }
