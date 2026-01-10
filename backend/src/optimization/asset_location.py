from typing import Dict, List, Tuple
from models.enveloppe import EnveloppeType
from models.etf import TypeDistribution


class AssetLocator:
    """
    Optimisation de la localisation des actifs (Asset Location).
    
    Détermine le placement optimal des ETFs dans les différentes enveloppes
    pour minimiser la fiscalité.
    """
    
    @staticmethod
    def calculer_score_efficience_fiscale(
        etf: dict,
        enveloppe_type: EnveloppeType,
        anciennete_annees: float,
        tmi: float = 0
    ) -> float:
        """
        Calcule le score d'efficience fiscale d'un (ETF, enveloppe).
        
        Score élevé = placement optimal pour minimiser la fiscalité.
        
        Args:
            etf: Dict avec keys: eligible_pea, type_distribution, classe_actif
            enveloppe_type: Type d'enveloppe
            anciennete_annees: Ancienneté de l'enveloppe
            tmi: Tranche Marginale d'Imposition
        
        Returns:
            Score d'efficience (0-100)
        """
        score = 50.0  # Score de base
        
        eligible_pea = etf.get("eligible_pea", False)
        type_distribution = etf.get("type_distribution", "capitalisant")
        classe_actif = etf.get("classe_actif", "")
        
        if enveloppe_type == EnveloppeType.PEA:
            if eligible_pea:
                score += 30
                if anciennete_annees >= 5:
                    # PEA >5 ans = exonération IR
                    score += 20
                else:
                    score += 10
            else:
                # Non éligible PEA
                score = 0
                
        elif enveloppe_type == EnveloppeType.CTO:
            # CTO: moins avantageux fiscalement
            if type_distribution == "capitalisant":
                # Capitalisant = différé fiscal
                score += 10
            else:
                # Distributif = taxation immédiate des dividendes
                score -= 10
            
            # Pénalité basée sur TMI
            score -= tmi * 0.5
            
        elif enveloppe_type == EnveloppeType.ASSURANCE_VIE:
            if anciennete_annees >= 8:
                # AV >8 ans = abattement + 7.5%
                score += 25
            elif anciennete_annees >= 4:
                # AV 4-8 ans = 15%
                score += 15
            else:
                # AV <4 ans = 35%
                score += 5
            
            # AV préfère obligations (fonds euros)
            if "obligations" in classe_actif:
                score += 10
                
        elif enveloppe_type == EnveloppeType.PER:
            # PER: déduction à l'entrée
            score += tmi * 0.5  # Avantage fiscal proportionnel à TMI
            
            if "obligations" in classe_actif:
                # PER adapté pour horizon retraite
                score += 10
        
        return max(0, min(100, score))
    
    @staticmethod
    def optimiser_placement(
        etfs_a_placer: List[dict],
        enveloppes_disponibles: List[dict],
        tmi: float = 0
    ) -> Dict[str, List[Tuple[str, float]]]:
        """
        Optimise le placement des ETFs dans les enveloppes disponibles.
        
        Args:
            etfs_a_placer: Liste d'ETFs avec montant à investir
            enveloppes_disponibles: Liste des enveloppes disponibles
            tmi: Tranche Marginale d'Imposition
        
        Returns:
            Dict: enveloppe_id -> [(isin, montant)]
        """
        placement = {env["id"]: [] for env in enveloppes_disponibles}
        
        # Pour chaque ETF, calculer le score pour chaque enveloppe
        for etf in etfs_a_placer:
            meilleur_score = -1
            meilleure_enveloppe = None
            
            for enveloppe in enveloppes_disponibles:
                score = AssetLocator.calculer_score_efficience_fiscale(
                    etf=etf,
                    enveloppe_type=enveloppe["type"],
                    anciennete_annees=enveloppe.get("anciennete_annees", 0),
                    tmi=tmi
                )
                
                # Vérifier si l'enveloppe a de la capacité
                capacite = enveloppe.get("capacite_restante", float('inf'))
                
                if score > meilleur_score and capacite >= etf.get("montant", 0):
                    meilleur_score = score
                    meilleure_enveloppe = enveloppe["id"]
            
            if meilleure_enveloppe:
                placement[meilleure_enveloppe].append(
                    (etf["isin"], etf.get("montant", 0))
                )
        
        return placement
    
    @staticmethod
    def recommandations_asset_location(
        portefeuille_actuel: List[dict],
        enveloppes: List[dict],
        tmi: float = 0
    ) -> List[dict]:
        """
        Génère des recommandations d'optimisation asset location.
        
        Returns:
            Liste de recommandations avec actions suggérées
        """
        recommandations = []
        
        for position in portefeuille_actuel:
            enveloppe_actuelle = position.get("enveloppe_type")
            
            # Calculer le score actuel
            score_actuel = AssetLocator.calculer_score_efficience_fiscale(
                etf=position,
                enveloppe_type=enveloppe_actuelle,
                anciennete_annees=position.get("anciennete_annees", 0),
                tmi=tmi
            )
            
            # Trouver la meilleure enveloppe alternative
            meilleur_score = score_actuel
            meilleure_enveloppe = enveloppe_actuelle
            
            for env in enveloppes:
                if env["type"] != enveloppe_actuelle:
                    score = AssetLocator.calculer_score_efficience_fiscale(
                        etf=position,
                        enveloppe_type=env["type"],
                        anciennete_annees=env.get("anciennete_annees", 0),
                        tmi=tmi
                    )
                    
                    if score > meilleur_score + 10:  # Seuil de 10 points
                        meilleur_score = score
                        meilleure_enveloppe = env["type"]
            
            if meilleure_enveloppe != enveloppe_actuelle:
                recommandations.append({
                    "isin": position["isin"],
                    "nom": position.get("nom", ""),
                    "enveloppe_actuelle": enveloppe_actuelle,
                    "enveloppe_recommandee": meilleure_enveloppe,
                    "score_actuel": score_actuel,
                    "score_optimal": meilleur_score,
                    "gain_potentiel": meilleur_score - score_actuel
                })
        
        return sorted(recommandations, key=lambda x: x["gain_potentiel"], reverse=True)
