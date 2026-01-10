import sys
sys.path.append("backend/src")

import pytest
from models.societe_is import SocieteIS, RegimeFiscalIS, TypeOPCVM


class TestSocieteIS:
    """
    Tests de la fiscalité société IS selon CGI Art. 209-0 A + BOFiP-IS-BASE-10-20-10.
    
    Vérifie:
    - OPCVM Actions (≥90% actions): taxation à la réalisation, PAS de QPFC
    - OPCVM Obligations (<90% actions): taxation annuelle sur PV latente
    - Seuil 90% pour IS (≠ seuil 75% pour PEA)
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
    
    def test_fiscalite_opcvm_actions_100_pourcent(self):
        """
        Test OPCVM Actions avec 100% actions (≥90%).
        
        Pas de taxation latente, taxation uniquement à la réalisation.
        PAS de QPFC pour OPCVM.
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
            plus_value_latente=10000,
            plus_value_realisee=0
        )
        
        # ≥90% actions -> OPCVM Actions
        assert fiscalite["opcvm_actions_eligible"] == True
        assert fiscalite["seuil_is"] == 90.0
        
        # Pas de taxation latente
        assert fiscalite["impot_annuel_latent"] == 0
        
        # PAS de QPFC pour OPCVM
        assert "qpfc" not in fiscalite
        
        assert "CGI Art. 209-0 A" in fiscalite["base_legale"]
        assert "PAS de QPFC" in fiscalite["note"]
    
    def test_fiscalite_opcvm_actions_realisation(self):
        """
        Test OPCVM Actions avec plus-value réalisée.
        
        Taxation uniquement à la réalisation (PAS de QPFC).
        """
        societe = SocieteIS(
            raison_sociale="TEST SARL",
            siren="222222222",
            regime_fiscal=RegimeFiscalIS.IS_STANDARD,
            taux_is=25.0
        )
        
        fiscalite = societe.calcul_fiscalite_opcvm(
            isin="FR0011869353",
            pourcentage_actions=100.0,
            plus_value_latente=0,
            plus_value_realisee=10000
        )
        
        # OPCVM Actions: taxation à la réalisation
        assert fiscalite["opcvm_actions_eligible"] == True
        assert fiscalite["impot_annuel_latent"] == 0
        
        # Impôt à la réalisation = 10000 * 25% = 2500€
        assert fiscalite["impot_a_la_realisation"] == 2500
        assert fiscalite["impot_total_du"] == 2500
        
        # PAS de QPFC pour OPCVM
        assert "qpfc" not in fiscalite
        
        assert "Taxation à la réalisation" in fiscalite["regime_applicable"]
    
    def test_fiscalite_opcvm_obligations_mark_to_market(self):
        """
        Test OPCVM Obligations (0% actions, <90%).
        
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
        
        # <90% actions -> OPCVM Obligations
        assert fiscalite["opcvm_actions_eligible"] == False
        
        # Taxation latente annuelle
        assert fiscalite["impot_annuel_latent"] == 1250  # 5000 * 0.25
        assert fiscalite["impot_a_la_realisation"] == 0
        
        # PAS de QPFC pour OPCVM
        assert "qpfc" not in fiscalite
        
        assert "mark-to-market" in fiscalite["regime_applicable"]
    
    def test_fiscalite_opcvm_80_pourcent_actions(self):
        """
        Test ETF 80% actions: eligible PEA (≥75%) mais PAS OPCVM Actions IS (<90%).
        
        Taxation latente annuelle car <90% actions.
        """
        societe = SocieteIS(
            raison_sociale="TEST SARL",
            siren="444444444",
            regime_fiscal=RegimeFiscalIS.IS_STANDARD,
            taux_is=25.0
        )
        
        fiscalite = societe.calcul_fiscalite_opcvm(
            isin="EXEMPLE80",
            pourcentage_actions=80.0,
            plus_value_latente=10000,
            plus_value_realisee=0
        )
        
        # 80% actions: eligible PEA (≥75%) mais PAS OPCVM Actions IS (<90%)
        assert fiscalite["opcvm_actions_eligible"] == False
        assert fiscalite["seuil_is"] == 90.0
        
        # Taxation latente annuelle: 10000 * 25% = 2500€
        assert fiscalite["impot_annuel_latent"] == 2500
        assert fiscalite["impot_a_la_realisation"] == 0
        
        # PAS de QPFC
        assert "qpfc" not in fiscalite
        
        assert "mark-to-market" in fiscalite["regime_applicable"]
    
    def test_fiscalite_opcvm_90_pourcent_seuil(self):
        """
        Test du seuil exact à 90% actions.
        
        Vérifie que 90% est eligible OPCVM Actions IS.
        """
        societe = SocieteIS(
            raison_sociale="SEUIL SARL",
            siren="555555555",
            regime_fiscal=RegimeFiscalIS.IS_STANDARD,
            taux_is=25.0
        )
        
        # Exactement 90% -> OPCVM Actions
        fiscalite_90 = societe.calcul_fiscalite_opcvm(
            isin="SEUIL90",
            pourcentage_actions=90.0,
            plus_value_latente=10000,
            plus_value_realisee=0
        )
        
        assert fiscalite_90["opcvm_actions_eligible"] == True
        assert fiscalite_90["impot_annuel_latent"] == 0  # Pas de taxation latente
        
        # 89.9% -> OPCVM Obligations
        fiscalite_89 = societe.calcul_fiscalite_opcvm(
            isin="SEUIL89",
            pourcentage_actions=89.9,
            plus_value_latente=10000,
            plus_value_realisee=0
        )
        
        assert fiscalite_89["opcvm_actions_eligible"] == False
        assert fiscalite_89["impot_annuel_latent"] == 2500  # Taxation latente


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
