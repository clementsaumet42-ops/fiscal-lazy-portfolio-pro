'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { 
  TrendingUp, DollarSign, CheckCircle, ArrowRight, Target,
  AlertCircle, Award, ArrowUpCircle, ArrowDownCircle
} from 'lucide-react'
import { DEMO_OPTIMISATION } from '@/lib/data/demo-audit'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']

export default function OptimisationProposeePage() {
  const router = useRouter()
  const { audit, setOptimisationAudit } = useClientStore()

  useEffect(() => {
    // Charger l'optimisation si elle n'existe pas
    if (!audit.optimisation) {
      setOptimisationAudit(DEMO_OPTIMISATION)
    }
  }, [audit.optimisation, setOptimisationAudit])

  if (!audit.optimisation) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Calcul de l'optimisation...</p>
          </div>
        </div>
      </div>
    )
  }

  const optimisation = audit.optimisation

  // Préparer les données pour les graphiques
  const allocationData = Object.entries(optimisation.nouvelle_allocation.allocation_globale).map(([name, value]) => ({
    name,
    value,
  }))

  const getPrioriteColor = (priorite: 'haute' | 'moyenne' | 'faible') => {
    switch (priorite) {
      case 'haute': return 'bg-red-100 text-red-800 border-red-200'
      case 'moyenne': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'faible': return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getImpactFiscalIcon = (impact: 'neutre' | 'positif' | 'negatif') => {
    switch (impact) {
      case 'positif': return <ArrowUpCircle className="w-4 h-4 text-green-600" />
      case 'neutre': return <ArrowRight className="w-4 h-4 text-gray-600" />
      case 'negatif': return <ArrowDownCircle className="w-4 h-4 text-red-600" />
    }
  }

  const getAssetLocationColor = (quality: 'optimal' | 'acceptable' | 'suboptimal') => {
    switch (quality) {
      case 'optimal': return 'bg-green-100 text-green-800'
      case 'acceptable': return 'bg-orange-100 text-orange-800'
      case 'suboptimal': return 'bg-red-100 text-red-800'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Optimisation Proposée
        </h1>
        <p className="text-gray-600">
          Recommandations personnalisées pour optimiser l'allocation, les frais et la fiscalité
        </p>
      </div>

      {/* Économies Principales */}
      <Card className="mb-6 border-2 border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <Award className="w-6 h-6" />
            Impact Total de l'Optimisation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Économie annuelle sur frais</div>
              <div className="text-3xl font-bold text-green-600">
                {optimisation.economies.economie_annuelle.toLocaleString('fr-FR')} €
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Économie sur 10 ans</div>
              <div className="text-3xl font-bold text-green-600">
                {optimisation.economies.economie_10ans_avec_interets.toLocaleString('fr-FR')} €
              </div>
              <div className="text-xs text-gray-500">Avec effet composé à 5%</div>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Gain fiscal estimé</div>
              <div className="text-3xl font-bold text-blue-600">
                {optimisation.economies.gain_fiscal_estime.toLocaleString('fr-FR')} €/an
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Impact patrimoine 10 ans</div>
              <div className="text-3xl font-bold text-purple-600">
                +{optimisation.economies.impact_patrimoine_10ans.toLocaleString('fr-FR')} €
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nouvelle Allocation */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Nouvelle Allocation Recommandée</CardTitle>
          <CardDescription>
            Allocation optimisée selon votre profil de risque et horizon d'investissement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {allocationData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allocationData.map((item: any, index: number) => (
              <div key={item.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-600">{item.value}%</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Allocation par Enveloppe */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Supports Recommandés par Enveloppe</CardTitle>
          <CardDescription>ETF et supports à privilégier dans chaque enveloppe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {optimisation.nouvelle_allocation.par_enveloppe.map((env: any, idx: number) => (
              <div key={idx} className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">{env.type}</h3>
                
                {env.supports_recommandes.length > 0 ? (
                  <div className="space-y-2">
                    {env.supports_recommandes.map((support: any, sidx: number) => (
                      <div key={sidx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div className="flex-1">
                          <div className="font-medium">{support.nom}</div>
                          <div className="text-sm text-gray-600">
                            {support.isin} • {support.type}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{support.montant.toLocaleString('fr-FR')} €</div>
                          <div className="text-sm text-green-600">Frais: {support.frais}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 italic">Enveloppe à clôturer ou transférer</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Asset Location */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Asset Location Optimale</CardTitle>
          <CardDescription>Placement fiscal optimal par classe d'actifs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            {optimisation.asset_location.regles.map((regle: any, idx: number) => (
              <div key={idx} className="p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{regle.classe_actif}</span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <Badge className="bg-green-100 text-green-800">{regle.enveloppe_optimale}</Badge>
                    </div>
                    <p className="text-sm text-gray-700">{regle.justification}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Matrice Asset Location */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Classe d'actif</th>
                  {Object.keys(optimisation.asset_location.matrice[Object.keys(optimisation.asset_location.matrice)[0]] || {}).map(env => (
                    <th key={env} className="border p-2 text-center">{env}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(optimisation.asset_location.matrice).map(([classe, enveloppes]: [string, any]) => (
                  <tr key={classe}>
                    <td className="border p-2 font-medium">{classe}</td>
                    {Object.entries(enveloppes as any).map(([env, quality]: [string, any]) => (
                      <td key={env} className="border p-2 text-center">
                        <Badge className={getAssetLocationColor(quality as any)}>
                          {quality}
                        </Badge>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Substitutions de Frais */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Optimisation des Frais - Substitutions ETF</CardTitle>
          <CardDescription>Remplacements recommandés pour réduire les frais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Support Actuel</th>
                  <th className="p-3 text-center">Frais</th>
                  <th className="p-3 text-center"></th>
                  <th className="p-3 text-left">ETF Recommandé</th>
                  <th className="p-3 text-center">Frais</th>
                  <th className="p-3 text-right">Économie/an</th>
                  <th className="p-3 text-right">Économie 10 ans</th>
                </tr>
              </thead>
              <tbody>
                {optimisation.substitutions_frais.map((sub: any, idx: number) => (
                  <tr key={idx} className="border-t">
                    <td className="p-3">
                      <div className="font-medium">{sub.support_actuel.nom}</div>
                      <div className="text-sm text-gray-600">
                        {sub.support_actuel.isin || 'N/A'} • {sub.support_actuel.montant.toLocaleString('fr-FR')} €
                      </div>
                    </td>
                    <td className="p-3 text-center text-red-600 font-semibold">
                      {sub.support_actuel.frais}%
                    </td>
                    <td className="p-3 text-center">
                      <ArrowRight className="w-5 h-5 text-gray-400 mx-auto" />
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{sub.support_recommande.nom}</div>
                      <div className="text-sm text-gray-600">
                        {sub.support_recommande.isin}
                      </div>
                    </td>
                    <td className="p-3 text-center text-green-600 font-semibold">
                      {sub.support_recommande.frais}%
                    </td>
                    <td className="p-3 text-right font-semibold text-green-600">
                      {sub.economie_annuelle.toLocaleString('fr-FR')} €
                    </td>
                    <td className="p-3 text-right font-semibold text-green-600">
                      {sub.economie_10ans.toLocaleString('fr-FR')} €
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 font-bold">
                <tr>
                  <td colSpan={5} className="p-3 text-right">Total Économies:</td>
                  <td className="p-3 text-right text-green-600">
                    {optimisation.economies.economie_annuelle.toLocaleString('fr-FR')} €/an
                  </td>
                  <td className="p-3 text-right text-green-600">
                    {optimisation.economies.economie_10ans_avec_interets.toLocaleString('fr-FR')} €
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Plan d'Action Priorisé */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Plan d'Action Priorisé
          </CardTitle>
          <CardDescription>Actions concrètes à réaliser, ordonnées par priorité</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {optimisation.plan_action.map((action: any, idx: number) => (
              <div 
                key={idx}
                className={`p-4 rounded-lg border-2 ${getPrioriteColor(action.priorite)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        Priorité: {action.priorite}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {action.enveloppe}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs">
                        {getImpactFiscalIcon(action.impact_fiscal)}
                        <span>Impact fiscal {action.impact_fiscal}</span>
                      </div>
                    </div>
                    <p className="font-semibold mb-2">{action.action}</p>
                    {action.economie > 0 && (
                      <p className="text-sm text-green-700 font-medium mb-1">
                        💰 Économie: {action.economie.toLocaleString('fr-FR')} €/an
                      </p>
                    )}
                    <p className="text-sm text-gray-700">{action.details}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Résumé des Frais */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Évolution des Frais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Frais annuels actuels</div>
              <div className="text-2xl font-bold text-red-600">
                {optimisation.economies.frais_annuels_avant.toLocaleString('fr-FR')} €
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Frais annuels après optimisation</div>
              <div className="text-2xl font-bold text-green-600">
                {optimisation.economies.frais_annuels_apres.toLocaleString('fr-FR')} €
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Réduction des frais</div>
              <div className="text-2xl font-bold text-blue-600">
                -{((optimisation.economies.economie_annuelle / optimisation.economies.frais_annuels_avant) * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={() => router.push('/client/analyse-existant')}
        >
          Retour à l'Analyse
        </Button>
        <Button
          size="lg"
          onClick={() => router.push('/')}
          className="flex items-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          Valider et Terminer
        </Button>
      </div>

      {/* Disclaimer */}
      <Card className="mt-6 border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-orange-900">
              <strong>Avertissement :</strong> Ces recommandations sont générées automatiquement et doivent être 
              validées par un expert-comptable. L'optimisation fiscale dépend de la situation personnelle de chaque client 
              et des réglementations en vigueur. Les économies estimées sont indicatives et peuvent varier.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
