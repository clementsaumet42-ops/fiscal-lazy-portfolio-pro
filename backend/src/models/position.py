from typing import Optional
from datetime import datetime, date
from pydantic import BaseModel, Field


class Position(BaseModel):
    """
    Représente une position (ligne) dans un portefeuille.
    """
    id: Optional[str] = None
    isin: str = Field(min_length=12, max_length=12)
    ticker: str
    nom: str
    quantite: float = Field(gt=0)
    prix_achat_moyen: float = Field(gt=0)
    prix_actuel: float = Field(default=0.0, ge=0)
    valeur_acquisition: float = Field(default=0.0, ge=0)
    valeur_actuelle: float = Field(default=0.0, ge=0)
    plus_value_latente: float = Field(default=0.0)
    date_achat: Optional[date] = None
    enveloppe_id: Optional[str] = None
    
    def calculer_valeurs(self):
        """Calcule les valeurs et plus-values"""
        self.valeur_acquisition = self.quantite * self.prix_achat_moyen
        self.valeur_actuelle = self.quantite * self.prix_actuel
        self.plus_value_latente = self.valeur_actuelle - self.valeur_acquisition
    
    def get_duree_detention_annees(self) -> float:
        """Retourne la durée de détention en années"""
        if self.date_achat:
            delta = datetime.now().date() - self.date_achat
            return delta.days / 365.25
        return 0.0
    
    def get_performance_pct(self) -> float:
        """Retourne la performance en %"""
        if self.valeur_acquisition > 0:
            return (self.plus_value_latente / self.valeur_acquisition) * 100
        return 0.0
    
    class Config:
        json_schema_extra = {
            "example": {
                "isin": "FR0011869353",
                "ticker": "EWLD.PA",
                "nom": "Amundi MSCI World",
                "quantite": 10,
                "prix_achat_moyen": 400.0,
                "prix_actuel": 450.0,
                "date_achat": "2023-01-15"
            }
        }
