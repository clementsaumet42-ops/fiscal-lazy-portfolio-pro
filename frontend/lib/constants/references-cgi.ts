/**
 * Références légales du Code Général des Impôts (CGI)
 * Utilisées pour justifier les calculs fiscaux
 */

export interface ReferenceCGI {
  article: string
  titre: string
  url: string
  description: string
}

/**
 * Références CGI pour chaque type d'enveloppe
 */
export const REFERENCES_CGI: Record<string, ReferenceCGI[]> = {
  PEA: [
    {
      article: 'Art. 150-0 A',
      titre: 'Imposition des gains avant 5 ans',
      url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042912856',
      description: 'Avant 5 ans : gains soumis au barème progressif de l\'IR (TMI) + PS 17.2%'
    },
    {
      article: 'Art. 150-0 A, 1 ter',
      titre: 'Exonération IR après 5 ans',
      url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042912856',
      description: 'Après 5 ans : gains exonérés d\'IR, seuls les PS 17.2% restent dus'
    },
    {
      article: 'Art. 163 quinquies D',
      titre: 'Plafond PEA',
      url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042912716',
      description: 'Plafond de versement : 150 000€ (PEA classique)'
    },
  ],
  
  CTO: [
    {
      article: 'Art. 200 A',
      titre: 'Prélèvement Forfaitaire Unique (PFU)',
      url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036431056',
      description: 'PFU de 30% (12.8% IR + 17.2% PS) sur les revenus mobiliers par défaut'
    },
    {
      article: 'Art. 200 A, 2',
      titre: 'Option pour le barème progressif',
      url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036431056',
      description: 'Option globale et irrévocable pour application du barème progressif (TMI + PS 17.2%)'
    },
    {
      article: 'Art. 158',
      titre: 'Abattement pour durée de détention',
      url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042912920',
      description: 'Abattement si option barème progressif : 50% après 2 ans, 65% après 8 ans'
    },
  ],
  
  AV: [
    {
      article: 'Art. 125-0 A',
      titre: 'Imposition des produits d\'assurance-vie',
      url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042912773',
      description: 'Taxation selon l\'ancienneté du contrat et la date des versements'
    },
    {
      article: 'Art. 125-0 A, II',
      titre: 'Contrats de moins de 4 ans',
      url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042912773',
      description: 'Prélèvement de 35% (+ PS 17.2%) sur les produits'
    },
    {
      article: 'Art. 125-0 A, II',
      titre: 'Contrats de 4 à 8 ans',
      url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042912773',
      description: 'Prélèvement de 15% (+ PS 17.2%) sur les produits'
    },
    {
      article: 'Art. 125-0 A, II',
      titre: 'Contrats de plus de 8 ans',
      url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042912773',
      description: 'Prélèvement de 7.5% (+ PS 17.2%) après abattement annuel de 4 600€ (9 200€ pour un couple)'
    },
    {
      article: 'Art. 990 I',
      titre: 'Prélèvements sociaux annuels',
      url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042912476',
      description: 'PS 17.2% dus chaque année sur les fonds euros'
    },
    {
      article: 'Art. 125-0 A, III-1',
      titre: 'Versements après le 27/09/2017',
      url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042912773',
      description: 'Pour les contrats > 150 000€ : taxation majorée à 12.8% au-delà du seuil'
    },
  ],
  
  PER: [
    {
      article: 'Art. 163 quatervicies',
      titre: 'Déduction des versements PER',
      url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042912710',
      description: 'Versements déductibles du revenu imposable dans la limite de 10% des revenus professionnels'
    },
    {
      article: 'Art. 163 quatervicies, I',
      titre: 'Plafond de déduction',
      url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042912710',
      description: 'Plafond 2024 : 35 194€ ou 10% des revenus pros (le plus élevé)'
    },
    {
      article: 'Art. 163 quatervicies, IV',
      titre: 'Imposition en sortie capital',
      url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042912710',
      description: 'Sortie en capital : imposée au barème progressif (TMI) + PS 17.2%'
    },
    {
      article: 'Art. 158',
      titre: 'Imposition en sortie rente',
      url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042912920',
      description: 'Sortie en rente : fraction imposable selon l\'âge au barème progressif + PS'
    },
  ],
}

/**
 * Messages d'explication pour les calculs fiscaux
 */
export const EXPLICATIONS_FISCALES = {
  PEA: {
    AVANT_5_ANS: (tmi: number) => 
      `PEA ouvert depuis moins de 5 ans : gains soumis à l'IR au taux de ${(tmi * 100).toFixed(0)}% (votre TMI) + PS 17.2%`,
    APRES_5_ANS: 
      'PEA ouvert depuis plus de 5 ans : gains exonérés d\'IR, seuls les prélèvements sociaux de 17.2% sont dus',
  },
  
  CTO: {
    PFU: 
      'Application du PFU (Flat Tax) : 30% (12.8% IR + 17.2% PS) sur les dividendes et plus-values',
    BAREME: (tmi: number) => 
      `Option barème progressif : ${(tmi * 100).toFixed(0)}% (votre TMI) + PS 17.2% sur les dividendes`,
  },
  
  AV: {
    MOINS_4_ANS: 
      'Contrat de moins de 4 ans : prélèvement de 35% + PS 17.2% sur les gains',
    ENTRE_4_8_ANS: 
      'Contrat de 4 à 8 ans : prélèvement de 15% + PS 17.2% sur les gains',
    PLUS_8_ANS: (abattement: number) => 
      `Contrat de plus de 8 ans : prélèvement de 7.5% + PS 17.2% après abattement annuel de ${abattement.toLocaleString('fr-FR')}€`,
    PS_FONDS_EUROS: 
      'Prélèvements sociaux annuels de 17.2% sur les fonds euros',
  },
  
  PER: {
    DEDUCTION: (tmi: number, montant: number) => 
      `Économie d'impôt à l'entrée : ${(tmi * 100).toFixed(0)}% de ${montant.toLocaleString('fr-FR')}€ = ${(tmi * montant).toLocaleString('fr-FR')}€`,
    SORTIE_CAPITAL: (tmi: number) => 
      `Sortie en capital : imposition au barème progressif (${(tmi * 100).toFixed(0)}% TMI) + PS 17.2%`,
    SORTIE_RENTE: 
      'Sortie en rente : fraction imposable selon votre âge au début de la rente',
  },
}

/**
 * Barème des rentes viagères (CGI Art. 158)
 * Fraction imposable selon l'âge au premier versement
 */
export const BAREME_RENTE_VIAGERE = {
  MOINS_50_ANS: 0.70,
  DE_50_A_59_ANS: 0.50,
  DE_60_A_69_ANS: 0.40,
  PLUS_70_ANS: 0.30,
} as const
