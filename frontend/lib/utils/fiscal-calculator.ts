/**
 * Calculateur fiscal professionnel conforme au Code Général des Impôts (CGI)
 * Calcule la fiscalité précise selon le type d'enveloppe, l'ancienneté, et la TMI du client
 */

import type { SituationFiscale, TMI } from '@/lib/types/situation-fiscale'
import { PRELEVEMENTS_SOCIAUX, PFU, PLAFONDS_2024 } from '@/lib/types/situation-fiscale'
import { EXPLICATIONS_FISCALES, REFERENCES_CGI, BAREME_RENTE_VIAGERE } from '@/lib/constants/references-cgi'
import type { ReferenceCGI } from '@/lib/constants/references-cgi'

/**
 * Résultat d'un calcul fiscal
 */
export interface CalculFiscal {
  taux_effectif: number // Taux total (IR + PS)
  taux_ir: number // Part IR seule
  taux_ps: number // Part PS seule
  montant_impot: number // Montant d'impôt sur la base taxable
  explication: string
  references: ReferenceCGI[]
  details?: {
    tmi?: number
    abattement?: number
    anciennete?: number
  }
}

/**
 * Calcule le nombre d'années écoulées depuis une date
 */
function calculerAnciennete(dateOuverture: string | Date | undefined): number {
  if (!dateOuverture) return 0
  
  const date = typeof dateOuverture === 'string' ? new Date(dateOuverture) : dateOuverture
  const maintenant = new Date()
  const diffMs = maintenant.getTime() - date.getTime()
  const diffAnnees = diffMs / (1000 * 60 * 60 * 24 * 365.25)
  
  return Math.floor(diffAnnees)
}

/**
 * PEA - Plan d'Épargne en Actions (CGI Art. 150-0 A)
 * 
 * Règles fiscales :
 * - Avant 5 ans : TMI + PS 17.2%
 * - Après 5 ans : PS 17.2% uniquement (exonération IR)
 */
export function calculerFiscalitePEA(
  situationFiscale: SituationFiscale,
  dateOuverture?: string | Date,
  baseTaxable?: number
): CalculFiscal {
  const anciennete = calculerAnciennete(dateOuverture)
  const ps = PRELEVEMENTS_SOCIAUX.TAUX
  
  if (anciennete < 5) {
    // Avant 5 ans : TMI + PS
    const tmi = situationFiscale.tmi
    const tauxEffectif = tmi + ps
    const montantImpot = baseTaxable ? baseTaxable * tauxEffectif : 0
    
    return {
      taux_effectif: tauxEffectif,
      taux_ir: tmi,
      taux_ps: ps,
      montant_impot: montantImpot,
      explication: EXPLICATIONS_FISCALES.PEA.AVANT_5_ANS(tmi),
      references: [REFERENCES_CGI.PEA[0]],
      details: {
        tmi,
        anciennete,
      }
    }
  } else {
    // Après 5 ans : PS uniquement
    const montantImpot = baseTaxable ? baseTaxable * ps : 0
    
    return {
      taux_effectif: ps,
      taux_ir: 0,
      taux_ps: ps,
      montant_impot: montantImpot,
      explication: EXPLICATIONS_FISCALES.PEA.APRES_5_ANS,
      references: [REFERENCES_CGI.PEA[1]],
      details: {
        tmi: 0,
        anciennete,
      }
    }
  }
}

/**
 * CTO - Compte-Titres Ordinaire (CGI Art. 200 A)
 * 
 * Règles fiscales :
 * - Par défaut : PFU 30% (12.8% IR + 17.2% PS)
 * - Option barème progressif : TMI + PS 17.2% (si TMI < 30%)
 */
export function calculerFiscaliteCTO(
  situationFiscale: SituationFiscale,
  baseTaxable?: number
): CalculFiscal {
  const ps = PRELEVEMENTS_SOCIAUX.TAUX
  
  if (situationFiscale.optionBaremeProgressif) {
    // Option barème progressif
    const tmi = situationFiscale.tmi
    const tauxEffectif = tmi + ps
    const montantImpot = baseTaxable ? baseTaxable * tauxEffectif : 0
    
    return {
      taux_effectif: tauxEffectif,
      taux_ir: tmi,
      taux_ps: ps,
      montant_impot: montantImpot,
      explication: EXPLICATIONS_FISCALES.CTO.BAREME(tmi),
      references: [REFERENCES_CGI.CTO[1]],
      details: {
        tmi,
      }
    }
  } else {
    // PFU par défaut
    const montantImpot = baseTaxable ? baseTaxable * PFU.TOTAL : 0
    
    return {
      taux_effectif: PFU.TOTAL,
      taux_ir: PFU.IR,
      taux_ps: ps,
      montant_impot: montantImpot,
      explication: EXPLICATIONS_FISCALES.CTO.PFU,
      references: [REFERENCES_CGI.CTO[0]],
    }
  }
}

/**
 * Assurance-Vie (CGI Art. 125-0 A)
 * 
 * Règles fiscales selon l'ancienneté :
 * - Moins de 4 ans : 35% + PS 17.2%
 * - 4 à 8 ans : 15% + PS 17.2%
 * - Plus de 8 ans : 7.5% + PS 17.2% (après abattement 4600€ ou 9200€)
 * 
 * + PS annuels sur fonds euros : 17.2%
 */
export function calculerFiscaliteAssuranceVie(
  situationFiscale: SituationFiscale,
  dateOuverture?: string | Date,
  baseTaxable?: number
): CalculFiscal {
  const anciennete = calculerAnciennete(dateOuverture)
  const ps = PRELEVEMENTS_SOCIAUX.TAUX
  
  // Calcul de l'abattement selon situation familiale
  const abattement = ['marie', 'pacse'].includes(situationFiscale.situationFamiliale)
    ? PLAFONDS_2024.AV_ABATTEMENT_COUPLE
    : PLAFONDS_2024.AV_ABATTEMENT_CELIBATAIRE
  
  if (anciennete < 4) {
    // Moins de 4 ans : 35% + PS
    const tauxIR = 0.35
    const tauxEffectif = tauxIR + ps
    const montantImpot = baseTaxable ? baseTaxable * tauxEffectif : 0
    
    return {
      taux_effectif: tauxEffectif,
      taux_ir: tauxIR,
      taux_ps: ps,
      montant_impot: montantImpot,
      explication: EXPLICATIONS_FISCALES.AV.MOINS_4_ANS,
      references: [REFERENCES_CGI.AV[1]],
      details: {
        anciennete,
      }
    }
  } else if (anciennete < 8) {
    // 4 à 8 ans : 15% + PS
    const tauxIR = 0.15
    const tauxEffectif = tauxIR + ps
    const montantImpot = baseTaxable ? baseTaxable * tauxEffectif : 0
    
    return {
      taux_effectif: tauxEffectif,
      taux_ir: tauxIR,
      taux_ps: ps,
      montant_impot: montantImpot,
      explication: EXPLICATIONS_FISCALES.AV.ENTRE_4_8_ANS,
      references: [REFERENCES_CGI.AV[2]],
      details: {
        anciennete,
      }
    }
  } else {
    // Plus de 8 ans : 7.5% + PS (après abattement)
    const tauxIR = 0.075
    const tauxEffectif = tauxIR + ps
    
    // Appliquer l'abattement si on a une base taxable
    let montantImpot = 0
    if (baseTaxable) {
      const baseTaxableApresAbattement = Math.max(0, baseTaxable - abattement)
      montantImpot = baseTaxableApresAbattement * tauxEffectif
    }
    
    return {
      taux_effectif: tauxEffectif,
      taux_ir: tauxIR,
      taux_ps: ps,
      montant_impot: montantImpot,
      explication: EXPLICATIONS_FISCALES.AV.PLUS_8_ANS(abattement),
      references: [REFERENCES_CGI.AV[3]],
      details: {
        anciennete,
        abattement,
      }
    }
  }
}

/**
 * Calcul des PS annuels sur fonds euros (Assurance-Vie)
 */
export function calculerPSFondsEuros(
  montantFondsEuros: number,
  rendementEstime: number = 0.015 // 1.5% par défaut
): CalculFiscal {
  const ps = PRELEVEMENTS_SOCIAUX.TAUX
  const baseTaxable = montantFondsEuros * rendementEstime
  const montantImpot = baseTaxable * ps
  
  return {
    taux_effectif: ps,
    taux_ir: 0,
    taux_ps: ps,
    montant_impot: montantImpot,
    explication: EXPLICATIONS_FISCALES.AV.PS_FONDS_EUROS,
    references: [REFERENCES_CGI.AV[4]],
  }
}

/**
 * PER - Plan d'Épargne Retraite (CGI Art. 163 quatervicies)
 * 
 * Déduction à l'entrée :
 * - Versements déductibles du revenu imposable
 * - Plafond : max(35 194€, 10% revenus pros)
 * 
 * Taxation en sortie :
 * - Capital : TMI + PS 17.2%
 * - Rente : fraction imposable selon âge × (TMI + PS)
 */
export function calculerDeductionPER(
  situationFiscale: SituationFiscale,
  montantVersement: number
): {
  plafond_deductible: number
  montant_deductible: number
  economie_impot: number
  explication: string
  references: ReferenceCGI[]
} {
  // Calcul du plafond déductible
  const plafondBase = PLAFONDS_2024.PER_PLAFOND_BASE
  const plafondRevenus = situationFiscale.revenusProAnnuels 
    ? situationFiscale.revenusProAnnuels * PLAFONDS_2024.PER_TAUX_REVENUS_PROS
    : 0
  
  const plafondDeductible = Math.max(plafondBase, plafondRevenus)
  const plafondDisponible = plafondDeductible - situationFiscale.plafonds.perDeductibleUtilise
  
  // Montant réellement déductible
  const montantDeductible = Math.min(montantVersement, plafondDisponible)
  
  // Économie d'impôt
  const economieImpot = montantDeductible * situationFiscale.tmi
  
  return {
    plafond_deductible: plafondDeductible,
    montant_deductible: montantDeductible,
    economie_impot: economieImpot,
    explication: EXPLICATIONS_FISCALES.PER.DEDUCTION(situationFiscale.tmi, montantDeductible),
    references: [REFERENCES_CGI.PER[0], REFERENCES_CGI.PER[1]],
  }
}

/**
 * Calcul de la fiscalité en sortie capital du PER
 */
export function calculerFiscaliteSortiePERCapital(
  situationFiscale: SituationFiscale,
  montantSortie: number
): CalculFiscal {
  const ps = PRELEVEMENTS_SOCIAUX.TAUX
  const tmi = situationFiscale.tmi
  const tauxEffectif = tmi + ps
  const montantImpot = montantSortie * tauxEffectif
  
  return {
    taux_effectif: tauxEffectif,
    taux_ir: tmi,
    taux_ps: ps,
    montant_impot: montantImpot,
    explication: EXPLICATIONS_FISCALES.PER.SORTIE_CAPITAL(tmi),
    references: [REFERENCES_CGI.PER[2]],
    details: {
      tmi,
    }
  }
}

/**
 * Calcul de la fiscalité en sortie rente du PER
 * La fraction imposable dépend de l'âge au début de la rente
 */
export function calculerFiscaliteSortiePERRente(
  situationFiscale: SituationFiscale,
  montantRenteAnnuelle: number,
  ageDebutRente: number
): CalculFiscal {
  const ps = PRELEVEMENTS_SOCIAUX.TAUX
  const tmi = situationFiscale.tmi
  
  // Déterminer la fraction imposable selon l'âge
  let fractionImposable: number
  if (ageDebutRente < 50) {
    fractionImposable = BAREME_RENTE_VIAGERE.MOINS_50_ANS
  } else if (ageDebutRente < 60) {
    fractionImposable = BAREME_RENTE_VIAGERE.DE_50_A_59_ANS
  } else if (ageDebutRente < 70) {
    fractionImposable = BAREME_RENTE_VIAGERE.DE_60_A_69_ANS
  } else {
    fractionImposable = BAREME_RENTE_VIAGERE.PLUS_70_ANS
  }
  
  const baseImposable = montantRenteAnnuelle * fractionImposable
  const tauxEffectif = tmi + ps
  const montantImpot = baseImposable * tauxEffectif
  
  return {
    taux_effectif: tauxEffectif,
    taux_ir: tmi,
    taux_ps: ps,
    montant_impot: montantImpot,
    explication: `${EXPLICATIONS_FISCALES.PER.SORTIE_RENTE} (${(fractionImposable * 100).toFixed(0)}% imposable à ${ageDebutRente} ans)`,
    references: [REFERENCES_CGI.PER[3]],
    details: {
      tmi,
    }
  }
}

/**
 * Estimateur de drag fiscal annuel pour une enveloppe
 * Basé sur un rendement estimé (dividendes, intérêts, etc.)
 */
export function estimerDragFiscalAnnuel(
  typeEnveloppe: 'PEA' | 'CTO' | 'AV' | 'PER',
  valorisation: number,
  rendementEstime: number,
  situationFiscale: SituationFiscale,
  dateOuverture?: string | Date,
  pourcentageFondsEuros?: number
): {
  drag_fiscal: number
  calcul: CalculFiscal
} {
  const baseTaxable = valorisation * rendementEstime
  
  switch (typeEnveloppe) {
    case 'PEA': {
      const calcul = calculerFiscalitePEA(situationFiscale, dateOuverture, baseTaxable)
      return { drag_fiscal: calcul.montant_impot, calcul }
    }
    
    case 'CTO': {
      const calcul = calculerFiscaliteCTO(situationFiscale, baseTaxable)
      return { drag_fiscal: calcul.montant_impot, calcul }
    }
    
    case 'AV': {
      // Pour l'AV, on calcule les PS sur fonds euros uniquement
      const montantFondsEuros = pourcentageFondsEuros 
        ? valorisation * pourcentageFondsEuros
        : valorisation * 0.30 // 30% par défaut
      
      const calcul = calculerPSFondsEuros(montantFondsEuros, 0.015) // 1.5% rendement fonds euros
      return { drag_fiscal: calcul.montant_impot, calcul }
    }
    
    case 'PER': {
      // Le PER n'a pas de drag fiscal annuel (fiscalité différée)
      // On retourne 0 avec une explication
      return {
        drag_fiscal: 0,
        calcul: {
          taux_effectif: 0,
          taux_ir: 0,
          taux_ps: 0,
          montant_impot: 0,
          explication: 'Le PER bénéficie d\'une fiscalité différée. L\'imposition aura lieu à la sortie (capital ou rente).',
          references: [REFERENCES_CGI.PER[0]],
        }
      }
    }
  }
}
