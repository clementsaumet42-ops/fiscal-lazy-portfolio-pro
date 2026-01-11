from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class EnveloppeISINMapping(BaseModel):
    """
    Mapping entre enveloppes et ISINs avec éligibilité automatique.
    Gère l'éligibilité des ETFs selon le type d'enveloppe.
    """
    id: Optional[str] = None
    enveloppe_id: str = Field(description="ID de l'enveloppe")
    enveloppe_type: str = Field(description="Type: pea, cto, av, per")
    isin: str = Field(min_length=12, max_length=12)
    
    # Éligibilité
    eligible: bool = Field(
        description="True si l'ISIN est éligible dans cette enveloppe"
    )
    raison_ineligibilite: Optional[str] = Field(
        default=None,
        description="Raison si non éligible (ex: 'PEA nécessite ≥75% actions UE')"
    )
    
    # Règles fiscales applicables
    regles_fiscales: List[str] = Field(
        default_factory=list,
        description="Liste des articles CGI applicables"
    )
    
    # Allocation dans l'enveloppe
    quantite_detenue: float = Field(default=0.0, ge=0)
    valeur_actuelle: float = Field(default=0.0, ge=0)
    poids_portefeuille_pct: float = Field(
        default=0.0,
        ge=0,
        le=100,
        description="Poids dans le portefeuille de l'enveloppe (%)"
    )
    
    # Métadonnées
    date_ajout: datetime = Field(default_factory=datetime.now)
    derniere_mise_a_jour: datetime = Field(default_factory=datetime.now)
    
    class Config:
        json_schema_extra = {
            "example": {
                "enveloppe_id": "pea_123",
                "enveloppe_type": "pea",
                "isin": "FR0011869353",
                "eligible": True,
                "regles_fiscales": ["CGI Art. 150-0 A"],
                "quantite_detenue": 10.0,
                "valeur_actuelle": 4500.0,
                "poids_portefeuille_pct": 15.5
            }
        }


class EligibiliteResult(BaseModel):
    """Résultat de vérification d'éligibilité d'un ISIN pour une enveloppe"""
    isin: str
    enveloppe_type: str
    eligible: bool
    pourcentage_actions: Optional[float] = None
    raison: str = Field(description="Explication de l'éligibilité ou non")
    regles_applicables: List[str] = Field(default_factory=list)
    
    class Config:
        json_schema_extra = {
            "example": {
                "isin": "FR0011869353",
                "enveloppe_type": "pea",
                "eligible": True,
                "pourcentage_actions": 100.0,
                "raison": "ETF 100% actions, éligible PEA (≥75% actions UE)",
                "regles_applicables": ["CGI Art. 150-0 A"]
            }
        }
