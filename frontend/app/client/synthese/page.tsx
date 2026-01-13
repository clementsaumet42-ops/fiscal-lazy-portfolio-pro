'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, getTMIColor } from '@/lib/utils/assessment/helpers'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Award, FileText, Download, Settings, RotateCcw, TrendingUp, Shield, Home } from 'lucide-react'

export default function SynthesePage() {
  const router = useRouter()
  const { assessment, getPatrimoineBrut, getPatrimoineNet, getAllocation, resetAssessment } = useClientStore()

  const patrimoineBrut = useMemo(() => getPatrimoineBrut(), [assessment])
  const patrimoineNet = useMemo(() => getPatrimoineNet(), [assessment])
  const allocation = useMemo(() => getAllocation(), [assessment])

  const passifs = useMemo(() => {
    return assessment.biens_immobiliers.reduce((sum, b) => sum + (b.pret?.capital_restant_du || 0), 0)
  }, [assessment.biens_immobiliers])

  // Pie chart data
  const pieData = useMemo(() => {
    return [
      { name: 'Liquidités', value: allocation.liquidites, color: '#3B82F6' },
      { name: 'Assurance-Vie', value: allocation.assurance_vie, color: '#10B981' },
      { name: 'Bourse', value: allocation.enveloppes_boursieres, color: '#F59E0B' },
      { name: 'Immobilier', value: allocation.immobilier - passifs, color: '#8B5CF6' },
      { name: 'Sociétés IS', value: allocation.societes_is, color: '#EC4899' },
      { name: 'Autres', value: allocation.autres_actifs, color: '#6366F1' },
    ].filter(item => item.value > 0)
  }, [allocation, passifs])

  // Investment allocation
  const investmentAllocation = useMemo(() => {
    const actions = assessment.enveloppes_bourse.reduce((sum, env) => {
      return sum + env.supports.filter(s => s.type === 'Action' || s.type === 'ETF').reduce((s2, support) => s2 + support.valeur_totale_ligne, 0)
    }, 0) + assessment.assurances_vie.reduce((sum, av) => {
      return sum + av.supports_uc.filter(s => s.categorie === 'Actions').reduce((s2, support) => s2 + support.valeur_actuelle, 0)
    }, 0)

    const obligations = assessment.enveloppes_bourse.reduce((sum, env) => {
      return sum + env.supports.filter(s => s.type === 'Obligation').reduce((s2, support) => s2 + support.valeur_totale_ligne, 0)
    }, 0) + assessment.assurances_vie.reduce((sum, av) => {
      return sum + av.supports_uc.filter(s => s.categorie === 'Obligations').reduce((s2, support) => s2 + support.valeur_actuelle, 0)
    }, 0)

    const fondsEuro = assessment.assurances_vie.reduce((sum, av) => sum + av.montant_fonds_euro, 0)
    const immobilier = allocation.immobilier - passifs
    const liquidites = allocation.liquidites

    const total = actions + obligations + fondsEuro + immobilier + liquidites
    
    return [
      { name: 'Actions', value: total > 0 ? (actions / total) * 100 : 0, amount: actions },
      { name: 'Obligations', value: total > 0 ? (obligations / total) * 100 : 0, amount: obligations },
      { name: 'Fonds €', value: total > 0 ? (fondsEuro / total) * 100 : 0, amount: fondsEuro },
      { name: 'Immobilier', value: total > 0 ? (immobilier / total) * 100 : 0, amount: immobilier },
      { name: 'Liquidités', value: total > 0 ? (liquidites / total) * 100 : 0, amount: liquidites },
    ]
  }, [assessment, allocation, passifs])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-[#FFFBEB]/70 text-sm">Étape 10 sur 11</p>
          <h1 className="text-4xl font-bold text-white mt-2">📊 Synthèse Globale</h1>
          <p className="text-[#FFFBEB]/60 mt-2">Vue d'ensemble complète de votre patrimoine</p>
        </div>

        <div className="mb-8">
          <div className="w-full bg-[#1E293B] rounded-full h-2">
            <div className="bg-[#F59E0B] h-2 rounded-full transition-all duration-300" style={{ width: '90%' }}></div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-[#1E293B] to-[#334155] border-[#334155]">
            <CardContent className="pt-6 text-center">
              <p className="text-[#FFFBEB]/70 text-sm mb-2">Patrimoine Brut</p>
              <p className="text-4xl font-bold text-white">{formatCurrency(patrimoineBrut)}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-orange-500/30">
            <CardContent className="pt-6 text-center">
              <p className="text-[#FFFBEB]/70 text-sm mb-2">Passifs</p>
              <p className="text-4xl font-bold text-orange-400">{formatCurrency(passifs)}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#F59E0B]/30 to-[#F59E0B]/10 border-[#F59E0B]">
            <CardContent className="pt-6 text-center">
              <p className="text-[#FFFBEB]/70 text-sm mb-2">Patrimoine Net</p>
              <p className="text-5xl font-bold text-[#F59E0B] drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                {formatCurrency(patrimoineNet)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Asset Allocation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-[#1E293B] border-[#334155]">
            <CardHeader>
              <CardTitle className="text-white">Répartition du patrimoine</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-[#1E293B] border-[#334155]">
            <CardHeader>
              <CardTitle className="text-white">Détails par catégorie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pieData.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-[#0F172A]/50 rounded-lg border border-[#334155] hover:border-[#F59E0B]/50 cursor-pointer transition-all"
                    onClick={() => {
                      const routes: Record<string, string> = {
                        'Liquidités': '/client/patrimoine/liquidites',
                        'Assurance-Vie': '/client/patrimoine/assurance-vie',
                        'Bourse': '/client/patrimoine/bourse',
                        'Immobilier': '/client/patrimoine/immobilier',
                        'Sociétés IS': '/client/patrimoine/societe',
                        'Autres': '/client/patrimoine/autres',
                      }
                      if (routes[item.name]) router.push(routes[item.name])
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-white font-semibold">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">{formatCurrency(item.value)}</p>
                      <p className="text-[#FFFBEB]/60 text-sm">{((item.value / patrimoineBrut) * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fiscal Summary */}
        {assessment.bilan_fiscal && (
          <Card className="bg-[#1E293B] border-[#334155] mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#F59E0B]" />
                Synthèse fiscale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-[#FFFBEB]/70 text-sm">Revenu Fiscal de Référence</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {formatCurrency(
                      assessment.bilan_fiscal.revenus_salaires +
                      assessment.bilan_fiscal.revenus_bic_bnc_ba +
                      assessment.bilan_fiscal.revenus_fonciers.revenus_nets +
                      assessment.bilan_fiscal.revenus_mobiliers.total
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-[#FFFBEB]/70 text-sm">TMI</p>
                  <div className="mt-1">
                    <Badge className={`${getTMIColor(assessment.bilan_fiscal.tmi)} text-white text-lg px-3 py-1`}>
                      {assessment.bilan_fiscal.tmi}%
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-[#FFFBEB]/70 text-sm">IR annuel</p>
                  <p className="text-2xl font-bold text-orange-400 mt-1">
                    {formatCurrency(assessment.bilan_fiscal.ir_annee_precedente)}
                  </p>
                </div>
                {assessment.bilan_fiscal.ifi_du && assessment.bilan_fiscal.ifi_du > 0 && (
                  <div>
                    <p className="text-[#FFFBEB]/70 text-sm">IFI</p>
                    <div className="mt-1">
                      <p className="text-2xl font-bold text-red-400">{formatCurrency(assessment.bilan_fiscal.ifi_du)}</p>
                      {patrimoineBrut > 1300000 && (
                        <Badge variant="destructive" className="mt-1">Assujetti IFI</Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estate Planning Status */}
        {assessment.bilan_successoral && (
          <Card className="bg-[#1E293B] border-[#334155] mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#F59E0B]" />
                Bilan successoral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-[#FFFBEB]/70 text-sm mb-2">Testament</p>
                  <Badge variant={assessment.bilan_successoral.testament_existe ? 'default' : 'secondary'}>
                    {assessment.bilan_successoral.testament_existe ? '✓ Oui' : '✗ Non'}
                  </Badge>
                  {assessment.bilan_successoral.testament_existe && assessment.bilan_successoral.type_testament && (
                    <p className="text-white text-sm mt-2">{assessment.bilan_successoral.type_testament}</p>
                  )}
                </div>
                <div>
                  <p className="text-[#FFFBEB]/70 text-sm mb-2">Donations réalisées</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(assessment.bilan_successoral.donations_realisees.reduce((sum, d) => sum + d.montant, 0))}
                  </p>
                  <p className="text-[#FFFBEB]/60 text-sm mt-1">
                    {assessment.bilan_successoral.donations_realisees.length} donation(s)
                  </p>
                </div>
                <div>
                  <p className="text-[#FFFBEB]/70 text-sm mb-2">Objectif de transmission</p>
                  <Badge className="bg-[#F59E0B] text-[#0F172A]">
                    {assessment.bilan_successoral.objectif_transmission}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Investment Allocation */}
        <Card className="bg-[#1E293B] border-[#334155] mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#F59E0B]" />
              Allocation d'investissement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={investmentAllocation}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#FFFBEB" />
                <YAxis stroke="#FFFBEB" />
                <Tooltip 
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
                />
                <Bar dataKey="value" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              {investmentAllocation.map((item, idx) => (
                <div key={idx} className="text-center">
                  <p className="text-[#FFFBEB]/70 text-sm">{item.name}</p>
                  <p className="text-lg font-bold text-[#F59E0B]">{item.value.toFixed(1)}%</p>
                  <p className="text-xs text-[#FFFBEB]/50">{formatCurrency(item.amount)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Button 
            size="lg"
            className="bg-[#F59E0B] text-[#0F172A] hover:bg-[#D97706] h-16"
            onClick={() => alert('Fonctionnalité à venir')}
          >
            <FileText className="w-5 h-5 mr-2" />
            Générer le rapport PDF
          </Button>
          <Button 
            variant="outline"
            size="lg"
            className="border-[#334155] text-white h-16"
            onClick={() => alert('Fonctionnalité à venir')}
          >
            <Download className="w-5 h-5 mr-2" />
            Exporter vers Excel
          </Button>
          <div className="relative">
            <select 
              onChange={(e) => e.target.value && router.push(e.target.value)}
              className="w-full h-16 bg-[#1E293B] border-[#334155] text-white rounded-lg px-4 cursor-pointer hover:border-[#F59E0B] transition-colors"
            >
              <option value="">Modifier les données</option>
              <option value="/client/prise-connaissance">Prise de connaissance</option>
              <option value="/client/bilan/civil">État civil</option>
              <option value="/client/bilan/fiscal">Bilan fiscal</option>
              <option value="/client/bilan/successoral">Bilan successoral</option>
              <option value="/client/patrimoine/liquidites">Liquidités</option>
              <option value="/client/patrimoine/assurance-vie">Assurance-Vie</option>
              <option value="/client/patrimoine/bourse">Enveloppes Boursières</option>
              <option value="/client/patrimoine/immobilier">Immobilier</option>
              <option value="/client/patrimoine/societe">Sociétés IS</option>
              <option value="/client/patrimoine/autres">Autres actifs</option>
            </select>
            <Settings className="w-5 h-5 text-[#FFFBEB]/70 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <Button 
            variant="destructive"
            size="lg"
            className="h-16"
            onClick={() => {
              if (confirm('Êtes-vous sûr de vouloir recommencer ? Toutes les données seront perdues.')) {
                resetAssessment()
                router.push('/client/prise-connaissance')
              }
            }}
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Nouvelle simulation
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => router.push('/client/patrimoine/autres')}
            className="border-[#334155] text-white"
          >
            ← Autres actifs
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            size="lg"
            onClick={() => {
              alert('Félicitations ! Le bilan patrimonial est complet. Les données sont sauvegardées.')
              // Could navigate to a success page or dashboard
            }}
          >
            <Award className="w-5 h-5 mr-2" />
            Terminer
          </Button>
        </div>
      </div>
    </div>
  )
}
