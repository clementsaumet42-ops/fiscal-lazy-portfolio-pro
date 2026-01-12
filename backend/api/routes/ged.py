from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List, Optional
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "src"))

from models.ged import Document, CategorieDocument
import shutil
from pathlib import Path
import mimetypes
import json

router = APIRouter()

UPLOAD_DIR = Path("data/clients/documents")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/upload")
async def upload_document(
    client_id: str = Form(...),
    categorie: CategorieDocument = Form(...),
    fichier: UploadFile = File(...),
    commentaire: Optional[str] = Form(None)
):
    """Upload un document client"""
    client_dir = UPLOAD_DIR / client_id / categorie.value
    client_dir.mkdir(parents=True, exist_ok=True)
    
    file_path = client_dir / fichier.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(fichier.file, buffer)
    
    doc = Document(
        client_id=client_id,
        nom_fichier=fichier.filename,
        categorie=categorie,
        taille_octets=file_path.stat().st_size,
        type_mime=mimetypes.guess_type(fichier.filename)[0] or "application/octet-stream",
        chemin_stockage=str(file_path),
        commentaire=commentaire
    )
    
    metadata_file = client_dir / f"{doc.id}.json"
    with open(metadata_file, 'w', encoding='utf-8') as f:
        f.write(doc.model_dump_json(indent=2))
    
    return doc

@router.get("/client/{client_id}")
async def list_documents_client(client_id: str) -> List[Document]:
    """Liste tous les documents d'un client"""
    client_dir = UPLOAD_DIR / client_id
    if not client_dir.exists():
        return []
    
    documents = []
    for metadata_file in client_dir.rglob("*.json"):
        with open(metadata_file, 'r', encoding='utf-8') as f:
            doc = Document.model_validate_json(f.read())
            documents.append(doc)
    
    return sorted(documents, key=lambda d: d.date_upload, reverse=True)

@router.delete("/document/{document_id}")
async def delete_document(document_id: str):
    """Supprime un document"""
    for metadata_file in UPLOAD_DIR.rglob(f"{document_id}.json"):
        with open(metadata_file, 'r', encoding='utf-8') as f:
            doc = Document.model_validate_json(f.read())
        
        Path(doc.chemin_stockage).unlink(missing_ok=True)
        metadata_file.unlink(missing_ok=True)
        return {"message": "Document supprimé"}
    
    raise HTTPException(status_code=404, detail="Document non trouvé")
