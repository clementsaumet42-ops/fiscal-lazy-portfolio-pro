'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { BilanCivil, Enfant } from '@/lib/types/assessment'
import { generateId } from '@/lib/utils/assessment/helpers'
import { User, Users, Heart, Plus, Trash2, Globe } from 'lucide-react'

export default function BilanCivilPage() {
  const router = useRouter()
  const { assessment, setBilanCivil } = useClientStore()
  
  const [formData, setFormData] = useState<BilanCivil>(
    assessment.bilan_civil || {
      nom: '',
      prenom: '',
      date_naissance: new Date(),
      lieu_naissance: '',
      nationalite: 'France',
      situation_familiale: 'Célibataire',
      regime_matrimonial: undefined,
      date_mariage: undefined,
      enfants: [],
      residence_fiscale: 'France',
      pays_residence_fiscale: undefined,
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setBilanCivil(formData)
    router.push('/client/bilan/fiscal')
  }

  const handleChange = (field: keyof BilanCivil, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addEnfant = () => {
    const newEnfant: Enfant = {
      id: generateId(),
      prenom: '',
      date_naissance: new Date(),
      lien_filiation: 'Légitime',
    }
    setFormData(prev => ({
      ...prev,
      enfants: [...prev.enfants, newEnfant]
    }))
  }

  const removeEnfant = (id: string) => {
    setFormData(prev => ({
      ...prev,
      enfants: prev.enfants.filter(e => e.id !== id)
    }))
  }

  const updateEnfant = (id: string, field: keyof Enfant, value: any) => {
    setFormData(prev => ({
      ...prev,
      enfants: prev.enfants.map(e =>
        e.id === id ? { ...e, [field]: value } : e
      )
    }))
  }

  const showRegimeMatrimonial = 
    formData.situation_familiale === 'Marié(e)' || 
    formData.situation_familiale === 'Pacsé(e)'

  return (
    <div className="min-h-screen bg-midnight">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            👤 Bilan Civil
          </h1>
          <p className="text-cream/70 text-lg">
            Étape 3/11 - Informations personnelles et situation familiale
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-midnight-lighter rounded-full h-2">
            <div className="bg-gold h-2 rounded-full transition-all duration-300" style={{ width: '27%' }}></div>
          </div>
          <p className="text-cream/70 text-sm mt-2">Progression: 3 sur 11 étapes</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card className="bg-midnight-light border-midnight-lighter">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-6 h-6 text-gold" />
                <CardTitle className="text-white">Informations personnelles</CardTitle>
              </div>
              <CardDescription className="text-cream/70">
                État civil et coordonnées
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nom">Nom *</Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => handleChange('nom', e.target.value)}
                    placeholder="Dupont"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="prenom">Prénom *</Label>
                  <Input
                    id="prenom"
                    value={formData.prenom}
                    onChange={(e) => handleChange('prenom', e.target.value)}
                    placeholder="Jean"
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date_naissance">Date de naissance *</Label>
                  <Input
                    id="date_naissance"
                    type="date"
                    value={formData.date_naissance instanceof Date 
                      ? formData.date_naissance.toISOString().split('T')[0] 
                      : formData.date_naissance}
                    onChange={(e) => handleChange('date_naissance', new Date(e.target.value))}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lieu_naissance">Lieu de naissance *</Label>
                  <Input
                    id="lieu_naissance"
                    value={formData.lieu_naissance}
                    onChange={(e) => handleChange('lieu_naissance', e.target.value)}
                    placeholder="Paris"
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="nationalite">Nationalité *</Label>
                <Input
                  id="nationalite"
                  value={formData.nationalite}
                  onChange={(e) => handleChange('nationalite', e.target.value)}
                  placeholder="France"
                  required
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Family Status */}
          <Card className="bg-midnight-light border-midnight-lighter">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-gold" />
                <CardTitle className="text-white">Situation familiale</CardTitle>
              </div>
              <CardDescription className="text-cream/70">
                Régime matrimonial et composition du foyer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="situation_familiale">Situation familiale *</Label>
                <Select
                  id="situation_familiale"
                  value={formData.situation_familiale}
                  onChange={(e) => handleChange('situation_familiale', e.target.value as any)}
                  required
                  className="mt-1"
                >
                  <option value="Célibataire">Célibataire</option>
                  <option value="Marié(e)">Marié(e)</option>
                  <option value="Pacsé(e)">Pacsé(e)</option>
                  <option value="Divorcé(e)">Divorcé(e)</option>
                  <option value="Veuf(ve)">Veuf(ve)</option>
                </Select>
              </div>

              {showRegimeMatrimonial && (
                <>
                  <div>
                    <Label htmlFor="regime_matrimonial">Régime matrimonial *</Label>
                    <Select
                      id="regime_matrimonial"
                      value={formData.regime_matrimonial || ''}
                      onChange={(e) => handleChange('regime_matrimonial', e.target.value)}
                      required
                      className="mt-1"
                    >
                      <option value="">Sélectionner...</option>
                      <option value="Communauté réduite aux acquêts">Communauté réduite aux acquêts</option>
                      <option value="Séparation de biens">Séparation de biens</option>
                      <option value="Communauté universelle">Communauté universelle</option>
                      <option value="Participation aux acquêts">Participation aux acquêts</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="date_mariage">Date de mariage / PACS</Label>
                    <Input
                      id="date_mariage"
                      type="date"
                      value={formData.date_mariage instanceof Date 
                        ? formData.date_mariage.toISOString().split('T')[0] 
                        : formData.date_mariage || ''}
                      onChange={(e) => handleChange('date_mariage', e.target.value ? new Date(e.target.value) : undefined)}
                      className="mt-1"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Children */}
          <Card className="bg-midnight-light border-midnight-lighter">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-gold" />
                  <CardTitle className="text-white">Enfants</CardTitle>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEnfant}
                  className="border-gold text-gold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un enfant
                </Button>
              </div>
              <CardDescription className="text-cream/70">
                {formData.enfants.length} enfant(s) déclaré(s)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.enfants.length === 0 ? (
                <div className="text-center py-8 text-cream/50">
                  Aucun enfant déclaré. Cliquez sur "Ajouter un enfant" si nécessaire.
                </div>
              ) : (
                formData.enfants.map((enfant, index) => (
                  <div 
                    key={enfant.id} 
                    className="p-4 border border-midnight-lighter rounded-lg bg-midnight/50 space-y-3"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-white font-semibold">Enfant {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEnfant(enfant.id)}
                        className="hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label>Prénom *</Label>
                        <Input
                          value={enfant.prenom}
                          onChange={(e) => updateEnfant(enfant.id, 'prenom', e.target.value)}
                          placeholder="Prénom"
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Date de naissance *</Label>
                        <Input
                          type="date"
                          value={enfant.date_naissance instanceof Date 
                            ? enfant.date_naissance.toISOString().split('T')[0] 
                            : enfant.date_naissance}
                          onChange={(e) => updateEnfant(enfant.id, 'date_naissance', new Date(e.target.value))}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Lien de filiation *</Label>
                        <Select
                          value={enfant.lien_filiation}
                          onChange={(e) => updateEnfant(enfant.id, 'lien_filiation', e.target.value)}
                          required
                          className="mt-1"
                        >
                          <option value="Légitime">Légitime</option>
                          <option value="Naturel">Naturel</option>
                          <option value="Adopté">Adopté</option>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Fiscal Residence */}
          <Card className="bg-midnight-light border-midnight-lighter">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="w-6 h-6 text-gold" />
                <CardTitle className="text-white">Résidence fiscale</CardTitle>
              </div>
              <CardDescription className="text-cream/70">
                Pays de résidence fiscale
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="residence_fiscale">Résidence fiscale *</Label>
                <Select
                  id="residence_fiscale"
                  value={formData.residence_fiscale}
                  onChange={(e) => handleChange('residence_fiscale', e.target.value as 'France' | 'Étranger')}
                  required
                  className="mt-1"
                >
                  <option value="France">France</option>
                  <option value="Étranger">Étranger</option>
                </Select>
              </div>

              {formData.residence_fiscale === 'Étranger' && (
                <div>
                  <Label htmlFor="pays_residence_fiscale">Pays de résidence fiscale *</Label>
                  <Input
                    id="pays_residence_fiscale"
                    value={formData.pays_residence_fiscale || ''}
                    onChange={(e) => handleChange('pays_residence_fiscale', e.target.value)}
                    placeholder="Suisse, Luxembourg..."
                    required
                    className="mt-1"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t border-midnight-lighter">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/client/prise-connaissance')}
            >
              ← Retour
            </Button>
            <Button type="submit" variant="gold" size="lg">
              Suivant : Bilan fiscal →
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
