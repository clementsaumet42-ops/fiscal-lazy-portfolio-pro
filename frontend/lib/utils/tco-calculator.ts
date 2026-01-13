import type { LigneAudit, TCOCalculation } from '@/lib/types/bilan-audit'
import type { SituationFiscale } from '@/lib/types/situation-fiscale'
import { 
  calculatePEADragFiscal, 
  calculateCTODragFiscal, 
  calculateAVDragFiscal,
  calculatePEROptimization
} from './fiscal-calculator'

// Interface étendue pour TCO détaillé
export interface TCODetailed extends TCOCalculation {
  explications: string[]
  references: string[]
  metrics: {
    ratioFraisGestion: number
    tauxFiscaliteEffective: number
    terMoyen: number
  }
}

// Constants for TCO calculation
const FONDS_EUROS_RATE = 0.015 // 1.5% rendement moyen fonds euros
const PRELEVEMENTS_SOCIAUX_RATE = 0.172 // 17.2% prélèvements sociaux
const DIVIDENDE_MOYEN_RATE = 0.02 // 2% rendement dividende moyen
const PFU_RATE = 0.30 // 30% PFU (12.8% IR + 17.2% PS)

/**
 * Calcul du Total Cost of Ownership pour les enveloppes
 */
export function calculateTCO(
  lignes: LigneAudit[],
  type: 'PEA' | 'CTO' | 'AV' | 'PER'
): TCOCalculation {
  const valorisationTotale = lignes.reduce((sum, l) => sum + l.valorisation, 0)

  // Frais de gestion moyens par type
  const fraisGestionMoyens = {
    PEA: 0.003, // 0.3% en moyenne
    CTO: 0.002, // 0.2%
    AV: 0.015, // 1.5% (frais sur UC + gestion)
    PER: 0.012, // 1.2%
  }

  const fraisTotauxAnnuels = valorisationTotale * fraisGestionMoyens[type]

  // Drag fiscal (simplifié - à affiner selon TMI)
  let dragFiscal = 0
  if (type === 'CTO') {
    // PFU 30% (12.8% IR + 17.2% PS) sur dividendes estimés (2% rendement moyen)
    dragFiscal = valorisationTotale * DIVIDENDE_MOYEN_RATE * PFU_RATE
  } else if (type === 'AV') {
    // Prélèvements sociaux sur fonds euros (17.2%)
    dragFiscal = valorisationTotale * FONDS_EUROS_RATE * PRELEVEMENTS_SOCIAUX_RATE
  }

  // Coût d'opportunité: différence de performance vs ETF optimal
  // Exemple: portefeuille actuel 5% vs optimal 7% => 2% de manque à gagner
  const coutOpportunite = valorisationTotale * 0.02

  return {
    frais_totaux_annuels: fraisTotauxAnnuels,
    drag_fiscal_annuel: dragFiscal,
    cout_opportunite: coutOpportunite,
    tco_total: fraisTotauxAnnuels + dragFiscal + coutOpportunite,
  }
}

/**
 * Calcule le TER (Total Expense Ratio) moyen pondéré
 */
export function calculateTERMoyen(lignes: LigneAudit[]): number {
  if (lignes.length === 0) return 0
  
  const valorisationTotale = lignes.reduce((sum, l) => sum + l.valorisation, 0)
  if (valorisationTotale === 0) return 0
  
  const fraisPonderes = lignes.reduce((sum, l) => {
    // Éviter la division par zéro
    if (l.valorisation === 0) return sum
    const fraisLigne = (l.frais_gestion_annuels || 0) / l.valorisation
    return sum + (fraisLigne * l.valorisation)
  }, 0)
  
  return fraisPonderes / valorisationTotale
}

/**
 * Calcul TCO détaillé pour PEA
 */
export function calculateTCOPEA(
  lignes: LigneAudit[],
  dateOuverture: Date | string,
  situationFiscale: SituationFiscale
): TCODetailed {
  const valorisationTotale = lignes.reduce((sum, l) => sum + l.valorisation, 0)
  const plusValueTotale = lignes.reduce((sum, l) => sum + l.plus_value_latente, 0)
  
  // Frais de gestion
  const terMoyen = calculateTERMoyen(lignes) || 0.003 // 0.3% par défaut
  const fraisTotauxAnnuels = valorisationTotale * terMoyen
  
  // Drag fiscal selon ancienneté
  const dragResult = calculatePEADragFiscal(plusValueTotale, dateOuverture, situationFiscale.tmi)
  const dragFiscal = dragResult.dragFiscal
  
  // Coût d'opportunité
  const coutOpportunite = valorisationTotale * 0.015 // 1.5% pour PEA
  
  const tcoTotal = fraisTotauxAnnuels + dragFiscal + coutOpportunite
  
  return {
    frais_totaux_annuels: fraisTotauxAnnuels,
    drag_fiscal_annuel: dragFiscal,
    cout_opportunite: coutOpportunite,
    tco_total: tcoTotal,
    explications: [
      `Frais de gestion : ${(terMoyen * 100).toFixed(2)}% × ${valorisationTotale.toLocaleString('fr-FR')}€ = ${fraisTotauxAnnuels.toFixed(0)}€/an`,
      dragResult.explication,
      `Coût d'opportunité : 1.5% de la valorisation`
    ],
    references: [dragResult.reference],
    metrics: {
      ratioFraisGestion: valorisationTotale > 0 ? fraisTotauxAnnuels / valorisationTotale : 0,
      tauxFiscaliteEffective: dragResult.tauxEffectif,
      terMoyen
    }
  }
}

/**
 * Calcul TCO détaillé pour CTO
 */
export function calculateTCOCTO(
  lignes: LigneAudit[],
  situationFiscale: SituationFiscale
): TCODetailed {
  const valorisationTotale = lignes.reduce((sum, l) => sum + l.valorisation, 0)
  const plusValueTotale = lignes.reduce((sum, l) => sum + l.plus_value_latente, 0)
  
  // Frais de gestion
  const terMoyen = calculateTERMoyen(lignes) || 0.002 // 0.2% par défaut
  const fraisTotauxAnnuels = valorisationTotale * terMoyen
  
  // Drag fiscal sur dividendes estimés
  const dividendesEstimes = valorisationTotale * DIVIDENDE_MOYEN_RATE
  const dragResult = calculateCTODragFiscal(dividendesEstimes, situationFiscale)
  const dragFiscal = dragResult.dragFiscal
  
  // Coût d'opportunité
  const coutOpportunite = valorisationTotale * 0.01 // 1% pour CTO
  
  const tcoTotal = fraisTotauxAnnuels + dragFiscal + coutOpportunite
  
  return {
    frais_totaux_annuels: fraisTotauxAnnuels,
    drag_fiscal_annuel: dragFiscal,
    cout_opportunite: coutOpportunite,
    tco_total: tcoTotal,
    explications: [
      `Frais de gestion : ${(terMoyen * 100).toFixed(2)}% × ${valorisationTotale.toLocaleString('fr-FR')}€ = ${fraisTotauxAnnuels.toFixed(0)}€/an`,
      `Dividendes estimés : 2% × ${valorisationTotale.toLocaleString('fr-FR')}€ = ${dividendesEstimes.toFixed(0)}€`,
      dragResult.explication,
      `Coût d'opportunité : 1% de la valorisation`
    ],
    references: [dragResult.reference],
    metrics: {
      ratioFraisGestion: valorisationTotale > 0 ? fraisTotauxAnnuels / valorisationTotale : 0,
      tauxFiscaliteEffective: dragResult.tauxEffectif,
      terMoyen
    }
  }
}

/**
 * Calcul TCO détaillé pour Assurance-vie
 */
export function calculateTCOAV(
  lignes: LigneAudit[],
  dateOuverture: Date | string,
  montantVerse: number,
  repartitionFondsEuros: number,
  situationFiscale: SituationFiscale
): TCODetailed {
  const valorisationTotale = lignes.reduce((sum, l) => sum + l.valorisation, 0)
  
  // Frais de gestion
  const terMoyen = calculateTERMoyen(lignes) || 0.015 // 1.5% par défaut
  const fraisTotauxAnnuels = valorisationTotale * terMoyen
  
  // Drag fiscal
  const dragResult = calculateAVDragFiscal(
    montantVerse,
    valorisationTotale,
    dateOuverture,
    repartitionFondsEuros,
    situationFiscale
  )
  const dragFiscal = dragResult.dragFiscal
  
  // Coût d'opportunité
  const coutOpportunite = valorisationTotale * 0.02 // 2% pour AV
  
  const tcoTotal = fraisTotauxAnnuels + dragFiscal + coutOpportunite
  
  return {
    frais_totaux_annuels: fraisTotauxAnnuels,
    drag_fiscal_annuel: dragFiscal,
    cout_opportunite: coutOpportunite,
    tco_total: tcoTotal,
    explications: [
      `Frais de gestion : ${(terMoyen * 100).toFixed(2)}% × ${valorisationTotale.toLocaleString('fr-FR')}€ = ${fraisTotauxAnnuels.toFixed(0)}€/an`,
      dragResult.explication,
      `Coût d'opportunité : 2% de la valorisation`
    ],
    references: [dragResult.reference],
    metrics: {
      ratioFraisGestion: valorisationTotale > 0 ? fraisTotauxAnnuels / valorisationTotale : 0,
      tauxFiscaliteEffective: dragResult.tauxEffectif,
      terMoyen
    }
  }
}

/**
 * Calcul TCO détaillé pour PER
 */
export function calculateTCOPER(
  lignes: LigneAudit[],
  montantVerse: number,
  revenus: number,
  situationFiscale: SituationFiscale
): TCODetailed {
  const valorisationTotale = lignes.reduce((sum, l) => sum + l.valorisation, 0)
  
  // Frais de gestion
  const terMoyen = calculateTERMoyen(lignes) || 0.012 // 1.2% par défaut
  const fraisTotauxAnnuels = valorisationTotale * terMoyen
  
  // Optimisation PER
  const perResult = calculatePEROptimization(montantVerse, revenus, situationFiscale)
  
  // Le "drag fiscal" pour PER est négatif (c'est un avantage)
  // On met 0 pour ne pas fausser le TCO
  const dragFiscal = 0
  
  // Coût d'opportunité
  const coutOpportunite = valorisationTotale * 0.015 // 1.5% pour PER
  
  const tcoTotal = fraisTotauxAnnuels + dragFiscal + coutOpportunite
  
  return {
    frais_totaux_annuels: fraisTotauxAnnuels,
    drag_fiscal_annuel: dragFiscal,
    cout_opportunite: coutOpportunite,
    tco_total: tcoTotal,
    explications: [
      `Frais de gestion : ${(terMoyen * 100).toFixed(2)}% × ${valorisationTotale.toLocaleString('fr-FR')}€ = ${fraisTotauxAnnuels.toFixed(0)}€/an`,
      perResult.explication,
      `Économie IR à l'entrée : ${perResult.economieIREntree.toLocaleString('fr-FR')}€`,
      perResult.recommandation,
      `Coût d'opportunité : 1.5% de la valorisation`
    ],
    references: [perResult.reference],
    metrics: {
      ratioFraisGestion: valorisationTotale > 0 ? fraisTotauxAnnuels / valorisationTotale : 0,
      tauxFiscaliteEffective: 0,
      terMoyen
    }
  }
}

/**
 * Formatte le TCO pour affichage
 */
export function formatTCOSummary(tco: TCOCalculation): string {
  return `
TCO Total: ${tco.tco_total.toFixed(0)}€/an
  - Frais gestion: ${tco.frais_totaux_annuels.toFixed(0)}€
  - Drag fiscal: ${tco.drag_fiscal_annuel.toFixed(0)}€
  - Coût opportunité: ${tco.cout_opportunite.toFixed(0)}€
  `.trim()
}
