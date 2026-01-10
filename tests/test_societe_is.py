import sys
sys.path.append("backend/src")

import pytest
from models.societe_is import SocieteIS, RegimeFiscalIS, TypeOPCVM


class TestSocieteIS:
    """
    Tests de la fiscalité société IS selon CGI Art. 219.
    
    Vérifie:
    - OPCVM Actions (≥75% actions): taxation à la réalisation, QPFC 12% si >2 ans
    - OPCVM Obligations: taxation annuelle sur PV latente
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
    
    def test_fiscalite_opcvm_actions_detention_courte(self):
        """
        Test OPCVM Actions avec détention ≤2 ans.
        
        Pas de QPFC, taxation IS standard.
        """
        societe = SocieteIS(
            raison_sociale="TEST SARL",
            siren="111111111",
            regime_fiscal=RegimeFiscalIS.IS_STANDARD,
            taux_is=25.0
        )
        
        fiscalite = societe.calcul_fiscalite_opcvm(
            type_opcvm=TypeOPCVM.ACTIONS,
            plus_value=10000,
            duree_detention_annees=1.5
        )
        
        # Pas de QPFC si détention ≤2 ans
        assert fiscalite["qpfc"] == 0.0
        assert fiscalite["taux_effectif"] == 25.0
        assert fiscalite["impot_du"] == 2500  # 10000 * 0.25
        assert "IS standard" in fiscalite["regime"]
    
    def test_fiscalite_opcvm_actions_detention_longue_qpfc(self):
        """
        Test OPCVM Actions avec détention >2 ans.
        
        QPFC 12% déductible (CGI Art. 219, I-a quinquies).
        """
        societe = SocieteIS(
            raison_sociale="TEST SARL",
            siren="222222222",
            regime_fiscal=RegimeFiscalIS.IS_STANDARD,
            taux_is=25.0
        )
        
        fiscalite = societe.calcul_fiscalite_opcvm(
            type_opcvm=TypeOPCVM.ACTIONS,
            plus_value=10000,
            duree_detention_annees=3.0
        )
        
        # QPFC 12% applicable
        assert fiscalite["qpfc"] == 1200  # 10000 * 0.12
        
        # Base imposable = 10000 - 1200 = 8800
        # Impôt = 8800 * 0.25 = 2200
        assert fiscalite["impot_du"] == 2200
        
        # Taux effectif = 2200 / 10000 = 22%
        assert fiscalite["taux_effectif"] == 22.0
        
        assert "QPFC 12%" in fiscalite["regime"]
    
    def test_fiscalite_opcvm_obligations_mark_to_market(self):
        """
        Test OPCVM Obligations (<75% actions).
        
        Taxation annuelle sur PV latente (mark-to-market).
        """
        societe = SocieteIS(
            raison_sociale="TEST SARL",
            siren="333333333",
            regime_fiscal=RegimeFiscalIS.IS_STANDARD,
            taux_is=25.0
        )
        
        fiscalite = societe.calcul_fiscalite_opcvm(
            type_opcvm=TypeOPCVM.OBLIGATIONS,
            plus_value=5000,
            duree_detention_annees=5.0  # Durée n'importe pas
        )
        
        # Pas de QPFC pour obligations
        assert fiscalite["qpfc"] == 0.0
        
        # Taxation standard IS
        assert fiscalite["impot_du"] == 1250  # 5000 * 0.25
        assert fiscalite["taux_effectif"] == 25.0
        
        assert "Mark-to-market" in fiscalite["regime"]
    
    def test_avantage_fiscal_qpfc(self):
        """
        Test de l'avantage fiscal QPFC.
        
        Détention >2 ans permet économie de 3% (12% QPFC sur 25% IS).
        """
        societe = SocieteIS(
            raison_sociale="COMPARE SARL",
            siren="444444444",
            regime_fiscal=RegimeFiscalIS.IS_STANDARD,
            taux_is=25.0
        )
        
        plus_value = 100000
        
        # Sans QPFC (≤2 ans)
        fiscalite_court = societe.calcul_fiscalite_opcvm(
            type_opcvm=TypeOPCVM.ACTIONS,
            plus_value=plus_value,
            duree_detention_annees=2.0
        )
        
        # Avec QPFC (>2 ans)
        fiscalite_long = societe.calcul_fiscalite_opcvm(
            type_opcvm=TypeOPCVM.ACTIONS,
            plus_value=plus_value,
            duree_detention_annees=2.5
        )
        
        # Économie fiscale
        economie = fiscalite_court["impot_du"] - fiscalite_long["impot_du"]
        
        # Économie attendue = 100000 * 0.12 * 0.25 = 3000€
        assert economie == 3000
        
        # Taux effectif réduit de 25% à 22%
        assert fiscalite_court["taux_effectif"] == 25.0
        assert fiscalite_long["taux_effectif"] == 22.0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
