'use client'

import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowRight, Home } from 'lucide-react'

export default function DemarrerPage() {
  const router = useRouter()
  const { resetBilan, resetAssessment } = useClientStore()

  const handleStart = () => {
    // Option: réinitialiser les données précédentes
    // resetBilan()
    // resetAssessment()
    
    router.push('/client/bilan/civil')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Bienvenue dans votre bilan patrimonial
          </h1>
          <p className="text-lg text-gray-600">
            Nous allons collecter toutes les informations nécessaires en 11 étapes
          </p>
        </div>

        {/* Card principale */}
        <Card className="shadow-lg mb-6">
          <CardHeader className="bg-blue-50 border-b border-gray-100">
            <CardTitle className="text-2xl text-blue-900">
              📋 Étapes du parcours
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              
              {/* Phase 1 : Bilan */}
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="font-bold text-gray-900 mb-2">
                  Phase 1 : Bilan patrimonial complet
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Situation civile :</strong> Famille, régime matrimonial, enfants</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Situation fiscale :</strong> Revenus, TMI, charges déductibles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Succession :</strong> Testament, donations, transmission</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Liquidités :</strong> Comptes, livrets, épargne réglementée</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Placements :</strong> Assurance-vie, PEA, CTO, PER</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Immobilier :</strong> Résidence principale, locatif, SCPI</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Sociétés :</strong> Participations, valorisation, dividendes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Autres actifs :</strong> Crypto, métaux, œuvres d'art</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Synthèse :</strong> Vue globale avec graphiques</span>
                  </li>
                </ul>
              </div>

              {/* Phase 2 : Préconisations */}
              <div className="border-l-4 border-green-600 pl-4">
                <h3 className="font-bold text-gray-900 mb-2">
                  Phase 2 : Préconisations personnalisées
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Allocation d'actifs cible selon votre profil</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>ETF recommandés par enveloppe (PEA, AV, CTO)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Optimisation fiscale (asset location)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Plan d'action priorisé avec économies estimées</span>
                  </li>
                </ul>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Info card */}
        <Card className="bg-blue-50 border-blue-200 mb-8">
          <CardContent className="py-4">
            <p className="text-sm text-blue-900 text-center">
              ⏱️ <strong>Temps estimé :</strong> 15-20 minutes • 
              💾 <strong>Sauvegarde auto :</strong> vos données sont conservées à chaque étape
            </p>
          </CardContent>
        </Card>

        {/* Boutons d'action */}
        <div className="flex gap-4 justify-center">
          <Button 
            variant="outline" 
            onClick={() => router.push('/')}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Retour à l'accueil
          </Button>
          
          <Button 
            size="lg" 
            onClick={handleStart}
            className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            Commencer le bilan
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

      </div>
    </div>
  )
}
