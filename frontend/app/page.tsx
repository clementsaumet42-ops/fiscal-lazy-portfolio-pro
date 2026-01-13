import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FeatureCard } from '@/components/ui/feature-card'
import { StatCard } from '@/components/ui/stat-card'
import { TrendingUp, Shield, FileText, PieChart, DollarSign, Clock } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight via-midnight-light to-midnight">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
              Optimisation Fiscale{' '}
              <span className="text-gradient-gold">Professionnelle</span>
            </h1>
            <p className="text-xl sm:text-2xl text-cream/80 mb-12 max-w-3xl mx-auto">
              Plateforme dédiée aux experts-comptables pour maximiser 
              l'efficience fiscale de vos clients
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/client/parcours">
                <Button size="lg" variant="gold" className="text-lg px-8 py-6 shadow-gold-lg">
                  🚀 Démarrer un Bilan Complet
                </Button>
              </Link>
              <Link href="/client/profil">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  📊 Nouvelle Simulation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-midnight-light/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Fonctionnalités <span className="text-gold">Clés</span>
            </h2>
            <p className="text-cream/70 text-lg max-w-2xl mx-auto">
              Une suite complète d'outils pour optimiser les portefeuilles de vos clients
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={FileText}
              title="Bilan Patrimonial Complet"
              description="Collectez la situation personnelle, revenus, patrimoine et objectifs de vos clients en 4 étapes structurées"
            />
            <FeatureCard
              icon={Shield}
              title="Audit Épargne Existante"
              description="Analysez les placements actuels, identifiez les points d'amélioration et calculez le potentiel d'économie"
            />
            <FeatureCard
              icon={TrendingUp}
              title="Optimisation Fiscale"
              description="Placement optimal des actifs selon les enveloppes fiscales pour maximiser l'efficience fiscale"
            />
            <FeatureCard
              icon={PieChart}
              title="Allocation Stratégique"
              description="Construction de portefeuilles diversifiés avec ETF à frais réduits et fiscalement optimisés"
            />
            <FeatureCard
              icon={DollarSign}
              title="Économies Potentielles"
              description="Calcul précis des économies d'impôts et de frais avec comparaison avant/après"
            />
            <FeatureCard
              icon={Clock}
              title="Backtesting Historique"
              description="Validation des stratégies avec données historiques et projection des performances"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Performance <span className="text-gold">Démontrée</span>
            </h2>
            <p className="text-cream/70 text-lg">
              Des résultats tangibles pour vos clients
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard
              value="€2.5M+"
              label="Patrimoine Optimisé"
              icon={DollarSign}
            />
            <StatCard
              value="150+"
              label="Clients Satisfaits"
              icon={Shield}
            />
            <StatCard
              value="18%"
              label="Économie Moyenne"
              icon={TrendingUp}
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              value="24"
              label="ETFs Référencés"
              icon={PieChart}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-midnight-light to-midnight" />
        <div className="absolute inset-0 bg-gold/5" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Prêt à <span className="text-gold">Optimiser</span> ?
          </h2>
          <p className="text-xl text-cream/80 mb-10">
            Commencez dès maintenant à maximiser l'efficience fiscale de vos clients
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/client/parcours">
              <Button size="lg" variant="gold" className="text-lg px-10 py-6 shadow-gold-lg">
                Démarrer Maintenant
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="text-lg px-10 py-6">
                Accéder au Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-midnight-light/30 border-t border-midnight-lighter">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-gold font-semibold mb-2">100% Conforme</div>
              <div className="text-cream/70 text-sm">Code Général des Impôts</div>
            </div>
            <div>
              <div className="text-gold font-semibold mb-2">21 Providers</div>
              <div className="text-cream/70 text-sm">Courtiers Comparés</div>
            </div>
            <div>
              <div className="text-gold font-semibold mb-2">Données Sécurisées</div>
              <div className="text-cream/70 text-sm">Hébergement Certifié</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
