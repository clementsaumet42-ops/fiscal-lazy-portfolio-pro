from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid

class CategorieDocument(str, Enum):
    IDENTITE_CNI = "identite_cni"
    IDENTITE_PASSEPORT = "identite_passeport"
    IDENTITE_LIVRET_FAMILLE = "identite_livret_famille"
    REVENUS_BULLETIN_SALAIRE = "revenus_bulletin_salaire"
    REVENUS_AVIS_IMPOSITION = "revenus_avis_imposition"
    IMMO_ACTE_PROPRIETE = "immo_acte_propriete"
    IMMO_OFFRE_PRET = "immo_offre_pret"
    IMMO_TAXE_FONCIERE = "immo_taxe_fonciere"
    IMMO_BAIL_LOCATION = "immo_bail_location"
    FIN_RELEVE_COMPTE = "fin_releve_compte"
    FIN_RELEVE_PEA = "fin_releve_pea"
    FIN_RELEVE_CTO = "fin_releve_cto"
    FIN_CONTRAT_AV = "fin_contrat_av"
    FIN_RELEVE_AV = "fin_releve_av"
    SUCCESSION_TESTAMENT = "succession_testament"
    SUCCESSION_DONATION = "succession_donation"
    ASSURANCE_CONTRAT = "assurance_contrat"
    AUTRE = "autre"

class Document(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_id: str
    nom_fichier: str
    categorie: CategorieDocument
    date_document: Optional[datetime] = None
    date_upload: datetime = Field(default_factory=datetime.now)
    taille_octets: int
    type_mime: str
    chemin_stockage: str
    tags: List[str] = Field(default_factory=list)
    commentaire: Optional[str] = None
