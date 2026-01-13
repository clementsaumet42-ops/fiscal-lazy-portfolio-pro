'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Briefcase, PlayCircle, Check, TrendingUp, Target, DollarSign,
  Shield, Calculator, BarChart, FileText, Zap, Users, CheckCircle2
} from 'lucide-react'

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          {/* Logo/Icon */}
          <div className="mb-6">
            <Briefcase className="w-16 h-16 text-blue-600 mx-auto" />
          </div>
          
          {/* Titre principal */}
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Optimisez votre patrimoine fiscal
          </h1>
          
          {/* Sous-titre */}
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Plateforme professionnelle pour experts-comptables : 
            bilan patrimonial complet, allocation d'actifs optimisée et recommandations fiscales personnalisées.
          </p>
          
          {/* CTA Principal - TRÈS VISIBLE */}
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            onClick={() => router.push('/client/demarrer')}
          >
            <PlayCircle className="w-6 h-6 mr-2" />
            Commencer mon bilan patrimonial
          </Button>
          
          {/* Sous-texte */}
          <p className="mt-4 text-sm text-gray-500">
            📋 11 étapes guidées | ⏱️ 15-20 minutes | 🔒 Données sécurisées
          </p>
        </div>
      </section>

      {/* Section "Comment ça marche" */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Un parcours simple en 2 étapes
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Étape 1 */}
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Bilan patrimonial</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Inventaire complet de votre situation : civil, fiscal, successoral, 
                liquidités, placements, immobilier, sociétés, autres actifs.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" /> Situation familiale et fiscale
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" /> Tous vos actifs (épargne, bourse, immo, etc.)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" /> Synthèse patrimoniale visuelle
                </li>
              </ul>
            </Card>
            
            {/* Étape 2 */}
            <Card className="p-8 hover:shadow-lg transition-shadow border-2 border-blue-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Préconisations</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Recommandations personnalisées basées sur votre profil : 
                allocation cible, ETF optimaux, plan d'action chiffré.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" /> Allocation d'actifs optimale
                </li>
                <li className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-600" /> ETF recommandés par enveloppe
                </li>
                <li className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" /> Économies fiscales estimées
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Section fonctionnalités */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Fonctionnalités professionnelles
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Conformité fiscale",
                desc: "Respect du Code Général des Impôts (PEA, AV, CTO, PER)"
              },
              {
                icon: Calculator,
                title: "Optimisation fiscale",
                desc: "Asset location intelligent selon votre TMI et enveloppes"
              },
              {
                icon: BarChart,
                title: "Backtesting",
                desc: "Simulations historiques et projections Monte Carlo"
              },
              {
                icon: FileText,
                title: "Rapports détaillés",
                desc: "Synthèse PDF exportable pour vos clients"
              },
              {
                icon: Zap,
                title: "24 ETF référencés",
                desc: "Univers d'investissement complet (actions, obligations, or)"
              },
              {
                icon: Users,
                title: "Multi-clients",
                desc: "Gérez tous vos clients depuis un dashboard unique"
              }
            ].map((feature, i) => (
              <Card key={i} className="p-6 text-center hover:shadow-md transition-shadow">
                <feature.icon className="w-10 h-10 text-blue-600 mx-auto mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à optimiser votre patrimoine ?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Commencez dès maintenant votre bilan patrimonial complet
          </p>
          <Button 
            size="lg" 
            variant="gold"
            className="text-lg px-10 py-6 shadow-lg"
            onClick={() => router.push('/client/demarrer')}
          >
            <CheckCircle2 className="w-6 h-6 mr-2" />
            Démarrer mon bilan
          </Button>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-blue-600 font-semibold mb-2">100% Conforme</div>
              <div className="text-gray-600 text-sm">Code Général des Impôts</div>
            </div>
            <div>
              <div className="text-blue-600 font-semibold mb-2">21 Providers</div>
              <div className="text-gray-600 text-sm">Courtiers Comparés</div>
            </div>
            <div>
              <div className="text-blue-600 font-semibold mb-2">Données Sécurisées</div>
              <div className="text-gray-600 text-sm">Hébergement Certifié</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
