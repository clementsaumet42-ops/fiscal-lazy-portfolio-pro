/**
 * Références légales du Code Général des Impôts (CGI)
 */

export interface ReferenceLegale {
  article: string;
  url: string;
  description: string;
  dateApplication: string;
}

export const REFERENCES_CGI = {
  PEA: {
    exoneration_5ans: {
      article: 'CGI Art. 150-0 A, 1 ter',
      url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042912967',
      description: 'Exonération IR après 5 ans (PS 17.2% restent dus)',
      dateApplication: '2019-01-01'
    } as ReferenceLegale,
    avant_5ans: {
      article: 'CGI Art. 150-0 A',
      url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042912967',
      description: 'Avant 5 ans : imposition au barème progressif de l\'IR + PS 17.2%',
      dateApplication: '2019-01-01'
    } as ReferenceLegale
  },
  CTO: {
    pfu: {
      article: 'CGI Art. 200 A',
      url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042912916',
      description: 'PFU 30% (12.8% IR + 17.2% PS)',
      dateApplication: '2018-01-01'
    } as ReferenceLegale,
    option_bareme: {
      article: 'CGI Art. 200 A, 2',
      url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042912916',
      description: 'Option pour le barème progressif (irrévocable pour l\'année)',
      dateApplication: '2018-01-01'
    } as ReferenceLegale
  },
  ASSURANCE_VIE: {
    abattement_8ans: {
      article: 'CGI Art. 125-0 A, III-1°',
      url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042912929',
      description: 'Abattement : 4 600€ (célibataire) / 9 200€ (couple)',
      dateApplication: '1998-09-26'
    } as ReferenceLegale,
    taux_moins_4ans: {
      article: 'CGI Art. 125-0 A, II-2°',
      url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042912929',
      description: 'Rachat < 4 ans : 35% + 17.2% PS',
      dateApplication: '1998-09-26'
    } as ReferenceLegale,
    taux_4_8ans: {
      article: 'CGI Art. 125-0 A, II-2°',
      url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042912929',
      description: 'Rachat 4-8 ans : 15% + 17.2% PS',
      dateApplication: '1998-09-26'
    } as ReferenceLegale,
    taux_plus_8ans: {
      article: 'CGI Art. 125-0 A, II-2°',
      url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042912929',
      description: 'Rachat > 8 ans : 7.5% + 17.2% PS (après abattement)',
      dateApplication: '1998-09-26'
    } as ReferenceLegale,
    ps_fonds_euros: {
      article: 'CGI Art. 125-0 A',
      url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042912929',
      description: 'Prélèvements sociaux 17.2% sur fonds euros (annuels)',
      dateApplication: '1998-09-26'
    } as ReferenceLegale
  },
  PER: {
    deduction_entree: {
      article: 'CGI Art. 163 quatervicies',
      url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000041470804',
      description: 'Déduction versements (10% revenus pros, max 32 909€ + 4 052€)',
      dateApplication: '2019-10-01'
    } as ReferenceLegale,
    sortie_rente: {
      article: 'CGI Art. 158, 5',
      url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042912815',
      description: 'Sortie rente : fraction imposable selon âge',
      dateApplication: '2019-10-01'
    } as ReferenceLegale,
    sortie_capital: {
      article: 'CGI Art. 163 quatervicies',
      url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000041470804',
      description: 'Sortie capital : imposition au barème progressif',
      dateApplication: '2019-10-01'
    } as ReferenceLegale
  }
} as const;

export const TAUX_PS = 0.172;

export const PLAFONDS_2024 = {
  PEA: 150000,
  PER_DEDUCTIBLE_BASE: 0.10,
  PER_DEDUCTIBLE_MIN: 4052,
  PER_DEDUCTIBLE_MAX: 32909,
  AV_ABATTEMENT_CELIBATAIRE: 4600,
  AV_ABATTEMENT_COUPLE: 9200
} as const;
