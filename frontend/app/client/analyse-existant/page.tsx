'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { 
  TrendingUp, DollarSign, AlertTriangle, CheckCircle, 
  TrendingDown, Package, ArrowRight 
} from 'lucide-react'
import { DEMO_ANALYSE } from '@/lib/data/demo-audit'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']

export default function AnalyseExistantPage() {
  const router = useRouter()
  const { audit, setAnalyse } = useClientStore()

  useEffect(() => {
    // Charger l'analyse si elle n'existe pas
    if (!audit.analyse) {
      // Utiliser les données de démo pour le MVP
      setAnalyse(DEMO_ANALYSE)
    }
  }, [audit.analyse, setAnalyse])

  if (!audit.analyse) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Analyse en cours...</p>
          </div>
        </div>
      </div>
    )
  }

  const analyse = audit.analyse

  // Préparer les données pour les graphiques
  const allocationData = Object.entries(analyse.allocation_globale).map(([name, data]: [string, any]) => ({
    name,
    value: data.pourcentage,
    montant: data.montant,
  }))

  const enveloppeData = analyse.par_enveloppe.map((env: any) => ({
    name: env.type,
    montant: env.montant,
  }))

  const getSeverityColor = (severite: 'faible' | 'moyen' | 'eleve') => {
    switch (severite) {
      case 'eleve': return 'bg-red-100 text-red-800 border-red-200'
      case 'moyen': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'faible': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const getSeverityIcon = (severite: 'faible' | 'moyen' | 'eleve') => {
    switch (severite) {
      case 'eleve': return '🔴'
      case 'moyen': return '🟠'
      case 'faible': return '🟡'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Analyse de l'Épargne Existante
        </h1>
        <p className="text-gray-600">
          Vue d'ensemble consolidée et analyse détaillée du portefeuille actuel
        </p>
      </div>

      {/* Vue d'ensemble */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Montant Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {analyse.vue_ensemble.montant_total.toLocaleString('fr-FR')} €
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {analyse.vue_ensemble.nombre_enveloppes} enveloppe(s)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Performance Moyenne
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{analyse.vue_ensemble.performance_moyenne.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Sur 12 mois
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Frais Annuels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {analyse.vue_ensemble.frais_annuels_total.toLocaleString('fr-FR')} €
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {((analyse.vue_ensemble.frais_annuels_total / analyse.vue_ensemble.montant_total) * 100).toFixed(2)}% du total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Points à Améliorer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {analyse.points_amelioration.length}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Détectés
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Allocation Globale */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Allocation Globale par Classe d'Actifs</CardTitle>
            <CardDescription>Répartition actuelle du portefeuille</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {allocationData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name, props: any) => [
                      `${value.toFixed(1)}% (${props.payload.montant.toLocaleString('fr-FR')} €)`,
                      name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {allocationData.map((item: any, index: number) => (
                <div key={item.name} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-semibold">
                    {item.montant.toLocaleString('fr-FR')} € ({item.value.toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par Enveloppe</CardTitle>
            <CardDescription>Montants par enveloppe fiscale</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enveloppeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => `${value.toLocaleString('fr-FR')} €`}
                  />
                  <Bar dataKey="montant" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Détail par Enveloppe */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Détail par Enveloppe</CardTitle>
          <CardDescription>Allocation et frais pour chaque enveloppe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {analyse.par_enveloppe.map((env: any, idx: number) => (
              <div key={idx} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{env.type}</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {env.montant.toLocaleString('fr-FR')} €
                    </p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {((env.montant / analyse.vue_ensemble.montant_total) * 100).toFixed(1)}% du total
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2 text-sm text-gray-600">Allocation:</h4>
                    <div className="space-y-1">
                      {Object.entries(env.allocation).map(([classe, montant]: [string, any]) => (
                        <div key={classe} className="flex justify-between text-sm">
                          <span>{classe}</span>
                          <span className="font-medium">{montant.toLocaleString('fr-FR')} €</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 text-sm text-gray-600">Frais annuels:</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Gestion</span>
                        <span className="font-medium">{env.frais.gestion}%</span>
                      </div>
                      {env.frais.uc > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Unités de compte</span>
                          <span className="font-medium">{env.frais.uc}%</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-semibold border-t pt-1 mt-2">
                        <span>Total</span>
                        <span className="text-red-600">{env.frais.total} €/an</span>
                      </div>
                    </div>
                  </div>
                </div>

                {env.supports.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2 text-sm text-gray-600">Supports:</h4>
                    <div className="space-y-1">
                      {env.supports.map((support: any, sidx: number) => (
                        <div key={sidx} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                          <span>{support.nom} {support.isin && `(${support.isin})`}</span>
                          <span className="font-medium">
                            {support.montant.toLocaleString('fr-FR')} € • {support.frais}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Points d'Amélioration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Points d'Amélioration Détectés
          </CardTitle>
          <CardDescription>Optimisations recommandées</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analyse.points_amelioration.map((point: any, idx: number) => (
              <div 
                key={idx}
                className={`p-4 rounded-lg border-2 ${getSeverityColor(point.severite)}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getSeverityIcon(point.severite)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {point.type.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Sévérité: {point.severite}
                      </Badge>
                    </div>
                    <p className="font-medium mb-1">{point.description}</p>
                    <p className="text-sm">
                      Enveloppes concernées: {point.enveloppes_concernees.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparaison Frais */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Analyse des Frais</CardTitle>
          <CardDescription>Comparaison avec le marché ETF</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">Frais actuels annuels</div>
                <div className="text-2xl font-bold text-red-600">
                  {analyse.vue_ensemble.frais_annuels_total.toLocaleString('fr-FR')} €
                </div>
                <div className="text-sm text-gray-600">
                  {((analyse.vue_ensemble.frais_annuels_total / analyse.vue_ensemble.montant_total) * 100).toFixed(2)}% du portefeuille
                </div>
              </div>
              <TrendingDown className="w-12 h-12 text-red-600" />
            </div>

            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">Moyenne marché ETF</div>
                <div className="text-2xl font-bold text-green-600">
                  {(analyse.vue_ensemble.montant_total * 0.0025).toLocaleString('fr-FR')} €
                </div>
                <div className="text-sm text-gray-600">0.20-0.30% du portefeuille</div>
              </div>
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span className="font-semibold text-orange-900">Potentiel d'économie</span>
              </div>
              <p className="text-sm text-orange-900">
                En optimisant vers des ETF à bas frais, vous pourriez économiser environ{' '}
                <strong>
                  {(analyse.vue_ensemble.frais_annuels_total - analyse.vue_ensemble.montant_total * 0.0025).toLocaleString('fr-FR')} €/an
                </strong>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={() => router.push('/client/import-releves')}
        >
          Retour
        </Button>
        <Button
          size="lg"
          onClick={() => router.push('/client/optimisation-proposee')}
          className="flex items-center gap-2"
        >
          Voir l'Optimisation Proposée
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
