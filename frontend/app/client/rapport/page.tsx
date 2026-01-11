'use client'

import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Stepper } from '@/components/ui/stepper'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { Download, FileText, Mail } from 'lucide-react'

const STEPS = ['Profil', 'Enveloppes', 'Allocation', 'Optimisation', 'Backtest', 'Rapport']

export default function RapportPage() {
  const router = useRouter()
  const { profil, enveloppes, allocation, optimisation, backtest, reset } = useClientStore()

  if (!profil || !allocation || !optimisation || !backtest) {
    router.push('/client/profil')
    return null
  }

  const handleNewSimulation = () => {
    if (confirm('Êtes-vous sûr de vouloir démarrer une nouvelle simulation ?')) {
      reset()
      router.push('/client/profil')
    }
  }

  const handleDownloadPDF = () => {
    alert('Fonctionnalité de téléchargement PDF à implémenter')
    // TODO: Implémenter la génération PDF
  }

  const handleExportExcel = () => {
    alert('Fonctionnalité d\'export Excel à implémenter')
    // TODO: Implémenter l'export Excel
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Stepper currentStep={6} totalSteps={6} steps={STEPS} />
      
      <div className="mt-8 mb-6">
        <h1 className="text-3xl font-bold mb-2">Rapport final</h1>
        <p className="text-gray-600">
          Récapitulatif complet de votre simulation d'optimisation
        </p>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Button onClick={handleDownloadPDF} className="h-auto py-4" variant="outline">
          <div className="flex flex-col items-center gap-2">
            <Download className="w-6 h-6" />
            <span>Télécharger PDF</span>
          </div>
        </Button>
        <Button onClick={handleExportExcel} className="h-auto py-4" variant="outline">
          <div className="flex flex-col items-center gap-2">
            <FileText className="w-6 h-6" />
            <span>Exporter Excel</span>
          </div>
        </Button>
        <Button className="h-auto py-4" variant="outline">
          <div className="flex flex-col items-center gap-2">
            <Mail className="w-6 h-6" />
            <span>Envoyer par email</span>
          </div>
        </Button>
      </div>

      {/* Profil client */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>1. Profil Client</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nom complet</p>
              <p className="font-semibold">{profil.prenom} {profil.nom}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Âge</p>
              <p className="font-semibold">{profil.age} ans</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Situation familiale</p>
              <p className="font-semibold capitalize">{profil.situation_familiale}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Parts fiscales</p>
              <p className="font-semibold">{profil.nombre_parts_fiscales}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Revenu imposable annuel</p>
              <p className="font-semibold">{formatCurrency(profil.revenu_imposable)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Patrimoine actuel</p>
              <p className="font-semibold">{formatCurrency(profil.patrimoine_actuel)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Horizon de placement</p>
              <p className="font-semibold">{profil.horizon_placement} ans</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tolérance au risque</p>
              <p className="font-semibold capitalize">{profil.tolerance_risque}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enveloppes sélectionnées */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>2. Enveloppes Sélectionnées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {enveloppes.map((env, index) => (
              <div key={index} className="border-l-4 border-primary pl-4">
                <p className="font-semibold">{env.type}</p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <div>
                    <span className="text-gray-600">Montant initial: </span>
                    <span className="font-medium">{formatCurrency(env.montant_initial)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Versements mensuels: </span>
                    <span className="font-medium">{formatCurrency(env.versements_mensuels)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Allocation recommandée */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>3. Allocation d'Actifs Recommandée</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{formatPercentage(allocation.actions_monde)}</p>
              <p className="text-sm text-gray-600">Actions Monde</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{formatPercentage(allocation.actions_europe)}</p>
              <p className="text-sm text-gray-600">Actions Europe</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{formatPercentage(allocation.obligations)}</p>
              <p className="text-sm text-gray-600">Obligations</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{formatPercentage(allocation.immobilier)}</p>
              <p className="text-sm text-gray-600">Immobilier</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{formatPercentage(allocation.cash)}</p>
              <p className="text-sm text-gray-600">Cash</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimisation fiscale */}
      <Card className="mb-6 bg-secondary-50 border-secondary">
        <CardHeader>
          <CardTitle className="text-secondary">4. Optimisation Fiscale</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-secondary">
                {formatCurrency(optimisation.fiscalite_estimee.economie_vs_cto_pur)}
              </p>
              <p className="text-sm text-gray-700 mt-2">Économie fiscale annuelle</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold">
                {formatCurrency(optimisation.fiscalite_estimee.impot_annuel)}
              </p>
              <p className="text-sm text-gray-700 mt-2">Impôt annuel estimé</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-secondary">
                -63%
              </p>
              <p className="text-sm text-gray-700 mt-2">Réduction d'impôt</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance attendue */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>5. Performance Historique (Backtest 10 ans)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Rendement annuel moyen</p>
              <p className="text-2xl font-bold text-secondary">
                {formatPercentage(backtest.performance.rendement_annuel)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Volatilité</p>
              <p className="text-2xl font-bold">
                {formatPercentage(backtest.performance.volatilite)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Max Drawdown</p>
              <p className="text-2xl font-bold text-red-600">
                {formatPercentage(backtest.performance.max_drawdown)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Sharpe Ratio</p>
              <p className="text-2xl font-bold text-primary">
                {backtest.performance.sharpe_ratio.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommandations */}
      <Card className="mb-8 bg-blue-50 border-primary">
        <CardHeader>
          <CardTitle>Recommandations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-secondary mr-2 font-bold">✓</span>
              <span className="text-sm">
                Privilégier le <strong>PEA</strong> pour les actions européennes afin de bénéficier de l'exonération fiscale après 5 ans
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-secondary mr-2 font-bold">✓</span>
              <span className="text-sm">
                Utiliser le <strong>CTO</strong> pour diversifier internationalement et investir dans les obligations
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-secondary mr-2 font-bold">✓</span>
              <span className="text-sm">
                Rééquilibrer le portefeuille <strong>trimestriellement</strong> pour maintenir l'allocation cible
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-secondary mr-2 font-bold">✓</span>
              <span className="text-sm">
                Économie fiscale estimée: <strong>{formatCurrency(optimisation.fiscalite_estimee.economie_vs_cto_pur)}/an</strong>
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Actions finales */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          Voir le Dashboard
        </Button>
        <Button onClick={handleNewSimulation} size="lg">
          Nouvelle Simulation
        </Button>
      </div>
    </div>
  )
}
