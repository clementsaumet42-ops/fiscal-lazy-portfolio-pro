/**
 * Types pour l'audit intégré de l'épargne dans le bilan patrimonial
 */

// Types pour chaque ligne de placement
export interface LigneAudit {
  id: string
  isin?: string
  nom: string
  quantite: number
  pru: number // Prix de Revient Unitaire
  cours_actuel: number
  valorisation: number
  plus_value_latente: number
  date_achat?: Date
  // TCO
  frais_entree?: number
  frais_gestion_annuels?: number
  frais_sortie?: number
  drag_fiscal_estime?: number
}

// Document PDF uploadé
export interface DocumentAudit {
  id: string
  nom: string
  type: 'pdf' | 'jpg' | 'png' | 'excel' | 'csv'
  url: string
  date_upload: Date
  statut: 'en_attente' | 'traite' | 'erreur'
  enveloppe_type: 'PEA' | 'CTO' | 'AV' | 'PER'
  enveloppe_id: string
}

// Calcul TCO
export interface TCOCalculation {
  frais_totaux_annuels: number
  drag_fiscal_annuel: number
  cout_opportunite: number
  tco_total: number
}

// Enveloppes enrichies avec audit
export interface PEAAvecAudit {
  id: string
  etablissement: string
  montant: number
  date_ouverture?: string
  // Audit intégré
  document?: DocumentAudit
  lignes?: LigneAudit[]
  tco?: TCOCalculation
}

export interface CTOAvecAudit {
  id: string
  etablissement: string
  montant: number
  // Audit intégré
  document?: DocumentAudit
  lignes?: LigneAudit[]
  tco?: TCOCalculation
}

export interface AssuranceVieAvecAudit {
  id: string
  etablissement: string
  montant: number
  date_ouverture?: string
  fonds_euros_pourcentage?: number
  // Audit intégré
  document?: DocumentAudit
  lignes?: LigneAudit[]
  tco?: TCOCalculation
}

export interface PERAvecAudit {
  id: string
  etablissement: string
  montant: number
  // Audit intégré
  document?: DocumentAudit
  lignes?: LigneAudit[]
  tco?: TCOCalculation
}
