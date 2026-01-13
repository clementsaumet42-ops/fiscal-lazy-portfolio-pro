'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Stepper } from '@/components/ui/stepper'
import { ProfilClient } from '@/lib/types'

const STEPS = ['Profil', 'Enveloppes', 'Allocation', 'Optimisation', 'Backtest', 'Rapport']

export default function ProfilPage() {
  const router = useRouter()
  const { setProfil } = useClientStore()
  
  const [formData, setFormData] = useState<ProfilClient>({
    nom: '',
    prenom: '',
    age: 35,
    situation_familiale: 'marie',
    nombre_parts_fiscales: 2,
    revenu_imposable: 50000,
    patrimoine_actuel: 100000,
    objectif_investissement: 'equilibre',
    horizon_placement: 20,
    tolerance_risque: 'modere',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setProfil(formData)
    router.push('/client/enveloppes')
  }

  const handleChange = (field: keyof ProfilClient, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight to-midnight-light">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Profil <span className="text-gold">Client</span>
          </h1>
          <p className="text-cream/70 text-lg">
            Renseignez les informations du client pour démarrer la simulation
          </p>
        </div>

        <Stepper currentStep={1} totalSteps={6} steps={STEPS} />
        
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Informations Client</CardTitle>
            <CardDescription>
              Collectez les données nécessaires pour l'optimisation fiscale
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations personnelles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-cream/90">Nom</label>
                  <Input
                    required
                    value={formData.nom}
                    onChange={(e) => handleChange('nom', e.target.value)}
                    placeholder="Dupont"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-cream/90">Prénom</label>
                  <Input
                    required
                    value={formData.prenom}
                    onChange={(e) => handleChange('prenom', e.target.value)}
                    placeholder="Jean"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-cream/90">Âge</label>
                  <Input
                    type="number"
                    required
                    min="18"
                    max="100"
                    value={formData.age}
                    onChange={(e) => handleChange('age', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-cream/90">Situation familiale</label>
                  <Select
                    value={formData.situation_familiale}
                    onChange={(e) => handleChange('situation_familiale', e.target.value)}
                  >
                    <option value="celibataire">Célibataire</option>
                    <option value="marie">Marié(e)</option>
                    <option value="pacse">Pacsé(e)</option>
                    <option value="divorce">Divorcé(e)</option>
                  </Select>
                </div>
              </div>

              {/* Informations fiscales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-cream/90">Nombre de parts fiscales</label>
                  <Input
                    type="number"
                    required
                    min="1"
                    step="0.5"
                    value={formData.nombre_parts_fiscales}
                    onChange={(e) => handleChange('nombre_parts_fiscales', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-cream/90">Revenu imposable annuel (€)</label>
                  <Input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    value={formData.revenu_imposable}
                    onChange={(e) => handleChange('revenu_imposable', parseInt(e.target.value))}
                  />
                </div>
              </div>

              {/* Patrimoine et objectifs */}
              <div>
                <label className="block text-sm font-medium mb-2 text-cream/90">Patrimoine actuel (€)</label>
                <Input
                  type="number"
                  required
                  min="0"
                  step="10000"
                  value={formData.patrimoine_actuel}
                  onChange={(e) => handleChange('patrimoine_actuel', parseInt(e.target.value))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-cream/90">Objectif d'investissement</label>
                  <Select
                    value={formData.objectif_investissement}
                    onChange={(e) => handleChange('objectif_investissement', e.target.value)}
                  >
                    <option value="croissance">Croissance</option>
                    <option value="revenus">Revenus</option>
                    <option value="equilibre">Équilibre</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-cream/90">Horizon de placement (années)</label>
                  <Input
                    type="number"
                    required
                    min="1"
                    max="50"
                    value={formData.horizon_placement}
                    onChange={(e) => handleChange('horizon_placement', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-cream/90">Tolérance au risque</label>
                <Select
                  value={formData.tolerance_risque}
                  onChange={(e) => handleChange('tolerance_risque', e.target.value)}
                >
                  <option value="faible">Faible</option>
                  <option value="modere">Modéré</option>
                  <option value="eleve">Élevé</option>
                </Select>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" size="lg" variant="gold">
                  Suivant: Enveloppes →
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
