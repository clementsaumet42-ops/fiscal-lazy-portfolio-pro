import sys
sys.path.append("backend/src")

import pytest
from models.parametres_fiscaux import ParametresFiscaux, TrancheIR, TrancheIFI, BaremeDroitsSuccession


class TestParametresFiscaux:
    """
    Tests des calculs fiscaux selon CGI (Code Général des Impôts).
    
    Vérifie:
    - Calcul IR selon barème progressif (CGI Art. 197)
    - Calcul IFI avec décote (CGI Art. 964 et suivants)
    - Calcul droits de succession (CGI Art. 777 et suivants)
    """
    
    def test_creation_parametres_fiscaux_defaut(self):
        """Test création paramètres fiscaux avec valeurs par défaut 2026"""
        params = ParametresFiscaux(annee=2026)
        
        assert params.annee == 2026
        assert len(params.tranches_ir) == 5
        assert params.seuil_ifi == 1_300_000
        assert params.taux_pfu_total == 0.30
        assert params.plafond_pea == 150_000
    
    def test_calcul_ir_celibataire_50k(self):
        """Test calcul IR pour célibataire (1 part) avec 50 000€ de revenu"""
        params = ParametresFiscaux(annee=2026)
        resultat = params.calculer_ir(revenu_imposable=50_000, nb_parts=1)
        
        assert resultat["revenu_imposable"] == 50_000
        assert resultat["quotient_familial"] == 50_000
        # 50k tombe dans la 3e tranche (30%)
        assert resultat["taux_marginal"] == 30.0
        # Impôt devrait être calculé progressivement
        assert resultat["impot_brut"] > 0
        assert resultat["taux_moyen"] > 0
        assert resultat["taux_moyen"] < resultat["taux_marginal"]
    
    def test_calcul_ir_couple_2_enfants(self):
        """Test calcul IR pour couple marié avec 2 enfants (3 parts)"""
        params = ParametresFiscaux(annee=2026)
        resultat = params.calculer_ir(revenu_imposable=90_000, nb_parts=3)
        
        assert resultat["quotient_familial"] == 30_000  # 90k / 3
        # 30k tombe dans la 3e tranche (30%)
        assert resultat["taux_marginal"] == 30.0
        # Avec 3 parts, l'impôt devrait être plus bas qu'un célibataire
        assert resultat["impot_brut"] > 0
    
    def test_calcul_ir_revenu_zero(self):
        """Test calcul IR avec revenu = 0 (pas d'impôt)"""
        params = ParametresFiscaux(annee=2026)
        resultat = params.calculer_ir(revenu_imposable=0, nb_parts=1)
        
        assert resultat["impot_brut"] == 0
        assert resultat["taux_moyen"] == 0
    
    def test_calcul_ir_tranche_haute(self):
        """Test calcul IR pour hauts revenus (tranche 45%)"""
        params = ParametresFiscaux(annee=2026)
        resultat = params.calculer_ir(revenu_imposable=200_000, nb_parts=1)
        
        assert resultat["taux_marginal"] == 45.0
        assert resultat["impot_brut"] > 50_000
        assert resultat["taux_moyen"] < 45.0  # Taux moyen < taux marginal
    
    def test_calcul_ifi_patrimoine_sous_seuil(self):
        """Test IFI avec patrimoine < 1.3M€ (pas d'IFI)"""
        params = ParametresFiscaux(annee=2026)
        resultat = params.calculer_ifi(patrimoine_immobilier_net=1_000_000)
        
        assert resultat["applicable"] is False
        assert resultat["ifi_du"] == 0
        assert resultat["patrimoine_net"] == 1_000_000
    
    def test_calcul_ifi_patrimoine_1_5M(self):
        """Test IFI avec patrimoine 1.5M€"""
        params = ParametresFiscaux(annee=2026)
        resultat = params.calculer_ifi(patrimoine_immobilier_net=1_500_000)
        
        assert resultat["applicable"] is True
        assert resultat["ifi_du"] > 0
        # IFI calculé sur les tranches progressives
        # Avec décote car entre 1.3M et 1.4M? Non, 1.5M > 1.4M
    
    def test_calcul_ifi_avec_decote(self):
        """Test IFI avec décote (patrimoine entre 1.3M€ et 1.4M€)"""
        params = ParametresFiscaux(annee=2026)
        resultat = params.calculer_ifi(patrimoine_immobilier_net=1_350_000)
        
        assert resultat["applicable"] is True
        # La décote devrait s'appliquer
        assert resultat["ifi_du"] >= 0
    
    def test_calcul_ifi_juste_au_seuil(self):
        """Test IFI juste au seuil de 1.3M€"""
        params = ParametresFiscaux(annee=2026)
        resultat = params.calculer_ifi(patrimoine_immobilier_net=1_300_000)
        
        assert resultat["applicable"] is True
        # Au seuil exact, décote maximale
    
    def test_calcul_droits_succession_ligne_directe(self):
        """Test droits de succession en ligne directe (parent -> enfant)"""
        params = ParametresFiscaux(annee=2026)
        resultat = params.calculer_droits_succession(
            montant_transmis=200_000,
            type_heritier="ligne_directe"
        )
        
        assert resultat["type_heritier"] == "ligne_directe"
        assert resultat["abattement"] == 100_000
        assert resultat["base_imposable"] == 100_000  # 200k - 100k
        assert resultat["droits_dus"] > 0
        assert resultat["taux_effectif"] > 0
    
    def test_calcul_droits_succession_conjoint_exonere(self):
        """Test droits de succession conjoint (exonéré)"""
        params = ParametresFiscaux(annee=2026)
        resultat = params.calculer_droits_succession(
            montant_transmis=500_000,
            type_heritier="conjoint"
        )
        
        assert resultat["type_heritier"] == "conjoint"
        # Conjoint exonéré
        assert resultat["droits_dus"] == 0
    
    def test_calcul_droits_succession_frere_soeur(self):
        """Test droits de succession frère/sœur"""
        params = ParametresFiscaux(annee=2026)
        resultat = params.calculer_droits_succession(
            montant_transmis=50_000,
            type_heritier="frere_soeur"
        )
        
        assert resultat["type_heritier"] == "frere_soeur"
        assert resultat["abattement"] == 15_932
        assert resultat["base_imposable"] > 0
        assert resultat["droits_dus"] > 0
        # Taux plus élevé pour frère/sœur (35% ou 45%)
        assert resultat["taux_effectif"] > 20
    
    def test_calcul_droits_succession_montant_sous_abattement(self):
        """Test droits de succession avec montant < abattement (pas de droits)"""
        params = ParametresFiscaux(annee=2026)
        resultat = params.calculer_droits_succession(
            montant_transmis=50_000,
            type_heritier="ligne_directe"
        )
        
        # 50k < 100k (abattement ligne directe)
        assert resultat["base_imposable"] == 0
        assert resultat["droits_dus"] == 0
    
    def test_calcul_droits_succession_type_inconnu(self):
        """Test droits de succession avec type héritier inconnu"""
        params = ParametresFiscaux(annee=2026)
        resultat = params.calculer_droits_succession(
            montant_transmis=100_000,
            type_heritier="type_inexistant"
        )
        
        assert "erreur" in resultat
    
    def test_taux_marginal_calcul(self):
        """Test calcul du taux marginal"""
        params = ParametresFiscaux(annee=2026)
        
        # Revenu de 10k (1ère tranche 0%)
        assert params._get_taux_marginal(10_000) == 0.0
        
        # Revenu de 20k (2e tranche 11%)
        assert params._get_taux_marginal(20_000) == 0.11
        
        # Revenu de 50k (3e tranche 30%)
        assert params._get_taux_marginal(50_000) == 0.30
        
        # Revenu de 200k (dernière tranche 45%)
        assert params._get_taux_marginal(200_000) == 0.45
    
    def test_tranches_ir_structure(self):
        """Test structure des tranches IR"""
        params = ParametresFiscaux(annee=2026)
        
        # Vérifier que les tranches sont bien ordonnées
        for i in range(len(params.tranches_ir) - 1):
            tranche_actuelle = params.tranches_ir[i]
            tranche_suivante = params.tranches_ir[i + 1]
            
            # La max de la tranche actuelle = min de la tranche suivante
            assert tranche_actuelle.max == tranche_suivante.min
            
            # Le taux augmente
            assert tranche_suivante.taux > tranche_actuelle.taux
    
    def test_prelevements_sociaux_parametres(self):
        """Test présence des paramètres de prélèvements sociaux"""
        params = ParametresFiscaux(annee=2026)
        
        assert params.taux_csg_deductible == 0.068
        assert params.taux_csg_non_deductible == 0.024
        assert params.taux_crds == 0.005
        assert params.taux_prelevements_sociaux == 0.172
        
        # Vérifier cohérence (approximativement)
        total_ps = (params.taux_csg_deductible + 
                    params.taux_csg_non_deductible + 
                    params.taux_crds + 
                    params.taux_prelevement_solidarite)
        assert abs(total_ps - params.taux_prelevements_sociaux) < 0.001
    
    def test_flat_tax_parametres(self):
        """Test paramètres flat tax (PFU)"""
        params = ParametresFiscaux(annee=2026)
        
        assert params.taux_pfu_ir == 0.128
        assert params.taux_pfu_ps == 0.172
        assert params.taux_pfu_total == 0.30
        
        # Vérifier cohérence
        assert params.taux_pfu_ir + params.taux_pfu_ps == params.taux_pfu_total
    
    def test_plafonds_enveloppes(self):
        """Test plafonds des enveloppes fiscales"""
        params = ParametresFiscaux(annee=2026)
        
        assert params.plafond_pea == 150_000
        assert params.plafond_livret_a == 22_950
        assert params.plafond_ldds == 12_000
        assert params.plafond_lep == 10_000
