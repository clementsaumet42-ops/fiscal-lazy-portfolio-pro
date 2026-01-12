'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PatrimoineCard } from '@/components/bilan/PatrimoineCard'
import { generateMockPlacementsFromBilan } from '@/lib/data/mock-audit'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, ArrowRight, TrendingUp, DollarSign } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function AuditAnalysePage() {
  const router = useRouter()
  const { bilan, audit, addPlacement } = useClientStore()

  useEffect(() => {
    // Generate mock placements from bilan if not already done
    if (bilan.patrimoine && (!audit.placements || audit.placements.length === 0)) {
      const mockPlacements = generateMockPlacementsFromBilan(bilan)
      mockPlacements.forEach(placement => addPlacement(placement))
    }
  }, [bilan, audit, addPlacement])

  const placements = audit.placements || []
  const totalMontant = placements.reduce((sum, p) => sum + p.montant, 0)
  const totalFrais = placements.reduce((sum, p) => sum + p.frais_annuels, 0)
  const rendementMoyen = placements.length > 0
    ? placements.reduce((sum, p) => sum + p.rendement_historique * p.montant, 0) / totalMontant
    : 0

  // Prepare pie chart data
  const pieData = placements.map(p => ({
    name: p.nom,
    value: p.montant,
    type: p.type,
  }))

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 Audit de l'Épargne</h1>
        <p className="text-gray-600">Étape 2/3 - Analyse automatique</p>
      </div>

      {/* Vue d'ensemble */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <PatrimoineCard
          titre="Patrimoine total"
          montant={totalMontant}
          icon="💰"
          variant="default"
        />
        <PatrimoineCard
          titre="Frais annuels"
          montant={totalFrais}
          details={`${((totalFrais / totalMontant) * 100).toFixed(2)}% du patrimoine`}
          icon="💸"
          variant="warning"
        />
        <PatrimoineCard
          titre="Rendement moyen"
          montant={rendementMoyen}
          details="Historique annualisé"
          icon="📈"
          variant="success"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Répartition par type de placement</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${((entry.value / totalMontant) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Score de qualité par placement</CardTitle>
            <CardDescription>Score sur 10</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {placements.map((placement) => (
                <div key={placement.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{placement.nom}</span>
                    <span className="font-bold">{placement.score_qualite}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        placement.score_qualite >= 7
                          ? 'bg-green-600'
                          : placement.score_qualite >= 5
                          ? 'bg-orange-600'
                          : 'bg-red-600'
                      }`}
                      style={{ width: `${(placement.score_qualite / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau récapitulatif */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Détail des placements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Placement</th>
                  <th className="text-left py-3 px-2">Établissement</th>
                  <th className="text-right py-3 px-2">Montant</th>
                  <th className="text-right py-3 px-2">Frais annuels</th>
                  <th className="text-right py-3 px-2">Rendement</th>
                  <th className="text-right py-3 px-2">Score</th>
                </tr>
              </thead>
              <tbody>
                {placements.map((placement) => (
                  <tr key={placement.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium">{placement.nom}</td>
                    <td className="py-3 px-2 text-gray-600">{placement.etablissement}</td>
                    <td className="py-3 px-2 text-right">{formatCurrency(placement.montant)}</td>
                    <td className="py-3 px-2 text-right text-orange-600">
                      {formatCurrency(placement.frais_annuels)}
                      <span className="text-xs ml-1">
                        ({((placement.frais_annuels / placement.montant) * 100).toFixed(2)}%)
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right text-green-600">
                      {placement.rendement_historique.toFixed(1)}%
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span
                        className={`px-2 py-1 rounded text-sm font-semibold ${
                          placement.score_qualite >= 7
                            ? 'bg-green-100 text-green-800'
                            : placement.score_qualite >= 5
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {placement.score_qualite}/10
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Info card */}
      <Card className="bg-blue-50 border-blue-200 mb-6">
        <CardContent className="py-4">
          <p className="text-sm text-blue-900">
            💡 L'analyse automatique a identifié {placements.length} placement(s). 
            Passez à l'étape suivante pour voir le diagnostic détaillé et les recommandations d'amélioration.
          </p>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.push('/client/audit/import')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour : Import
        </Button>
        <Button onClick={() => router.push('/client/audit/diagnostic')}>
          Suivant : Diagnostic
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
