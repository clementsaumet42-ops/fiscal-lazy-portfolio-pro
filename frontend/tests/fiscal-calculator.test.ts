/**
 * Test des calculs fiscaux professionnels
 * Vérification rapide des résultats attendus selon le CGI
 */

import {
  calculerFiscalitePEA,
  calculerFiscaliteCTO,
  calculerFiscaliteAssuranceVie,
  calculerPSFondsEuros,
  calculerDeductionPER,
  estimerDragFiscalAnnuel,
} from '../lib/utils/fiscal-calculator'
import type { SituationFiscale } from '../lib/types/situation-fiscale'

// Situation fiscale de test
const situationFiscaleTest: SituationFiscale = {
  tmi: 0.30,
  rfr: 50000,
  nbPartsFiscales: 2,
  situationFamiliale: 'marie',
  optionBaremeProgressif: false,
  plafonds: {
    peaUtilise: 0,
    perDeductibleUtilise: 0,
  },
  revenusProAnnuels: 60000,
}

console.log('🧪 Tests des calculs fiscaux professionnels\n')
console.log('=' .repeat(60))

// Test 1: PEA < 5 ans
console.log('\n📊 Test 1: PEA ouvert depuis 3 ans (TMI 30%)')
const dateOuverturePEA3ans = new Date()
dateOuverturePEA3ans.setFullYear(dateOuverturePEA3ans.getFullYear() - 3)
const peaAvant5ans = calculerFiscalitePEA(situationFiscaleTest, dateOuverturePEA3ans, 2000)
console.log(`Taux effectif: ${(peaAvant5ans.taux_effectif * 100).toFixed(1)}%`)
console.log(`Taux IR: ${(peaAvant5ans.taux_ir * 100).toFixed(1)}%`)
console.log(`Taux PS: ${(peaAvant5ans.taux_ps * 100).toFixed(1)}%`)
console.log(`Impôt sur 2000€: ${peaAvant5ans.montant_impot.toFixed(0)}€`)
console.log(`Explication: ${peaAvant5ans.explication}`)
console.log(`✅ Attendu: 47.2% (30% + 17.2%) = ${(2000 * 0.472).toFixed(0)}€`)

// Test 2: PEA > 5 ans
console.log('\n📊 Test 2: PEA ouvert depuis 7 ans (TMI 30%)')
const dateOuverturePEA7ans = new Date()
dateOuverturePEA7ans.setFullYear(dateOuverturePEA7ans.getFullYear() - 7)
const peaApres5ans = calculerFiscalitePEA(situationFiscaleTest, dateOuverturePEA7ans, 2000)
console.log(`Taux effectif: ${(peaApres5ans.taux_effectif * 100).toFixed(1)}%`)
console.log(`Taux IR: ${(peaApres5ans.taux_ir * 100).toFixed(1)}%`)
console.log(`Taux PS: ${(peaApres5ans.taux_ps * 100).toFixed(1)}%`)
console.log(`Impôt sur 2000€: ${peaApres5ans.montant_impot.toFixed(0)}€`)
console.log(`Explication: ${peaApres5ans.explication}`)
console.log(`✅ Attendu: 17.2% (PS uniquement) = ${(2000 * 0.172).toFixed(0)}€`)

// Test 3: CTO avec PFU
console.log('\n📊 Test 3: CTO avec PFU (TMI 30%)')
const ctoPFU = calculerFiscaliteCTO(situationFiscaleTest, 2000)
console.log(`Taux effectif: ${(ctoPFU.taux_effectif * 100).toFixed(1)}%`)
console.log(`Taux IR: ${(ctoPFU.taux_ir * 100).toFixed(1)}%`)
console.log(`Taux PS: ${(ctoPFU.taux_ps * 100).toFixed(1)}%`)
console.log(`Impôt sur 2000€: ${ctoPFU.montant_impot.toFixed(0)}€`)
console.log(`Explication: ${ctoPFU.explication}`)
console.log(`✅ Attendu: 30% (PFU) = ${(2000 * 0.30).toFixed(0)}€`)

// Test 4: CTO avec barème progressif
console.log('\n📊 Test 4: CTO avec barème progressif (TMI 11%)')
const situationFiscaleTMI11: SituationFiscale = {
  ...situationFiscaleTest,
  tmi: 0.11,
  optionBaremeProgressif: true,
}
const ctoBareme = calculerFiscaliteCTO(situationFiscaleTMI11, 2000)
console.log(`Taux effectif: ${(ctoBareme.taux_effectif * 100).toFixed(1)}%`)
console.log(`Taux IR: ${(ctoBareme.taux_ir * 100).toFixed(1)}%`)
console.log(`Taux PS: ${(ctoBareme.taux_ps * 100).toFixed(1)}%`)
console.log(`Impôt sur 2000€: ${ctoBareme.montant_impot.toFixed(0)}€`)
console.log(`Explication: ${ctoBareme.explication}`)
console.log(`✅ Attendu: 28.2% (11% + 17.2%) = ${(2000 * 0.282).toFixed(0)}€`)

// Test 5: Assurance-Vie < 4 ans
console.log('\n📊 Test 5: Assurance-Vie < 4 ans')
const dateOuvertureAV2ans = new Date()
dateOuvertureAV2ans.setFullYear(dateOuvertureAV2ans.getFullYear() - 2)
const avMoins4ans = calculerFiscaliteAssuranceVie(situationFiscaleTest, dateOuvertureAV2ans, 2000)
console.log(`Taux effectif: ${(avMoins4ans.taux_effectif * 100).toFixed(1)}%`)
console.log(`Taux IR: ${(avMoins4ans.taux_ir * 100).toFixed(1)}%`)
console.log(`Impôt sur 2000€: ${avMoins4ans.montant_impot.toFixed(0)}€`)
console.log(`Explication: ${avMoins4ans.explication}`)
console.log(`✅ Attendu: 52.2% (35% + 17.2%) = ${(2000 * 0.522).toFixed(0)}€`)

// Test 6: Assurance-Vie > 8 ans avec abattement
console.log('\n📊 Test 6: Assurance-Vie > 8 ans (couple, abattement 9200€)')
const dateOuvertureAV10ans = new Date()
dateOuvertureAV10ans.setFullYear(dateOuvertureAV10ans.getFullYear() - 10)
const avPlus8ans = calculerFiscaliteAssuranceVie(situationFiscaleTest, dateOuvertureAV10ans, 2000)
console.log(`Taux effectif: ${(avPlus8ans.taux_effectif * 100).toFixed(1)}%`)
console.log(`Abattement: ${avPlus8ans.details?.abattement}€`)
console.log(`Impôt sur 2000€: ${avPlus8ans.montant_impot.toFixed(0)}€`)
console.log(`Explication: ${avPlus8ans.explication}`)
console.log(`✅ Attendu: 0€ (gains < abattement)`)

// Test 7: PS Fonds Euros
console.log('\n📊 Test 7: PS annuels sur fonds euros')
const psFondsEuros = calculerPSFondsEuros(30000, 0.015)
console.log(`PS sur 30000€ à 1.5%: ${psFondsEuros.montant_impot.toFixed(2)}€`)
console.log(`Explication: ${psFondsEuros.explication}`)
console.log(`✅ Attendu: ${(30000 * 0.015 * 0.172).toFixed(2)}€`)

// Test 8: PER déduction
console.log('\n📊 Test 8: PER déduction (versement 10000€, TMI 30%)')
const perDeduction = calculerDeductionPER(situationFiscaleTest, 10000)
console.log(`Plafond déductible: ${perDeduction.plafond_deductible.toLocaleString('fr-FR')}€`)
console.log(`Montant déductible: ${perDeduction.montant_deductible.toLocaleString('fr-FR')}€`)
console.log(`Économie d'impôt: ${perDeduction.economie_impot.toLocaleString('fr-FR')}€`)
console.log(`Explication: ${perDeduction.explication}`)
console.log(`✅ Attendu: ${(10000 * 0.30).toFixed(0)}€ d'économie`)

// Test 9: Drag fiscal annuel
console.log('\n📊 Test 9: Drag fiscal annuel PEA 100k€ (3 ans, TMI 30%, 2% rendement)')
const dragPEA = estimerDragFiscalAnnuel(
  'PEA',
  100000,
  0.02,
  situationFiscaleTest,
  dateOuverturePEA3ans
)
console.log(`Drag fiscal annuel: ${dragPEA.drag_fiscal.toFixed(0)}€`)
console.log(`Explication: ${dragPEA.calcul.explication}`)
console.log(`✅ Attendu: ${(100000 * 0.02 * 0.472).toFixed(0)}€`)

console.log('\n' + '='.repeat(60))
console.log('✅ Tous les tests terminés!')
console.log('\nRemarque: Vérifiez que les résultats correspondent aux attentes.')
