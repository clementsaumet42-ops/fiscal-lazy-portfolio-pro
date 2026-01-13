'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/ui/stat-card'
import { TrendingUp, Users, DollarSign, FileText } from 'lucide-react'
import { formatCurrency, formatPercentage } from '@/lib/utils'

export default function DashboardPage() {
  // Données simulées pour la démo
  const stats = {
    total_simulations: 42,
    clients_actifs: 18,
    economie_fiscale_moyenne: 3850,
    performance_moyenne: 8.4,
  }

  const recentSimulations = [
    {
      id: 1,
      client: 'Jean Dupont',
      date: '2024-01-10',
      economie: 4200,
      status: 'completed',
    },
    {
      id: 2,
      client: 'Marie Martin',
      date: '2024-01-09',
      economie: 3500,
      status: 'completed',
    },
    {
      id: 3,
      client: 'Pierre Durand',
      date: '2024-01-08',
      economie: 5100,
      status: 'completed',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight to-midnight-light">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Dashboard <span className="text-gold">Expert-Comptable</span>
          </h1>
          <p className="text-cream/70 text-lg">
            Vue d'ensemble de vos simulations et clients
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/client/profil">
            <Button className="w-full h-auto py-4" size="lg" variant="gold">
              <div className="flex flex-col items-center gap-2">
                <Users className="w-6 h-6" />
                <span>Nouvelle Simulation</span>
              </div>
            </Button>
          </Link>
          <Button variant="outline" className="w-full h-auto py-4" size="lg">
            <div className="flex flex-col items-center gap-2">
              <FileText className="w-6 h-6" />
              <span>Mes Rapports</span>
            </div>
          </Button>
          <Button variant="outline" className="w-full h-auto py-4" size="lg">
            <div className="flex flex-col items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              <span>Statistiques</span>
            </div>
          </Button>
        </div>

        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            value={stats.total_simulations}
            label="Total Simulations"
            icon={FileText}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            value={stats.clients_actifs}
            label="Clients Actifs"
            icon={Users}
            trend={{ value: 3, isPositive: true }}
          />
          <StatCard
            value={formatCurrency(stats.economie_fiscale_moyenne)}
            label="Économie Fiscale Moy."
            icon={DollarSign}
          />
          <StatCard
            value={formatPercentage(stats.performance_moyenne)}
            label="Performance Moyenne"
            icon={TrendingUp}
          />
        </div>

        {/* Simulations récentes */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Simulations Récentes</CardTitle>
            <CardDescription>
              Dernières simulations effectuées pour vos clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSimulations.map((sim) => (
                <div
                  key={sim.id}
                  className="flex items-center justify-between p-4 border border-midnight-lighter rounded-lg hover:border-gold transition-all bg-midnight/50"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-white">{sim.client}</p>
                    <p className="text-sm text-cream/60">{sim.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-cream/60">Économie fiscale</p>
                      <p className="font-bold text-gold">{formatCurrency(sim.economie)}/an</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Voir détails
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Graphiques et insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Répartition par enveloppe</CardTitle>
              <CardDescription>
                Distribution des investissements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-white">PEA</span>
                    <span className="text-sm font-semibold text-gold">42%</span>
                  </div>
                  <div className="w-full bg-midnight rounded-full h-2">
                    <div className="bg-gold h-2 rounded-full" style={{ width: '42%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-white">CTO</span>
                    <span className="text-sm font-semibold text-gold">28%</span>
                  </div>
                  <div className="w-full bg-midnight rounded-full h-2">
                    <div className="bg-gold-light h-2 rounded-full" style={{ width: '28%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-white">Assurance-Vie</span>
                    <span className="text-sm font-semibold text-gold">22%</span>
                  </div>
                  <div className="w-full bg-midnight rounded-full h-2">
                    <div className="bg-gold-dark h-2 rounded-full" style={{ width: '22%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-white">PER</span>
                    <span className="text-sm font-semibold text-gold">8%</span>
                  </div>
                  <div className="w-full bg-midnight rounded-full h-2">
                    <div className="bg-gold/70 h-2 rounded-full" style={{ width: '8%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Économies Fiscales</CardTitle>
              <CardDescription>
                Clients avec les meilleures optimisations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white">Pierre Durand</span>
                  <span className="font-bold text-gold">{formatCurrency(5100)}/an</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white">Jean Dupont</span>
                  <span className="font-bold text-gold">{formatCurrency(4200)}/an</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white">Sophie Bernard</span>
                  <span className="font-bold text-gold">{formatCurrency(3800)}/an</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white">Marie Martin</span>
                  <span className="font-bold text-gold">{formatCurrency(3500)}/an</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to action */}
        <Card className="mt-8 bg-gold/10 border-gold">
          <CardContent className="py-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2 text-white">
                Prêt à optimiser un nouveau portefeuille ?
              </h3>
              <p className="mb-6 text-cream/70">
                Créez une nouvelle simulation pour votre client en quelques minutes
              </p>
              <Link href="/client/profil">
                <Button size="lg" variant="gold">
                  Démarrer une simulation
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
