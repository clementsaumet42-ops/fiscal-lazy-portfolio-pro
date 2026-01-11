from enum import Enum
from typing import Optional
from datetime import datetime, date
from pydantic import BaseModel, Field


class TypeTransaction(str, Enum):
    """Types de transactions"""
    ACHAT = "achat"
    VENTE = "vente"
    VERSEMENT = "versement"
    RETRAIT = "retrait"
    DIVIDENDE = "dividende"
    ARBITRAGE = "arbitrage"


class Transaction(BaseModel):
    """
    Historique des transactions d'un portefeuille.
    Permet le tracking des opérations pour calculs fiscaux.
    """
    id: Optional[str] = None
    user_id: str = Field(description="ID de l'utilisateur")
    enveloppe_id: str = Field(description="ID de l'enveloppe concernée")
    
    type_transaction: TypeTransaction
    date_transaction: date
    
    # Pour transactions d'actifs (achat/vente)
    isin: Optional[str] = Field(default=None, min_length=12, max_length=12)
    ticker: Optional[str] = None
    nom_actif: Optional[str] = None
    quantite: Optional[float] = Field(default=None, gt=0)
    prix_unitaire: Optional[float] = Field(default=None, ge=0)
    
    # Montants
    montant: float = Field(description="Montant total de la transaction")
    frais: float = Field(default=0.0, ge=0, description="Frais de transaction")
    
    # Fiscalité (pour ventes)
    plus_value_realisee: Optional[float] = Field(
        default=None,
        description="Plus-value réalisée (pour ventes)"
    )
    impot_du: Optional[float] = Field(
        default=None,
        description="Impôt dû sur la transaction"
    )
    
    # Métadonnées
    notes: Optional[str] = Field(default=None, max_length=500)
    date_enregistrement: datetime = Field(default_factory=datetime.now)
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user_123",
                "enveloppe_id": "pea_456",
                "type_transaction": "achat",
                "date_transaction": "2024-01-15",
                "isin": "FR0011869353",
                "ticker": "EWLD.PA",
                "nom_actif": "Amundi MSCI World",
                "quantite": 10,
                "prix_unitaire": 400.0,
                "montant": 4000.0,
                "frais": 5.0,
                "notes": "Premier investissement PEA"
            }
        }
