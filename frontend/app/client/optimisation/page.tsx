'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Stepper } from '@/components/ui/stepper'
import { BarChart } from '@/components/charts/BarChart'
import { PieChart } from '@/components/charts/PieChart'
import { formatCurrency, formatPercentage } from '@/lib/utils'

const STEPS = ['Profil', 'Enveloppes', 'Allocation', 'Optimisation', 'Backtest', 'Rapport']

export default function OptimisationPage() {
  const router = useRouter()
  const { profil, enveloppes, allocation, setOptimisation } = useClientStore()
  
  const [loading, setLoading] = useState(false)
  const [optimisationResult, setOptimisationResult] = useState<any>(null)

  useEffect(() => {
    if (profil && allocation && enveloppes.length > 0) {
      // Simuler l'appel API d'optimisation
      performOptimization()
    }
  }, [])

  const performOptimization = async () => {
    setLoading(true)
    try {
      // Simuler un délai d'optimisation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Résultats simulés pour la démo
      const result = {
        allocation_optimisee: {
          PEA: {
            actions_monde: 50,
            actions_europe: 30,
            obligations: 20,
          },
          CTO: {
            actions_monde: 30,
            obligations: 40,
            immobilier: 20,
            cash: 10,
          },
        },
        fiscalite_estimee: {
          impot_annuel: 2500,
          economie_vs_cto_pur: 4200,
          taux_effectif: 12.5,
        },
      }
      
      setOptimisationResult(result)
      setOptimisation(result)
    } catch (error) {
      console.error('Erreur optimisation:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    router.push('/client/backtest')
  }

  useEffect(() => {
    if (!profil || !allocation || enveloppes.length === 0) {
      router.push('/client/profil')
    }
  }, [profil, allocation, enveloppes, router])

  if (!profil || !allocation || enveloppes.length === 0) {
    return null
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Stepper currentStep={4} totalSteps={6} steps={STEPS} />
        <div className="mt-16 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Optimisation en cours...</h2>
          <p className="text-gray-600">
            Calcul de l'allocation fiscalement optimale
          </p>
        </div>
      </div>
    )
  }

  if (!optimisationResult) {
    return null
  }

  // Préparer les données pour les graphiques
  const fiscaliteData = [
    {
      name: 'Avant',
      avant: 6700,
      apres: 0,
    },
    {
      name: 'Après',
      avant: 0,
      apres: 2500,
    },
  ]

  const allocationPEA = Object.entries(optimisationResult.allocation_optimisee.PEA || {}).map(([key, value]) => ({
    name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: value as number,
  }))

  const allocationCTO = Object.entries(optimisationResult.allocation_optimisee.CTO || {}).map(([key, value]) => ({
    name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: value as number,
  }))

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Stepper currentStep={4} totalSteps={6} steps={STEPS} />
      
      <div className="mt-8 mb-6">
        <h1 className="text-3xl font-bold mb-2">Optimisation fiscale</h1>
        <p className="text-gray-600">
          Votre allocation a été optimisée pour minimiser l'impôt
        </p>
      </div>

      {/* Métriques clés */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-secondary-50 border-secondary">
          <CardHeader>
            <CardTitle className="text-secondary">Économie fiscale</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-secondary">
              {formatCurrency(optimisationResult.fiscalite_estimee.economie_vs_cto_pur)}
            </p>
            <p className="text-sm text-gray-600 mt-1">vs CTO pur (par an)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Impôt annuel estimé</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatCurrency(optimisationResult.fiscalite_estimee.impot_annuel)}
            </p>
            <p className="text-sm text-gray-600 mt-1">après optimisation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Taux effectif</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatPercentage(optimisationResult.fiscalite_estimee.taux_effectif)}
            </p>
            <p className="text-sm text-gray-600 mt-1">sur les gains</p>
          </CardContent>
        </Card>
      </div>

      {/* Comparaison avant/après */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Impact fiscal sur 1 an</CardTitle>
          <CardDescription>
            Comparaison de l'impôt avant et après optimisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BarChart data={fiscaliteData} />
        </CardContent>
      </Card>

      {/* Allocation par enveloppe */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {optimisationResult.allocation_optimisee.PEA && (
          <Card>
            <CardHeader>
              <CardTitle>PEA - Plan d'Épargne en Actions</CardTitle>
              <CardDescription>
                Allocation recommandée dans le PEA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PieChart data={allocationPEA} />
              <div className="mt-4 p-4 bg-secondary-50 rounded-lg">
                <p className="text-sm text-secondary font-medium">
                  ✓ Optimisé pour l'exonération fiscale après 5 ans
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {optimisationResult.allocation_optimisee.CTO && (
          <Card>
            <CardHeader>
              <CardTitle>CTO - Compte-Titres Ordinaire</CardTitle>
              <CardDescription>
                Allocation recommandée dans le CTO
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PieChart data={allocationCTO} />
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-primary font-medium">
                  ℹ Diversification internationale et obligations
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Explication */}
      <Card className="mb-8 bg-gray-50">
        <CardHeader>
          <CardTitle>Comment ça fonctionne ?</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-secondary mr-2">✓</span>
              <span className="text-sm">
                <strong>PEA:</strong> Priorité aux actions européennes pour profiter de l'exonération fiscale
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-secondary mr-2">✓</span>
              <span className="text-sm">
                <strong>CTO:</strong> Obligations et actifs internationaux pour diversifier
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-secondary mr-2">✓</span>
              <span className="text-sm">
                <strong>Économie:</strong> {formatCurrency(optimisationResult.fiscalite_estimee.economie_vs_cto_pur)} 
                d'impôt économisé par an vs un portefeuille 100% CTO
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.push('/client/allocation')}>
          Retour
        </Button>
        <Button onClick={handleNext} size="lg">
          Suivant: Backtest
        </Button>
      </div>
    </div>
  )
}
