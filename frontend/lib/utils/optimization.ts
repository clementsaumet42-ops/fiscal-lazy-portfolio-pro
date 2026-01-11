/**
 * Utilitaires pour l'optimisation fiscale et financière
 */

import { TypeEnveloppeAudit } from '../types/audit';
import { ETF_DATABASE, getETFsByCategory } from '../data/etf-database';
import type { ETFInfo } from '../types/audit';

/**
 * Calcule l'économie avec intérêts composés
 * @param economie_annuelle - Économie annuelle en euros
 * @param annees - Nombre d'années
 * @param taux_rendement - Taux de rendement annuel (par défaut 5%)
 * @returns Valeur future de l'annuité
 */
export function calculerEconomieAvecInterets(
  economie_annuelle: number, 
  annees: number, 
  taux_rendement: number = 0.05
): number {
  if (economie_annuelle === 0 || annees === 0) return 0;
  // Formule : VF d'une annuité = PMT × (((1 + r)^n - 1) / r)
  return economie_annuelle * (((1 + taux_rendement) ** annees - 1) / taux_rendement);
}

/**
 * Détermine l'enveloppe optimale pour une classe d'actifs
 * @param classe_actif - Type d'actif
 * @param enveloppes_disponibles - Liste des enveloppes disponibles
 * @returns Enveloppe recommandée
 */
export function determinerAssetLocation(
  classe_actif: string, 
  enveloppes_disponibles: TypeEnveloppeAudit[]
): TypeEnveloppeAudit {
  // Règles de placement optimal par classe d'actifs
  const regles: Record<string, TypeEnveloppeAudit[]> = {
    'Actions Europe': ['PEA', 'AV', 'CTO', 'PER', 'IS'],
    'Actions France': ['PEA', 'AV', 'CTO', 'PER', 'IS'],
    'Actions Monde': ['AV', 'CTO', 'PER', 'IS', 'PEA'],
    'Actions USA': ['AV', 'CTO', 'PER', 'IS', 'PEA'],
    'Actions Émergents': ['AV', 'CTO', 'PER', 'IS', 'PEA'],
    'Obligations': ['AV', 'PER', 'CTO', 'IS', 'PEA'],
    'Obligations Euro IG': ['AV', 'PER', 'CTO', 'IS'],
    'Obligations Euro Souveraines': ['AV', 'PER', 'CTO', 'IS'],
    'Fonds Euro': ['AV', 'PER'],
    'Immobilier': ['AV', 'CTO', 'IS', 'PER'],
    'Or': ['CTO', 'AV', 'IS'],
  };
  
  const priorite = regles[classe_actif] || ['CTO', 'AV', 'PEA', 'PER', 'IS'];
  
  // Retourner la première enveloppe disponible selon la priorité
  for (const env of priorite) {
    if (enveloppes_disponibles.includes(env)) {
      return env;
    }
  }
  
  // Par défaut, retourner la première enveloppe disponible
  return enveloppes_disponibles[0] || 'CTO';
}

/**
 * Trouve les ETF correspondants à une catégorie et une enveloppe
 * @param categorie - Catégorie d'actifs
 * @param enveloppe - Type d'enveloppe
 * @returns Liste d'ETF triés par frais croissants
 */
export function matcherETF(categorie: string, enveloppe: TypeEnveloppeAudit): ETFInfo[] {
  return ETF_DATABASE.filter(etf => {
    // Pour le PEA, seuls les ETF éligibles
    if (enveloppe === 'PEA' && !etf.eligible_pea) return false;
    
    // Matcher la catégorie
    return etf.categorie === categorie || 
           etf.categorie.includes(categorie) ||
           categorie.includes(etf.categorie);
  }).sort((a, b) => a.frais_gestion - b.frais_gestion);
}

/**
 * Calcule le score de qualité fiscale d'une allocation
 * @param allocation - Allocation par enveloppe et classe d'actifs
 * @returns Score de 0 à 100
 */
export function calculerScoreFiscal(
  allocation: Record<TypeEnveloppeAudit, Record<string, number>>
): number {
  let score = 0;
  let totalPoints = 0;
  
  for (const [enveloppe, classes] of Object.entries(allocation)) {
    for (const [classe, montant] of Object.entries(classes)) {
      if (montant === 0) continue;
      
      const enveloppeOptimale = determinerAssetLocation(classe, Object.keys(allocation) as TypeEnveloppeAudit[]);
      const priorites: Record<string, TypeEnveloppeAudit[]> = {
        'Actions Europe': ['PEA', 'AV', 'CTO', 'PER', 'IS'],
        'Actions France': ['PEA', 'AV', 'CTO', 'PER', 'IS'],
        'Actions Monde': ['AV', 'CTO', 'PER', 'IS'],
        'Obligations': ['AV', 'PER', 'CTO', 'IS'],
        'Fonds Euro': ['AV', 'PER'],
      };
      
      const priorite = priorites[classe] || ['CTO', 'AV', 'PEA', 'PER', 'IS'];
      const index = priorite.indexOf(enveloppe as TypeEnveloppeAudit);
      
      // Points: 100 pour optimal, 70 pour acceptable, 40 pour suboptimal
      if (index === 0) score += 100;
      else if (index === 1) score += 70;
      else if (index >= 2) score += 40;
      
      totalPoints += 100;
    }
  }
  
  return totalPoints > 0 ? Math.round(score / totalPoints * 100) : 0;
}

/**
 * Évalue la qualité fiscale d'un placement
 * @param classe_actif - Classe d'actifs
 * @param enveloppe - Enveloppe fiscale
 * @returns 'optimal' | 'acceptable' | 'suboptimal'
 */
export function evaluerQualiteFiscale(
  classe_actif: string, 
  enveloppe: TypeEnveloppeAudit
): 'optimal' | 'acceptable' | 'suboptimal' {
  const priorites: Record<string, TypeEnveloppeAudit[]> = {
    'Actions Europe': ['PEA', 'AV', 'CTO', 'PER', 'IS'],
    'Actions France': ['PEA', 'AV', 'CTO', 'PER', 'IS'],
    'Actions Monde': ['AV', 'CTO', 'PER', 'IS'],
    'Actions USA': ['AV', 'CTO', 'PER', 'IS'],
    'Obligations': ['AV', 'PER', 'CTO', 'IS'],
    'Fonds Euro': ['AV', 'PER'],
    'Immobilier': ['AV', 'CTO', 'IS'],
  };
  
  const priorite = priorites[classe_actif] || ['CTO', 'AV', 'PEA', 'PER', 'IS'];
  const index = priorite.indexOf(enveloppe);
  
  if (index === 0) return 'optimal';
  if (index === 1) return 'acceptable';
  return 'suboptimal';
}

/**
 * Calcule le gain fiscal estimé d'une optimisation
 * @param montant - Montant concerné
 * @param enveloppe_actuelle - Enveloppe actuelle
 * @param enveloppe_optimale - Enveloppe recommandée
 * @param tmi - Taux marginal d'imposition (par défaut 30%)
 * @returns Gain fiscal annuel estimé
 */
export function calculerGainFiscal(
  montant: number,
  enveloppe_actuelle: TypeEnveloppeAudit,
  enveloppe_optimale: TypeEnveloppeAudit,
  tmi: number = 0.30
): number {
  // Taux de taxation effectifs moyens par enveloppe (simplifié)
  const tauxEffectifs: Record<TypeEnveloppeAudit, number> = {
    'PEA': 0.00,      // Exonération après 5 ans (hors prélèvements sociaux)
    'AV': 0.075,      // Taux réduit après 8 ans + abattement
    'PER': 0.00,      // Déduction IR à l'entrée, mais taxation sortie
    'CTO': tmi,       // TMI + prélèvements sociaux
    'IS': 0.25,       // IS à 25%
  };
  
  const rendementAnnuelEstime = 0.05; // 5% par an
  const gainAnnuel = montant * rendementAnnuelEstime;
  
  const taxeActuelle = gainAnnuel * tauxEffectifs[enveloppe_actuelle];
  const taxeOptimale = gainAnnuel * tauxEffectifs[enveloppe_optimale];
  
  return Math.max(0, taxeActuelle - taxeOptimale);
}
