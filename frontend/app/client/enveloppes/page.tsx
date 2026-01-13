'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Stepper } from '@/components/ui/stepper'
import { EnveloppeConfig, TypeEnveloppe } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

const STEPS = ['Profil', 'Enveloppes', 'Allocation', 'Optimisation', 'Backtest', 'Rapport']

const ENVELOPPES_INFO = [
  {
    type: 'PEA' as TypeEnveloppe,
    nom: 'Plan d\'Épargne en Actions',
    description: 'Exonération d\'impôt sur les plus-values après 5 ans',
    plafond: 150000,
    avantages: [
      'Exonération fiscale après 5 ans',
      'Prélèvements sociaux uniquement (17,2%)',
      'Investissement en actions européennes',
    ]
  },
  {
    type: 'CTO' as TypeEnveloppe,
    nom: 'Compte-Titres Ordinaire',
    description: 'Compte sans plafond avec fiscalité complète',
    plafond: null,
    avantages: [
      'Aucun plafond de versement',
      'Accès à tous les marchés mondiaux',
      'Liquidité immédiate',
    ]
  },
  {
    type: 'Assurance_vie' as TypeEnveloppe,
    nom: 'Assurance-Vie',
    description: 'Enveloppe fiscale avantageuse après 8 ans',
    plafond: null,
    avantages: [
      'Abattement annuel après 8 ans',
      'Transmission successorale optimisée',
      'Diversification actions/obligations',
    ]
  },
  {
    type: 'PER' as TypeEnveloppe,
    nom: 'Plan d\'Épargne Retraite',
    description: 'Déduction fiscale à l\'entrée',
    plafond: null,
    avantages: [
      'Déduction fiscale des versements',
      'Capitalisation défiscalisée',
      'Sortie en rente ou capital',
    ]
  },
]

export default function EnveloppesPage() {
  const router = useRouter()
  const { profil, setEnveloppes } = useClientStore()
  
  const [selectedEnveloppes, setSelectedEnveloppes] = useState<EnveloppeConfig[]>([])

  const handleToggle = (type: TypeEnveloppe) => {
    const exists = selectedEnveloppes.find(e => e.type === type)
    if (exists) {
      setSelectedEnveloppes(selectedEnveloppes.filter(e => e.type !== type))
    } else {
      setSelectedEnveloppes([
        ...selectedEnveloppes,
        { type, montant_initial: 10000, versements_mensuels: 500 }
      ])
    }
  }

  const handleUpdate = (type: TypeEnveloppe, field: 'montant_initial' | 'versements_mensuels', value: number) => {
    setSelectedEnveloppes(
      selectedEnveloppes.map(e => 
        e.type === type ? { ...e, [field]: value } : e
      )
    )
  }

  const handleSubmit = () => {
    if (selectedEnveloppes.length === 0) {
      alert('Veuillez sélectionner au moins une enveloppe')
      return
    }
    setEnveloppes(selectedEnveloppes)
    router.push('/client/allocation')
  }

  const totalMontantInitial = selectedEnveloppes.reduce((sum, e) => sum + e.montant_initial, 0)
  const totalVersementsMensuels = selectedEnveloppes.reduce((sum, e) => sum + e.versements_mensuels, 0)

  if (!profil) {
    router.push('/client/profil')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight to-midnight-light">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Enveloppes <span className="text-gold">Fiscales</span>
          </h1>
          <p className="text-cream/70 text-lg">
            Sélectionnez les enveloppes dans lesquelles vous souhaitez investir
          </p>
        </div>

        <Stepper currentStep={2} totalSteps={6} steps={STEPS} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 mb-8">
          {ENVELOPPES_INFO.map((info: any) => {
            const isSelected = selectedEnveloppes.some(e => e.type === info.type)
            const enveloppe = selectedEnveloppes.find(e => e.type === info.type)
            
            return (
              <Card 
                key={info.type} 
                className={isSelected ? 'border-gold border-2 shadow-gold' : ''}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{info.nom}</CardTitle>
                      <CardDescription className="mt-2">
                        {info.description}
                      </CardDescription>
                      {info.plafond && (
                        <p className="text-sm text-gold mt-2 font-medium">
                          Plafond: {formatCurrency(info.plafond)}
                        </p>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggle(info.type)}
                      className="w-5 h-5 text-gold rounded focus:ring-gold accent-gold"
                    />
                  </div>
                </CardHeader>
                
                {isSelected && enveloppe && (
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-cream/90">
                          Montant initial (€)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="1000"
                          value={enveloppe.montant_initial}
                          onChange={(e) => handleUpdate(info.type, 'montant_initial', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-cream/90">
                          Versements mensuels (€)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="100"
                          value={enveloppe.versements_mensuels}
                          onChange={(e) => handleUpdate(info.type, 'versements_mensuels', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-midnight-lighter">
                      <h4 className="font-medium text-sm mb-2 text-white">Avantages:</h4>
                      <ul className="space-y-1">
                        {info.avantages.map((avantage: any, index: number) => (
                          <li key={index} className="text-sm text-cream/70 flex items-start">
                            <span className="text-gold mr-2 font-bold">✓</span>
                            {avantage}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>

        {selectedEnveloppes.length > 0 && (
          <Card className="mb-8 bg-gold/10 border-gold">
            <CardHeader>
              <CardTitle>Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-cream/70">Enveloppes sélectionnées</p>
                  <p className="text-2xl font-bold text-gold">{selectedEnveloppes.length}</p>
                </div>
                <div>
                  <p className="text-sm text-cream/70">Montant initial total</p>
                  <p className="text-2xl font-bold text-gold">{formatCurrency(totalMontantInitial)}</p>
                </div>
                <div>
                  <p className="text-sm text-cream/70">Versements mensuels totaux</p>
                  <p className="text-2xl font-bold text-gold">{formatCurrency(totalVersementsMensuels)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => router.push('/client/profil')}>
            ← Retour
          </Button>
          <Button onClick={handleSubmit} size="lg" variant="gold" disabled={selectedEnveloppes.length === 0}>
            Suivant: Allocation →
          </Button>
        </div>
      </div>
    </div>
  )
}
