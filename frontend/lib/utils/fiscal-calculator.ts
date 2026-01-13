/**
 * Calculateur fiscal professionnel conforme au CGI
 */

import type { SituationFiscale } from '@/lib/types/situation-fiscale'
import { TAUX_PS, PLAFONDS_2024, REFERENCES_CGI } from '@/lib/constants/references-cgi'

/**
 * Calcule l'ancienneté en années à partir d'une date d'ouverture
 */
export function calculateAnciennete(dateOuverture: Date | string): number {
  const date = typeof dateOuverture === 'string' ? new Date(dateOuverture) : dateOuverture
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25)
  return diffYears
}

/**
 * Calcule le drag fiscal pour un PEA selon ancienneté (CGI Art. 150-0 A)
 * < 5 ans : TMI + PS 17.2%
 * ≥ 5 ans : PS 17.2% uniquement
 */
export function calculatePEADragFiscal(
  plusValue: number,
  dateOuverture: Date | string,
  tmi: number
): {
  dragFiscal: number
  tauxEffectif: number
  explication: string
  reference: string
} {
  const anciennete = calculateAnciennete(dateOuverture)
  
  if (anciennete < 5) {
    // Avant 5 ans : TMI + PS
    const tauxEffectif = tmi + TAUX_PS
    const dragFiscal = plusValue * tauxEffectif
    
    return {
      dragFiscal,
      tauxEffectif,
      explication: `PEA < 5 ans (${anciennete.toFixed(1)} ans) : TMI ${(tmi * 100).toFixed(0)}% + PS ${(TAUX_PS * 100).toFixed(1)}% = ${(tauxEffectif * 100).toFixed(1)}%`,
      reference: REFERENCES_CGI.PEA.avant_5ans.article
    }
  } else {
    // Après 5 ans : PS uniquement
    const tauxEffectif = TAUX_PS
    const dragFiscal = plusValue * tauxEffectif
    
    return {
      dragFiscal,
      tauxEffectif,
      explication: `PEA ≥ 5 ans (${anciennete.toFixed(1)} ans) : Exonération IR, PS ${(TAUX_PS * 100).toFixed(1)}% uniquement`,
      reference: REFERENCES_CGI.PEA.exoneration_5ans.article
    }
  }
}

/**
 * Calcule le drag fiscal pour un CTO (CGI Art. 200 A)
 * PFU 30% ou barème progressif selon option
 */
export function calculateCTODragFiscal(
  plusValue: number,
  situationFiscale: SituationFiscale
): {
  dragFiscal: number
  tauxEffectif: number
  explication: string
  reference: string
} {
  if (situationFiscale.optionBaremeProgressif) {
    // Option barème progressif
    const tauxEffectif = situationFiscale.tmi + TAUX_PS
    const dragFiscal = plusValue * tauxEffectif
    
    return {
      dragFiscal,
      tauxEffectif,
      explication: `CTO avec option barème : TMI ${(situationFiscale.tmi * 100).toFixed(0)}% + PS ${(TAUX_PS * 100).toFixed(1)}% = ${(tauxEffectif * 100).toFixed(1)}%`,
      reference: REFERENCES_CGI.CTO.option_bareme.article
    }
  } else {
    // PFU 30% par défaut
    const tauxEffectif = 0.30
    const dragFiscal = plusValue * tauxEffectif
    
    return {
      dragFiscal,
      tauxEffectif,
      explication: `CTO avec PFU : 30% (12.8% IR + 17.2% PS)`,
      reference: REFERENCES_CGI.CTO.pfu.article
    }
  }
}

/**
 * Calcule le drag fiscal pour une Assurance-vie (CGI Art. 125-0 A)
 * < 4 ans : 35% + PS
 * 4-8 ans : 15% + PS
 * > 8 ans : 7.5% + PS (avec abattement 4600€/9200€)
 * + PS annuels sur fonds euros
 */
export function calculateAVDragFiscal(
  montantVerse: number,
  montantActuel: number,
  dateOuverture: Date | string,
  repartitionFondsEuros: number, // en pourcentage (0-100)
  situation: SituationFiscale
): {
  dragFiscal: number
  dragFiscalRachat: number
  dragFiscalPS: number
  tauxEffectif: number
  explication: string
  reference: string
} {
  const anciennete = calculateAnciennete(dateOuverture)
  const plusValue = Math.max(0, montantActuel - montantVerse)
  const montantFondsEuros = montantActuel * (repartitionFondsEuros / 100)
  
  // PS annuels sur fonds euros (17.2%)
  const rendementFE = 0.015 // 1.5% rendement moyen fonds euros
  const dragFiscalPS = montantFondsEuros * rendementFE * TAUX_PS
  
  // Calcul du drag fiscal en cas de rachat
  let dragFiscalRachat = 0
  let tauxRachat = 0
  let explication = ''
  let reference = ''
  
  if (anciennete < 4) {
    // < 4 ans : 35% + 17.2% PS
    tauxRachat = 0.35 + TAUX_PS
    dragFiscalRachat = plusValue * tauxRachat
    explication = `AV < 4 ans (${anciennete.toFixed(1)} ans) : ${(tauxRachat * 100).toFixed(1)}% (35% IR + 17.2% PS)`
    reference = REFERENCES_CGI.ASSURANCE_VIE.taux_moins_4ans.article
  } else if (anciennete < 8) {
    // 4-8 ans : 15% + 17.2% PS
    tauxRachat = 0.15 + TAUX_PS
    dragFiscalRachat = plusValue * tauxRachat
    explication = `AV 4-8 ans (${anciennete.toFixed(1)} ans) : ${(tauxRachat * 100).toFixed(1)}% (15% IR + 17.2% PS)`
    reference = REFERENCES_CGI.ASSURANCE_VIE.taux_4_8ans.article
  } else {
    // > 8 ans : 7.5% + 17.2% PS avec abattement
    const abattement = situation.situationFamiliale === 'marie' || situation.situationFamiliale === 'pacse'
      ? PLAFONDS_2024.AV_ABATTEMENT_COUPLE
      : PLAFONDS_2024.AV_ABATTEMENT_CELIBATAIRE
    
    const plusValueImposable = Math.max(0, plusValue - abattement)
    tauxRachat = 0.075 + TAUX_PS
    dragFiscalRachat = plusValueImposable * tauxRachat
    
    explication = `AV > 8 ans (${anciennete.toFixed(1)} ans) : ${(tauxRachat * 100).toFixed(1)}% (7.5% IR + 17.2% PS) après abattement ${abattement.toLocaleString('fr-FR')}€`
    reference = REFERENCES_CGI.ASSURANCE_VIE.taux_plus_8ans.article
  }
  
  const dragFiscal = dragFiscalRachat + dragFiscalPS
  const tauxEffectif = montantActuel > 0 ? dragFiscal / montantActuel : 0
  
  explication += ` + PS annuels ${dragFiscalPS.toFixed(0)}€ sur fonds euros`
  
  return {
    dragFiscal,
    dragFiscalRachat,
    dragFiscalPS,
    tauxEffectif,
    explication,
    reference
  }
}

/**
 * Calcule l'optimisation fiscale pour un PER (CGI Art. 163 quatervicies)
 * - Économie IR à l'entrée (déduction selon plafond)
 * - Fiscalité sortie capital vs rente
 */
export function calculatePEROptimization(
  montantVerse: number,
  revenusAnnuels: number,
  situation: SituationFiscale,
  age: number = 40
): {
  economieIREntree: number
  plafondDeductible: number
  dragFiscalSortie: number
  recommandation: string
  explication: string
  reference: string
} {
  // Calcul du plafond de déduction PER
  const plafondCalcule = Math.min(
    revenusAnnuels * PLAFONDS_2024.PER_DEDUCTIBLE_BASE,
    PLAFONDS_2024.PER_DEDUCTIBLE_MAX
  )
  const plafondDeductible = Math.max(plafondCalcule, PLAFONDS_2024.PER_DEDUCTIBLE_MIN)
  
  // Économie IR à l'entrée
  const montantDeductible = Math.min(montantVerse, plafondDeductible)
  const economieIREntree = montantDeductible * situation.tmi
  
  // Estimation drag fiscal sortie (sortie en capital au barème progressif)
  // On estime une valorisation à la sortie (x2 pour un horizon long terme)
  const valorisationEstimee = montantVerse * 2
  const dragFiscalSortie = valorisationEstimee * situation.tmi
  
  // Recommandation
  let recommandation = ''
  if (situation.tmi >= 0.30) {
    recommandation = 'PER très avantageux : déduction TMI élevée. Privilégier sortie en rente pour optimiser la fiscalité.'
  } else if (situation.tmi >= 0.11) {
    recommandation = 'PER intéressant : bonne déduction IR. Comparer sortie capital vs rente selon situation future.'
  } else {
    recommandation = 'PER peu avantageux fiscalement à votre TMI actuelle. Privilégier PEA ou assurance-vie.'
  }
  
  const explication = `Déduction entrée : ${montantDeductible.toLocaleString('fr-FR')}€ × ${(situation.tmi * 100).toFixed(0)}% = ${economieIREntree.toLocaleString('fr-FR')}€ d'économie d'IR. Sortie capital imposée au barème progressif.`
  
  return {
    economieIREntree,
    plafondDeductible,
    dragFiscalSortie,
    recommandation,
    explication,
    reference: REFERENCES_CGI.PER.deduction_entree.article
  }
}
