import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Shield, FileText } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Fiscal Lazy Portfolio Pro
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Optimisation fiscale de portefeuilles pour experts-comptables français
          </p>
          <Link href="/client/profil">
            <Button size="lg" className="text-lg px-8 py-6">
              Commencer une simulation
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Fonctionnalités clés
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Optimisation fiscale automatique</CardTitle>
                <CardDescription>
                  Allocation optimale des actifs entre PEA, CTO, Assurance-vie et PER
                  pour minimiser l'impôt
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle>Backtests sur 10+ ans</CardTitle>
                <CardDescription>
                  Simulations historiques avec données réelles pour valider les
                  stratégies d'investissement
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>Rapports PDF personnalisés</CardTitle>
                <CardDescription>
                  Génération automatique de rapports détaillés pour vos clients
                  avec analyses et recommandations
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à optimiser vos portefeuilles ?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Commencez dès maintenant votre première simulation
          </p>
          <Link href="/client/profil">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Démarrer maintenant
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24</div>
              <div className="text-gray-600">ETFs référencés</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-secondary mb-2">21</div>
              <div className="text-gray-600">Providers comparés</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">100%</div>
              <div className="text-gray-600">Conforme CGI</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
