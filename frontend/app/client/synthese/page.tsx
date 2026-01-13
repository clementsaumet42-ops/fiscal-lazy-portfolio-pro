'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils/assessment/helpers'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Wallet, TrendingUp, FileText, Download, ArrowRight, PieChart as PieChartIcon } from 'lucide-react'

const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899']

export default function SynthesePage() {
  const router = useRouter()
  const {
    assessment,
    getPatrimoineBrut,
    getPatrimoineNet,
    getAllocation,
  } = useClientStore()

  const patrimoineBrut = useMemo(() => getPatrimoineBrut(), [assessment])
  const patrimoineNet = useMemo(() => getPatrimoineNet(), [assessment])
  const allocation = useMemo(() => getAllocation(), [assessment])

  // Prepare chart data
  const allocationData = useMemo(() => {
    const data = []
    if (allocation.liquidites > 0) {
      data.push({ name: 'Liquidités', value: allocation.liquidites })
    }
    if (allocation.assurance_vie > 0) {
      data.push({ name: 'Assurance-Vie', value: allocation.assurance_vie })
    }
    if (allocation.enveloppes_boursieres > 0) {
      data.push({ name: 'Bourse', value: allocation.enveloppes_boursieres })
    }
    if (allocation.immobilier > 0) {
      data.push({ name: 'Immobilier', value: allocation.immobilier })
    }
    if (allocation.societes_is > 0) {
      data.push({ name: 'Sociétés IS', value: allocation.societes_is })
    }
    if (allocation.autres_actifs > 0) {
      data.push({ name: 'Autres actifs', value: allocation.autres_actifs })
    }
    return data
  }, [allocation])

  // Calculate revenue data
  const revenusAnnuels = useMemo(() => {
    if (!assessment.bilan_fiscal) return 0
    return (
      assessment.bilan_fiscal.revenus_salaires +
      assessment.bilan_fiscal.revenus_bic_bnc_ba +
      assessment.bilan_fiscal.revenus_fonciers.revenus_nets +
      assessment.bilan_fiscal.revenus_mobiliers.total
    )
  }, [assessment.bilan_fiscal])

  const capaciteEpargne = useMemo(() => {
    if (!assessment.bilan_fiscal) return 0
    // Simple estimation: revenus - impôts - estimated living costs (40% of net income)
    const impotsTotal = assessment.bilan_fiscal.ir_annee_precedente + assessment.bilan_fiscal.prelevements_sociaux
    const netIncome = revenusAnnuels - impotsTotal
    return Math.max(0, netIncome * 0.3) // Assume 30% savings rate
  }, [revenusAnnuels, assessment.bilan_fiscal])

  // Detailed breakdown data
  const breakdown = useMemo(() => {
    const data = []
    
    if (allocation.liquidites > 0) {
      // Calculate average yield for liquidites
      let avgYield = 0
      if (assessment.liquidites) {
        const totalWeighted = 
          (assessment.liquidites.livret_a.montant * assessment.liquidites.livret_a.taux) +
          (assessment.liquidites.ldds.montant * assessment.liquidites.ldds.taux) +
          ((assessment.liquidites.lep?.montant || 0) * (assessment.liquidites.lep?.taux || 0)) +
          assessment.liquidites.autres_livrets.reduce((sum, l) => sum + (l.montant * l.taux), 0)
        
        avgYield = allocation.liquidites > 0 ? totalWeighted / allocation.liquidites : 0
      }
      const revenus = allocation.liquidites * (avgYield / 100)
      const rendement = avgYield
      
      data.push({
        categorie: 'Liquidités',
        valeur: allocation.liquidites,
        pourcentage: allocation.total > 0 ? (allocation.liquidites / allocation.total) * 100 : 0,
        revenus,
        rendement,
      })
    }

    if (allocation.assurance_vie > 0) {
      const revenus = assessment.assurances_vie.reduce((sum, av) => {
        // Estimate 3% yield on average
        return sum + (av.montant_total * 0.03)
      }, 0)
      const rendement = allocation.assurance_vie > 0 ? (revenus / allocation.assurance_vie) * 100 : 0
      
      data.push({
        categorie: 'Assurance-Vie',
        valeur: allocation.assurance_vie,
        pourcentage: allocation.total > 0 ? (allocation.assurance_vie / allocation.total) * 100 : 0,
        revenus,
        rendement,
      })
    }

    if (allocation.enveloppes_boursieres > 0) {
      const revenus = assessment.enveloppes_bourse.reduce((sum, env) => sum + env.performance_globale_euros, 0)
      const rendement = allocation.enveloppes_boursieres > 0 ? (revenus / allocation.enveloppes_boursieres) * 100 : 0
      
      data.push({
        categorie: 'Bourse',
        valeur: allocation.enveloppes_boursieres,
        pourcentage: allocation.total > 0 ? (allocation.enveloppes_boursieres / allocation.total) * 100 : 0,
        revenus,
        rendement,
      })
    }

    if (allocation.immobilier > 0) {
      const revenus = assessment.biens_immobiliers.reduce((sum, bien) => {
        const rev = bien.revenus_locatifs?.revenus_nets_annuels || bien.scpi?.rendement_annuel || 0
        return sum + rev
      }, 0)
      const rendement = allocation.immobilier > 0 ? (revenus / allocation.immobilier) * 100 : 0
      
      data.push({
        categorie: 'Immobilier',
        valeur: allocation.immobilier,
        pourcentage: allocation.total > 0 ? (allocation.immobilier / allocation.total) * 100 : 0,
        revenus,
        rendement,
      })
    }

    if (allocation.societes_is > 0) {
      const revenus = assessment.societes_is.reduce((sum, soc) => sum + soc.dividendes_annuels, 0)
      const rendement = allocation.societes_is > 0 ? (revenus / allocation.societes_is) * 100 : 0
      
      data.push({
        categorie: 'Sociétés IS',
        valeur: allocation.societes_is,
        pourcentage: allocation.total > 0 ? (allocation.societes_is / allocation.total) * 100 : 0,
        revenus,
        rendement,
      })
    }

    if (allocation.autres_actifs > 0) {
      data.push({
        categorie: 'Autres actifs',
        valeur: allocation.autres_actifs,
        pourcentage: allocation.total > 0 ? (allocation.autres_actifs / allocation.total) * 100 : 0,
        revenus: 0,
        rendement: 0,
      })
    }

    return data
  }, [allocation, assessment])

  return (
    <div className="min-h-screen bg-midnight">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            📊 Synthèse Patrimoniale
          </h1>
          <p className="text-cream/70 text-lg">
            Étape 11/11 - Vue d'ensemble complète de votre patrimoine
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-midnight-lighter rounded-full h-2">
            <div className="bg-gold h-2 rounded-full transition-all duration-300" style={{ width: '100%' }}></div>
          </div>
          <p className="text-cream/70 text-sm mt-2">✅ Évaluation complète terminée</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-midnight-light border-midnight-lighter">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gold/10 rounded-lg">
                  <Wallet className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <p className="text-cream/70 text-sm">Patrimoine brut</p>
                  <p className="text-2xl font-bold text-gold">
                    {formatCurrency(patrimoineBrut)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-midnight-light border-midnight-lighter">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-cream/70 text-sm">Patrimoine net</p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(patrimoineNet)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-midnight-light border-midnight-lighter">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-cream/70 text-sm">Revenus annuels</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {formatCurrency(revenusAnnuels)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-midnight-light border-midnight-lighter">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-cream/70 text-sm">Capacité d'épargne</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {formatCurrency(capaciteEpargne)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Allocation Chart */}
        <Card className="bg-midnight-light border-midnight-lighter mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-6 h-6 text-gold" />
              <CardTitle className="text-white">Répartition du patrimoine</CardTitle>
            </div>
            <CardDescription className="text-cream/70">
              Allocation par classe d'actifs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {allocationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #F59E0B' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-cream/50">
                Aucune donnée patrimoniale à afficher
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Breakdown */}
        <Card className="bg-midnight-light border-midnight-lighter mb-8">
          <CardHeader>
            <CardTitle className="text-white">Détail par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="bg-[#1E293B]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gold">Catégorie</TableHead>
                    <TableHead className="text-gold text-right">Valeur</TableHead>
                    <TableHead className="text-gold text-right">% du total</TableHead>
                    <TableHead className="text-gold text-right">Revenus annuels</TableHead>
                    <TableHead className="text-gold text-right">Rendement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {breakdown.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-cream/50 py-8">
                        Aucune donnée disponible
                      </TableCell>
                    </TableRow>
                  ) : (
                    breakdown.map((item, index) => (
                      <TableRow key={index} className="hover:bg-midnight-lighter/50">
                        <TableCell className="font-semibold text-white">{item.categorie}</TableCell>
                        <TableCell className="text-right text-white">{formatCurrency(item.valeur)}</TableCell>
                        <TableCell className="text-right text-gold">{item.pourcentage.toFixed(1)}%</TableCell>
                        <TableCell className="text-right text-green-400">
                          {item.revenus > 0 ? formatCurrency(item.revenus) : '-'}
                        </TableCell>
                        <TableCell className="text-right text-gold">
                          {item.rendement > 0 ? `${item.rendement.toFixed(2)}%` : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Fiscal Summary */}
        {assessment.bilan_fiscal && (
          <Card className="bg-midnight-light border-midnight-lighter mb-8">
            <CardHeader>
              <CardTitle className="text-white">Résumé fiscal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-midnight rounded-lg">
                  <p className="text-cream/70 text-sm mb-1">Taux Marginal d'Imposition</p>
                  <p className="text-2xl font-bold text-white">{assessment.bilan_fiscal.tmi}%</p>
                </div>
                <div className="p-4 bg-midnight rounded-lg">
                  <p className="text-cream/70 text-sm mb-1">IR année précédente</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(assessment.bilan_fiscal.ir_annee_precedente)}
                  </p>
                </div>
                <div className="p-4 bg-midnight rounded-lg">
                  <p className="text-cream/70 text-sm mb-1">Nombre de parts fiscales</p>
                  <p className="text-2xl font-bold text-white">{assessment.bilan_fiscal.nombre_parts_fiscales}</p>
                </div>
              </div>
              {assessment.bilan_fiscal.ifi_du && assessment.bilan_fiscal.ifi_du > 0 && (
                <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <p className="text-orange-400 font-semibold">
                    IFI dû : {formatCurrency(assessment.bilan_fiscal.ifi_du)}
                  </p>
                  <p className="text-cream/70 text-sm mt-1">
                    Votre patrimoine est soumis à l'Impôt sur la Fortune Immobilière
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card className="bg-gradient-to-br from-gold/10 to-midnight-light border-gold/30 mb-8">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Prochaines étapes</CardTitle>
            <CardDescription className="text-cream/70">
              Votre bilan patrimonial est complet ! Vous pouvez maintenant :
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="gold"
              size="lg"
              className="w-full justify-between"
              onClick={() => alert('Fonctionnalité de génération PDF à venir')}
            >
              <span className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Générer le rapport PDF complet
              </span>
              <ArrowRight className="w-5 h-5" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full justify-between border-gold text-gold"
              onClick={() => router.push('/client/optimisation')}
            >
              <span className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Commencer l'optimisation patrimoniale
              </span>
              <ArrowRight className="w-5 h-5" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full justify-between"
              onClick={() => router.push('/client/parcours')}
            >
              <span className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Retour au parcours client
              </span>
            </Button>
          </CardContent>
        </Card>

        {/* Info box */}
        <div className="p-4 bg-midnight-light border border-gold/20 rounded-lg">
          <p className="text-cream/70 text-sm">
            💡 <strong className="text-gold">Félicitations !</strong> Vous avez complété votre bilan patrimonial détaillé. Ces informations constituent la base pour élaborer une stratégie d'optimisation fiscale et patrimoniale personnalisée.
          </p>
        </div>
      </div>
    </div>
  )
}
