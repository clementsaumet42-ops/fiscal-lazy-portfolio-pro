from enum import Enum
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class ProfilRisque(str, Enum):
    DEFENSIF = "defensif"
    EQUILIBRE = "equilibre"
    DYNAMIQUE = "dynamique"
    AGRESSIF = "agressif"


class PersonnePhysique(BaseModel):
    """
    Modèle représentant une personne physique cliente.
    """
    id: Optional[str] = None
    nom: str
    prenom: str
    age: int = Field(ge=18, le=120)
    tmi: float = Field(
        description="Tranche Marginale d'Imposition (%)",
        ge=0,
        le=45
    )
    horizon_annees: int = Field(
        description="Horizon d'investissement en années",
        ge=1,
        le=50
    )
    profil_risque: ProfilRisque = ProfilRisque.EQUILIBRE
    patrimoine_total: float = Field(default=0.0, ge=0)
    revenus_annuels: float = Field(default=0.0, ge=0)
    date_creation: datetime = Field(default_factory=datetime.now)
    
    class Config:
        json_schema_extra = {
            "example": {
                "nom": "Dupont",
                "prenom": "Jean",
                "age": 45,
                "tmi": 30.0,
                "horizon_annees": 20,
                "profil_risque": "equilibre",
                "patrimoine_total": 250000.0,
                "revenus_annuels": 75000.0
            }
        }
