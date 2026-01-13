'use client'

import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, ArrowRight, TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function RecommandationsPage() {
  const router = useRouter()
  const { audit } = useClientStore()

  const placements = audit.placements || []
  const diagnostic = audit.diagnostic

  if (placements.length === 0 || !diagnostic) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Audit requis</h2>
            <p className="text-gray-600 mb-4">
              Complétez d'abord l'audit de votre épargne pour accéder aux recommandations.
            </p>
            <Button onClick={() => router.push('/client/audit/import')}>
              Démarrer l'audit
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Mock comparison data
  const totalMontantAvant = placements.reduce((sum: number, p: any) => sum + p.montant, 0)
  const totalFraisAvant = placements.reduce((sum: number, p: any) => sum + p.frais_annuels, 0)
  const totalFraisApres = totalFraisAvant * 0.6 // 40% reduction
  const economieAnnuelle = totalFraisAvant - totalFraisApres

  const scoreDiversificationAvant = 60
  const scoreDiversificationApres = 85
  const scoreFiscaliteAvant = 65
  const scoreFiscaliteApres = 90

  // Chart data
  const comparisonData = [
    {
      name: 'Frais',
      avant: totalFraisAvant,
      apres: totalFraisApres,
    },
    {
      name: 'Score Diversif.',
      avant: scoreDiversificationAvant,
      apres: scoreDiversificationApres,
    },
    {
      name: 'Score Fiscalité',
      avant: scoreFiscaliteAvant,
      apres: scoreFiscaliteApres,
    },
  ]

  // Mock actions
  const actions = [
    {
      id: '1',
      priorite: 'haute' as const,
      titre: 'Réduire les frais d\'assurance-vie',
      description: 'Transférer votre assurance-vie vers un contrat en ligne à frais réduits',
      economie: Math.floor(totalFraisAvant * 0.25),
      difficulte: 'moyenne' as const,
      impact: 'Économie de frais significative sur le long terme',
    },
    {
      id: '2',
      priorite: 'haute' as const,
      titre: 'Maximiser l\'utilisation du PEA',
      description: 'Augmenter vos versements sur le PEA pour bénéficier de l\'exonération fiscale',
      economie: Math.floor(totalMontantAvant * 0.05 * 0.30 * 0.17),
      difficulte: 'facile' as const,
      impact: 'Optimisation fiscale importante',
    },
    {
      id: '3',
      priorite: 'moyenne' as const,
      titre: 'Diversifier avec des ETF low-cost',
      description: 'Remplacer les fonds actifs par des ETF passifs (TER < 0.3%)',
      economie: Math.floor(totalFraisAvant * 0.15),
      difficulte: 'facile' as const,
      impact: 'Réduction des frais et meilleure performance',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🎯 Recommandations Personnalisées</h1>
        <p className="text-gray-600">Plan d'action pour optimiser votre patrimoine</p>
      </div>

      {/* Économie potentielle totale */}
      <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-10 h-10 text-green-600" />
              <div>
                <h2 className="text-2xl font-bold text-green-900">
                  {formatCurrency(economieAnnuelle)} / an
                </h2>
                <p className="text-green-700">
                  Économie potentielle en appliquant nos recommandations
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-green-900">
                {formatCurrency(economieAnnuelle * 10)}
              </div>
              <div className="text-sm text-green-700">sur 10 ans</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparaison avant/après */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Comparaison Avant / Après</CardTitle>
          <CardDescription>
            Impact des optimisations recommandées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Avant */}
            <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
              <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                Situation actuelle
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Frais annuels :</span>
                  <span className="font-bold text-red-700">{formatCurrency(totalFraisAvant)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Score diversification :</span>
                  <span className="font-bold">{scoreDiversificationAvant}/100</span>
                </div>
                <div className="flex justify-between">
                  <span>Score fiscalité :</span>
                  <span className="font-bold">{scoreFiscaliteAvant}/100</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span>Score global :</span>
                  <span className="font-bold text-lg">{diagnostic.score_global}/100</span>
                </div>
              </div>
            </div>

            {/* Après */}
            <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
              <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Après optimisation
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Frais annuels :</span>
                  <span className="font-bold text-green-700">{formatCurrency(totalFraisApres)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Score diversification :</span>
                  <span className="font-bold">{scoreDiversificationApres}/100</span>
                </div>
                <div className="flex justify-between">
                  <span>Score fiscalité :</span>
                  <span className="font-bold">{scoreFiscaliteApres}/100</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span>Score global :</span>
                  <span className="font-bold text-lg text-green-700">
                    {Math.min(100, diagnostic.score_global + 25)}/100
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avant" fill="#ef4444" name="Avant" />
              <Bar dataKey="apres" fill="#10b981" name="Après" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Plan d'action */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Plan d'action prioritaire</CardTitle>
          <CardDescription>
            {actions.length} actions recommandées pour optimiser votre patrimoine
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {actions.map((action: any, index: number) => (
              <div
                key={action.id}
                className={`border-2 rounded-lg p-4 ${
                  action.priorite === 'haute'
                    ? 'border-red-200 bg-red-50'
                    : 'border-orange-200 bg-orange-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-300 font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-lg">{action.titre}</h4>
                        <Badge
                          variant={action.priorite === 'haute' ? 'destructive' : 'default'}
                        >
                          {action.priorite === 'haute' ? 'Prioritaire' : 'Important'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{action.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium text-green-700">
                          💰 {formatCurrency(action.economie)} / an
                        </span>
                        <span className="text-gray-600">
                          Difficulté : {action.difficulte}
                        </span>
                      </div>
                    </div>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-gray-400 hover:text-green-600 cursor-pointer transition-colors" />
                </div>
                <div className="ml-11 mt-2 p-2 bg-white rounded text-xs text-gray-600">
                  💡 {action.impact}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next steps */}
      <Card className="mb-8 bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Étapes suivantes</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Validez les actions qui vous conviennent</li>
            <li>Consultez votre conseiller pour la mise en œuvre</li>
            <li>Générez un rapport complet pour garder trace de l'analyse</li>
          </ul>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.push('/client/audit/diagnostic')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour : Diagnostic
        </Button>
        <Button onClick={() => router.push('/client/rapport')}>
          Générer le rapport PDF
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
