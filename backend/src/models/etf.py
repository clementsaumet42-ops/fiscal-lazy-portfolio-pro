from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class AssetClass(str, Enum):
    """Classes d'actifs disponibles"""
    ACTIONS_EUROPE = "actions_europe"
    ACTIONS_USA = "actions_usa"
    ACTIONS_EMERGENTS = "actions_emergents"
    ACTIONS_MONDE = "actions_monde"
    OBLIGATIONS_GOUVERNEMENTALES = "obligations_gouvernementales"
    OBLIGATIONS_CORPORATE = "obligations_corporate"
    SMALL_CAPS = "small_caps"
    OR = "or"


class TypeDistribution(str, Enum):
    CAPITALISANT = "capitalisant"
    DISTRIBUTIF = "distributif"


class ETF(BaseModel):
    """
    Modèle représentant un ETF.
    
    Champs importants:
    - eligible_pea: Éligibilité au PEA (actions UE, ETF ≥75% actions UE)
    - eligible_opcvm_actions_is: Pour sociétés IS, ≥75% actions (CGI Art. 219)
    - ter: Total Expense Ratio (frais annuels)
    """
    isin: str = Field(min_length=12, max_length=12)
    ticker: str
    nom: str
    classe_actif: AssetClass
    eligible_pea: bool = Field(
        description="Éligible au PEA (actions UE, ETF ≥75% actions UE)"
    )
    eligible_opcvm_actions_is: bool = Field(
        description="OPCVM Actions pour société IS (≥75% actions)"
    )
    type_distribution: TypeDistribution = TypeDistribution.CAPITALISANT
    ter: float = Field(
        description="Total Expense Ratio (%)",
        ge=0,
        le=2.0
    )
    emetteur: str = Field(default="")
    description: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "isin": "FR0011869353",
                "ticker": "EWLD.PA",
                "nom": "Amundi MSCI World UCITS ETF EUR",
                "classe_actif": "actions_monde",
                "eligible_pea": True,
                "eligible_opcvm_actions_is": True,
                "type_distribution": "capitalisant",
                "ter": 0.38,
                "emetteur": "Amundi"
            }
        }
