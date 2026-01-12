/**
 * Types pour le module Recommandations
 */

import { TypeEnveloppeAudit } from './audit'

// Action recommandée
export interface ActionRecommandee {
  id: string
  priorite: 'haute' | 'moyenne' | 'faible'
  type: 'arbitrage' | 'versement' | 'ouverture' | 'cloture' | 'transfert'
  titre: string
  description: string
  enveloppe: TypeEnveloppeAudit | 'nouvelle'
  montant?: number
  support_source?: {
    nom: string
    isin?: string
  }
  support_cible?: {
    nom: string
    isin: string
  }
  impact_fiscal: 'neutre' | 'positif' | 'negatif'
  details_fiscaux?: string
  economie_estimee_annuelle?: number
  economie_estimee_10ans?: number
  difficulte: 'facile' | 'moyenne' | 'complexe'
  delai_realisation?: string
}

// Comparaison allocation avant/après
export interface ComparaisonAllocation {
  avant: {
    allocation_globale: { [classe: string]: number }
    par_enveloppe: Array<{
      type: TypeEnveloppeAudit
      montant: number
      allocation: { [classe: string]: number }
      frais_annuels: number
    }>
    frais_totaux_annuels: number
    score_diversification: number // 0-100
    score_fiscalite: number // 0-100
    score_frais: number // 0-100
    score_global: number // 0-100
  }
  apres: {
    allocation_globale: { [classe: string]: number }
    par_enveloppe: Array<{
      type: TypeEnveloppeAudit
      montant: number
      allocation: { [classe: string]: number }
      frais_annuels: number
    }>
    frais_totaux_annuels: number
    score_diversification: number // 0-100
    score_fiscalite: number // 0-100
    score_frais: number // 0-100
    score_global: number // 0-100
  }
  gains: {
    economie_frais_annuels: number
    economie_frais_10ans: number
    gain_diversification: number // points
    gain_fiscalite: number // points
    gain_global: number // points
    rendement_espere_avant: number // %
    rendement_espere_apres: number // %
    gain_rendement: number // %
  }
}

// Plan d'action complet
export interface PlanAction {
  actions: ActionRecommandee[]
  timeline: {
    immediate: ActionRecommandee[] // à faire tout de suite
    court_terme: ActionRecommandee[] // 1-3 mois
    moyen_terme: ActionRecommandee[] // 3-12 mois
  }
  ordre_prioritaire: string[] // IDs des actions dans l'ordre recommandé
  impact_global: {
    economie_totale_annuelle: number
    economie_totale_10ans: number
    temps_total_estime: string
    complexite_globale: 'simple' | 'moyen' | 'complexe'
  }
}

// État des recommandations dans le store
export interface RecommandationsState {
  comparaison: ComparaisonAllocation | null
  plan_action: PlanAction | null
  actions_validees: string[] // IDs des actions que le client a validées
  actions_realisees: string[] // IDs des actions réalisées
}
