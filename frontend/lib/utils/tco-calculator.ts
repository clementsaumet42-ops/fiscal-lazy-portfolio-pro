import type { LigneAudit, TCOCalculation } from '@/lib/types/bilan-audit'

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
