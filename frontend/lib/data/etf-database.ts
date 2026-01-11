/**
 * Base de données d'ETF recommandés pour l'optimisation
 */

import { ETFInfo } from '../types/audit';

export const ETF_DATABASE: ETFInfo[] = [
  // Actions Monde
  {
    nom: "Amundi MSCI World UCITS ETF",
    isin: "LU1681043599",
    emetteur: "Amundi",
    categorie: "Actions Monde",
    frais_gestion: 0.18,
    eligible_pea: false,
    encours: 5000000000,
    replication: 'physique',
    distribution: 'capitalisant'
  },
  {
    nom: "iShares Core MSCI World UCITS ETF",
    isin: "IE00B4L5Y983",
    emetteur: "iShares",
    categorie: "Actions Monde",
    frais_gestion: 0.20,
    eligible_pea: false,
    encours: 60000000000,
    replication: 'physique',
    distribution: 'capitalisant'
  },
  {
    nom: "Vanguard FTSE All-World UCITS ETF",
    isin: "IE00BK5BQT80",
    emetteur: "Vanguard",
    categorie: "Actions Monde",
    frais_gestion: 0.22,
    eligible_pea: false,
    encours: 15000000000,
    replication: 'physique',
    distribution: 'capitalisant'
  },

  // Actions Europe (éligibles PEA)
  {
    nom: "Amundi PEA MSCI Europe UCITS ETF",
    isin: "FR0013412012",
    emetteur: "Amundi",
    categorie: "Actions Europe",
    frais_gestion: 0.18,
    eligible_pea: true,
    encours: 500000000,
    replication: 'physique',
    distribution: 'capitalisant'
  },
  {
    nom: "Lyxor PEA Europe (STOXX 600) UCITS ETF",
    isin: "FR0011871110",
    emetteur: "Lyxor",
    categorie: "Actions Europe",
    frais_gestion: 0.20,
    eligible_pea: true,
    encours: 800000000,
    replication: 'synthetique',
    distribution: 'capitalisant'
  },
  {
    nom: "iShares STOXX Europe 600 UCITS ETF",
    isin: "DE0002635307",
    emetteur: "iShares",
    categorie: "Actions Europe",
    frais_gestion: 0.20,
    eligible_pea: false,
    encours: 7000000000,
    replication: 'physique',
    distribution: 'capitalisant'
  },

  // Actions France (éligibles PEA)
  {
    nom: "Amundi CAC 40 UCITS ETF",
    isin: "FR0007052782",
    emetteur: "Amundi",
    categorie: "Actions France",
    frais_gestion: 0.25,
    eligible_pea: true,
    encours: 2000000000,
    replication: 'physique',
    distribution: 'capitalisant'
  },
  {
    nom: "Lyxor CAC 40 (DR) UCITS ETF",
    isin: "FR0007056841",
    emetteur: "Lyxor",
    categorie: "Actions France",
    frais_gestion: 0.25,
    eligible_pea: true,
    encours: 1500000000,
    replication: 'physique',
    distribution: 'distribuant'
  },

  // Actions USA
  {
    nom: "Amundi S&P 500 UCITS ETF",
    isin: "LU1681048804",
    emetteur: "Amundi",
    categorie: "Actions USA",
    frais_gestion: 0.15,
    eligible_pea: false,
    encours: 8000000000,
    replication: 'physique',
    distribution: 'capitalisant'
  },
  {
    nom: "iShares Core S&P 500 UCITS ETF",
    isin: "IE00B5BMR087",
    emetteur: "iShares",
    categorie: "Actions USA",
    frais_gestion: 0.07,
    eligible_pea: false,
    encours: 75000000000,
    replication: 'physique',
    distribution: 'capitalisant'
  },
  {
    nom: "Vanguard S&P 500 UCITS ETF",
    isin: "IE00B3XXRP09",
    emetteur: "Vanguard",
    categorie: "Actions USA",
    frais_gestion: 0.07,
    eligible_pea: false,
    encours: 45000000000,
    replication: 'physique',
    distribution: 'capitalisant'
  },

  // Actions Émergents
  {
    nom: "Amundi MSCI Emerging Markets UCITS ETF",
    isin: "LU1681045370",
    emetteur: "Amundi",
    categorie: "Actions Émergents",
    frais_gestion: 0.20,
    eligible_pea: false,
    encours: 2000000000,
    replication: 'physique',
    distribution: 'capitalisant'
  },
  {
    nom: "iShares Core MSCI EM IMI UCITS ETF",
    isin: "IE00BKM4GZ66",
    emetteur: "iShares",
    categorie: "Actions Émergents",
    frais_gestion: 0.18,
    eligible_pea: false,
    encours: 20000000000,
    replication: 'physique',
    distribution: 'capitalisant'
  },
  {
    nom: "Vanguard FTSE Emerging Markets UCITS ETF",
    isin: "IE00B3VVMM84",
    emetteur: "Vanguard",
    categorie: "Actions Émergents",
    frais_gestion: 0.22,
    eligible_pea: false,
    encours: 8000000000,
    replication: 'physique',
    distribution: 'capitalisant'
  },

  // Obligations Euro Investment Grade
  {
    nom: "iShares Core Euro Corporate Bond UCITS ETF",
    isin: "IE00B3F81R35",
    emetteur: "iShares",
    categorie: "Obligations Euro IG",
    frais_gestion: 0.20,
    eligible_pea: false,
    encours: 15000000000,
    replication: 'physique',
    distribution: 'capitalisant'
  },
  {
    nom: "Amundi Euro Corporate Bond UCITS ETF",
    isin: "LU1650490474",
    emetteur: "Amundi",
    categorie: "Obligations Euro IG",
    frais_gestion: 0.16,
    eligible_pea: false,
    encours: 2000000000,
    replication: 'physique',
    distribution: 'capitalisant'
  },
  {
    nom: "Vanguard EUR Corporate Bond UCITS ETF",
    isin: "IE00BZ163L38",
    emetteur: "Vanguard",
    categorie: "Obligations Euro IG",
    frais_gestion: 0.09,
    eligible_pea: false,
    encours: 5000000000,
    replication: 'physique',
    distribution: 'capitalisant'
  },

  // Obligations d'État Euro
  {
    nom: "iShares Core Euro Government Bond UCITS ETF",
    isin: "IE00B4WXJJ64",
    emetteur: "iShares",
    categorie: "Obligations Euro Souveraines",
    frais_gestion: 0.09,
    eligible_pea: false,
    encours: 10000000000,
    replication: 'physique',
    distribution: 'capitalisant'
  },
  {
    nom: "Lyxor Euro Government Bond UCITS ETF",
    isin: "LU1650487413",
    emetteur: "Lyxor",
    categorie: "Obligations Euro Souveraines",
    frais_gestion: 0.17,
    eligible_pea: false,
    encours: 3000000000,
    replication: 'synthetique',
    distribution: 'capitalisant'
  },

  // Obligations Monde
  {
    nom: "iShares Core Global Aggregate Bond UCITS ETF",
    isin: "IE00B3F81409",
    emetteur: "iShares",
    categorie: "Obligations Monde",
    frais_gestion: 0.10,
    eligible_pea: false,
    encours: 8000000000,
    replication: 'physique',
    distribution: 'capitalisant'
  },
  {
    nom: "Vanguard Global Aggregate Bond UCITS ETF",
    isin: "IE00BG47KH54",
    emetteur: "Vanguard",
    categorie: "Obligations Monde",
    frais_gestion: 0.10,
    eligible_pea: false,
    encours: 5000000000,
    replication: 'physique',
    distribution: 'capitalisant'
  },

  // Immobilier
  {
    nom: "iShares Developed Markets Property Yield UCITS ETF",
    isin: "IE00B1FZS350",
    emetteur: "iShares",
    categorie: "Immobilier",
    frais_gestion: 0.59,
    eligible_pea: false,
    encours: 1500000000,
    replication: 'physique',
    distribution: 'distribuant'
  },
  {
    nom: "Amundi ETF FTSE EPRA Europe Real Estate UCITS ETF",
    isin: "FR0010791160",
    emetteur: "Amundi",
    categorie: "Immobilier Europe",
    frais_gestion: 0.35,
    eligible_pea: true,
    encours: 800000000,
    replication: 'physique',
    distribution: 'capitalisant'
  },

  // Or
  {
    nom: "Amundi Physical Gold ETC",
    isin: "FR0013416716",
    emetteur: "Amundi",
    categorie: "Or",
    frais_gestion: 0.15,
    eligible_pea: false,
    encours: 3000000000,
    replication: 'physique',
    distribution: 'capitalisant'
  },
  {
    nom: "iShares Physical Gold ETC",
    isin: "IE00B4ND3602",
    emetteur: "iShares",
    categorie: "Or",
    frais_gestion: 0.12,
    eligible_pea: false,
    encours: 18000000000,
    replication: 'physique',
    distribution: 'capitalisant'
  },
];

/**
 * Recherche d'ETF par catégorie et éligibilité PEA
 */
export function getETFsByCategory(categorie: string, eligiblePEAOnly: boolean = false): ETFInfo[] {
  return ETF_DATABASE.filter(etf => {
    const matchCategory = etf.categorie === categorie;
    const matchPEA = !eligiblePEAOnly || etf.eligible_pea;
    return matchCategory && matchPEA;
  }).sort((a, b) => a.frais_gestion - b.frais_gestion);
}

/**
 * Recherche d'ETF à bas frais
 */
export function getLowCostETFs(maxFrais: number = 0.3): ETFInfo[] {
  return ETF_DATABASE.filter(etf => etf.frais_gestion <= maxFrais)
    .sort((a, b) => a.frais_gestion - b.frais_gestion);
}

/**
 * Recherche d'ETF éligibles PEA
 */
export function getPEAEligibleETFs(): ETFInfo[] {
  return ETF_DATABASE.filter(etf => etf.eligible_pea)
    .sort((a, b) => a.frais_gestion - b.frais_gestion);
}
