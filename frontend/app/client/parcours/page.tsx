'use client'

import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ParcoursTimeline } from '@/components/layout/ParcoursTimeline'
import { PatrimoineCard } from '@/components/bilan/PatrimoineCard'
import { formatCurrency } from '@/lib/utils'
import { ArrowRight, FileText } from 'lucide-react'

export default function ParcoursPage() {
  const router = useRouter()
  const { bilan, audit, recommandations } = useClientStore()

  // Determine phase statuses
  const bilanCompleted = !!(bilan.situation && bilan.revenus && bilan.patrimoine && bilan.objectifs)
  const auditCompleted = !!(audit.analyse && audit.diagnostic)
  const recommandationsCompleted = !!recommandations.comparaison

  const phases = [
    {
      id: 'bilan',
      titre: 'Bilan Patrimonial',
      emoji: '📋',
      etapes: 4,
      href: '/client/bilan/situation',
      status: bilanCompleted ? 'completed' : 'in_progress' as const,
    },
    {
      id: 'audit',
      titre: 'Audit de l\'Épargne',
      emoji: '🔍',
      etapes: 3,
      href: '/client/audit/import',
      status: auditCompleted ? 'completed' : bilanCompleted ? 'in_progress' : 'pending' as const,
    },
    {
      id: 'allocation',
      titre: 'Allocation Optimisée',
      emoji: '🎯',
      etapes: 6,
      href: '/client/recommandations',
      status: recommandationsCompleted ? 'completed' : auditCompleted ? 'in_progress' : 'pending' as const,
    },
  ]

  // Calculate some stats if bilan exists
  let patrimoineTotal = 0
  let capaciteEpargne = 0
  
  if (bilan.patrimoine) {
    const { epargne_liquide, placements_financiers, autres_actifs } = bilan.patrimoine
    
    const liquidTotal = 
      epargne_liquide.livret_a +
      epargne_liquide.ldds +
      epargne_liquide.lep +
      epargne_liquide.comptes_courants
    
    const financierTotal =
      placements_financiers.pea.reduce((sum, p) => sum + p.montant, 0) +
      placements_financiers.cto.reduce((sum, p) => sum + p.montant, 0) +
      placements_financiers.assurance_vie.reduce((sum, p) => sum + p.montant, 0) +
      placements_financiers.per.reduce((sum, p) => sum + p.montant, 0)
    
    const autresTotal =
      autres_actifs.crypto +
      autres_actifs.or_metaux_precieux +
      (autres_actifs.entreprise_valorisation || 0) +
      autres_actifs.autres
    
    patrimoineTotal = liquidTotal + financierTotal + autresTotal
  }
  
  if (bilan.revenus) {
    capaciteEpargne = bilan.revenus.capacite_epargne_mensuelle
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Parcours Client Professionnel
        </h1>
        <p className="text-gray-600">
          Suivez les 3 phases du parcours complet : Bilan → Audit → Allocation
        </p>
      </div>

      {/* Client info if bilan exists */}
      {bilan.situation && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {bilan.situation.prenom} {bilan.situation.nom}
            </CardTitle>
            <CardDescription>
              {bilan.situation.age} ans • {bilan.situation.situation_professionnelle}
              {bilan.situation.profession && ` • ${bilan.situation.profession}`}
            </CardDescription>
          </CardHeader>
          {(patrimoineTotal > 0 || capaciteEpargne > 0) && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patrimoineTotal > 0 && (
                  <PatrimoineCard
                    titre="Patrimoine total"
                    montant={patrimoineTotal}
                    icon="💰"
                    variant="default"
                  />
                )}
                {capaciteEpargne > 0 && (
                  <PatrimoineCard
                    titre="Capacité d'épargne mensuelle"
                    montant={capaciteEpargne}
                    icon="📈"
                    variant="success"
                  />
                )}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Timeline */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Progression du parcours</h2>
        <ParcoursTimeline phases={phases} />
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
          <CardDescription>
            Accédez directement aux différentes sections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!bilanCompleted && (
              <Button
                variant="default"
                size="lg"
                className="w-full justify-between"
                onClick={() => router.push('/client/bilan/situation')}
              >
                <span>📋 Compléter le bilan</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            
            {bilanCompleted && !auditCompleted && (
              <Button
                variant="default"
                size="lg"
                className="w-full justify-between"
                onClick={() => router.push('/client/audit/import')}
              >
                <span>🔍 Démarrer l'audit</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            
            {auditCompleted && !recommandationsCompleted && (
              <Button
                variant="default"
                size="lg"
                className="w-full justify-between"
                onClick={() => router.push('/client/recommandations')}
              >
                <span>🎯 Voir les recommandations</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            
            {bilanCompleted && (
              <Button
                variant="outline"
                size="lg"
                className="w-full justify-between"
                onClick={() => router.push('/client/profil')}
              >
                <span>Workflow classique</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            
            {recommandationsCompleted && (
              <Button
                variant="outline"
                size="lg"
                className="w-full justify-between"
                onClick={() => router.push('/client/rapport')}
              >
                <span><FileText className="w-4 h-4 inline mr-2" />Générer le rapport</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info card */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <p className="text-sm text-blue-900">
            💡 <strong>Conseil :</strong> Complétez les phases dans l'ordre pour une analyse optimale. 
            Vos données sont automatiquement sauvegardées.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
