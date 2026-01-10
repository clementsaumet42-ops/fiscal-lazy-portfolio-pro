from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "src"))

from models.personne_physique import PersonnePhysique
from models.societe_is import SocieteIS

router = APIRouter()

# Stockage en mémoire (remplacer par base de données en production)
clients_db = {}


class ClientResponse(BaseModel):
    success: bool
    client_id: str = None
    message: str = None


@router.post("/personne-physique", response_model=ClientResponse)
def creer_personne_physique(client: PersonnePhysique):
    """Crée un client personne physique"""
    client_id = f"pp_{len(clients_db) + 1}"
    client.id = client_id
    clients_db[client_id] = {
        "type": "personne_physique",
        "data": client.dict()
    }
    
    return ClientResponse(
        success=True,
        client_id=client_id,
        message="Client personne physique créé avec succès"
    )


@router.post("/societe-is", response_model=ClientResponse)
def creer_societe_is(client: SocieteIS):
    """Crée un client société IS"""
    client_id = f"is_{len(clients_db) + 1}"
    client.id = client_id
    clients_db[client_id] = {
        "type": "societe_is",
        "data": client.dict()
    }
    
    return ClientResponse(
        success=True,
        client_id=client_id,
        message="Client société IS créé avec succès"
    )


@router.get("/")
def lister_clients():
    """Liste tous les clients"""
    return {
        "success": True,
        "count": len(clients_db),
        "clients": [
            {
                "id": client_id,
                "type": data["type"],
                "data": data["data"]
            }
            for client_id, data in clients_db.items()
        ]
    }


@router.get("/{client_id}")
def get_client(client_id: str):
    """Récupère un client par ID"""
    if client_id not in clients_db:
        raise HTTPException(status_code=404, detail="Client non trouvé")
    
    return {
        "success": True,
        "client": clients_db[client_id]
    }


@router.delete("/{client_id}")
def supprimer_client(client_id: str):
    """Supprime un client"""
    if client_id not in clients_db:
        raise HTTPException(status_code=404, detail="Client non trouvé")
    
    del clients_db[client_id]
    
    return {
        "success": True,
        "message": "Client supprimé avec succès"
    }
