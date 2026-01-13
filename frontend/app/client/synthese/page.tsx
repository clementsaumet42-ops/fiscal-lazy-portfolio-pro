'use client'

import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatPercentage, getTMIColor, calculateAge } from '@/lib/utils/assessment/helpers'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { TrendingUp, DollarSign, Shield, FileText, Download, Target } from 'lucide-react'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function SynthesePage() {
  const router = useRouter()
  const { assessment, getPatrimoineBrut, getPatrimoineNet, getAllocation } = useClientStore()
  
  const patrimoineBrut = getPatrimoineBrut()
  const patrimoineNet = getPatrimoineNet()
  const passifs = patrimoineBrut - patrimoineNet
  const allocation = getAllocation()

  // Prepare data for pie chart
  const allocationData = [
    { name: 'Liquidités', value: allocation.liquidites, color: COLORS[0] },
    { name: 'Immobilier', value: allocation.immobilier, color: COLORS[1] },
    { name: 'Assurance-Vie', value: allocation.assurance_vie, color: COLORS[2] },
    { name: 'Bourse', value: allocation.enveloppes_boursieres, color: COLORS[3] },
    { name: 'Sociétés IS', value: allocation.societes_is, color: COLORS[4] },
    { name: 'Autres', value: allocation.autres_actifs, color: COLORS[5] },
  ].filter(item => item.value > 0)

  // Calculate percentages
  const calculatePercentageAllocation = (value: number) => {
    if (patrimoineBrut === 0) return 0
    return (value / patrimoineBrut) * 100
  }

  // Fiscal summary
  const age = assessment.bilan_civil ? calculateAge(assessment.bilan_civil.date_naissance) : 0
  const tmi = assessment.bilan_fiscal?.tmi || 0
  const ir = assessment.bilan_fiscal?.ir_annee_precedente || 0
  const ifi = assessment.bilan_fiscal?.ifi_du || 0

  // Estate planning summary
  const hasTestament = assessment.bilan_successoral?.testament_existe || false
  const donationsCount = assessment.bilan_successoral?.donations_realisees.length || 0
  const totalDonations = assessment.bilan_successoral?.donations_realisees.reduce((sum, d) => sum + d.abattement_utilise, 0) || 0
  const abattementRestant = Math.max(0, 100000 - totalDonations) // Simplified calculation

  return (
    <div className="min-h-screen bg-midnight">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            📊 Synthèse Patrimoniale
          </h1>
          <p className="text-cream/70 text-lg">
            Étape 11/11 - Vue d'ensemble de votre situation
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-midnight-lighter rounded-full h-2">
            <div className="bg-gold h-2 rounded-full transition-all duration-300" style={{ width: '100%' }}></div>
          </div>
          <p className="text-cream/70 text-sm mt-2">Progression: 11 sur 11 étapes ✅</p>
        </div>

        {/* Section 1: Vue d'ensemble */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-gold/30 to-gold/10 border-gold">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cream/70 text-sm mb-1">Patrimoine Brut</p>
                  <p className="text-3xl font-bold text-gold">{formatCurrency(patrimoineBrut)}</p>
                </div>
                <DollarSign className="w-12 h-12 text-gold/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-midnight-light border-midnight-lighter">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cream/70 text-sm mb-1">Passifs (Dettes)</p>
                  <p className="text-3xl font-bold text-red-400">{formatCurrency(passifs)}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-cream/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-green-500/10 border-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cream/70 text-sm mb-1">Patrimoine Net</p>
                  <p className="text-3xl font-bold text-green-400">{formatCurrency(patrimoineNet)}</p>
                </div>
                <Shield className="w-12 h-12 text-green-400/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section 2: Graphique d'allocation */}
        <Card className="bg-midnight-light border-midnight-lighter mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-6 h-6 text-gold" />
              Allocation d'Actifs
            </CardTitle>
            <CardDescription className="text-cream/70">
              Répartition de votre patrimoine par classe d'actifs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pie Chart */}
              <div className="h-[400px]">
                {allocationData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                        labelStyle={{ color: '#f1f5f9' }}
                      />
                      <Legend 
                        wrapperStyle={{ color: '#f1f5f9' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-cream/50">
                    Aucune donnée patrimoniale disponible
                  </div>
                )}
              </div>

              {/* Allocation Table */}
              <div className="space-y-3">
                <h4 className="font-semibold text-white mb-4">Détail de l'allocation</h4>
                {allocationData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-midnight rounded-lg border border-midnight-lighter">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-white">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{formatCurrency(item.value)}</p>
                      <p className="text-cream/70 text-sm">
                        {formatPercentage(calculatePercentageAllocation(item.value))}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 bg-gold/20 rounded-lg border border-gold mt-4">
                  <span className="text-white font-semibold">TOTAL</span>
                  <span className="text-gold font-bold text-lg">{formatCurrency(patrimoineBrut)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Résumé fiscal */}
        <Card className="bg-midnight-light border-midnight-lighter mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-gold" />
              Résumé Fiscal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-midnight rounded-lg border border-midnight-lighter">
                <p className="text-cream/70 text-sm mb-2">Âge</p>
                <p className="text-2xl font-bold text-white">{age} ans</p>
              </div>
              <div className="p-4 bg-midnight rounded-lg border border-midnight-lighter">
                <p className="text-cream/70 text-sm mb-2">TMI</p>
                <Badge className={getTMIColor(tmi)}>
                  {tmi}%
                </Badge>
              </div>
              <div className="p-4 bg-midnight rounded-lg border border-midnight-lighter">
                <p className="text-cream/70 text-sm mb-2">IR année précédente</p>
                <p className="text-xl font-bold text-white">{formatCurrency(ir)}</p>
              </div>
              {ifi > 0 && (
                <div className="p-4 bg-midnight rounded-lg border border-midnight-lighter">
                  <p className="text-cream/70 text-sm mb-2">IFI</p>
                  <p className="text-xl font-bold text-orange-400">{formatCurrency(ifi)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Statut successoral */}
        <Card className="bg-midnight-light border-midnight-lighter mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-gold" />
              Planification Successorale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-midnight rounded-lg border border-midnight-lighter">
                <p className="text-cream/70 text-sm mb-2">Testament</p>
                <Badge variant={hasTestament ? "default" : "outline"} className={hasTestament ? "bg-green-500" : "border-cream/30 text-cream"}>
                  {hasTestament ? '✓ Oui' : '✗ Non'}
                </Badge>
              </div>
              <div className="p-4 bg-midnight rounded-lg border border-midnight-lighter">
                <p className="text-cream/70 text-sm mb-2">Donations réalisées</p>
                <p className="text-xl font-bold text-white">{donationsCount}</p>
                <p className="text-sm text-cream/70 mt-1">Total: {formatCurrency(totalDonations)}</p>
              </div>
              <div className="p-4 bg-midnight rounded-lg border border-midnight-lighter">
                <p className="text-cream/70 text-sm mb-2">Abattement restant</p>
                <p className="text-xl font-bold text-green-400">{formatCurrency(abattementRestant)}</p>
                <p className="text-xs text-cream/70 mt-1">Par enfant (estimation)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button
            variant="outline"
            className="bg-midnight-lighter border-midnight-lighter text-cream hover:bg-midnight hover:text-white h-16"
            onClick={() => alert('Export PDF à implémenter')}
          >
            <Download className="w-5 h-5 mr-2" />
            Exporter en PDF
          </Button>
          <Button
            variant="outline"
            className="bg-midnight-lighter border-midnight-lighter text-cream hover:bg-midnight hover:text-white h-16"
            onClick={() => alert('Export Excel à implémenter')}
          >
            <Download className="w-5 h-5 mr-2" />
            Exporter en Excel
          </Button>
          <Button
            className="bg-gold text-midnight hover:bg-gold/90 font-semibold h-16 text-lg"
            onClick={() => router.push('/client/recommandations')}
          >
            <Target className="w-6 h-6 mr-2" />
            Voir mes recommandations
          </Button>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/client/patrimoine/autres')}
            className="bg-midnight-lighter border-midnight-lighter text-cream hover:bg-midnight hover:text-white"
          >
            ← Précédent
          </Button>
          <Button
            onClick={() => router.push('/client/recommandations')}
            className="bg-gold text-midnight hover:bg-gold/90 font-semibold"
          >
            Recommandations →
          </Button>
        </div>
      </div>
    </div>
  )
}
