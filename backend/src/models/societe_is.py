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
    Classification OPCVM selon CGI Art. 209-0 A
    BOFiP-IS-BASE-10-20-10
    """
    ACTIONS = "actions"  # ≥90% actions (seuil IS, PAS 75%)
    OBLIGATIONS = "obligations"  # <90% actions
    MONETAIRE = "monetaire"
    MIXTE = "mixte"


class SocieteIS(BaseModel):
    """
    Modèle représentant une société soumise à l'IS.
    
    Fiscalité selon CGI Art. 209-0 A + BOFiP-IS-BASE-10-20-10:
    - OPCVM Actions (≥90% actions): taxation à la réalisation uniquement
    - PAS de QPFC 12% pour OPCVM (réservée aux titres de participation directs)
    - OPCVM Obligations (<90% actions): taxation annuelle sur plus-values latentes (mark-to-market)
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
        isin: str,
        pourcentage_actions: float,
        plus_value_latente: float = 0,
        plus_value_realisee: float = 0,
        exercice: int = 2026
    ) -> dict:
        """
        Calcul fiscalité OPCVM selon CGI Art. 209-0 A
        
        RÈGLES FISCALES :
        - OPCVM Actions (≥90% actions) : taxation à la RÉALISATION uniquement
        - OPCVM Autres (<90% actions) : taxation LATENTE annuelle (mark-to-market)
        - PAS de QPFC 12% pour les OPCVM (réservée aux titres de participation)
        
        SEUILS :
        - Société IS : ≥90% actions (CGI 209-0 A)
        - PEA : ≥75% actions UE (CGI 150-0 A) - DIFFÉRENT !
        
        Args:
            isin: Code ISIN de l'OPCVM
            pourcentage_actions: % d'actions dans l'OPCVM (ex: 95.0 pour 95%)
            plus_value_latente: PV latente de l'exercice (non réalisée)
            plus_value_realisee: PV réalisée lors de cession
            exercice: Année fiscale
        
        Returns:
            dict avec calculs fiscaux détaillés conformes CGI
        """
        
        # Déterminer le type d'OPCVM selon le seuil IS de 90% (pas 75%)
        is_opcvm_actions = pourcentage_actions >= 90.0
        
        if is_opcvm_actions:
            # OPCVM Actions (≥90%) : taxation à la réalisation
            impot_annuel_latent = 0  # Pas de taxation latente
            impot_a_la_realisation = plus_value_realisee * (self.taux_is / 100)
            regime_applicable = "Taxation à la réalisation uniquement"
            
        else:
            # OPCVM Obligations/Autres (<90%) : taxation latente annuelle
            impot_annuel_latent = plus_value_latente * (self.taux_is / 100)
            impot_a_la_realisation = 0  # Déjà taxé sur latent chaque année
            regime_applicable = "Taxation latente annuelle (mark-to-market)"
        
        return {
            'isin': isin,
            'pourcentage_actions': pourcentage_actions,
            'opcvm_actions_eligible': is_opcvm_actions,
            'seuil_is': 90.0,  # Seuil IS = 90% (≠ seuil PEA 75%)
            'impot_annuel_latent': round(impot_annuel_latent, 2),
            'impot_a_la_realisation': round(impot_a_la_realisation, 2),
            'impot_total_du': round(impot_annuel_latent + impot_a_la_realisation, 2),
            'taux_is_applique': self.taux_is,
            'regime_applicable': regime_applicable,
            'base_legale': 'CGI Art. 209-0 A + BOFiP-IS-BASE-10-20-10',
            'note_importante': 'PAS de QPFC 12% pour OPCVM (réservée aux titres de participation directs)'
        }
    
    def optimiser_allocation_is(self) -> dict:
        """
        Recommandations optimales pour société IS selon fiscalité OPCVM
        """
        return {
            'actions': {
                'vehicule_optimal': 'OPCVM Actions (≥90% actions)',
                'seuil_is': '90% minimum (différent du PEA à 75%)',
                'fiscalite': f'Taxation à réalisation : {self.taux_is}%',
                'avantage': 'Pas de taxation latente annuelle',
                'exemples_etf_eligibles': [
                    {
                        'isin': 'IE00B4L5Y983',
                        'nom': 'iShares Core MSCI World',
                        'pct_actions': 100,
                        'eligible_is': True
                    },
                    {
                        'isin': 'IE00B3RBWM25',
                        'nom': 'Vanguard FTSE All-World',
                        'pct_actions': 100,
                        'eligible_is': True
                    },
                    {
                        'isin': 'FR0011869353',
                        'nom': 'Amundi MSCI World PEA',
                        'pct_actions': 100,
                        'eligible_is': True,
                        'eligible_pea': True
                    }
                ]
            },
            'obligations': {
                'vehicule_optimal': 'Contrat de capitalisation',
                'raison': 'Éviter taxation latente annuelle des OPCVM obligations',
                'fiscalite': 'Taxation différée à la sortie',
                'alternative_opcvm': f'OPCVM obligations (<90% actions) : taxation latente {self.taux_is}%/an (TRÈS PÉNALISANT)'
            },
            'etf_mixtes_attention': {
                'exemple': 'ETF avec 80% actions',
                'eligible_pea': 'OUI (≥75% actions UE)',
                'eligible_is_optimal': 'NON (<90% actions)',
                'consequence_is': 'Taxation latente annuelle (pénalisant)'
            },
            'base_legale': 'CGI Art. 209-0 A + BOFiP-IS-BASE-10-20-10'
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
