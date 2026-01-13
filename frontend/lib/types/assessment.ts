/**
 * Types for Professional Client Assessment Workflow
 * Complete wealth management system for French accountants
 */

// ============================================================================
// PHASE 1: INITIAL DISCOVERY (Prise de Connaissance)
// ============================================================================

export interface PriseConnaissance {
  type_client: 'Nouveau client' | 'Bilan annuel' | 'Projet spécifique'
  objectif_principal: 'Optimisation fiscale' | 'Préparation retraite' | 'Transmission patrimoine' | 'Diversification' | 'Réduction fiscalité'
  horizon_temps: 'Court terme (<5 ans)' | 'Moyen terme (5-15 ans)' | 'Long terme (>15 ans)'
  tolerance_risque: 'Prudent' | 'Équilibré' | 'Dynamique' | 'Agressif'
  notes?: string
}

// ============================================================================
// PHASE 2: DETAILED WEALTH ASSESSMENT (Bilan Patrimonial)
// ============================================================================

// 2.1 Civil Status
export interface Enfant {
  id: string
  prenom: string
  date_naissance: Date
  lien_filiation: 'Légitime' | 'Naturel' | 'Adopté'
}

export interface BilanCivil {
  // Personal info
  nom: string
  prenom: string
  date_naissance: Date
  lieu_naissance: string
  nationalite: string
  
  // Family status
  situation_familiale: 'Célibataire' | 'Marié(e)' | 'Pacsé(e)' | 'Divorcé(e)' | 'Veuf(ve)'
  regime_matrimonial?: 'Communauté réduite aux acquêts' | 'Séparation de biens' | 'Communauté universelle' | 'Participation aux acquêts'
  date_mariage?: Date
  
  // Children
  enfants: Enfant[]
  
  // Tax residency
  residence_fiscale: 'France' | 'Étranger'
  pays_residence_fiscale?: string
}

// 2.2 Fiscal Status
export interface BilanFiscal {
  // Income (Revenus)
  revenus_salaires: number
  revenus_bic_bnc_ba: number  // Professional income
  revenus_fonciers: {
    loyers_bruts: number
    charges_deductibles: number
    revenus_nets: number
  }
  revenus_mobiliers: {
    dividendes: number
    interets: number
    total: number
  }
  plus_values: {
    mobilieres: number
    immobilieres: number
  }
  
  // Deductions (Charges déductibles)
  pensions_alimentaires: number
  dons_associations: number
  emploi_domicile: number
  investissements_defiscalisation: {
    pinel: number
    malraux: number
    girardin: number
  }
  
  // Taxes
  tmi: 0 | 11 | 30 | 41 | 45  // Taux Marginal Imposition (%)
  ir_annee_precedente: number
  ifi_du?: number  // If applicable
  prelevements_sociaux: number
  
  // Family quotient
  nombre_parts_fiscales: number
}

// 2.3 Estate Planning
export interface Donation {
  id: string
  date: Date
  beneficiaire: string
  montant: number
  type: 'Don manuel' | 'Donation-partage' | 'Donation simple'
  abattement_utilise: number
}

export interface BeneficiaireAV {
  contrat_id: string  // Link to AV contract
  beneficiaires: string
  clause_type: 'Standard' | 'Démembrement' | 'À terme' | 'Par ordre'
}

export interface BilanSuccessoral {
  // Will (Testament)
  testament_existe: boolean
  type_testament?: 'Olographe' | 'Authentique' | 'Mystique'
  date_testament?: Date
  notaire?: string
  
  // Prior donations
  donations_realisees: Donation[]
  
  // Life insurance beneficiaries
  assurances_vie_beneficiaires: BeneficiaireAV[]
  
  // Transmission objectives
  objectif_transmission: 'Conjoint' | 'Enfants' | 'Petits-enfants' | 'Tiers' | 'Œuvre'
  souhaits_particuliers: string  // Free text
}

// ============================================================================
// PHASE 3: DETAILED ASSET TRACKING
// ============================================================================

// 3.1 Liquid Assets
export interface CompteCourant {
  id: string
  banque: string
  montant: number
}

export interface AutreLivret {
  id: string
  nom: string
  montant: number
  taux: number
}

export interface Liquidites {
  comptes_courants: CompteCourant[]
  livret_a: { montant: number, taux: number }
  ldds: { montant: number, taux: number }
  lep: { montant: number, taux: number } | null
  autres_livrets: AutreLivret[]
}

// 3.2 Life Insurance (Assurance-Vie)
export interface SupportUC {
  id: string
  nom_support: string
  isin: string
  categorie: 'Actions' | 'Obligations' | 'Immobilier' | 'Monétaire' | 'Diversifié'
  montant_investi: number
  valeur_actuelle: number
  performance_pct: number
  performance_euros: number
  frais_gestion: number  // Annual %
  date_achat: Date
}

export interface ContratAssuranceVie {
  id: string
  etablissement: string
  numero_contrat: string
  date_souscription: Date
  
  // Fund allocation
  montant_fonds_euro: number
  montant_unites_compte: number
  montant_total: number
  
  // Detailed UC holdings
  supports_uc: SupportUC[]
  
  // Contract details
  frais_entree: number
  frais_gestion_annuels: number
  frais_arbitrage: number
  
  // Tax info
  anteriorite_fiscale: Date
  versements_avant_70_ans: number
  versements_apres_70_ans: number
  
  // Beneficiaries
  clause_beneficiaire: string
}

// 3.3 Securities Accounts (Enveloppes Boursières)
export interface SupportBourse {
  id: string
  nom: string
  isin: string
  type: 'ETF' | 'Action' | 'Obligation' | 'Fonds'
  zone_geo: 'Europe' | 'USA' | 'Monde' | 'Émergents' | 'France'
  
  // Position details
  quantite: number
  pru: number  // Prix de Revient Unitaire
  valeur_actuelle: number  // Current unit price
  valeur_totale_ligne: number  // quantite * valeur_actuelle
  
  // Performance
  plus_value_latente_euros: number
  plus_value_latente_pct: number
  
  // Fees
  frais_ter: number  // For ETFs (%)
  frais_courtage: number  // Brokerage fees
  
  date_achat: Date
}

export interface EnveloppeBourse {
  id: string
  type: 'PEA' | 'CTO' | 'PER'
  etablissement: string
  numero_compte: string
  date_ouverture: Date
  
  // Detailed holdings (EXACT same structure as AV supports)
  supports: SupportBourse[]
  
  // Account-level metrics
  montant_total_valorise: number
  performance_globale_euros: number
  performance_globale_pct: number
  frais_annuels_totaux: number
  
  // PER-specific (if type === 'PER')
  deductibilite_ir?: number
  plafond_deduction_restant?: number
}

// 3.4 Real Estate
export interface RevenuLocatif {
  loyer_mensuel: number
  charges_mensuelles: number
  taxe_fonciere_annuelle: number
  revenus_nets_annuels: number
}

export interface PretImmobilier {
  existe: boolean
  capital_restant_du?: number
  mensualite?: number
  taux?: number
  echeance_finale?: Date
  assurance_mensuelle?: number
}

export interface SCPI {
  nom_scpi: string
  nombre_parts: number
  valeur_part: number
  rendement_annuel: number
}

export interface BienImmobilier {
  id: string
  type: 'Résidence principale' | 'Résidence secondaire' | 'Locatif' | 'SCI' | 'SCPI'
  adresse: string
  valeur_venale: number
  
  // Loan (if any)
  pret: PretImmobilier | null
  
  // Rental income (if applicable)
  revenus_locatifs?: RevenuLocatif
  
  // SCPI specific
  scpi?: SCPI
}

// 3.5 Corporate Holdings (Société IS)
export interface SocieteIS {
  id: string
  raison_sociale: string
  forme_juridique: 'SARL' | 'SAS' | 'SA' | 'SCI IS'
  pourcentage_detention: number
  valeur_titres: number
  dividendes_annuels: number
  date_creation: Date
}

// 3.6 Other Assets
export interface CryptoMonnaie {
  id: string
  nom: string  // Bitcoin, Ethereum, etc.
  quantite: number
  valeur_unitaire: number
  valeur_totale: number
}

export interface MetalPrecieux {
  id: string
  type: 'Or' | 'Argent' | 'Platine'
  quantite_grammes: number
  valeur_totale: number
}

export interface OeuvreArt {
  id: string
  description: string
  valeur_estimee: number
  date_acquisition: Date
}

export interface VehiculeCollection {
  id: string
  modele: string
  annee: number
  valeur_estimee: number
}

export interface AutresActifs {
  crypto_monnaies: CryptoMonnaie[]
  metaux_precieux: MetalPrecieux[]
  oeuvres_art: OeuvreArt[]
  vehicules_collection: VehiculeCollection[]
}

// ============================================================================
// PHASE 4: SYNTHESIS
// ============================================================================

export interface AllocationGlobale {
  liquidites: number
  immobilier: number
  assurance_vie: number
  enveloppes_boursieres: number
  societes_is: number
  autres_actifs: number
  total: number
}

export interface SynthesePatrimoine {
  patrimoine_brut: number
  patrimoine_net: number
  allocation: AllocationGlobale
}

// ============================================================================
// COMPLETE ASSESSMENT STATE
// ============================================================================

export interface ClientAssessment {
  // Phase 1
  prise_connaissance: PriseConnaissance | null
  
  // Phase 2
  bilan_civil: BilanCivil | null
  bilan_fiscal: BilanFiscal | null
  bilan_successoral: BilanSuccessoral | null
  
  // Phase 3
  liquidites: Liquidites | null
  assurances_vie: ContratAssuranceVie[]
  enveloppes_bourse: EnveloppeBourse[]
  biens_immobiliers: BienImmobilier[]
  societes_is: SocieteIS[]
  autres_actifs: AutresActifs | null
  
  // Metadata
  date_creation?: Date
  date_modification?: Date
}
