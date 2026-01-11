import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="text-4xl mb-2">{icon}</div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="py-6 px-8 border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">
            Fiscal Lazy Portfolio Pro
          </h1>
          <p className="text-gray-600 mt-1">Optimisation fiscale pour experts-comptables</p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl font-bold mb-6 text-gray-900">
              Optimisez la fiscalité de vos clients
            </h2>
            <p className="text-xl text-gray-700 mb-8">
              Plateforme professionnelle pour experts-comptables : 
              allocation d&apos;actifs optimisée fiscalement, backtests, 
              rapports automatisés.
            </p>
            <div className="flex gap-4">
              <Link href="/client/profil">
                <Button size="lg" className="text-lg">Nouveau Client</Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="text-lg">Dashboard</Button>
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FeatureCard 
              icon="📊" 
              title="Allocation Optimisée"
              description="Algorithmes fiscalement efficient"
            />
            <FeatureCard 
              icon="💰" 
              title="Optimisation Fiscale"
              description="PEA, CTO, AV, Société IS"
            />
            <FeatureCard 
              icon="📈" 
              title="Backtests"
              description="Performance historique"
            />
            <FeatureCard 
              icon="📄" 
              title="Rapports PDF"
              description="Livrables professionnels"
            />
          </div>
        </div>
      </main>

      <footer className="border-t bg-white/80 backdrop-blur py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2024 Fiscal Lazy Portfolio Pro - Fait avec ❤️ pour les Experts-Comptables Français</p>
        </div>
      </footer>
    </div>
  )
}
