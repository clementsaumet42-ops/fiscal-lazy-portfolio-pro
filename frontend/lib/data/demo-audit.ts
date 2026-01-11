/**
 * Données de démonstration pour l'audit d'épargne
 */

import { AnalyseExistant, OptimisationProposee } from '../types/audit';

/**
 * Analyse existante de démonstration
 */
export const DEMO_ANALYSE: AnalyseExistant = {
  vue_ensemble: {
    montant_total: 150000,
    nombre_enveloppes: 3,
    frais_annuels_total: 1875,
    performance_moyenne: 4.5,
  },
  
  allocation_globale: {
    'Actions France': {
      montant: 25000,
      pourcentage: 16.67,
      sous_classes: {
        'CAC 40': 15000,
        'Mid/Small Caps': 10000,
      }
    },
    'Actions Europe': {
      montant: 35000,
      pourcentage: 23.33,
    },
    'Actions Monde': {
      montant: 30000,
      pourcentage: 20.00,
    },
    'Obligations': {
      montant: 20000,
      pourcentage: 13.33,
    },
    'Fonds Euro': {
      montant: 30000,
      pourcentage: 20.00,
    },
    'Liquidités': {
      montant: 10000,
      pourcentage: 6.67,
    },
  },
  
  par_enveloppe: [
    {
      type: 'PEA',
      montant: 60000,
      allocation: {
        'Actions France': 25000,
        'Actions Europe': 35000,
      },
      frais: {
        gestion: 0.4,
        uc: 0,
        total: 240,
      },
      supports: [
        {
          nom: "Amundi CAC 40 UCITS ETF",
          isin: "FR0007052782",
          montant: 15000,
          frais: 0.25,
        },
        {
          nom: "Lyxor PEA Europe STOXX 600",
          isin: "FR0011871110",
          montant: 35000,
          frais: 0.20,
        },
        {
          nom: "Fonds Actions Françaises XYZ",
          montant: 10000,
          frais: 1.5,
        },
      ],
    },
    {
      type: 'AV',
      montant: 70000,
      allocation: {
        'Fonds Euro': 30000,
        'Actions Monde': 25000,
        'Obligations': 15000,
      },
      frais: {
        gestion: 0.8,
        uc: 0.8,
        total: 1120,
      },
      supports: [
        {
          nom: "Fonds Euro Sécurité",
          montant: 30000,
          frais: 0.8,
        },
        {
          nom: "UC Actions Internationales",
          isin: "FR0011234567",
          montant: 25000,
          frais: 1.8,
        },
        {
          nom: "UC Obligations Euro",
          isin: "LU0987654321",
          montant: 15000,
          frais: 1.2,
        },
      ],
    },
    {
      type: 'CTO',
      montant: 20000,
      allocation: {
        'Actions Monde': 5000,
        'Obligations': 5000,
        'Liquidités': 10000,
      },
      frais: {
        gestion: 0.2,
        uc: 0,
        total: 40,
      },
      supports: [
        {
          nom: "iShares Core MSCI World",
          isin: "IE00B4L5Y983",
          montant: 5000,
          frais: 0.20,
        },
        {
          nom: "ETF Obligations Euro",
          isin: "IE00B3F81R35",
          montant: 5000,
          frais: 0.20,
        },
        {
          nom: "Liquidités",
          montant: 10000,
          frais: 0,
        },
      ],
    },
  ],
  
  points_amelioration: [
    {
      type: 'frais',
      severite: 'eleve',
      description: "Frais élevés sur Assurance Vie (1.25% en moyenne)",
      enveloppes_concernees: ['AV'],
    },
    {
      type: 'frais',
      severite: 'moyen',
      description: "Fonds actif PEA à frais élevés (1.5%)",
      enveloppes_concernees: ['PEA'],
    },
    {
      type: 'asset_location',
      severite: 'moyen',
      description: "Liquidités importantes sur CTO (fiscalité sous-optimale)",
      enveloppes_concernees: ['CTO'],
    },
    {
      type: 'allocation',
      severite: 'faible',
      description: "Allocation Fonds Euro élevée (20%) pour un profil dynamique",
      enveloppes_concernees: ['AV'],
    },
  ],
};

/**
 * Optimisation proposée de démonstration
 */
export const DEMO_OPTIMISATION: OptimisationProposee = {
  nouvelle_allocation: {
    allocation_globale: {
      'Actions France': 15,
      'Actions Europe': 25,
      'Actions Monde': 30,
      'Obligations': 20,
      'Fonds Euro': 10,
    },
    par_enveloppe: [
      {
        type: 'PEA',
        allocation: {
          'Actions France': 15,
          'Actions Europe': 25,
        },
        supports_recommandes: [
          {
            nom: "Amundi CAC 40 UCITS ETF",
            isin: "FR0007052782",
            type: 'ETF',
            montant: 22500,
            frais: 0.25,
          },
          {
            nom: "Amundi PEA MSCI Europe UCITS ETF",
            isin: "FR0013412012",
            type: 'ETF',
            montant: 37500,
            frais: 0.18,
          },
        ],
      },
      {
        type: 'AV',
        allocation: {
          'Actions Monde': 30,
          'Obligations': 20,
          'Fonds Euro': 10,
        },
        supports_recommandes: [
          {
            nom: "Fonds Euro Sécurité",
            isin: "",
            type: 'Fonds_Euro',
            montant: 15000,
            frais: 0.8,
          },
          {
            nom: "Amundi MSCI World UCITS ETF",
            isin: "LU1681043599",
            type: 'ETF',
            montant: 45000,
            frais: 0.18,
          },
          {
            nom: "Vanguard EUR Corporate Bond UCITS ETF",
            isin: "IE00BZ163L38",
            type: 'ETF',
            montant: 30000,
            frais: 0.09,
          },
        ],
      },
      {
        type: 'CTO',
        allocation: {},
        supports_recommandes: [],
      },
    ],
  },
  
  asset_location: {
    regles: [
      {
        classe_actif: 'Actions Europe',
        enveloppe_optimale: 'PEA',
        justification: "Le PEA offre une exonération d'impôt sur les plus-values après 5 ans (hors prélèvements sociaux de 17.2%). Idéal pour les actions européennes éligibles.",
      },
      {
        classe_actif: 'Actions Monde',
        enveloppe_optimale: 'AV',
        justification: "L'Assurance Vie bénéficie d'une fiscalité attractive après 8 ans avec un abattement annuel de 4600€ (9200€ pour un couple) et un taux réduit de 7.5% + PS.",
      },
      {
        classe_actif: 'Obligations',
        enveloppe_optimale: 'AV',
        justification: "La fiscalité de l'AV est particulièrement avantageuse pour les revenus obligataires, surtout après 8 ans.",
      },
      {
        classe_actif: 'Fonds Euro',
        enveloppe_optimale: 'AV',
        justification: "Les fonds euros ne sont disponibles que dans l'Assurance Vie et le PER, avec une fiscalité avantageuse et une garantie en capital.",
      },
    ],
    matrice: {
      'Actions Europe': {
        'PEA': 'optimal',
        'AV': 'acceptable',
        'CTO': 'suboptimal',
        'PER': 'acceptable',
        'IS': 'suboptimal',
      },
      'Actions Monde': {
        'PEA': 'suboptimal',
        'AV': 'optimal',
        'CTO': 'acceptable',
        'PER': 'optimal',
        'IS': 'acceptable',
      },
      'Obligations': {
        'AV': 'optimal',
        'PER': 'optimal',
        'CTO': 'acceptable',
        'PEA': 'suboptimal',
        'IS': 'acceptable',
      },
      'Fonds Euro': {
        'AV': 'optimal',
        'PER': 'acceptable',
      },
    },
  },
  
  substitutions_frais: [
    {
      support_actuel: {
        nom: "Fonds Actions Françaises XYZ",
        frais: 1.5,
        montant: 10000,
      },
      support_recommande: {
        nom: "Amundi CAC 40 UCITS ETF",
        isin: "FR0007052782",
        frais: 0.25,
      },
      economie_annuelle: 125,
      economie_10ans: 1613,
      enveloppe: 'PEA',
    },
    {
      support_actuel: {
        nom: "UC Actions Internationales",
        isin: "FR0011234567",
        frais: 1.8,
        montant: 25000,
      },
      support_recommande: {
        nom: "Amundi MSCI World UCITS ETF",
        isin: "LU1681043599",
        frais: 0.18,
      },
      economie_annuelle: 405,
      economie_10ans: 5226,
      enveloppe: 'AV',
    },
    {
      support_actuel: {
        nom: "UC Obligations Euro",
        isin: "LU0987654321",
        frais: 1.2,
        montant: 15000,
      },
      support_recommande: {
        nom: "Vanguard EUR Corporate Bond UCITS ETF",
        isin: "IE00BZ163L38",
        frais: 0.09,
      },
      economie_annuelle: 167,
      economie_10ans: 2155,
      enveloppe: 'AV',
    },
  ],
  
  economies: {
    frais_annuels_avant: 1875,
    frais_annuels_apres: 578,
    economie_annuelle: 1297,
    economie_10ans_avec_interets: 16740,
    gain_fiscal_estime: 450,
    impact_patrimoine_10ans: 17190,
  },
  
  plan_action: [
    {
      priorite: 'haute',
      action: "Remplacer UC Actions Internationales par Amundi MSCI World ETF dans l'Assurance Vie",
      enveloppe: 'AV',
      economie: 405,
      impact_fiscal: 'neutre',
      details: "Arbitrage interne sans sortie d'argent. Économie de 1.62% par an soit 405€/an. Impact cumulé sur 10 ans : 5 226€.",
    },
    {
      priorite: 'haute',
      action: "Remplacer UC Obligations par Vanguard EUR Corporate Bond ETF dans l'Assurance Vie",
      enveloppe: 'AV',
      economie: 167,
      impact_fiscal: 'neutre',
      details: "Arbitrage interne. Économie de 1.11% par an soit 167€/an. Impact sur 10 ans : 2 155€.",
    },
    {
      priorite: 'haute',
      action: "Remplacer Fonds Actions Françaises XYZ par Amundi CAC 40 ETF dans le PEA",
      enveloppe: 'PEA',
      economie: 125,
      impact_fiscal: 'neutre',
      details: "Arbitrage interne PEA. Économie de 1.25% par an soit 125€/an. Impact sur 10 ans : 1 613€.",
    },
    {
      priorite: 'moyenne',
      action: "Transférer les liquidités du CTO vers le Fonds Euro de l'Assurance Vie",
      enveloppe: 'CTO',
      economie: 0,
      impact_fiscal: 'positif',
      details: "Amélioration de la fiscalité sur les intérêts. Le Fonds Euro en AV offre une meilleure rémunération et une fiscalité plus douce.",
    },
    {
      priorite: 'faible',
      action: "Rééquilibrer l'allocation vers plus d'actions (de 60% à 70%)",
      enveloppe: 'AV',
      economie: 0,
      impact_fiscal: 'neutre',
      details: "Pour un profil dynamique, augmenter la part d'actions. Réduire le Fonds Euro de 30k€ à 15k€ et augmenter les actions monde.",
    },
  ],
};
