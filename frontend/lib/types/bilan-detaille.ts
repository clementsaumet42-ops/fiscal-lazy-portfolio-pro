export interface RevenusDetailles {
  salaires: {
    salaire_net_mensuel: number
    primes_annuelles: number
    avantages_nature: number
    participation_interessement: number
  }
  revenus_fonciers: {
    loyers_mensuels_bruts: number
    charges_deductibles: number
    revenus_fonciers_nets: number
    regime: 'micro_foncier' | 'reel'
  }
  revenus_financiers: {
    interets: number
    dividendes: number
    plus_values: number
    regime_fiscal: 'bareme_progressif' | 'flat_tax'
  }
  revenus_professionnels_non_salaries: {
    bnc_bic: number
    regime: 'micro' | 'reel'
  }
  pensions_retraites: number
  autres_revenus: number
  revenus_bruts_annuels: number
  revenus_nets_imposables: number
}

export interface ChargesDetaillees {
  charges_fixes: {
    credit_immobilier_mensuel: number
    loyer_mensuel: number
    charges_copropriete: number
    taxe_fonciere_annuelle: number
    taxe_habitation_annuelle: number
    assurances_annuelles: number
  }
  charges_courantes: {
    alimentation_mensuel: number
    energie_mensuel: number
    transport_mensuel: number
    telecommunications_mensuel: number
  }
  credits_consommation: {
    mensualite_totale: number
    capital_restant_du: number
  }
  charges_familiales: {
    frais_scolarite_annuels: number
    frais_garde_enfants: number
    pensions_alimentaires_versees: number
  }
  epargne_reguliere: {
    epargne_securite_mensuelle: number
    epargne_projets_mensuelle: number
    epargne_retraite_mensuelle: number
  }
  charges_mensuelles_totales: number
  charges_annuelles_totales: number
  capacite_epargne_mensuelle: number
}

export interface BienImmobilier {
  id: string
  type: 'appartement' | 'maison' | 'parking' | 'local_commercial' | 'terrain'
  adresse: string
  valeur_marche: number
  annee_acquisition: number
  prix_acquisition: number
  surface_m2?: number
  loyer_mensuel_brut?: number
  charges_annuelles: number
  credit_restant_du: number
  valeur_nette: number
}

export interface PatrimoineImmobilier {
  residence_principale: BienImmobilier | null
  biens_locatifs: BienImmobilier[]
  scpi: Array<{
    nom: string
    nombre_parts: number
    valeur_part: number
    valeur_totale: number
    rendement_annuel: number
  }>
  valeur_totale_brute: number
  valeur_totale_nette: number
  endettement_total: number
  revenus_locatifs_annuels: number
}

export interface LigneEtf {
  isin: string
  nom: string
  quantite: number
  pru: number
  cours_actuel: number
  valorisation: number
  plus_value_latente: number
}

export interface PatrimoineFinancier {
  liquidites: {
    comptes_courants: number
    livret_a: number
    ldds: number
    lep: number
    autres_livrets: number
    total: number
  }
  pea: Array<{
    etablissement: string
    date_ouverture: string
    valorisation: number
    versements_cumules: number
    plus_value_latente: number
    lignes: LigneEtf[]
  }>
  cto: Array<{
    etablissement: string
    valorisation: number
    plus_value_latente: number
    moins_values_reportables: number
    lignes: LigneEtf[]
  }>
  assurances_vie: Array<{
    compagnie: string
    numero_contrat: string
    date_ouverture: string
    valorisation: number
    versements_cumules: number
    fonds_euros: number
    unites_compte: number
    plus_value_latente: number
    clause_beneficiaire: string
    anciennete_fiscale_ans: number
  }>
  per: Array<{
    etablissement: string
    valorisation: number
    versements_deductibles_cumules: number
  }>
  crypto: {
    plateformes: Array<{
      nom: string
      valorisation_euro: number
      plus_value_latente: number
    }>
    total: number
  }
  total_valorisation: number
  total_plus_values_latentes: number
}

export interface SituationFiscale {
  annee_reference: number
  revenus_imposables: number
  nombre_parts: number
  impot_revenu: {
    revenu_imposable: number
    quotient_familial: number
    impot_brut: number
    reductions_credits: number
    impot_net: number
    taux_moyen: number
    taux_marginal: number
  }
  ifi: {
    applicable: boolean
    patrimoine_immobilier_brut: number
    dettes_deductibles: number
    patrimoine_immobilier_net: number
    ifi_du: number
  }
  prelevements_sociaux: {
    revenus_patrimoine: number
    csg_crds_dus: number
    taux_applique: number
  }
  fiscalite_totale_annuelle: number
  taux_pression_fiscale: number
}

export interface Heritier {
  id: string
  nom: string
  lien_parente: 'conjoint' | 'enfant' | 'parent' | 'frere_soeur' | 'neveu_niece' | 'autre'
  part_legale: number
  part_attribuee: number
  abattement_applicable: number
  base_imposable: number
  droits_succession_dus: number
  taux_effectif: number
}

export interface SimulationSuccession {
  date_simulation: string
  hypotheses: {
    deces_dans_annees: number
    valorisation_prevue: number
    frais_obseques: number
    dettes_a_regler: number
  }
  actif_successoral_net: number
  heritiers: Heritier[]
  total_droits_succession: number
  optimisations_possibles: Array<{
    type: 'donation' | 'assurance_vie' | 'demembrement' | 'sci'
    description: string
    economie_estimee: number
    contraintes: string
  }>
}
