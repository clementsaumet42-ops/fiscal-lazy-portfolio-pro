'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Stepper } from '@/components/ui/stepper'
import { PieChart } from '@/components/charts/PieChart'
import { Allocation } from '@/lib/types'
import { validateAllocation, getTotalAllocation, formatPercentage } from '@/lib/utils'

const STEPS = ['Profil', 'Enveloppes', 'Allocation', 'Optimisation', 'Backtest', 'Rapport']

const ASSET_CLASSES = [
  { key: 'actions_monde', label: 'Actions Monde', description: 'ETF MSCI World, S&P 500' },
  { key: 'actions_europe', label: 'Actions Europe', description: 'ETF Euro Stoxx 50, MSCI Europe' },
  { key: 'obligations', label: 'Obligations', description: 'Obligations gouvernementales et corporate' },
  { key: 'immobilier', label: 'Immobilier (REITs)', description: 'Sociétés foncières cotées' },
  { key: 'cash', label: 'Cash / Monétaire', description: 'Fonds monétaires, liquidités' },
]

export default function AllocationPage() {
  const router = useRouter()
  const { profil, enveloppes, setAllocation } = useClientStore()
  
  const [allocation, setAllocationState] = useState<Allocation>({
    actions_monde: 40,
    actions_europe: 20,
    obligations: 25,
    immobilier: 10,
    cash: 5,
  })

  const [etfs, setEtfs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Fetch ETFs from API
    const fetchEtfs = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/providers/universe/etfs`)
        const data = await response.json()
        if (data.success) {
          setEtfs(data.etfs || [])
        }
      } catch (error) {
        console.error('Error fetching ETFs:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchEtfs()
  }, [])

  const handleSliderChange = (key: keyof Allocation, value: number) => {
    setAllocationState(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = () => {
    const total = getTotalAllocation(allocation)
    if (Math.abs(total - 100) > 0.5) {
      alert(`L'allocation totale doit être égale à 100% (actuellement ${total.toFixed(1)}%)`)
      return
    }
    setAllocation(allocation)
    router.push('/client/optimisation')
  }

  const total = getTotalAllocation(allocation)
  const isValid = Math.abs(total - 100) < 0.5

  // Préparer les données pour le graphique
  const chartData = ASSET_CLASSES.map(asset => ({
    name: asset.label,
    value: allocation[asset.key as keyof Allocation],
  })).filter(item => item.value > 0)

  useEffect(() => {
    if (!profil || enveloppes.length === 0) {
      router.push('/client/profil')
    }
  }, [profil, enveloppes, router])

  if (!profil || enveloppes.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight to-midnight-light">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Allocation <span className="text-gold">d'Actifs</span>
          </h1>
          <p className="text-cream/70 text-lg">
            Définissez la répartition de votre portefeuille entre les différentes classes d'actifs
          </p>
        </div>

        <Stepper currentStep={3} totalSteps={6} steps={STEPS} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 mb-8">
          {/* Sliders */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Répartition des actifs</CardTitle>
                <CardDescription>
                  Ajustez les curseurs pour définir votre allocation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {ASSET_CLASSES.map((asset: any) => (
                  <div key={asset.key}>
                    <div className="flex justify-between mb-2">
                      <div>
                        <label className="text-sm font-medium text-white">{asset.label}</label>
                        <p className="text-xs text-cream/60">{asset.description}</p>
                      </div>
                      <span className="text-lg font-bold text-gold">
                        {formatPercentage(allocation[asset.key as keyof Allocation])}
                      </span>
                    </div>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={allocation[asset.key as keyof Allocation]}
                      onValueChange={(value) => handleSliderChange(asset.key as keyof Allocation, value)}
                    />
                  </div>
                ))}
                
                <div className="pt-4 border-t border-midnight-lighter">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white">Total:</span>
                    <span className={`text-2xl font-bold ${isValid ? 'text-gold' : 'text-red-400'}`}>
                      {formatPercentage(total)}
                    </span>
                  </div>
                  {!isValid && (
                    <p className="text-sm text-red-400 mt-2">
                      ⚠️ L'allocation doit totaliser 100%
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Graphique */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Visualisation</CardTitle>
                <CardDescription>
                  Aperçu graphique de votre allocation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PieChart data={chartData} />
              </CardContent>
            </Card>

            {/* ETFs suggérés */}
            <Card>
              <CardHeader>
                <CardTitle>ETFs suggérés</CardTitle>
                <CardDescription>
                  Exemples d'ETFs pour chaque classe d'actifs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-cream/60 text-sm">Chargement des ETFs...</p>
                ) : etfs.length > 0 ? (
                  <div className="space-y-3">
                    {etfs.slice(0, 5).map((etf: any, index: number) => (
                      <div key={index} className="border-b border-midnight-lighter pb-2">
                        <p className="font-medium text-sm text-white">{etf.nom}</p>
                        <div className="flex justify-between text-xs text-cream/60 mt-1">
                          <span>{etf.ticker}</span>
                          <span className={etf.eligible_pea ? 'text-gold' : 'text-cream/50'}>
                            {etf.eligible_pea ? '✓ PEA' : 'CTO'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-cream/60 text-sm">Aucun ETF disponible</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => router.push('/client/enveloppes')}>
            ← Retour
          </Button>
          <Button onClick={handleSubmit} size="lg" variant="gold" disabled={!isValid}>
            Suivant: Optimisation fiscale →
          </Button>
        </div>
      </div>
    </div>
  )
}
