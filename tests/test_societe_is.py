import sys
sys.path.append("backend/src")

import pytest
from models.societe_is import SocieteIS, RegimeFiscalIS, TypeOPCVM


class TestSocieteIS:
    """
    Tests de la fiscalité société IS selon CGI Art. 209-0 A.
    
    Vérifie:
    - OPCVM Actions (≥90% actions): taxation à la réalisation, PAS de QPFC
    - OPCVM Obligations (<90% actions): taxation annuelle sur PV latente
    - Distinction seuil PEA (75%) vs IS (90%)
    """
    
    def test_creation_societe_is_pme(self):
        """Test création société IS PME"""
        societe = SocieteIS(
            raison_sociale="INVEST SARL",
            siren="123456789",
            regime_fiscal=RegimeFiscalIS.IS_PME,
            taux_is=15.0,
            resultat_fiscal_annuel=50000.0
        )
        
        assert societe.raison_sociale == "INVEST SARL"
        assert societe.regime_fiscal == RegimeFiscalIS.IS_PME
        assert societe.taux_is == 15.0
    
    def test_calcul_taux_is_pme(self):
        """Test calcul taux IS effectif pour PME"""
        societe = SocieteIS(
            raison_sociale="PME TEST",
            siren="987654321",
            regime_fiscal=RegimeFiscalIS.IS_PME,
            taux_is=15.0
        )
        
        # Montant <= 38,120€: 15%
        taux_effectif = societe.get_taux_is_effectif(30000)
        assert taux_effectif == 15.0
        
        # Montant > 38,120€: mixte 15% + 25%
        taux_effectif = societe.get_taux_is_effectif(50000)
        assert taux_effectif > 15.0
        assert taux_effectif < 25.0
    
    def test_opcvm_actions_is_seuil_90(self):
        """Test seuil 90% pour OPCVM Actions en société IS"""
        societe = SocieteIS(
            raison_sociale="TEST SARL",
            siren="123456789",
            regime_fiscal=RegimeFiscalIS.IS_STANDARD,
            taux_is=25.0
        )
        
        # ETF avec 95% actions : éligible OPCVM Actions IS
        result = societe.calcul_fiscalite_opcvm(
            isin="IE00B4L5Y983",
            pourcentage_actions=95.0,
            plus_value_latente=10000,
            plus_value_realisee=0
        )
        
        assert result['opcvm_actions_eligible'] == True
        assert result['seuil_is'] == 90.0
        assert result['impot_annuel_latent'] == 0  # Pas de taxation latente
        assert 'qpfc' not in result  # QPFC n'existe pas pour OPCVM
        assert result['base_legale'] == 'CGI Art. 209-0 A + BOFiP-IS-BASE-10-20-10'
    
    def test_opcvm_actions_100_pourcent_taxation_realisation(self):
        """
        Test OPCVM Actions 100% - Taxation uniquement à la réalisation.
        
        PAS de QPFC 12% pour OPCVM.
        """
        societe = SocieteIS(
            raison_sociale="TEST SARL",
            siren="111111111",
            regime_fiscal=RegimeFiscalIS.IS_STANDARD,
            taux_is=25.0
        )
        
        fiscalite = societe.calcul_fiscalite_opcvm(
            isin="IE00B4L5Y983",
            pourcentage_actions=100.0,
            plus_value_latente=0,
            plus_value_realisee=10000
        )
        
        # Pas de QPFC pour OPCVM
        assert 'qpfc' not in fiscalite
        assert fiscalite['impot_a_la_realisation'] == 2500  # 10000 * 0.25
        assert fiscalite['impot_annuel_latent'] == 0
        assert fiscalite['regime_applicable'] == "Taxation à la réalisation uniquement"
        assert fiscalite['note_importante'] == 'PAS de QPFC 12% pour OPCVM (réservée aux titres de participation directs)'
    
    def test_opcvm_mixte_80_pourcent(self):
        """ETF avec 80% actions : PEA OK mais IS pénalisant"""
        societe = SocieteIS(
            raison_sociale="TEST SARL",
            siren="123456789",
            regime_fiscal=RegimeFiscalIS.IS_STANDARD,
            taux_is=25.0
        )
        
        # ETF avec 80% actions : éligible PEA (≥75%) mais pas optimal IS (<90%)
        result = societe.calcul_fiscalite_opcvm(
            isin="FR0000000000",
            pourcentage_actions=80.0,
            plus_value_latente=10000,
            plus_value_realisee=0
        )
        
        assert result['opcvm_actions_eligible'] == False  # <90%
        assert result['impot_annuel_latent'] == 2500  # Taxation latente : 10000 * 0.25
        assert result['impot_a_la_realisation'] == 0
        assert result['regime_applicable'] == "Taxation latente annuelle (mark-to-market)"
        assert result['base_legale'] == 'CGI Art. 209-0 A + BOFiP-IS-BASE-10-20-10'
    
    def test_opcvm_obligations_mark_to_market(self):
        """
        Test OPCVM Obligations (0% actions).
        
        Taxation annuelle sur PV latente (mark-to-market).
        """
        societe = SocieteIS(
            raison_sociale="TEST SARL",
            siren="333333333",
            regime_fiscal=RegimeFiscalIS.IS_STANDARD,
            taux_is=25.0
        )
        
        fiscalite = societe.calcul_fiscalite_opcvm(
            isin="LU1681038672",
            pourcentage_actions=0.0,
            plus_value_latente=5000,
            plus_value_realisee=0
        )
        
        # Pas de QPFC pour obligations
        assert 'qpfc' not in fiscalite
        
        # Taxation latente annuelle
        assert fiscalite['impot_annuel_latent'] == 1250  # 5000 * 0.25
        assert fiscalite['impot_a_la_realisation'] == 0
        assert fiscalite['opcvm_actions_eligible'] == False
        assert "mark-to-market" in fiscalite['regime_applicable'].lower()
    
    def test_pas_de_qpfc_pour_opcvm(self):
        """Vérifier qu'il n'y a PAS de QPFC pour OPCVM"""
        societe = SocieteIS(
            raison_sociale="TEST SARL",
            siren="123456789",
            regime_fiscal=RegimeFiscalIS.IS_PME,
            taux_is=15.0
        )
        
        result = societe.calcul_fiscalite_opcvm(
            isin="IE00B4L5Y983",
            pourcentage_actions=100.0,
            plus_value_latente=0,
            plus_value_realisee=10000
        )
        
        # Taxation pleine à 15% (PME) ou 25% (standard)
        assert result['impot_a_la_realisation'] == 1500  # 10000 * 0.15
        assert 'qpfc' not in result
        assert result['note_importante'] == 'PAS de QPFC 12% pour OPCVM (réservée aux titres de participation directs)'
    
    def test_seuil_limite_89_9_pourcent(self):
        """Test cas limite: 89.9% actions -> NON éligible OPCVM Actions IS"""
        societe = SocieteIS(
            raison_sociale="TEST SARL",
            siren="123456789",
            regime_fiscal=RegimeFiscalIS.IS_STANDARD,
            taux_is=25.0
        )
        
        result = societe.calcul_fiscalite_opcvm(
            isin="TEST001",
            pourcentage_actions=89.9,
            plus_value_latente=10000,
            plus_value_realisee=0
        )
        
        # Doit être considéré comme non-éligible
        assert result['opcvm_actions_eligible'] == False
        assert result['impot_annuel_latent'] == 2500  # Taxation latente
    
    def test_seuil_limite_90_0_pourcent(self):
        """Test cas limite: 90.0% actions -> éligible OPCVM Actions IS"""
        societe = SocieteIS(
            raison_sociale="TEST SARL",
            siren="123456789",
            regime_fiscal=RegimeFiscalIS.IS_STANDARD,
            taux_is=25.0
        )
        
        result = societe.calcul_fiscalite_opcvm(
            isin="TEST002",
            pourcentage_actions=90.0,
            plus_value_latente=10000,
            plus_value_realisee=0
        )
        
        # Doit être considéré comme éligible
        assert result['opcvm_actions_eligible'] == True
        assert result['impot_annuel_latent'] == 0  # Pas de taxation latente
    
    def test_optimiser_allocation_is(self):
        """Test recommandations d'optimisation pour société IS"""
        societe = SocieteIS(
            raison_sociale="TEST SARL",
            siren="123456789",
            regime_fiscal=RegimeFiscalIS.IS_STANDARD,
            taux_is=25.0
        )
        
        recommandations = societe.optimiser_allocation_is()
        
        # Vérifier la structure des recommandations
        assert 'actions' in recommandations
        assert 'obligations' in recommandations
        assert 'etf_mixtes_attention' in recommandations
        
        # Vérifier les seuils corrects
        assert '90%' in recommandations['actions']['seuil_is']
        assert recommandations['base_legale'] == 'CGI Art. 209-0 A + BOFiP-IS-BASE-10-20-10'
        
        # Vérifier l'avertissement sur ETFs mixtes
        assert '80%' in recommandations['etf_mixtes_attention']['exemple']
        assert recommandations['etf_mixtes_attention']['eligible_pea'] == 'OUI (≥75% actions UE)'
        assert recommandations['etf_mixtes_attention']['eligible_is_optimal'] == 'NON (<90% actions)'


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
