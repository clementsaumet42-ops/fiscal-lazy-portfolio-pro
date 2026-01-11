from typing import Dict, List
from legal.fiscal_rules import FiscalRules


class ComplianceEngine:
    """
    Moteur de vérification de conformité réglementaire.
    
    Vérifie:
    - Éligibilité PEA
    - Respect des plafonds
    - Conformité fiscale
    - Validation des opérations
    """
    
    def __init__(self):
        self.fiscal_rules = FiscalRules()
    
    def verifier_conformite_portefeuille(
        self,
        enveloppes: List[dict],
        positions: List[dict],
        etfs_db: Dict[str, dict]
    ) -> Dict:
        """
        Vérifie la conformité complète d'un portefeuille.
        
        Returns:
            Dict avec résultats de conformité et alertes
        """
        alertes = []
        avertissements = []
        conforme = True
        
        for enveloppe in enveloppes:
            type_env = enveloppe.get("type")
            
            if type_env == "pea":
                # Vérifier PEA
                verif_pea = self._verifier_conformite_pea(enveloppe, positions, etfs_db)
                if not verif_pea["conforme"]:
                    conforme = False
                    alertes.extend(verif_pea["alertes"])
                avertissements.extend(verif_pea.get("avertissements", []))
            
            elif type_env == "av":
                # Vérifier AV
                verif_av = self._verifier_conformite_av(enveloppe)
                avertissements.extend(verif_av.get("avertissements", []))
            
            elif type_env == "cto":
                # Vérifier CTO
                verif_cto = self._verifier_conformite_cto(enveloppe, positions)
                avertissements.extend(verif_cto.get("avertissements", []))
        
        return {
            "conforme": conforme,
            "nb_alertes": len(alertes),
            "nb_avertissements": len(avertissements),
            "alertes": alertes,
            "avertissements": avertissements,
            "recommandations": self._generer_recommandations(alertes, avertissements)
        }
    
    def _verifier_conformite_pea(
        self,
        pea: dict,
        positions: List[dict],
        etfs_db: Dict[str, dict]
    ) -> Dict:
        """Vérifie la conformité d'un PEA"""
        alertes = []
        avertissements = []
        conforme = True
        
        # 1. Vérifier plafond versements
        montant_verse = pea.get("montant_verse", 0)
        verif_plafond = FiscalRules.verifier_plafond_pea(montant_verse)
        
        if not verif_plafond["respect_plafond"]:
            conforme = False
            alertes.append({
                "type": "PLAFOND_DEPASSE",
                "severite": "CRITIQUE",
                "message": f"Plafond PEA dépassé: {montant_verse}€ > {FiscalRules.PLAFOND_PEA}€",
                "action": "Régulariser les versements excédentaires",
                "reference": verif_plafond["reference_legale"]
            })
        elif verif_plafond["capacite_restante"] < 10000:
            avertissements.append({
                "type": "PLAFOND_PROCHE",
                "message": f"Capacité restante PEA faible: {verif_plafond['capacite_restante']}€",
                "action": "Planifier versements futurs"
            })
        
        # 2. Vérifier éligibilité des positions
        positions_pea = [p for p in positions if p.get("enveloppe_id") == pea.get("id")]
        
        for position in positions_pea:
            isin = position.get("isin")
            
            if isin in etfs_db:
                etf = etfs_db[isin]
                verif_eligibilite = FiscalRules.verifier_eligibilite_pea(etf)
                
                if not verif_eligibilite["eligible"]:
                    conforme = False
                    alertes.append({
                        "type": "ETF_NON_ELIGIBLE",
                        "severite": "CRITIQUE",
                        "message": f"ETF non éligible PEA: {position.get('nom')} ({isin})",
                        "raisons": verif_eligibilite["raisons"],
                        "action": "Vendre et réinvestir dans ETF éligible",
                        "reference": verif_eligibilite["reference_legale"]
                    })
        
        # 3. Vérifier ancienneté pour optimisation fiscale
        anciennete = pea.get("anciennete_annees", 0)
        
        if anciennete < 5:
            avertissements.append({
                "type": "PEA_JEUNE",
                "message": f"PEA de {anciennete:.1f} ans: attention aux retraits avant 5 ans",
                "action": "Éviter tout retrait pour ne pas déclencher clôture et taxation IR",
                "reference": "CGI Art. 150-0 A"
            })
        
        return {
            "conforme": conforme,
            "alertes": alertes,
            "avertissements": avertissements
        }
    
    def _verifier_conformite_av(self, av: dict) -> Dict:
        """Vérifie la conformité d'une Assurance-Vie"""
        avertissements = []
        
        anciennete = av.get("anciennete_annees", 0)
        
        if anciennete < 8:
            avertissements.append({
                "type": "AV_JEUNE",
                "message": f"Assurance-Vie de {anciennete:.1f} ans",
                "action": f"Attendre {8 - anciennete:.1f} ans pour bénéficier abattement et taux 7.5%",
                "avantage_fiscal": "Abattement 4,600€ (9,200€ couple) + taxation 7.5%"
            })
        
        return {
            "conforme": True,
            "avertissements": avertissements
        }
    
    def _verifier_conformite_cto(self, cto: dict, positions: List[dict]) -> Dict:
        """Vérifie la conformité d'un CTO"""
        avertissements = []
        
        # Identifier opportunités tax-loss harvesting
        positions_cto = [p for p in positions if p.get("enveloppe_id") == cto.get("id")]
        positions_perte = [p for p in positions_cto if p.get("plus_value_latente", 0) < -100]
        
        if positions_perte:
            avertissements.append({
                "type": "TAX_LOSS_HARVESTING",
                "message": f"{len(positions_perte)} position(s) en moins-value sur CTO",
                "action": "Considérer Tax-Loss Harvesting avant fin d'année fiscale",
                "avantage_fiscal": "Compensation gains/pertes pour réduire fiscalité"
            })
        
        return {
            "conforme": True,
            "avertissements": avertissements
        }
    
    def _generer_recommandations(self, alertes: List, avertissements: List) -> List[str]:
        """Génère des recommandations basées sur alertes et avertissements"""
        recommandations = []
        
        if any(a["type"] == "PLAFOND_DEPASSE" for a in alertes):
            recommandations.append("Régulariser immédiatement les versements PEA excédentaires")
        
        if any(a["type"] == "ETF_NON_ELIGIBLE" for a in alertes):
            recommandations.append("Vendre les ETFs non éligibles PEA et réinvestir dans ETFs conformes")
        
        if any(a["type"] == "PEA_JEUNE" for a in avertissements):
            recommandations.append("Privilégier nouveaux apports plutôt que retraits sur PEA <5 ans")
        
        if any(a["type"] == "TAX_LOSS_HARVESTING" for a in avertissements):
            recommandations.append("Exécuter stratégie Tax-Loss Harvesting sur CTO avant 31 décembre")
        
        return recommandations
    
    def generer_rapport_conformite(
        self,
        enveloppes: List[dict],
        positions: List[dict],
        etfs_db: Dict[str, dict]
    ) -> str:
        """
        Génère un rapport de conformité complet pour expert-comptable.
        
        Returns:
            Rapport texte formaté
        """
        verification = self.verifier_conformite_portefeuille(enveloppes, positions, etfs_db)
        
        rapport = "=" * 60 + "\n"
        rapport += "RAPPORT DE CONFORMITÉ RÉGLEMENTAIRE\n"
        rapport += "Fiscal Lazy Portfolio Pro\n"
        rapport += "=" * 60 + "\n\n"
        
        if verification["conforme"]:
            rapport += "✓ STATUT: CONFORME\n\n"
        else:
            rapport += "✗ STATUT: NON CONFORME - ACTION REQUISE\n\n"
        
        if verification["alertes"]:
            rapport += f"ALERTES CRITIQUES ({verification['nb_alertes']}):\n"
            rapport += "-" * 60 + "\n"
            
            for i, alerte in enumerate(verification["alertes"], 1):
                rapport += f"{i}. {alerte['message']}\n"
                rapport += f"   Action: {alerte['action']}\n"
                rapport += f"   Référence: {alerte.get('reference', 'N/A')}\n\n"
        
        if verification["avertissements"]:
            rapport += f"\nAVERTISSEMENTS ({verification['nb_avertissements']}):\n"
            rapport += "-" * 60 + "\n"
            
            for i, avert in enumerate(verification["avertissements"], 1):
                rapport += f"{i}. {avert['message']}\n"
                rapport += f"   Action: {avert['action']}\n\n"
        
        if verification["recommandations"]:
            rapport += "\nRECOMMANDATIONS:\n"
            rapport += "-" * 60 + "\n"
            
            for i, reco in enumerate(verification["recommandations"], 1):
                rapport += f"{i}. {reco}\n"
        
        rapport += "\n" + "=" * 60 + "\n"
        rapport += "Rapport généré par Fiscal Lazy Portfolio Pro\n"
        rapport += "DISCLAIMER: Ce rapport est fourni à titre informatif.\n"
        rapport += "Consultez un expert-comptable pour validation finale.\n"
        rapport += "=" * 60 + "\n"
        
        return rapport
