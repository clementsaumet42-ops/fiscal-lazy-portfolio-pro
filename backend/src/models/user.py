from enum import Enum
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr


class UserRole(str, Enum):
    """Rôles utilisateurs"""
    ADMIN = "admin"
    EXPERT_COMPTABLE = "expert_comptable"
    CLIENT = "client"


class User(BaseModel):
    """
    Modèle utilisateur avec authentification.
    Pour les experts-comptables et leurs clients.
    """
    id: Optional[str] = None
    email: EmailStr
    nom: str
    prenom: str
    role: UserRole = UserRole.CLIENT
    cabinet: Optional[str] = Field(
        default=None,
        description="Nom du cabinet d'expertise comptable"
    )
    telephone: Optional[str] = None
    actif: bool = Field(default=True)
    date_creation: datetime = Field(default_factory=datetime.now)
    derniere_connexion: Optional[datetime] = None
    
    # Authentification (hash sera stocké, pas le mot de passe)
    password_hash: Optional[str] = Field(
        default=None,
        description="Hash du mot de passe (bcrypt)"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "jean.dupont@cabinet-expert.fr",
                "nom": "Dupont",
                "prenom": "Jean",
                "role": "expert_comptable",
                "cabinet": "Cabinet Dupont & Associés",
                "telephone": "+33612345678"
            }
        }
