/**
 * Mock data generator for audit and diagnostic
 */

import { PlacementExistant, DiagnosticAudit } from '@/lib/types/audit'
import { BilanPatrimonial } from '@/lib/types/bilan'

export function generateMockPlacementsFromBilan(bilan: BilanPatrimonial): PlacementExistant[] {
  const placements: PlacementExistant[] = []

  if (!bilan.patrimoine) return placements

  const { epargne_liquide, placements_financiers, autres_actifs } = bilan.patrimoine

  // Épargne liquide
  if (epargne_liquide.livret_a > 0) {
    placements.push({
      id: 'livret-a',
      type: 'livret',
      nom: 'Livret A',
      etablissement: 'Banque',
      montant: epargne_liquide.livret_a,
      frais_annuels: 0,
      rendement_historique: 3.0,
      score_qualite: 8,
      liquidite: 'immediate',
      fiscalite_note: 10,
      diversification_note: 5,
    })
  }

  // PEA
  placements_financiers.pea.forEach((pea, index) => {
    if (pea.montant > 0) {
      placements.push({
        id: `pea-${index}`,
        type: 'pea',
        nom: `PEA ${pea.etablissement || 'Banque'}`,
        etablissement: pea.etablissement || 'Banque',
        montant: pea.montant,
        frais_annuels: pea.montant * 0.005, // 0.5% estimation
        rendement_historique: 6.5,
        score_qualite: 7,
        liquidite: 'court_terme',
        fiscalite_note: 9,
        diversification_note: 7,
      })
    }
  })

  // Assurance-vie
  placements_financiers.assurance_vie.forEach((av, index) => {
    if (av.montant > 0) {
      placements.push({
        id: `av-${index}`,
        type: 'assurance_vie',
        nom: `Assurance-vie ${av.etablissement || 'Assureur'}`,
        etablissement: av.etablissement || 'Assureur',
        montant: av.montant,
        frais_annuels: av.montant * 0.008, // 0.8% estimation
        rendement_historique: 4.0,
        score_qualite: 6,
        liquidite: 'moyen_terme',
        fiscalite_note: 8,
        diversification_note: 6,
      })
    }
  })

  return placements
}

export function generateMockDiagnostic(placements: PlacementExistant[]): DiagnosticAudit {
  const totalFrais = placements.reduce((sum, p) => sum + p.frais_annuels, 0)
  const totalMontant = placements.reduce((sum, p) => sum + p.montant, 0)
  const tauxFraisMoyen = totalMontant > 0 ? (totalFrais / totalMontant) * 100 : 0

  const points_forts = []
  const points_attention = []
  const points_faibles = []
  const opportunites = []

  // Analyse des points forts
  const hasPEA = placements.some(p => p.type === 'pea')
  if (hasPEA) {
    points_forts.push({
      titre: 'PEA bien utilisé',
      description: 'Vous possédez un PEA, enveloppe fiscalement avantageuse pour les actions européennes.',
      impact: 'Exonération d\'impôt après 5 ans (hors prélèvements sociaux)'
    })
  }

  const hasLivretA = placements.some(p => p.type === 'livret' && p.nom === 'Livret A')
  if (hasLivretA) {
    points_forts.push({
      titre: 'Épargne de sécurité constituée',
      description: 'Le Livret A constitue une bonne épargne de précaution liquide et sans risque.',
      impact: 'Disponibilité immédiate et capital garanti'
    })
  }

  // Analyse des points d\'attention
  if (tauxFraisMoyen > 0.6) {
    points_attention.push({
      titre: 'Frais de gestion élevés',
      description: `Vos frais annuels moyens sont de ${tauxFraisMoyen.toFixed(2)}%, ce qui est supérieur à la moyenne du marché.`,
      recommandation: 'Privilégier des ETF à faible coût (TER < 0.3%)'
    })
  }

  const hasAssuranceVie = placements.some(p => p.type === 'assurance_vie')
  if (hasAssuranceVie) {
    const av = placements.find(p => p.type === 'assurance_vie')
    if (av && av.frais_annuels / av.montant > 0.007) {
      points_attention.push({
        titre: 'Frais assurance-vie à optimiser',
        description: 'Votre contrat d\'assurance-vie a des frais supérieurs aux contrats en ligne.',
        recommandation: 'Envisager un transfert vers Linxea Spirit 2 ou Placement-direct (frais < 0.6%)'
      })
    }
  }

  // Analyse des points faibles
  const pctLiquidite = placements
    .filter(p => p.type === 'livret')
    .reduce((sum, p) => sum + p.montant, 0) / totalMontant * 100

  if (pctLiquidite > 40) {
    points_faibles.push({
      titre: 'Sur-exposition à l\'épargne liquide',
      description: `${pctLiquidite.toFixed(0)}% de votre patrimoine est en épargne liquide, ce qui limite le potentiel de rendement.`,
      consequence: 'Rendement réel négatif après inflation',
      action_corrective: 'Investir une partie en actions via PEA ou assurance-vie'
    })
  }

  // Opportunités
  const montantPEA = placements.filter(p => p.type === 'pea').reduce((sum, p) => sum + p.montant, 0)
  if (montantPEA < 150000) {
    const potentiel = Math.min(150000 - montantPEA, totalMontant * 0.3)
    opportunites.push({
      titre: 'Plafond PEA non utilisé',
      description: `Vous pouvez encore verser ${Math.floor(potentiel).toLocaleString()} € sur votre PEA.`,
      gain_potentiel: 'Économie fiscale estimée : ' + Math.floor(potentiel * 0.30 * 0.17).toLocaleString() + ' € sur 10 ans'
    })
  }

  const hasPER = placements.some(p => p.type === 'per')
  if (!hasPER && totalMontant > 50000) {
    opportunites.push({
      titre: 'PER non ouvert',
      description: 'Le Plan d\'Épargne Retraite permet de déduire les versements de vos revenus imposables.',
      gain_potentiel: 'Économie fiscale possible selon votre TMI'
    })
  }

  // Calcul du score global
  let scoreGlobal = 50
  scoreGlobal += points_forts.length * 15
  scoreGlobal -= points_faibles.length * 20
  scoreGlobal -= points_attention.length * 10
  scoreGlobal = Math.max(0, Math.min(100, scoreGlobal))

  // Économie potentielle
  const economiePotentielle = totalFrais > 1000 ? Math.floor(totalFrais * 0.4) : 0

  return {
    points_forts,
    points_attention,
    points_faibles,
    opportunites,
    economie_potentielle_annuelle: economiePotentielle,
    score_global: scoreGlobal,
  }
}
