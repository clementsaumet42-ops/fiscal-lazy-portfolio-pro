from fastapi import APIRouter, HTTPException
from typing import Optional
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "src"))

from models.parametres_fiscaux import ParametresFiscaux
import json
from pathlib import Path

router = APIRouter()

PARAMETRES_DIR = Path("data/fiscal/parametres")
PARAMETRES_DIR.mkdir(parents=True, exist_ok=True)

@router.get("/annee/{annee}")
async def get_parametres_fiscaux(annee: int) -> ParametresFiscaux:
    """Récupère les paramètres fiscaux d'une année"""
    file_path = PARAMETRES_DIR / f"{annee}.json"
    
    if not file_path.exists():
        return ParametresFiscaux(annee=annee)
    
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        return ParametresFiscaux(**data)

@router.put("/annee/{annee}")
async def update_parametres_fiscaux(annee: int, parametres: ParametresFiscaux) -> ParametresFiscaux:
    """Met à jour les paramètres fiscaux (admin uniquement)"""
    file_path = PARAMETRES_DIR / f"{annee}.json"
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(parametres.model_dump(), f, indent=2, ensure_ascii=False, default=str)
    
    return parametres

@router.post("/calcul/ir")
async def calculer_ir(revenu_imposable: float, nb_parts: float, annee: int = 2026):
    """Calcule l'impôt sur le revenu"""
    params = await get_parametres_fiscaux(annee)
    return params.calculer_ir(revenu_imposable, nb_parts)

@router.post("/calcul/ifi")
async def calculer_ifi(patrimoine_immobilier_net: float, annee: int = 2026):
    """Calcule l'IFI"""
    params = await get_parametres_fiscaux(annee)
    return params.calculer_ifi(patrimoine_immobilier_net)

@router.post("/calcul/succession")
async def calculer_droits_succession(
    montant_transmis: float,
    type_heritier: str,
    annee: int = 2026
):
    """Calcule les droits de succession"""
    params = await get_parametres_fiscaux(annee)
    return params.calculer_droits_succession(montant_transmis, type_heritier)
