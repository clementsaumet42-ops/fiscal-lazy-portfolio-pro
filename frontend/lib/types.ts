/**
 * Types pour l'application Fiscal Lazy Portfolio Pro
 */

// Types d'enveloppes fiscales
export type TypeEnveloppe = 'PEA' | 'CTO' | 'Assurance_vie' | 'PER'

// Profil client
export interface ProfilClient {
  nom: string
  prenom: string
  age: number
  situation_familiale: 'celibataire' | 'marie' | 'pacse' | 'divorce' | 'veuf'
  nombre_parts_fiscales: number
  revenu_imposable: number
  patrimoine_actuel: number
  objectif_investissement: 'prudent' | 'equilibre' | 'dynamique' | 'offensif'
  horizon_placement: number
  tolerance_risque: 'faible' | 'modere' | 'eleve'
}

// Configuration d'une enveloppe fiscale
export interface EnveloppeConfig {
  type: TypeEnveloppe
  montant_initial: number
  versements_mensuels: number
}

// Allocation d'actifs
export interface Allocation {
  actions_monde: number
  actions_europe: number
  obligations: number
  immobilier: number
  cash: number
}

// Résultat d'optimisation fiscale
export interface OptimisationResult {
  allocation_optimisee: {
    [key in TypeEnveloppe]?: {
      [key: string]: number
    }
  }
  fiscalite_estimee: {
    impot_annuel: number
    economie_vs_cto_pur: number
    taux_effectif: number
  }
}

// Résultat de backtest
export interface BacktestResult {
  performance: {
    rendement_annuel: number
    volatilite: number
    max_drawdown: number
    sharpe_ratio?: number
  }
  historique?: Array<{
    date: string
    valeur: number
  }>
}

// État global du client
export interface ClientState {
  profil: ProfilClient | null
  enveloppes: EnveloppeConfig[]
  allocation: Allocation | null
  optimisation: OptimisationResult | null
  backtest: BacktestResult | null
  etape_actuelle: number
}
