import type { LigneAudit, TCOCalculation, TCODetailed } from '@/lib/types/bilan-audit'
import type { SituationFiscale } from '@/lib/types/situation-fiscale'
import { estimerDragFiscalAnnuel } from '@/lib/utils/fiscal-calculator'
import { REFERENCES_CGI } from '@/lib/constants/references-cgi'

// Constants for TCO calculation
const FONDS_EUROS_RATE = 0.015 // 1.5% rendement moyen fonds euros
const PRELEVEMENTS_SOCIAUX_RATE = 0.172 // 17.2% prélèvements sociaux
const DIVIDENDE_MOYEN_RATE = 0.02 // 2% rendement dividende moyen
const PFU_RATE = 0.30 // 30% PFU (12.8% IR + 17.2% PS)

/**
 * Calcul du Total Cost of Ownership pour les enveloppes (version simplifiée - rétrocompatibilité)
 * 
 * @deprecated Utiliser calculateTCODetailed pour des calculs fiscaux précis
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
 * Calcul du TER moyen pondéré à partir des lignes d'audit
 */
function calculerTERMoyen(lignes: LigneAudit[]): number {
  if (lignes.length === 0) return 0
  
  const valorisationTotale = lignes.reduce((sum, l) => sum + l.valorisation, 0)
  
  if (valorisationTotale === 0) return 0
  
  const fraisTotaux = lignes.reduce((sum, l) => {
    const frais = l.frais_gestion_annuels || 0
    return sum + frais
  }, 0)
  
  return fraisTotaux / valorisationTotale
}

/**
 * Calcul du Total Cost of Ownership professionnel avec explications et références CGI
 * 
 * @param lignes Lignes d'audit de l'enveloppe
 * @param type Type d'enveloppe
 * @param situationFiscale Situation fiscale du client
 * @param dateOuverture Date d'ouverture de l'enveloppe (pour PEA et AV)
 * @param pourcentageFondsEuros Pourcentage en fonds euros (pour AV)
 * @param rendementEstime Rendement annuel estimé (dividendes, intérêts)
 */
export function calculateTCODetailed(
  lignes: LigneAudit[],
  type: 'PEA' | 'CTO' | 'AV' | 'PER',
  situationFiscale: SituationFiscale,
  dateOuverture?: string | Date,
  pourcentageFondsEuros?: number,
  rendementEstime: number = DIVIDENDE_MOYEN_RATE
): TCODetailed {
  const valorisationTotale = lignes.reduce((sum, l) => sum + l.valorisation, 0)
  
  // 1. Calcul des frais de gestion
  // Essayer d'utiliser les frais réels des lignes, sinon utiliser les moyennes
  const terReel = calculerTERMoyen(lignes)
  
  const fraisGestionMoyens = {
    PEA: 0.003,
    CTO: 0.002,
    AV: 0.015,
    PER: 0.012,
  }
  
  const ter = terReel > 0 ? terReel : fraisGestionMoyens[type]
  const fraisTotauxAnnuels = valorisationTotale * ter
  
  // 2. Calcul du drag fiscal professionnel
  const { drag_fiscal, calcul } = estimerDragFiscalAnnuel(
    type,
    valorisationTotale,
    rendementEstime,
    situationFiscale,
    dateOuverture,
    pourcentageFondsEuros
  )
  
  // 3. Coût d'opportunité (inchangé)
  const coutOpportunite = valorisationTotale * 0.02
  
  // 4. TCO total
  const tcoTotal = fraisTotauxAnnuels + drag_fiscal + coutOpportunite
  
  // 5. Métriques complémentaires
  const ratioFraisValorisation = valorisationTotale > 0 ? fraisTotauxAnnuels / valorisationTotale : 0
  
  // 6. Explications détaillées
  const explications = {
    frais: `Frais de gestion annuels basés sur un TER ${terReel > 0 ? 'réel' : 'moyen estimé'} de ${(ter * 100).toFixed(2)}% appliqué sur ${valorisationTotale.toLocaleString('fr-FR')}€`,
    fiscalite: calcul.explication,
    opportunite: `Coût d'opportunité estimé à 2% de la valorisation, représentant le manque à gagner potentiel par rapport à une allocation optimisée`,
  }
  
  // 7. Calcul de l'ancienneté si disponible
  let ancienneteAnnees: number | undefined
  if (dateOuverture) {
    const date = typeof dateOuverture === 'string' ? new Date(dateOuverture) : dateOuverture
    const maintenant = new Date()
    const diffMs = maintenant.getTime() - date.getTime()
    ancienneteAnnees = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25))
  }
  
  return {
    // TCOCalculation (rétrocompatibilité)
    frais_totaux_annuels: fraisTotauxAnnuels,
    drag_fiscal_annuel: drag_fiscal,
    cout_opportunite: coutOpportunite,
    tco_total: tcoTotal,
    
    // TCODetailed
    ter_moyen_pondere: ter,
    taux_fiscalite_effective: calcul.taux_effectif,
    ratio_frais_valorisation: ratioFraisValorisation,
    
    explications,
    references_cgi: calcul.references,
    
    details_fiscaux: {
      tmi_appliquee: calcul.details?.tmi,
      ps_appliques: calcul.taux_ps,
      taux_ir: calcul.taux_ir,
      abattement_applique: calcul.details?.abattement,
      anciennete_annees: ancienneteAnnees,
    },
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
