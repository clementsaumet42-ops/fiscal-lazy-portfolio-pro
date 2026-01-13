/**
 * Types pour le module Bilan Patrimonial
 */

import type { LigneAudit, DocumentAudit, TCOCalculation } from './bilan-audit'

// Situation personnelle
export interface SituationPersonnelle {
  nom: string
  prenom: string
  age: number
  situation_familiale: 'celibataire' | 'marie' | 'pacse' | 'divorce' | 'veuf'
  nombre_enfants: number
  situation_professionnelle: 'salarie' | 'independant' | 'retraite' | 'autre'
  profession?: string
  residence_principale: {
    statut: 'proprietaire' | 'locataire'
    valeur?: number // si propriétaire
  }
}

// Revenus et charges
export interface RevenusCharges {
  revenus: {
    salaires_nets_mensuels: number
    revenus_locatifs_mensuels: number
    autres_revenus_mensuels: number
  }
  charges: {
    credit_immobilier_mensuel: number
    loyer_mensuel: number
    autres_credits_mensuels: number
    autres_charges_mensuelles: number
  }
  capacite_epargne_mensuelle: number // calculé automatiquement
}

// Patrimoine existant
export interface PatrimoineExistant {
  immobilier: {
    residence_principale?: {
      valeur: number
      credit_restant?: number
    }
    immobilier_locatif: Array<{
      type: 'appartement' | 'maison' | 'parking' | 'autre'
      valeur: number
      credit_restant?: number
      loyer_mensuel?: number
    }>
    scpi: Array<{
      nom: string
      montant: number
      rendement?: number
    }>
  }
  epargne_liquide: {
    livret_a: number
    ldds: number
    lep: number
    comptes_courants: number
  }
  placements_financiers: {
    pea: Array<{
      id?: string
      etablissement: string
      montant: number
      date_ouverture?: string
      // Ajout audit
      lignes?: LigneAudit[]
      document?: DocumentAudit
      tco?: TCOCalculation
    }>
    cto: Array<{
      id?: string
      etablissement: string
      montant: number
      // Ajout audit
      lignes?: LigneAudit[]
      document?: DocumentAudit
      tco?: TCOCalculation
    }>
    assurance_vie: Array<{
      id?: string
      etablissement: string
      montant: number
      date_ouverture?: string
      fonds_euros_pourcentage?: number
      // Ajout audit
      lignes?: LigneAudit[]
      document?: DocumentAudit
      tco?: TCOCalculation
    }>
    per: Array<{
      id?: string
      etablissement: string
      montant: number
      // Ajout audit
      lignes?: LigneAudit[]
      document?: DocumentAudit
      tco?: TCOCalculation
    }>
  }
  autres_actifs: {
    crypto: number
    or_metaux_precieux: number
    entreprise_valorisation?: number
    autres: number
  }
}

// Objectifs patrimoniaux
export interface ObjectifsPatrimoniaux {
  objectif_principal: 'retraite' | 'transmission' | 'revenus_complementaires' | 'achat_immobilier' | 'autre'
  objectif_principal_details?: string
  horizon_placement: 'court_terme' | 'moyen_terme' | 'long_terme' // <5ans, 5-15ans, >15ans
  horizon_placement_annees?: number
  tolerance_risque: 'prudent' | 'equilibre' | 'dynamique' | 'offensif'
  objectifs_secondaires?: string[]
}

// Bilan patrimonial complet
export interface BilanPatrimonial {
  situation: SituationPersonnelle | null
  revenus: RevenusCharges | null
  patrimoine: PatrimoineExistant | null
  objectifs: ObjectifsPatrimoniaux | null
  date_creation?: Date
  date_modification?: Date
}

// Calculs dérivés pour affichage
export interface CalculsPatrimoine {
  patrimoine_total: number
  patrimoine_immobilier: number
  patrimoine_financier: number
  patrimoine_liquide: number
  endettement_total: number
  patrimoine_net: number
  revenus_mensuels_total: number
  charges_mensuelles_total: number
  taux_endettement: number // en pourcentage
}
