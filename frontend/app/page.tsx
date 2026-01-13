'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  TrendingUp, 
  Shield, 
  Sparkles, 
  ChevronRight,
  BarChart3,
  FileText,
  Briefcase,
  CheckCircle2
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.primary),transparent)] opacity-20" />
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="mx-auto max-w-3xl text-center animate-fade-in">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Plateforme Premium pour Experts-Comptables</span>
            </div>
            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Optimisation Fiscale{' '}
              <span className="bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent">
                Intelligente
              </span>
            </h1>
            <p className="mb-10 text-xl text-muted-foreground">
              La solution complète d'allocation d'actifs et d'optimisation fiscale dédiée aux professionnels du conseil patrimonial
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/client/parcours">
                <Button size="lg" className="gap-2 px-8 premium-shadow">
                  <Sparkles className="h-5 w-5" />
                  Démarrer une Simulation
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="gap-2 px-8">
                  <BarChart3 className="h-5 w-5" />
                  Voir le Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-lg text-muted-foreground">
              Une suite complète d'outils pour conseiller vos clients en toute confiance
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8 text-primary" />}
              title="Bilan Patrimonial"
              description="Collectez et analysez la situation financière complète de vos clients"
              features={[
                "Questionnaire structuré",
                "Analyse des revenus",
                "Cartographie du patrimoine"
              ]}
            />
            
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8 text-primary" />}
              title="Optimisation Fiscale"
              description="Recommandations personnalisées basées sur le CGI 2026"
              features={[
                "24 ETFs référencés",
                "Optimisation PEA/CTO",
                "Calcul économies fiscales"
              ]}
            />
            
            <FeatureCard
              icon={<FileText className="h-8 w-8 text-primary" />}
              title="Rapports Automatisés"
              description="Documentation professionnelle prête à livrer à vos clients"
              features={[
                "Export PDF haute qualité",
                "Branding personnalisable",
                "Conformité réglementaire"
              ]}
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border/40 bg-muted/20 py-16">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24</div>
              <div className="text-sm text-muted-foreground">ETFs référencés</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">21</div>
              <div className="text-sm text-muted-foreground">Providers comparés</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Conforme CGI</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">€€€</div>
              <div className="text-sm text-muted-foreground">Économies générées</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-6 max-w-7xl">
          <Card className="glass-card premium-shadow overflow-hidden">
            <div className="relative p-12 text-center">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 to-transparent" />
              <Briefcase className="mx-auto h-12 w-12 text-primary mb-6" />
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Prêt à transformer votre conseil patrimonial ?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Rejoignez les experts-comptables qui utilisent déjà Fiscal Lazy Portfolio Pro pour optimiser les portefeuilles de leurs clients
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link href="/client/parcours">
                  <Button size="lg" className="gap-2 px-8 premium-shadow">
                    <Sparkles className="h-5 w-5" />
                    Commencer Maintenant
                  </Button>
                </Link>
                <Link href="/client/profil">
                  <Button size="lg" variant="outline" className="gap-2 px-8">
                    Nouveau Client
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">
                Fiscal Lazy Portfolio Pro
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Fiscal Lazy Portfolio Pro. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
}

function FeatureCard({ icon, title, description, features }: FeatureCardProps) {
  return (
    <Card className="relative overflow-hidden transition-all hover:shadow-lg hover:shadow-primary/20">
      <div className="p-8">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
          {icon}
        </div>
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        <p className="mb-6 text-sm text-muted-foreground">{description}</p>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
