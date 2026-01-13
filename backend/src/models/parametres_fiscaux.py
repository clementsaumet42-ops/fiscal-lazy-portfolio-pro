from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class TrancheIR(BaseModel):
    """Tranche d'impôt sur le revenu"""
    min: float = Field(ge=0, description="Seuil minimum (€)")
    max: Optional[float] = Field(default=None, description="Seuil maximum (€), None = infini")
    taux: float = Field(ge=0, le=1, description="Taux marginal (0.0 à 1.0)")

class TrancheIFI(BaseModel):
    """Tranche d'impôt sur la fortune immobilière"""
    min: float = Field(ge=0)
    max: Optional[float] = Field(default=None)
    taux: float = Field(ge=0, le=1)

class BaremeDroitsSuccession(BaseModel):
    """Barème droits de succession"""
    type_heritier: str  # "ligne_directe", "conjoint", "frere_soeur", "neveu_niece", "autres"
    abattement: float
    tranches: List[TrancheIR]

class ParametresFiscaux(BaseModel):
    """Configuration fiscale annuelle - Conforme CGI 2026"""
    annee: int = Field(ge=2020, le=2030)
    date_mise_a_jour: datetime = Field(default_factory=datetime.now)
    
    # Impôt sur le Revenu (CGI Art. 197)
    tranches_ir: List[TrancheIR] = Field(
        default=[
            TrancheIR(min=0, max=11294, taux=0.0),
            TrancheIR(min=11294, max=28797, taux=0.11),
            TrancheIR(min=28797, max=82341, taux=0.30),
            TrancheIR(min=82341, max=177106, taux=0.41),
            TrancheIR(min=177106, max=None, taux=0.45)
        ],
        description="Barème IR 2026"
    )
    
    # Impôt sur la Fortune Immobilière (CGI Art. 964 et suivants)
    seuil_ifi: float = Field(default=1_300_000, description="Seuil d'entrée IFI (€)")
    tranches_ifi: List[TrancheIFI] = Field(
        default=[
            TrancheIFI(min=0, max=800_000, taux=0.0),
            TrancheIFI(min=800_000, max=1_300_000, taux=0.005),
            TrancheIFI(min=1_300_000, max=2_570_000, taux=0.007),
            TrancheIFI(min=2_570_000, max=5_000_000, taux=0.010),
            TrancheIFI(min=5_000_000, max=10_000_000, taux=0.0125),
            TrancheIFI(min=10_000_000, max=None, taux=0.015)
        ]
    )
    
    # Prélèvements sociaux (CGI Art. 1600-0 C à 1600-0 S)
    taux_csg_deductible: float = Field(default=0.068, description="CSG déductible")
    taux_csg_non_deductible: float = Field(default=0.024)
    taux_crds: float = Field(default=0.005)
    taux_prelevement_solidarite: float = Field(default=0.075)
    taux_prelevements_sociaux: float = Field(default=0.172, description="Total PS")
    
    # Flat tax / PFU (CGI Art. 200 A)
    taux_pfu_ir: float = Field(default=0.128, description="Part IR de la flat tax")
    taux_pfu_ps: float = Field(default=0.172, description="Part prélèvements sociaux")
    taux_pfu_total: float = Field(default=0.30)
    
    # Succession (CGI Art. 777 et suivants)
    baremes_succession: List[BaremeDroitsSuccession] = Field(
        default=[
            BaremeDroitsSuccession(
                type_heritier="ligne_directe",
                abattement=100_000,
                tranches=[
                    TrancheIR(min=0, max=8_072, taux=0.05),
                    TrancheIR(min=8_072, max=12_109, taux=0.10),
                    TrancheIR(min=12_109, max=15_932, taux=0.15),
                    TrancheIR(min=15_932, max=552_324, taux=0.20),
                    TrancheIR(min=552_324, max=902_838, taux=0.30),
                    TrancheIR(min=902_838, max=1_805_677, taux=0.40),
                    TrancheIR(min=1_805_677, max=None, taux=0.45)
                ]
            ),
            BaremeDroitsSuccession(
                type_heritier="conjoint",
                abattement=80_724,
                tranches=[TrancheIR(min=0, max=None, taux=0.0)]  # Exonéré
            ),
            BaremeDroitsSuccession(
                type_heritier="frere_soeur",
                abattement=15_932,
                tranches=[
                    TrancheIR(min=0, max=24_430, taux=0.35),
                    TrancheIR(min=24_430, max=None, taux=0.45)
                ]
            )
        ]
    )
    
    # Plafonds enveloppes
    plafond_pea: float = Field(default=150_000)
    plafond_livret_a: float = Field(default=22_950)
    plafond_ldds: float = Field(default=12_000)
    plafond_lep: float = Field(default=10_000)

    def calculer_ir(self, revenu_imposable: float, nb_parts: float) -> dict:
        """Calcule l'IR selon le barème progressif (CGI Art. 197)"""
        quotient_familial = revenu_imposable / nb_parts
        impot_par_part = 0
        
        for tranche in self.tranches_ir:
            if quotient_familial > tranche.min:
                base = min(
                    quotient_familial - tranche.min,
                    (tranche.max or float('inf')) - tranche.min
                )
                impot_par_part += base * tranche.taux
        
        impot_brut = impot_par_part * nb_parts
        
        return {
            "revenu_imposable": revenu_imposable,
            "quotient_familial": round(quotient_familial, 2),
            "impot_brut": round(impot_brut, 2),
            "taux_moyen": round(impot_brut / revenu_imposable * 100, 2) if revenu_imposable > 0 else 0,
            "taux_marginal": self._get_taux_marginal(quotient_familial) * 100
        }
    
    def calculer_ifi(self, patrimoine_immobilier_net: float) -> dict:
        """Calcule l'IFI (CGI Art. 964 et suivants)"""
        if patrimoine_immobilier_net < self.seuil_ifi:
            return {
                "patrimoine_net": patrimoine_immobilier_net,
                "ifi_du": 0,
                "applicable": False
            }
        
        ifi = 0
        for tranche in self.tranches_ifi:
            if patrimoine_immobilier_net > tranche.min:
                base = min(
                    patrimoine_immobilier_net - tranche.min,
                    (tranche.max or float('inf')) - tranche.min
                )
                ifi += base * tranche.taux
        
        # Décote si patrimoine entre 1.3M€ et 1.4M€
        if 1_300_000 <= patrimoine_immobilier_net <= 1_400_000:
            decote = 17_500 - 1.25 * (patrimoine_immobilier_net - 1_300_000)
            ifi = max(0, ifi - decote)
        
        return {
            "patrimoine_net": patrimoine_immobilier_net,
            "ifi_du": round(ifi, 2),
            "applicable": True,
            "decote_appliquee": ifi < (patrimoine_immobilier_net - 1_300_000) * 0.005 if patrimoine_immobilier_net <= 1_400_000 else False
        }
    
    def calculer_droits_succession(self, montant_transmis: float, type_heritier: str) -> dict:
        """Calcule les droits de succession (CGI Art. 777 et suivants)"""
        bareme = next(
            (b for b in self.baremes_succession if b.type_heritier == type_heritier),
            None
        )
        
        if not bareme:
            return {"erreur": "Type héritier inconnu"}
        
        base_imposable = max(0, montant_transmis - bareme.abattement)
        
        if base_imposable == 0:
            return {
                "montant_transmis": montant_transmis,
                "abattement": bareme.abattement,
                "base_imposable": 0,
                "droits_dus": 0
            }
        
        droits = 0
        for tranche in bareme.tranches:
            if base_imposable > tranche.min:
                base = min(
                    base_imposable - tranche.min,
                    (tranche.max or float('inf')) - tranche.min
                )
                droits += base * tranche.taux
        
        return {
            "montant_transmis": montant_transmis,
            "type_heritier": type_heritier,
            "abattement": bareme.abattement,
            "base_imposable": base_imposable,
            "droits_dus": round(droits, 2),
            "taux_effectif": round(droits / montant_transmis * 100, 2) if montant_transmis > 0 else 0
        }
    
    def _get_taux_marginal(self, quotient_familial: float) -> float:
        """Retourne le taux marginal applicable"""
        for tranche in reversed(self.tranches_ir):
            if quotient_familial >= tranche.min:
                return tranche.taux
        return 0.0
