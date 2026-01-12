/**
 * Types pour le module d'audit d'épargne professionnel
 */

// Type d'enveloppe étendu pour l'audit
export type TypeEnveloppeAudit = 'PEA' | 'PER' | 'AV' | 'CTO' | 'IS';

// Document importé
export interface DocumentImporte {
  id: string;
  nom: string;
  type_enveloppe: TypeEnveloppeAudit;
  date_upload: Date;
  statut: 'uploade' | 'en_cours_analyse' | 'analyse' | 'erreur';
  url?: string;
  file?: File;
}

// Position extraite d'un relevé
export interface PositionExtraite {
  nom_support: string;
  isin?: string;
  montant: number;
  nombre_parts?: number;
  valeur_part?: number;
  frais?: number;
  categorie?: string; // Actions, Obligations, etc.
}

// Relevé parsé
export interface ReleveParse {
  type_enveloppe: TypeEnveloppeAudit;
  date_valorisation?: Date;
  montant_total: number;
  positions: PositionExtraite[];
  frais_detectes?: {
    gestion?: number;
    uc?: number;
    arbitrage?: number;
  };
}

// Analyse de l'existant
export interface AnalyseExistant {
  vue_ensemble: {
    montant_total: number;
    nombre_enveloppes: number;
    frais_annuels_total: number;
    performance_moyenne: number;
  };
  allocation_globale: {
    [classe: string]: {
      montant: number;
      pourcentage: number;
      sous_classes?: { [key: string]: number };
    };
  };
  par_enveloppe: Array<{
    type: TypeEnveloppeAudit;
    montant: number;
    allocation: { [classe: string]: number };
    frais: {
      gestion: number;
      uc: number;
      total: number;
    };
    supports: Array<{
      nom: string;
      isin?: string;
      montant: number;
      frais: number;
    }>;
  }>;
  points_amelioration: Array<{
    type: 'frais' | 'asset_location' | 'allocation' | 'diversification';
    severite: 'faible' | 'moyen' | 'eleve';
    description: string;
    enveloppes_concernees: TypeEnveloppeAudit[];
  }>;
}

// Informations ETF
export interface ETFInfo {
  nom: string;
  isin: string;
  emetteur: string; // Amundi, iShares, Vanguard, etc.
  categorie: string; // Actions Monde, Europe, Obligations, etc.
  frais_gestion: number; // TER
  eligible_pea: boolean;
  encours: number; // Liquidité
  replication: 'physique' | 'synthetique';
  distribution: 'capitalisant' | 'distribuant';
}

// Support recommandé
export interface SupportRecommande {
  nom: string;
  isin: string;
  type: 'ETF' | 'Fonds' | 'Fonds_Euro';
  montant: number;
  frais: number;
}

// Optimisation proposée
export interface OptimisationProposee {
  nouvelle_allocation: {
    allocation_globale: { [classe: string]: number };
    par_enveloppe: Array<{
      type: TypeEnveloppeAudit;
      allocation: { [classe: string]: number };
      supports_recommandes: SupportRecommande[];
    }>;
  };
  
  asset_location: {
    regles: Array<{
      classe_actif: string;
      enveloppe_optimale: TypeEnveloppeAudit;
      justification: string;
    }>;
    matrice: { 
      [classe: string]: { 
        [enveloppe: string]: 'optimal' | 'acceptable' | 'suboptimal' 
      } 
    };
  };
  
  substitutions_frais: Array<{
    support_actuel: { 
      nom: string; 
      isin?: string; 
      frais: number; 
      montant: number 
    };
    support_recommande: { 
      nom: string; 
      isin: string; 
      frais: number 
    };
    economie_annuelle: number;
    economie_10ans: number;
    enveloppe: TypeEnveloppeAudit;
  }>;
  
  economies: {
    frais_annuels_avant: number;
    frais_annuels_apres: number;
    economie_annuelle: number;
    economie_10ans_avec_interets: number;
    gain_fiscal_estime: number;
    impact_patrimoine_10ans: number;
  };
  
  plan_action: Array<{
    priorite: 'haute' | 'moyenne' | 'faible';
    action: string;
    enveloppe: TypeEnveloppeAudit;
    economie: number;
    impact_fiscal: 'neutre' | 'positif' | 'negatif';
    details: string;
  }>;
}

// Placement existant avec score de qualité
export interface PlacementExistant {
  id: string
  type: 'livret' | 'assurance_vie' | 'pea' | 'cto' | 'per' | 'immobilier' | 'scpi' | 'autre'
  nom: string
  etablissement: string
  montant: number
  frais_annuels: number
  rendement_historique: number
  score_qualite: number // 0-10
  liquidite: 'immediate' | 'court_terme' | 'moyen_terme' | 'bloque'
  date_ouverture?: string
  fiscalite_note?: number // 0-10
  diversification_note?: number // 0-10
}

// Diagnostic d'audit complet
export interface DiagnosticAudit {
  points_forts: Array<{
    titre: string
    description: string
    impact: string
  }>
  points_attention: Array<{
    titre: string
    description: string
    recommandation: string
  }>
  points_faibles: Array<{
    titre: string
    description: string
    consequence: string
    action_corrective: string
  }>
  opportunites: Array<{
    titre: string
    description: string
    gain_potentiel: string
  }>
  economie_potentielle_annuelle: number
  score_global: number // 0-100
}

// État de l'audit dans le store
export interface AuditState {
  documents: DocumentImporte[];
  placements?: PlacementExistant[];
  analyse?: AnalyseExistant;
  diagnostic?: DiagnosticAudit;
  optimisation?: OptimisationProposee;
}
