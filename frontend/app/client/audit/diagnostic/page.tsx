'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { generateMockDiagnostic } from '@/lib/data/mock-audit'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, XCircle, Lightbulb, TrendingUp } from 'lucide-react'

export default function AuditDiagnosticPage() {
  const router = useRouter()
  const { audit, setDiagnostic } = useClientStore()

  useEffect(() => {
    // Generate diagnostic if not already done
    if (audit.placements && audit.placements.length > 0 && !audit.diagnostic) {
      const diagnostic = generateMockDiagnostic(audit.placements)
      setDiagnostic(diagnostic)
    }
  }, [audit, setDiagnostic])

  const diagnostic = audit.diagnostic

  if (!diagnostic) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-600 mb-4">Génération du diagnostic en cours...</p>
            <Button onClick={() => router.push('/client/audit/analyse')}>
              Retour à l'analyse
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const scoreColor = diagnostic.score_global >= 70 ? 'text-green-600' : 
                     diagnostic.score_global >= 50 ? 'text-orange-600' : 
                     'text-red-600'
  
  const scoreBgColor = diagnostic.score_global >= 70 ? 'bg-green-50 border-green-200' : 
                       diagnostic.score_global >= 50 ? 'bg-orange-50 border-orange-200' : 
                       'bg-red-50 border-red-200'

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 Audit de l'Épargne</h1>
        <p className="text-gray-600">Étape 3/3 - Diagnostic détaillé</p>
      </div>

      {/* Score global */}
      <Card className={`mb-8 ${scoreBgColor}`}>
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Score global de votre épargne</h2>
              <p className="text-gray-700">
                Basé sur : frais, fiscalité, diversification, liquidité
              </p>
            </div>
            <div className="text-center">
              <div className={`text-6xl font-bold ${scoreColor}`}>
                {diagnostic.score_global}
              </div>
              <div className="text-gray-600 font-medium">/100</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Économie potentielle */}
      {diagnostic.economie_potentielle_annuelle > 0 && (
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="text-xl font-bold text-blue-900">
                    Économie potentielle annuelle
                  </h3>
                  <p className="text-blue-700 text-sm">
                    En optimisant vos frais et votre fiscalité
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-900">
                  {formatCurrency(diagnostic.economie_potentielle_annuelle)}
                </div>
                <div className="text-sm text-blue-700">
                  {formatCurrency(diagnostic.economie_potentielle_annuelle * 10)} sur 10 ans
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Points forts */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <CardTitle className="text-green-900">Points forts</CardTitle>
            </div>
            <CardDescription>
              Ce qui fonctionne bien dans votre stratégie
            </CardDescription>
          </CardHeader>
          <CardContent>
            {diagnostic.points_forts.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Aucun point fort identifié</p>
            ) : (
              <div className="space-y-4">
                {diagnostic.points_forts.map((point: any, index: number) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-green-900 mb-1">{point.titre}</h4>
                    <p className="text-sm text-gray-700 mb-2">{point.description}</p>
                    <p className="text-xs text-green-700 font-medium">
                      ✓ {point.impact}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Points d'attention */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <CardTitle className="text-orange-900">Points d'attention</CardTitle>
            </div>
            <CardDescription>
              Améliorations possibles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {diagnostic.points_attention.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Aucun point d'attention</p>
            ) : (
              <div className="space-y-4">
                {diagnostic.points_attention.map((point: any, index: number) => (
                  <div key={index} className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-semibold text-orange-900 mb-1">{point.titre}</h4>
                    <p className="text-sm text-gray-700 mb-2">{point.description}</p>
                    <p className="text-xs text-orange-700 font-medium">
                      → {point.recommandation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Points faibles */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <CardTitle className="text-red-900">Points faibles</CardTitle>
            </div>
            <CardDescription>
              Problèmes à corriger rapidement
            </CardDescription>
          </CardHeader>
          <CardContent>
            {diagnostic.points_faibles.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Aucun point faible majeur</p>
            ) : (
              <div className="space-y-4">
                {diagnostic.points_faibles.map((point: any, index: number) => (
                  <div key={index} className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-semibold text-red-900 mb-1">{point.titre}</h4>
                    <p className="text-sm text-gray-700 mb-1">{point.description}</p>
                    <p className="text-xs text-red-700 mb-2">⚠️ {point.consequence}</p>
                    <p className="text-xs text-red-800 font-medium bg-red-50 p-2 rounded">
                      💡 {point.action_corrective}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Opportunités */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-blue-900">Opportunités</CardTitle>
            </div>
            <CardDescription>
              Leviers d'optimisation disponibles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {diagnostic.opportunites.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Aucune opportunité identifiée</p>
            ) : (
              <div className="space-y-4">
                {diagnostic.opportunites.map((point: any, index: number) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-blue-900 mb-1">{point.titre}</h4>
                    <p className="text-sm text-gray-700 mb-2">{point.description}</p>
                    <p className="text-xs text-blue-700 font-medium bg-blue-50 p-2 rounded">
                      💰 {point.gain_potentiel}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardContent className="py-6">
          <h3 className="text-xl font-bold mb-2">🎯 Prêt pour l'étape suivante ?</h3>
          <p className="text-gray-700 mb-4">
            Découvrez vos recommandations personnalisées et le plan d'action pour optimiser votre patrimoine.
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            onClick={() => router.push('/client/recommandations')}
          >
            Voir mes recommandations
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.push('/client/audit/analyse')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour : Analyse
        </Button>
        <Button onClick={() => router.push('/client/recommandations')}>
          Suivant : Recommandations
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
