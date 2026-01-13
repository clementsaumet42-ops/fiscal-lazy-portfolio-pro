/**
 * Zod validation schemas for Client Assessment workflow
 */
import { z } from 'zod'

// ============================================================================
// PHASE 1: PRISE DE CONNAISSANCE
// ============================================================================

export const priseConnaissanceSchema = z.object({
  type_client: z.enum(['Nouveau client', 'Bilan annuel', 'Projet spécifique']),
  objectif_principal: z.enum(['Optimisation fiscale', 'Préparation retraite', 'Transmission patrimoine', 'Diversification', 'Réduction fiscalité']),
  horizon_temps: z.enum(['Court terme (<5 ans)', 'Moyen terme (5-15 ans)', 'Long terme (>15 ans)']),
  tolerance_risque: z.enum(['Prudent', 'Équilibré', 'Dynamique', 'Agressif']),
  notes: z.string().optional(),
})

// ============================================================================
// PHASE 2: BILAN PATRIMONIAL
// ============================================================================

export const enfantSchema = z.object({
  id: z.string(),
  prenom: z.string().min(1, 'Le prénom est requis'),
  date_naissance: z.date(),
  lien_filiation: z.enum(['Légitime', 'Naturel', 'Adopté']),
})

export const bilanCivilSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  prenom: z.string().min(1, 'Le prénom est requis'),
  date_naissance: z.date(),
  lieu_naissance: z.string().min(1, 'Le lieu de naissance est requis'),
  nationalite: z.string().min(1, 'La nationalité est requise'),
  situation_familiale: z.enum(['Célibataire', 'Marié(e)', 'Pacsé(e)', 'Divorcé(e)', 'Veuf(ve)']),
  regime_matrimonial: z.enum(['Communauté réduite aux acquêts', 'Séparation de biens', 'Communauté universelle', 'Participation aux acquêts']).optional(),
  date_mariage: z.date().optional(),
  enfants: z.array(enfantSchema),
  residence_fiscale: z.enum(['France', 'Étranger']),
  pays_residence_fiscale: z.string().optional(),
})

export const bilanFiscalSchema = z.object({
  revenus_salaires: z.number().min(0),
  revenus_bic_bnc_ba: z.number().min(0),
  revenus_fonciers: z.object({
    loyers_bruts: z.number().min(0),
    charges_deductibles: z.number().min(0),
    revenus_nets: z.number(),
  }),
  revenus_mobiliers: z.object({
    dividendes: z.number().min(0),
    interets: z.number().min(0),
    total: z.number(),
  }),
  plus_values: z.object({
    mobilieres: z.number().min(0),
    immobilieres: z.number().min(0),
  }),
  pensions_alimentaires: z.number().min(0),
  dons_associations: z.number().min(0),
  emploi_domicile: z.number().min(0),
  investissements_defiscalisation: z.object({
    pinel: z.number().min(0),
    malraux: z.number().min(0),
    girardin: z.number().min(0),
  }),
  tmi: z.union([z.literal(0), z.literal(11), z.literal(30), z.literal(41), z.literal(45)]),
  ir_annee_precedente: z.number().min(0),
  ifi_du: z.number().min(0).optional(),
  prelevements_sociaux: z.number().min(0),
  nombre_parts_fiscales: z.number().min(1),
})

export const donationSchema = z.object({
  id: z.string(),
  date: z.date(),
  beneficiaire: z.string().min(1),
  montant: z.number().min(0),
  type: z.enum(['Don manuel', 'Donation-partage', 'Donation simple']),
  abattement_utilise: z.number().min(0),
})

export const beneficiaireAVSchema = z.object({
  contrat_id: z.string(),
  beneficiaires: z.string().min(1),
  clause_type: z.enum(['Standard', 'Démembrement', 'À terme', 'Par ordre']),
})

export const bilanSuccessoralSchema = z.object({
  testament_existe: z.boolean(),
  type_testament: z.enum(['Olographe', 'Authentique', 'Mystique']).optional(),
  date_testament: z.date().optional(),
  notaire: z.string().optional(),
  donations_realisees: z.array(donationSchema),
  assurances_vie_beneficiaires: z.array(beneficiaireAVSchema),
  objectif_transmission: z.enum(['Conjoint', 'Enfants', 'Petits-enfants', 'Tiers', 'Œuvre']),
  souhaits_particuliers: z.string(),
})

// ============================================================================
// PHASE 3: ASSET TRACKING
// ============================================================================

export const compteCourantSchema = z.object({
  id: z.string(),
  banque: z.string().min(1),
  montant: z.number().min(0),
})

export const autreLivretSchema = z.object({
  id: z.string(),
  nom: z.string().min(1),
  montant: z.number().min(0),
  taux: z.number().min(0),
})

export const liquiditesSchema = z.object({
  comptes_courants: z.array(compteCourantSchema),
  livret_a: z.object({ montant: z.number().min(0), taux: z.number().min(0) }),
  ldds: z.object({ montant: z.number().min(0), taux: z.number().min(0) }),
  lep: z.object({ montant: z.number().min(0), taux: z.number().min(0) }).nullable(),
  autres_livrets: z.array(autreLivretSchema),
})

export const supportUCSchema = z.object({
  id: z.string(),
  nom_support: z.string().min(1),
  isin: z.string().min(1),
  categorie: z.enum(['Actions', 'Obligations', 'Immobilier', 'Monétaire', 'Diversifié']),
  montant_investi: z.number().min(0),
  valeur_actuelle: z.number().min(0),
  performance_pct: z.number(),
  performance_euros: z.number(),
  frais_gestion: z.number().min(0),
  date_achat: z.date(),
})

export const contratAssuranceVieSchema = z.object({
  id: z.string(),
  etablissement: z.string().min(1),
  numero_contrat: z.string().min(1),
  date_souscription: z.date(),
  montant_fonds_euro: z.number().min(0),
  montant_unites_compte: z.number().min(0),
  montant_total: z.number().min(0),
  supports_uc: z.array(supportUCSchema),
  frais_entree: z.number().min(0),
  frais_gestion_annuels: z.number().min(0),
  frais_arbitrage: z.number().min(0),
  anteriorite_fiscale: z.date(),
  versements_avant_70_ans: z.number().min(0),
  versements_apres_70_ans: z.number().min(0),
  clause_beneficiaire: z.string(),
})

export const supportBourseSchema = z.object({
  id: z.string(),
  nom: z.string().min(1),
  isin: z.string().min(1),
  type: z.enum(['ETF', 'Action', 'Obligation', 'Fonds']),
  zone_geo: z.enum(['Europe', 'USA', 'Monde', 'Émergents', 'France']),
  quantite: z.number().min(0),
  pru: z.number().min(0),
  valeur_actuelle: z.number().min(0),
  valeur_totale_ligne: z.number().min(0),
  plus_value_latente_euros: z.number(),
  plus_value_latente_pct: z.number(),
  frais_ter: z.number().min(0),
  frais_courtage: z.number().min(0),
  date_achat: z.date(),
})

export const enveloppeBourseSchema = z.object({
  id: z.string(),
  type: z.enum(['PEA', 'CTO', 'PER']),
  etablissement: z.string().min(1),
  numero_compte: z.string().min(1),
  date_ouverture: z.date(),
  supports: z.array(supportBourseSchema),
  montant_total_valorise: z.number().min(0),
  performance_globale_euros: z.number(),
  performance_globale_pct: z.number(),
  frais_annuels_totaux: z.number().min(0),
  deductibilite_ir: z.number().min(0).optional(),
  plafond_deduction_restant: z.number().min(0).optional(),
})

export const bienImmobilierSchema = z.object({
  id: z.string(),
  type: z.enum(['Résidence principale', 'Résidence secondaire', 'Locatif', 'SCI', 'SCPI']),
  adresse: z.string().min(1),
  valeur_venale: z.number().min(0),
  pret: z.object({
    existe: z.boolean(),
    capital_restant_du: z.number().min(0).optional(),
    mensualite: z.number().min(0).optional(),
    taux: z.number().min(0).optional(),
    echeance_finale: z.date().optional(),
    assurance_mensuelle: z.number().min(0).optional(),
  }).nullable(),
  revenus_locatifs: z.object({
    loyer_mensuel: z.number().min(0),
    charges_mensuelles: z.number().min(0),
    taxe_fonciere_annuelle: z.number().min(0),
    revenus_nets_annuels: z.number(),
  }).optional(),
  scpi: z.object({
    nom_scpi: z.string(),
    nombre_parts: z.number().min(0),
    valeur_part: z.number().min(0),
    rendement_annuel: z.number(),
  }).optional(),
})

export const societeISSchema = z.object({
  id: z.string(),
  raison_sociale: z.string().min(1),
  forme_juridique: z.enum(['SARL', 'SAS', 'SA', 'SCI IS']),
  pourcentage_detention: z.number().min(0).max(100),
  valeur_titres: z.number().min(0),
  dividendes_annuels: z.number().min(0),
  date_creation: z.date(),
})

export const autresActifsSchema = z.object({
  crypto_monnaies: z.array(z.object({
    id: z.string(),
    nom: z.string().min(1),
    quantite: z.number().min(0),
    valeur_unitaire: z.number().min(0),
    valeur_totale: z.number().min(0),
  })),
  metaux_precieux: z.array(z.object({
    id: z.string(),
    type: z.enum(['Or', 'Argent', 'Platine']),
    quantite_grammes: z.number().min(0),
    valeur_totale: z.number().min(0),
  })),
  oeuvres_art: z.array(z.object({
    id: z.string(),
    description: z.string().min(1),
    valeur_estimee: z.number().min(0),
    date_acquisition: z.date(),
  })),
  vehicules_collection: z.array(z.object({
    id: z.string(),
    modele: z.string().min(1),
    annee: z.number().min(1900),
    valeur_estimee: z.number().min(0),
  })),
})
