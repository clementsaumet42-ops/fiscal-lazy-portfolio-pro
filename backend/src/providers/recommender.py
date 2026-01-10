from typing import Dict, List


class ProviderRecommender:
    """
    Système de recommandation de providers basé sur profil client.
    """
    
    @staticmethod
    def recommander_pea(
        profil: dict,
        providers: List[dict]
    ) -> List[dict]:
        """
        Recommande les meilleurs providers PEA selon profil.
        
        Args:
            profil: Dict avec montant_investissement, frequence_ordres, experience
            providers: Liste de providers PEA
        
        Returns:
            Liste de recommandations triées
        """
        montant_annuel = profil.get("montant_investissement", 10000)
        frequence_ordres = profil.get("frequence_ordres", "mensuel")  # mensuel, trimestriel, annuel
        experience = profil.get("experience", "debutant")  # debutant, intermediaire, avance
        
        # Mapper fréquence vers nb ordres
        freq_map = {"mensuel": 12, "trimestriel": 4, "annuel": 1}
        nb_ordres = freq_map.get(frequence_ordres, 12)
        
        recommandations = []
        
        for provider in providers:
            score_total = 0
            raisons = []
            
            # Score de base
            score_total += provider["score"]
            
            # Adapter selon expérience
            if experience == "debutant":
                # Privilégier interface simple
                if provider["interface_qualite"] >= 9:
                    score_total += 10
                    raisons.append("Interface très intuitive pour débutants")
                
                if "Trade Republic" in provider["nom"]:
                    score_total += 5
                    raisons.append("Application mobile ultra-simple")
            
            elif experience == "avance":
                # Privilégier choix ETFs et outils
                if "Excellent" in provider.get("choix_etfs", ""):
                    score_total += 10
                    raisons.append("Large choix d'ETFs (600+)")
                
                if "Saxo" in provider["nom"]:
                    score_total += 5
                    raisons.append("Outils de trading professionnels")
            
            # Adapter selon fréquence ordres
            frais_fixe = provider["frais_courtage"].get("fixe", 0)
            frais_pct = provider["frais_courtage"].get("variable_pct", 0)
            
            if nb_ordres >= 12:
                # Trading fréquent: privilégier frais % bas
                if frais_pct <= 0.2:
                    score_total += 10
                    raisons.append("Frais % très bas pour trading actif")
            else:
                # Trading rare: frais fixes acceptables
                if frais_fixe <= 1.0:
                    score_total += 5
                    raisons.append("Frais fixes avantageux")
            
            # IFU automatique toujours apprécié
            if provider["ifu_automatique"]:
                score_total += 5
                raisons.append("IFU automatique (simplicité fiscale)")
            
            recommandations.append({
                "provider": provider,
                "score_recommandation": score_total,
                "raisons": raisons,
                "adapte_pour": profil
            })
        
        # Trier par score décroissant
        recommandations.sort(key=lambda x: x["score_recommandation"], reverse=True)
        
        return recommandations[:3]  # Top 3
    
    @staticmethod
    def recommander_av(
        profil: dict,
        providers: List[dict]
    ) -> List[dict]:
        """
        Recommande les meilleurs contrats AV selon profil.
        
        Args:
            profil: Dict avec montant, gestion_souhaitee, horizon
            providers: Liste de providers AV
        """
        montant = profil.get("montant", 50000)
        gestion_souhaitee = profil.get("gestion_souhaitee", "libre")  # libre, pilotee
        horizon = profil.get("horizon_annees", 10)
        
        recommandations = []
        
        for provider in providers:
            score_total = provider["score"]
            raisons = []
            
            # Adapter selon gestion souhaitée
            if gestion_souhaitee == "libre":
                if provider.get("gestion_libre", True):
                    score_total += 10
                    raisons.append("Gestion libre disponible")
                
                if provider["frais_gestion_uc"] <= 0.6:
                    score_total += 10
                    raisons.append("Frais de gestion très compétitifs")
                
                if "Excellent" in provider.get("choix_etfs", ""):
                    score_total += 10
                    raisons.append("Large choix d'ETFs (200+)")
            
            else:  # gestion_pilotee
                if provider.get("gestion_pilotee"):
                    score_total += 15
                    raisons.append("Gestion pilotée disponible")
                
                if "Yomoni" in provider["nom"] or "Nalo" in provider["nom"]:
                    score_total += 5
                    raisons.append("Spécialiste gestion pilotée")
            
            # Fonds euros important pour horizon long
            if horizon >= 8:
                rendement_fe = provider.get("rendement_fonds_euros_2023", 0)
                if rendement_fe >= 3.0:
                    score_total += 5
                    raisons.append(f"Bon rendement fonds euros ({rendement_fe}%)")
            
            # Linxea toujours excellent pour gestion libre
            if "Linxea" in provider["nom"] and gestion_souhaitee == "libre":
                score_total += 5
                raisons.append("Référence du marché en gestion libre")
            
            recommandations.append({
                "provider": provider,
                "score_recommandation": score_total,
                "raisons": raisons,
                "adapte_pour": profil
            })
        
        recommandations.sort(key=lambda x: x["score_recommandation"], reverse=True)
        
        return recommandations[:3]
    
    @staticmethod
    def recommander_per(
        profil: dict,
        providers: List[dict]
    ) -> List[dict]:
        """Recommande les meilleurs PER selon profil"""
        tmi = profil.get("tmi", 30)
        gestion_souhaitee = profil.get("gestion_souhaitee", "libre")
        
        recommandations = []
        
        for provider in providers:
            score_total = provider["score"]
            raisons = []
            
            # TMI élevé = déduction importante = PER intéressant
            if tmi >= 30:
                score_total += 10
                raisons.append(f"PER très avantageux avec TMI {tmi}% (déduction IR)")
            
            # Adapter selon gestion
            if gestion_souhaitee == "libre":
                if provider.get("gestion_libre"):
                    score_total += 15
                    raisons.append("Gestion libre disponible")
                
                frais_libre = provider.get("frais_gestion_libre")
                if frais_libre and frais_libre <= 0.6:
                    score_total += 10
                    raisons.append("Frais très compétitifs en gestion libre")
            else:
                if provider.get("gestion_pilotee"):
                    score_total += 15
                    raisons.append("Gestion pilotée disponible")
            
            # Portabilité importante
            if provider.get("portabilite"):
                score_total += 5
                raisons.append("PER portable (changement assureur possible)")
            
            # Linxea PER = référence
            if "Linxea" in provider["nom"]:
                score_total += 5
                raisons.append("Meilleur PER du marché selon comparateurs")
            
            recommandations.append({
                "provider": provider,
                "score_recommandation": score_total,
                "raisons": raisons,
                "adapte_pour": profil
            })
        
        recommandations.sort(key=lambda x: x["score_recommandation"], reverse=True)
        
        return recommandations[:3]
