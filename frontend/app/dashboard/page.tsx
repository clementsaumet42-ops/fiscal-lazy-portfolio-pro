'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard Expert-Comptable</h1>
        <p className="text-gray-600">
          Vue d'ensemble de vos simulations et clients
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/client/profil">
          <Button className="w-full h-auto py-4" size="lg">
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Simulations</CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_simulations}</div>
            <p className="text-xs text-gray-600 mt-1">
              +12% ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients Actifs</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clients_actifs}</div>
            <p className="text-xs text-gray-600 mt-1">
              +3 nouveaux ce mois
            </p>
          </CardContent>
        </Card>

        <Card className="bg-secondary-50 border-secondary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Économie Fiscale Moy.</CardTitle>
            <DollarSign className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {formatCurrency(stats.economie_fiscale_moyenne)}
            </div>
            <p className="text-xs text-gray-700 mt-1">
              par client / an
            </p>
          </CardContent>
        </Card>

        <Card className="bg-primary-50 border-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Moyenne</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatPercentage(stats.performance_moyenne)}
            </div>
            <p className="text-xs text-gray-700 mt-1">
              rendement annuel
            </p>
          </CardContent>
        </Card>
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
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-semibold">{sim.client}</p>
                  <p className="text-sm text-gray-600">{sim.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Économie fiscale</p>
                    <p className="font-bold text-secondary">{formatCurrency(sim.economie)}/an</p>
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
                  <span className="text-sm">PEA</span>
                  <span className="text-sm font-semibold">42%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">CTO</span>
                  <span className="text-sm font-semibold">28%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-secondary h-2 rounded-full" style={{ width: '28%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Assurance-Vie</span>
                  <span className="text-sm font-semibold">22%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '22%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">PER</span>
                  <span className="text-sm font-semibold">8%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '8%' }}></div>
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
                <span className="text-sm">Pierre Durand</span>
                <span className="font-bold text-secondary">{formatCurrency(5100)}/an</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Jean Dupont</span>
                <span className="font-bold text-secondary">{formatCurrency(4200)}/an</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Sophie Bernard</span>
                <span className="font-bold text-secondary">{formatCurrency(3800)}/an</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Marie Martin</span>
                <span className="font-bold text-secondary">{formatCurrency(3500)}/an</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call to action */}
      <Card className="mt-8 bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
        <CardContent className="py-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">
              Prêt à optimiser un nouveau portefeuille ?
            </h3>
            <p className="mb-6 opacity-90">
              Créez une nouvelle simulation pour votre client en quelques minutes
            </p>
            <Link href="/client/profil">
              <Button size="lg" variant="secondary">
                Démarrer une simulation
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
