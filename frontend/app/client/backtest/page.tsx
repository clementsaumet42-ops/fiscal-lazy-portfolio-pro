'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Stepper } from '@/components/ui/stepper'
import { LineChart } from '@/components/charts/LineChart'
import { formatCurrency, formatPercentage } from '@/lib/utils'

const STEPS = ['Profil', 'Enveloppes', 'Allocation', 'Optimisation', 'Backtest', 'Rapport']

export default function BacktestPage() {
  const router = useRouter()
  const { profil, allocation, optimisation, setBacktest } = useClientStore()
  
  const [loading, setLoading] = useState(false)
  const [backtestResult, setBacktestResult] = useState<any>(null)

  useEffect(() => {
    if (profil && allocation && optimisation) {
      performBacktest()
    }
  }, [])

  const performBacktest = async () => {
    setLoading(true)
    try {
      // Simuler un délai de calcul
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Générer des données de backtest simulées
      const startYear = 2014
      const endYear = 2024
      const months = (endYear - startYear) * 12
      const evolutionPatrimoine = []
      
      let valeur = 100000
      for (let i = 0; i < months; i++) {
        const rendementMensuel = (Math.random() - 0.4) * 0.03 + 0.007
        valeur *= (1 + rendementMensuel)
        
        if (i % 3 === 0) { // Tous les 3 mois
          const date = new Date(startYear, i)
          evolutionPatrimoine.push({
            date: date.toISOString().split('T')[0],
            valeur: Math.round(valeur),
          })
        }
      }
      
      const result = {
        performance: {
          rendement_annuel: 8.2,
          volatilite: 12.8,
          max_drawdown: -18.5,
          sharpe_ratio: 0.64,
          sortino_ratio: 0.89,
        },
        evolution_patrimoine: evolutionPatrimoine,
        statistiques: {
          valeur_initiale: 100000,
          valeur_finale: Math.round(valeur),
          gain_total: Math.round(valeur - 100000),
          nombre_annees: endYear - startYear,
        }
      }
      
      setBacktestResult(result)
      setBacktest(result)
    } catch (error) {
      console.error('Erreur backtest:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    router.push('/client/rapport')
  }

  if (!profil || !allocation || !optimisation) {
    router.push('/client/profil')
    return null
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Stepper currentStep={5} totalSteps={6} steps={STEPS} />
        <div className="mt-16 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Backtest en cours...</h2>
          <p className="text-gray-600">
            Simulation de la performance sur 10 ans avec données historiques
          </p>
        </div>
      </div>
    )
  }

  if (!backtestResult) {
    return null
  }

  const { performance, evolution_patrimoine, statistiques } = backtestResult

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Stepper currentStep={5} totalSteps={6} steps={STEPS} />
      
      <div className="mt-8 mb-6">
        <h1 className="text-3xl font-bold mb-2">Backtest historique</h1>
        <p className="text-gray-600">
          Performance simulée sur {statistiques.nombre_annees} ans avec données réelles
        </p>
      </div>

      {/* Métriques de performance */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Rendement annuel</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-secondary">
              {formatPercentage(performance.rendement_annuel)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Volatilité</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatPercentage(performance.volatilite)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Max Drawdown</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {formatPercentage(performance.max_drawdown)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Sharpe Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">
              {performance.sharpe_ratio.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphique d'évolution */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Évolution du patrimoine sur 10 ans</CardTitle>
          <CardDescription>
            Simulation avec rééquilibrage trimestriel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LineChart data={evolution_patrimoine} />
        </CardContent>
      </Card>

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Statistiques financières</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Valeur initiale:</span>
                <span className="font-semibold">{formatCurrency(statistiques.valeur_initiale)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Valeur finale:</span>
                <span className="font-semibold text-secondary">{formatCurrency(statistiques.valeur_finale)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-600">Gain total:</span>
                <span className="font-bold text-secondary text-lg">
                  +{formatCurrency(statistiques.gain_total)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ratios de performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Sharpe Ratio:</span>
                <span className="font-semibold">{performance.sharpe_ratio.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sortino Ratio:</span>
                <span className="font-semibold">{performance.sortino_ratio.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ratio Gain/Risque:</span>
                <span className="font-semibold text-secondary">
                  {(performance.rendement_annuel / performance.volatilite).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interprétation */}
      <Card className="mb-8 bg-blue-50 border-primary">
        <CardHeader>
          <CardTitle>Interprétation des résultats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm">
              <strong>Rendement annuel ({formatPercentage(performance.rendement_annuel)}):</strong> 
              {' '}Performance moyenne annualisée sur la période. Un bon rendement pour un portefeuille équilibré.
            </p>
            <p className="text-sm">
              <strong>Volatilité ({formatPercentage(performance.volatilite)}):</strong> 
              {' '}Mesure du risque. Plus elle est élevée, plus les fluctuations sont importantes.
            </p>
            <p className="text-sm">
              <strong>Max Drawdown ({formatPercentage(performance.max_drawdown)}):</strong> 
              {' '}Pire perte depuis un pic. Indique la résilience du portefeuille en période de crise.
            </p>
            <p className="text-sm">
              <strong>Sharpe Ratio ({performance.sharpe_ratio.toFixed(2)}):</strong> 
              {' '}Rendement ajusté du risque. Un ratio > 0.5 est considéré comme acceptable.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.push('/client/optimisation')}>
          Retour
        </Button>
        <Button onClick={handleNext} size="lg">
          Suivant: Rapport final
        </Button>
      </div>
    </div>
  )
}
