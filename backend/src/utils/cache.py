from typing import Any, Optional
from datetime import datetime, timedelta
import json


class CacheManager:
    """
    Gestionnaire de cache simple pour données de marché et calculs.
    """
    
    def __init__(self, ttl_seconds: int = 3600):
        """
        Args:
            ttl_seconds: Time To Live du cache en secondes (défaut: 1h)
        """
        self.cache = {}
        self.ttl_seconds = ttl_seconds
    
    def get(self, key: str) -> Optional[Any]:
        """
        Récupère une valeur du cache.
        
        Returns:
            Valeur si présente et valide, None sinon
        """
        if key not in self.cache:
            return None
        
        entry = self.cache[key]
        
        # Vérifier expiration
        if datetime.now() > entry["expires_at"]:
            del self.cache[key]
            return None
        
        return entry["value"]
    
    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None):
        """
        Stocke une valeur dans le cache.
        
        Args:
            key: Clé unique
            value: Valeur à stocker
            ttl_seconds: TTL spécifique (optionnel)
        """
        ttl = ttl_seconds if ttl_seconds is not None else self.ttl_seconds
        
        self.cache[key] = {
            "value": value,
            "expires_at": datetime.now() + timedelta(seconds=ttl)
        }
    
    def delete(self, key: str):
        """Supprime une entrée du cache"""
        if key in self.cache:
            del self.cache[key]
    
    def clear(self):
        """Vide tout le cache"""
        self.cache.clear()
    
    def get_stats(self) -> dict:
        """Statistiques du cache"""
        return {
            "nb_entries": len(self.cache),
            "keys": list(self.cache.keys())
        }
    
    def cleanup_expired(self):
        """Nettoie les entrées expirées"""
        now = datetime.now()
        expired_keys = [
            key for key, entry in self.cache.items()
            if now > entry["expires_at"]
        ]
        
        for key in expired_keys:
            del self.cache[key]
        
        return len(expired_keys)


# Instance globale de cache
global_cache = CacheManager()
