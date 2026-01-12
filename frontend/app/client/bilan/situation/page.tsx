'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { BilanStepper } from '@/components/bilan/BilanStepper'
import { SituationPersonnelle } from '@/lib/types/bilan'
import { User, Home } from 'lucide-react'

export default function SituationPersonnellePage() {
  const router = useRouter()
  const { bilan, setSituation } = useClientStore()
  
  const [formData, setFormData] = useState<SituationPersonnelle>(
    bilan.situation || {
      nom: '',
      prenom: '',
      age: 35,
      situation_familiale: 'marie',
      nombre_enfants: 0,
      situation_professionnelle: 'salarie',
      profession: '',
      residence_principale: {
        statut: 'locataire',
      }
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSituation(formData)
    router.push('/client/bilan/revenus')
  }

  const handleChange = (field: keyof SituationPersonnelle, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleResidenceChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      residence_principale: {
        ...prev.residence_principale,
        [field]: value
      }
    }))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📋 Bilan Patrimonial</h1>
        <p className="text-gray-600">Étape 1/4 - Situation personnelle</p>
      </div>

      <BilanStepper currentStep={1} />
      
      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <CardTitle>Informations personnelles</CardTitle>
          </div>
          <CardDescription>
            Renseignez les informations personnelles du client
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Identité */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nom *</label>
                <Input
                  required
                  value={formData.nom}
                  onChange={(e) => handleChange('nom', e.target.value)}
                  placeholder="Dupont"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Prénom *</label>
                <Input
                  required
                  value={formData.prenom}
                  onChange={(e) => handleChange('prenom', e.target.value)}
                  placeholder="Jean"
                />
              </div>
            </div>

            {/* Âge et Situation familiale */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Âge *</label>
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
                <label className="block text-sm font-medium mb-2">Situation familiale *</label>
                <Select
                  value={formData.situation_familiale}
                  onChange={(e) => handleChange('situation_familiale', e.target.value)}
                >
                  <option value="celibataire">Célibataire</option>
                  <option value="marie">Marié(e)</option>
                  <option value="pacse">Pacsé(e)</option>
                  <option value="divorce">Divorcé(e)</option>
                  <option value="veuf">Veuf/Veuve</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nombre d'enfants</label>
                <Input
                  type="number"
                  min="0"
                  max="20"
                  value={formData.nombre_enfants}
                  onChange={(e) => handleChange('nombre_enfants', parseInt(e.target.value))}
                />
              </div>
            </div>

            {/* Situation professionnelle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Situation professionnelle *</label>
                <Select
                  value={formData.situation_professionnelle}
                  onChange={(e) => handleChange('situation_professionnelle', e.target.value)}
                >
                  <option value="salarie">Salarié</option>
                  <option value="independant">Indépendant</option>
                  <option value="retraite">Retraité</option>
                  <option value="autre">Autre</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Profession</label>
                <Input
                  value={formData.profession || ''}
                  onChange={(e) => handleChange('profession', e.target.value)}
                  placeholder="Ingénieur, Consultant..."
                />
              </div>
            </div>

            {/* Résidence principale */}
            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Home className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Résidence principale</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Statut *</label>
                  <Select
                    value={formData.residence_principale.statut}
                    onChange={(e) => handleResidenceChange('statut', e.target.value)}
                  >
                    <option value="proprietaire">Propriétaire</option>
                    <option value="locataire">Locataire</option>
                  </Select>
                </div>

                {formData.residence_principale.statut === 'proprietaire' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Valeur estimée (€)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="10000"
                      value={formData.residence_principale.valeur || ''}
                      onChange={(e) => handleResidenceChange('valeur', parseInt(e.target.value))}
                      placeholder="250000"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Boutons de navigation */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/client/parcours')}
              >
                Retour au parcours
              </Button>
              <Button type="submit" size="lg">
                Suivant : Revenus et charges
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
