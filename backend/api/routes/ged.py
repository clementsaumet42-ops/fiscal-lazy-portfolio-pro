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
import re

router = APIRouter()

UPLOAD_DIR = Path("data/clients/documents")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent path traversal attacks"""
    # Remove path components
    filename = os.path.basename(filename)
    # Remove any non-alphanumeric characters except dots, dashes, and underscores
    filename = re.sub(r'[^\w\s.-]', '', filename)
    # Limit length
    if len(filename) > 255:
        name, ext = os.path.splitext(filename)
        filename = name[:255-len(ext)] + ext
    return filename

@router.post("/upload")
async def upload_document(
    client_id: str = Form(...),
    categorie: CategorieDocument = Form(...),
    fichier: UploadFile = File(...),
    commentaire: Optional[str] = Form(None)
):
    """Upload un document client"""
    # Sanitize inputs
    safe_filename = sanitize_filename(fichier.filename or "document")
    safe_client_id = re.sub(r'[^\w-]', '', client_id)
    
    if not safe_filename or not safe_client_id:
        raise HTTPException(status_code=400, detail="Invalid filename or client_id")
    
    client_dir = UPLOAD_DIR / safe_client_id / categorie.value
    client_dir.mkdir(parents=True, exist_ok=True)
    
    file_path = client_dir / safe_filename
    
    # Check file size (limit to 10MB)
    max_size = 10 * 1024 * 1024  # 10MB
    content = await fichier.read()
    if len(content) > max_size:
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")
    
    with open(file_path, "wb") as buffer:
        buffer.write(content)
    
    doc = Document(
        client_id=safe_client_id,
        nom_fichier=safe_filename,
        categorie=categorie,
        taille_octets=file_path.stat().st_size,
        type_mime=mimetypes.guess_type(safe_filename)[0] or "application/octet-stream",
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
    # Sanitize client_id to prevent path traversal
    safe_client_id = re.sub(r'[^\w-]', '', client_id)
    if not safe_client_id:
        raise HTTPException(status_code=400, detail="Invalid client_id")
    
    client_dir = UPLOAD_DIR / safe_client_id
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
    # Sanitize document_id (should be UUID format)
    safe_doc_id = re.sub(r'[^\w-]', '', document_id)
    if not safe_doc_id:
        raise HTTPException(status_code=400, detail="Invalid document_id")
    
    for metadata_file in UPLOAD_DIR.rglob(f"{safe_doc_id}.json"):
        with open(metadata_file, 'r', encoding='utf-8') as f:
            doc = Document.model_validate_json(f.read())
        
        Path(doc.chemin_stockage).unlink(missing_ok=True)
        metadata_file.unlink(missing_ok=True)
        return {"message": "Document supprimé"}
    
    raise HTTPException(status_code=404, detail="Document non trouvé")
