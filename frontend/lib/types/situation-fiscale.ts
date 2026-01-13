/**
 * Types pour la situation fiscale du client
 * Base pour les calculs fiscaux conformes au Code Général des Impôts (CGI)
 */

// Tranches Marginales d'Imposition 2024 (CGI Art. 197)
export type TMI = 0 | 0.11 | 0.30 | 0.41 | 0.45

export type SituationFamiliale = 'celibataire' | 'marie' | 'pacse' | 'divorce' | 'veuf'

export interface SituationFiscale {
  // Tranche Marginale d'Imposition
  tmi: TMI
  
  // Revenu Fiscal de Référence (pour certains seuils)
  rfr: number
  
  // Nombre de parts fiscales (pour calcul plafonds)
  nbPartsFiscales: number
  
  // Situation familiale
  situationFamiliale: SituationFamiliale
  
  // Option pour le barème progressif sur les revenus mobiliers (CTO)
  // Alternative au PFU 30% si TMI < 30%
  optionBaremeProgressif: boolean
  
  // Plafonds utilisés (pour calcul disponible)
  plafonds: {
    // PEA: plafond 150 000€ (CGI Art. 163 quinquies D)
    peaUtilise: number
    
    // PER: plafond déductible = 10% revenus professionnels (CGI Art. 163 quatervicies)
    perDeductibleUtilise: number
  }
  
  // Revenus professionnels annuels (pour calcul plafond PER)
  revenusProAnnuels?: number
}

/**
 * Plafonds et constantes fiscales 2024
 */
export const PLAFONDS_2024 = {
  // PEA (CGI Art. 163 quinquies D)
  PEA_MAX: 150_000,
  PEA_JEUNE_MAX: 20_000,
  
  // Assurance-vie (CGI Art. 125-0 A)
  AV_ABATTEMENT_CELIBATAIRE: 4_600,
  AV_ABATTEMENT_COUPLE: 9_200,
  AV_SEUIL_ANCIEN_REGIME: 150_000, // Versements avant 27/09/2017
  
  // PER (CGI Art. 163 quatervicies)
  PER_PLAFOND_BASE: 35_194, // 2024
  PER_TAUX_REVENUS_PROS: 0.10, // 10% des revenus pros
} as const

/**
 * Taux de prélèvements sociaux 2024 (CGI Art. L136-7)
 */
export const PRELEVEMENTS_SOCIAUX = {
  TAUX: 0.172, // 17.2%
  COMPOSITION: {
    CSG: 0.092, // 9.2%
    CRDS: 0.005, // 0.5%
    PRELEVEMENT_SOCIAL: 0.045, // 4.5%
    CONTRIBUTION_ADDITIONNELLE: 0.03, // 3.0%
  }
} as const

/**
 * Taux PFU (Prélèvement Forfaitaire Unique) - CGI Art. 200 A
 * Aussi appelé "Flat Tax"
 */
export const PFU = {
  IR: 0.128, // 12.8% impôt sur le revenu
  PS: PRELEVEMENTS_SOCIAUX.TAUX, // 17.2% prélèvements sociaux
  TOTAL: 0.30, // 30% total
} as const
