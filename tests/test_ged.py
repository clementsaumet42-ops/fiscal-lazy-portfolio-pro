import sys
sys.path.append("backend/src")

import pytest
from models.ged import Document, CategorieDocument
from datetime import datetime


class TestGED:
    """
    Tests du système de Gestion Électronique de Documents (GED).
    
    Vérifie:
    - Création de documents avec métadonnées
    - Catégorisation correcte
    - Gestion des attributs
    """
    
    def test_creation_document_identite(self):
        """Test création d'un document d'identité"""
        doc = Document(
            client_id="pp_123",
            nom_fichier="cni_dupont.pdf",
            categorie=CategorieDocument.IDENTITE_CNI,
            taille_octets=1024000,
            type_mime="application/pdf",
            chemin_stockage="/data/clients/documents/pp_123/identite_cni/cni_dupont.pdf"
        )
        
        assert doc.client_id == "pp_123"
        assert doc.nom_fichier == "cni_dupont.pdf"
        assert doc.categorie == CategorieDocument.IDENTITE_CNI
        assert doc.taille_octets == 1024000
        assert doc.type_mime == "application/pdf"
        # ID généré automatiquement
        assert doc.id is not None
        assert len(doc.id) > 0
    
    def test_creation_document_avec_commentaire(self):
        """Test création d'un document avec commentaire"""
        doc = Document(
            client_id="pp_456",
            nom_fichier="bulletin_salaire_janvier.pdf",
            categorie=CategorieDocument.REVENUS_BULLETIN_SALAIRE,
            taille_octets=512000,
            type_mime="application/pdf",
            chemin_stockage="/data/clients/documents/pp_456/revenus/bulletin.pdf",
            commentaire="Bulletin de salaire janvier 2026"
        )
        
        assert doc.commentaire == "Bulletin de salaire janvier 2026"
    
    def test_creation_document_avec_tags(self):
        """Test création d'un document avec tags"""
        doc = Document(
            client_id="pp_789",
            nom_fichier="avis_imposition_2025.pdf",
            categorie=CategorieDocument.REVENUS_AVIS_IMPOSITION,
            taille_octets=2048000,
            type_mime="application/pdf",
            chemin_stockage="/data/clients/documents/pp_789/revenus/avis_2025.pdf",
            tags=["impots", "2025", "IR"]
        )
        
        assert "impots" in doc.tags
        assert "2025" in doc.tags
        assert "IR" in doc.tags
        assert len(doc.tags) == 3
    
    def test_creation_document_avec_date_document(self):
        """Test création d'un document avec date du document"""
        date_doc = datetime(2025, 12, 31)
        doc = Document(
            client_id="pp_100",
            nom_fichier="taxe_fonciere_2025.pdf",
            categorie=CategorieDocument.IMMO_TAXE_FONCIERE,
            date_document=date_doc,
            taille_octets=768000,
            type_mime="application/pdf",
            chemin_stockage="/data/clients/documents/pp_100/immo/taxe.pdf"
        )
        
        assert doc.date_document == date_doc
    
    def test_document_categories_identite(self):
        """Test toutes les catégories identité"""
        categories_identite = [
            CategorieDocument.IDENTITE_CNI,
            CategorieDocument.IDENTITE_PASSEPORT,
            CategorieDocument.IDENTITE_LIVRET_FAMILLE
        ]
        
        for cat in categories_identite:
            doc = Document(
                client_id="test_client",
                nom_fichier=f"{cat.value}.pdf",
                categorie=cat,
                taille_octets=1000,
                type_mime="application/pdf",
                chemin_stockage=f"/data/{cat.value}.pdf"
            )
            assert doc.categorie == cat
    
    def test_document_categories_revenus(self):
        """Test catégories revenus"""
        categories_revenus = [
            CategorieDocument.REVENUS_BULLETIN_SALAIRE,
            CategorieDocument.REVENUS_AVIS_IMPOSITION
        ]
        
        for cat in categories_revenus:
            doc = Document(
                client_id="test_client",
                nom_fichier=f"{cat.value}.pdf",
                categorie=cat,
                taille_octets=1000,
                type_mime="application/pdf",
                chemin_stockage=f"/data/{cat.value}.pdf"
            )
            assert doc.categorie == cat
    
    def test_document_categories_immobilier(self):
        """Test catégories immobilier"""
        categories_immo = [
            CategorieDocument.IMMO_ACTE_PROPRIETE,
            CategorieDocument.IMMO_OFFRE_PRET,
            CategorieDocument.IMMO_TAXE_FONCIERE,
            CategorieDocument.IMMO_BAIL_LOCATION
        ]
        
        for cat in categories_immo:
            doc = Document(
                client_id="test_client",
                nom_fichier=f"{cat.value}.pdf",
                categorie=cat,
                taille_octets=1000,
                type_mime="application/pdf",
                chemin_stockage=f"/data/{cat.value}.pdf"
            )
            assert doc.categorie == cat
    
    def test_document_categories_financier(self):
        """Test catégories patrimoine financier"""
        categories_fin = [
            CategorieDocument.FIN_RELEVE_COMPTE,
            CategorieDocument.FIN_RELEVE_PEA,
            CategorieDocument.FIN_RELEVE_CTO,
            CategorieDocument.FIN_CONTRAT_AV,
            CategorieDocument.FIN_RELEVE_AV
        ]
        
        for cat in categories_fin:
            doc = Document(
                client_id="test_client",
                nom_fichier=f"{cat.value}.pdf",
                categorie=cat,
                taille_octets=1000,
                type_mime="application/pdf",
                chemin_stockage=f"/data/{cat.value}.pdf"
            )
            assert doc.categorie == cat
    
    def test_document_categories_succession(self):
        """Test catégories succession"""
        categories_succession = [
            CategorieDocument.SUCCESSION_TESTAMENT,
            CategorieDocument.SUCCESSION_DONATION
        ]
        
        for cat in categories_succession:
            doc = Document(
                client_id="test_client",
                nom_fichier=f"{cat.value}.pdf",
                categorie=cat,
                taille_octets=1000,
                type_mime="application/pdf",
                chemin_stockage=f"/data/{cat.value}.pdf"
            )
            assert doc.categorie == cat
    
    def test_document_categorie_assurance(self):
        """Test catégorie assurance"""
        doc = Document(
            client_id="test_client",
            nom_fichier="contrat_assurance.pdf",
            categorie=CategorieDocument.ASSURANCE_CONTRAT,
            taille_octets=1000,
            type_mime="application/pdf",
            chemin_stockage="/data/assurance.pdf"
        )
        assert doc.categorie == CategorieDocument.ASSURANCE_CONTRAT
    
    def test_document_categorie_autre(self):
        """Test catégorie autre"""
        doc = Document(
            client_id="test_client",
            nom_fichier="autre_document.pdf",
            categorie=CategorieDocument.AUTRE,
            taille_octets=1000,
            type_mime="application/pdf",
            chemin_stockage="/data/autre.pdf"
        )
        assert doc.categorie == CategorieDocument.AUTRE
    
    def test_document_date_upload_auto(self):
        """Test que la date d'upload est générée automatiquement"""
        doc = Document(
            client_id="test_client",
            nom_fichier="test.pdf",
            categorie=CategorieDocument.AUTRE,
            taille_octets=1000,
            type_mime="application/pdf",
            chemin_stockage="/data/test.pdf"
        )
        
        assert doc.date_upload is not None
        assert isinstance(doc.date_upload, datetime)
    
    def test_document_id_unique(self):
        """Test que les IDs de documents sont uniques"""
        doc1 = Document(
            client_id="test_client",
            nom_fichier="test1.pdf",
            categorie=CategorieDocument.AUTRE,
            taille_octets=1000,
            type_mime="application/pdf",
            chemin_stockage="/data/test1.pdf"
        )
        
        doc2 = Document(
            client_id="test_client",
            nom_fichier="test2.pdf",
            categorie=CategorieDocument.AUTRE,
            taille_octets=1000,
            type_mime="application/pdf",
            chemin_stockage="/data/test2.pdf"
        )
        
        assert doc1.id != doc2.id
    
    def test_document_types_mime_divers(self):
        """Test différents types MIME"""
        types_mime = [
            "application/pdf",
            "image/jpeg",
            "image/png",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ]
        
        for mime_type in types_mime:
            doc = Document(
                client_id="test_client",
                nom_fichier=f"test.{mime_type.split('/')[-1]}",
                categorie=CategorieDocument.AUTRE,
                taille_octets=1000,
                type_mime=mime_type,
                chemin_stockage="/data/test"
            )
            assert doc.type_mime == mime_type
    
    def test_document_tags_par_defaut_vide(self):
        """Test que les tags sont une liste vide par défaut"""
        doc = Document(
            client_id="test_client",
            nom_fichier="test.pdf",
            categorie=CategorieDocument.AUTRE,
            taille_octets=1000,
            type_mime="application/pdf",
            chemin_stockage="/data/test.pdf"
        )
        
        assert doc.tags == []
        assert isinstance(doc.tags, list)
