from enum import Enum
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class RegimeFiscalIS(str, Enum):
    """Régimes fiscaux pour sociétés à l'IS"""
    IS_STANDARD = "is_standard"  # 25%
    IS_PME = "is_pme"  # 15% sur premiers 38,120€


class TypeOPCVM(str, Enum):
    """
    Types d'OPCVM selon CGI Art. 219.
    
    ACTIONS: ≥75% actions -> Taxation à la réalisation, QPFC 12% si détention >2 ans
    OBLIGATIONS: <75% actions -> Taxation annuelle sur PV latente (mark-to-market)
    """
    ACTIONS = "actions"  # ≥75% actions
    OBLIGATIONS = "obligations"  # <75% actions


class SocieteIS(BaseModel):
    """
    Modèle représentant une société soumise à l'IS.
    
    Fiscalité selon CGI Art. 219:
    - OPCVM Actions (≥75% actions): taxation à la réalisation uniquement
    - QPFC 12% applicable si détention >2 ans (Quote-Part pour Frais et Charges)
    - OPCVM Obligations: taxation annuelle sur plus-values latentes (mark-to-market)
    - Contrats de capitalisation: régime spécifique avantageux >8 ans
    """
    id: Optional[str] = None
    raison_sociale: str
    siren: str = Field(min_length=9, max_length=9)
    regime_fiscal: RegimeFiscalIS = RegimeFiscalIS.IS_STANDARD
    taux_is: float = Field(
        description="Taux d'IS applicable (%)",
        ge=0,
        le=33.33
    )
    resultat_fiscal_annuel: float = Field(
        default=0.0,
        description="Résultat fiscal annuel de la société"
    )
    date_cloture: Optional[str] = Field(
        default=None,
        description="Date de clôture comptable (format: MM-DD)"
    )
    date_creation: datetime = Field(default_factory=datetime.now)
    
    def get_taux_is_effectif(self, montant: float) -> float:
        """
        Calcule le taux d'IS effectif selon le régime.
        
        Pour PME: 15% jusqu'à 38,120€, puis 25%
        """
        if self.regime_fiscal == RegimeFiscalIS.IS_PME:
            if montant <= 38120:
                return 15.0
            else:
                # Calcul au prorata
                montant_15 = 38120
                montant_25 = montant - 38120
                impot_total = (montant_15 * 0.15) + (montant_25 * 0.25)
                return (impot_total / montant) * 100
        return self.taux_is
    
    def calcul_fiscalite_opcvm(
        self,
        type_opcvm: TypeOPCVM,
        plus_value: float,
        duree_detention_annees: float
    ) -> dict:
        """
        Calcule la fiscalité d'un OPCVM selon CGI Art. 219.
        
        Returns:
            dict avec keys: impot_du, qpfc, impot_net, taux_effectif
        """
        if type_opcvm == TypeOPCVM.ACTIONS:
            # OPCVM Actions: taxation à la réalisation
            # QPFC 12% si détention >2 ans
            if duree_detention_annees > 2:
                qpfc = plus_value * 0.12
                base_imposable = plus_value - qpfc
                impot_brut = base_imposable * (self.taux_is / 100)
                impot_net = impot_brut
                taux_effectif = (impot_net / plus_value) * 100 if plus_value > 0 else 0
                
                return {
                    "impot_du": impot_net,
                    "qpfc": qpfc,
                    "impot_net": impot_net,
                    "taux_effectif": taux_effectif,
                    "regime": "QPFC 12% - Détention >2 ans"
                }
            else:
                # Pas de QPFC si détention ≤2 ans
                impot = plus_value * (self.taux_is / 100)
                return {
                    "impot_du": impot,
                    "qpfc": 0.0,
                    "impot_net": impot,
                    "taux_effectif": self.taux_is,
                    "regime": "IS standard - Détention ≤2 ans"
                }
        else:
            # OPCVM Obligations: taxation annuelle sur PV latente
            impot = plus_value * (self.taux_is / 100)
            return {
                "impot_du": impot,
                "qpfc": 0.0,
                "impot_net": impot,
                "taux_effectif": self.taux_is,
                "regime": "Mark-to-market annuel"
            }
    
    class Config:
        json_schema_extra = {
            "example": {
                "raison_sociale": "INVEST SARL",
                "siren": "123456789",
                "regime_fiscal": "is_pme",
                "taux_is": 15.0,
                "resultat_fiscal_annuel": 50000.0,
                "date_cloture": "12-31"
            }
        }
