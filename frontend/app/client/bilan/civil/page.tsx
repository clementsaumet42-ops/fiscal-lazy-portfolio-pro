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
import { User, Users, Baby, Trash2, Plus, Globe } from 'lucide-react'

export default function BilanCivilPage() {
  const router = useRouter()
  const { assessment, setBilanCivil } = useClientStore()
  
  const [formData, setFormData] = useState<BilanCivil>(
    assessment.bilan_civil || {
      nom: '',
      prenom: '',
      date_naissance: new Date(),
      lieu_naissance: '',
      nationalite: 'Française',
      situation_familiale: 'Célibataire',
      enfants: [],
      residence_fiscale: 'France',
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
    setFormData(prev => ({
      ...prev,
      enfants: [...prev.enfants, {
        id: generateId(),
        prenom: '',
        date_naissance: new Date(),
        lien_filiation: 'Légitime'
      }]
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

  const showRegimeMatrimonial = formData.situation_familiale === 'Marié(e)'
  const showDateMariage = formData.situation_familiale === 'Marié(e)'
  const showPaysResidence = formData.residence_fiscale === 'Étranger'

  return (
    <div className="min-h-screen bg-midnight">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            👤 Situation Civile
          </h1>
          <p className="text-cream/70 text-lg">
            Étape 2/11 - Collectons vos informations personnelles et familiales
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-midnight-lighter rounded-full h-2">
            <div className="bg-gold h-2 rounded-full transition-all duration-300" style={{ width: '18%' }}></div>
          </div>
          <p className="text-cream/70 text-sm mt-2">Progression: 2 sur 11 étapes</p>
        </div>
        
        <Card className="bg-midnight-light border-midnight-lighter">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-6 h-6 text-gold" />
              <CardTitle className="text-white">Bilan Civil</CardTitle>
            </div>
            <CardDescription className="text-cream/70">
              Ces informations sont essentielles pour comprendre votre situation personnelle et familiale.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-gold" />
                  Informations Personnelles
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nom" className="text-cream">Nom *</Label>
                    <Input
                      id="nom"
                      value={formData.nom}
                      onChange={(e) => handleChange('nom', e.target.value)}
                      required
                      className="mt-1 bg-midnight border-midnight-lighter text-white"
                      placeholder="Nom de famille"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="prenom" className="text-cream">Prénom *</Label>
                    <Input
                      id="prenom"
                      value={formData.prenom}
                      onChange={(e) => handleChange('prenom', e.target.value)}
                      required
                      className="mt-1 bg-midnight border-midnight-lighter text-white"
                      placeholder="Prénom"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date_naissance" className="text-cream">Date de naissance *</Label>
                    <Input
                      id="date_naissance"
                      type="date"
                      value={formData.date_naissance instanceof Date ? formData.date_naissance.toISOString().split('T')[0] : ''}
                      onChange={(e) => handleChange('date_naissance', new Date(e.target.value))}
                      required
                      className="mt-1 bg-midnight border-midnight-lighter text-white"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="lieu_naissance" className="text-cream">Lieu de naissance *</Label>
                    <Input
                      id="lieu_naissance"
                      value={formData.lieu_naissance}
                      onChange={(e) => handleChange('lieu_naissance', e.target.value)}
                      required
                      className="mt-1 bg-midnight border-midnight-lighter text-white"
                      placeholder="Ville, Pays"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="nationalite" className="text-cream">Nationalité *</Label>
                  <Input
                    id="nationalite"
                    value={formData.nationalite}
                    onChange={(e) => handleChange('nationalite', e.target.value)}
                    required
                    className="mt-1 bg-midnight border-midnight-lighter text-white"
                    placeholder="Ex: Française"
                  />
                </div>
              </div>

              {/* Family Situation Section */}
              <div className="space-y-4 pt-6 border-t border-midnight-lighter">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-gold" />
                  Situation Familiale
                </h3>
                
                <div>
                  <Label htmlFor="situation_familiale" className="text-cream">Situation familiale *</Label>
                  <Select
                    id="situation_familiale"
                    value={formData.situation_familiale}
                    onChange={(e) => handleChange('situation_familiale', e.target.value)}
                    required
                    className="mt-1 bg-midnight border-midnight-lighter text-white"
                  >
                    <option value="Célibataire">Célibataire</option>
                    <option value="Marié(e)">Marié(e)</option>
                    <option value="Pacsé(e)">Pacsé(e)</option>
                    <option value="Divorcé(e)">Divorcé(e)</option>
                    <option value="Veuf(ve)">Veuf(ve)</option>
                  </Select>
                </div>

                {showRegimeMatrimonial && (
                  <div>
                    <Label htmlFor="regime_matrimonial" className="text-cream">Régime matrimonial *</Label>
                    <Select
                      id="regime_matrimonial"
                      value={formData.regime_matrimonial || ''}
                      onChange={(e) => handleChange('regime_matrimonial', e.target.value)}
                      required={showRegimeMatrimonial}
                      className="mt-1 bg-midnight border-midnight-lighter text-white"
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="Communauté réduite aux acquêts">Communauté réduite aux acquêts</option>
                      <option value="Séparation de biens">Séparation de biens</option>
                      <option value="Communauté universelle">Communauté universelle</option>
                      <option value="Participation aux acquêts">Participation aux acquêts</option>
                    </Select>
                  </div>
                )}

                {showDateMariage && (
                  <div>
                    <Label htmlFor="date_mariage" className="text-cream">Date de mariage</Label>
                    <Input
                      id="date_mariage"
                      type="date"
                      value={formData.date_mariage instanceof Date ? formData.date_mariage.toISOString().split('T')[0] : ''}
                      onChange={(e) => handleChange('date_mariage', new Date(e.target.value))}
                      className="mt-1 bg-midnight border-midnight-lighter text-white"
                    />
                  </div>
                )}
              </div>

              {/* Children Section */}
              <div className="space-y-4 pt-6 border-t border-midnight-lighter">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Baby className="w-5 h-5 text-gold" />
                    Enfants ({formData.enfants.length})
                  </h3>
                  <Button
                    type="button"
                    onClick={addEnfant}
                    variant="outline"
                    size="sm"
                    className="bg-midnight-lighter border-gold text-gold hover:bg-gold hover:text-midnight"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter un enfant
                  </Button>
                </div>

                {formData.enfants.length > 0 && (
                  <div className="space-y-3">
                    {formData.enfants.map((enfant, index) => (
                      <Card key={enfant.id} className="bg-midnight border-midnight-lighter">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-4">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <Label className="text-cream text-sm">Prénom</Label>
                                <Input
                                  value={enfant.prenom}
                                  onChange={(e) => updateEnfant(enfant.id, 'prenom', e.target.value)}
                                  className="mt-1 bg-midnight-light border-midnight-lighter text-white"
                                  placeholder="Prénom"
                                />
                              </div>
                              
                              <div>
                                <Label className="text-cream text-sm">Date de naissance</Label>
                                <Input
                                  type="date"
                                  value={enfant.date_naissance instanceof Date ? enfant.date_naissance.toISOString().split('T')[0] : ''}
                                  onChange={(e) => updateEnfant(enfant.id, 'date_naissance', new Date(e.target.value))}
                                  className="mt-1 bg-midnight-light border-midnight-lighter text-white"
                                />
                              </div>
                              
                              <div>
                                <Label className="text-cream text-sm">Lien de filiation</Label>
                                <Select
                                  value={enfant.lien_filiation}
                                  onChange={(e) => updateEnfant(enfant.id, 'lien_filiation', e.target.value)}
                                  className="mt-1 bg-midnight-light border-midnight-lighter text-white"
                                >
                                  <option value="Légitime">Légitime</option>
                                  <option value="Naturel">Naturel</option>
                                  <option value="Adopté">Adopté</option>
                                </Select>
                              </div>
                            </div>
                            
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEnfant(enfant.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20 mt-6"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Tax Residency Section */}
              <div className="space-y-4 pt-6 border-t border-midnight-lighter">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-gold" />
                  Résidence Fiscale
                </h3>
                
                <div>
                  <Label htmlFor="residence_fiscale" className="text-cream">Résidence fiscale *</Label>
                  <Select
                    id="residence_fiscale"
                    value={formData.residence_fiscale}
                    onChange={(e) => handleChange('residence_fiscale', e.target.value)}
                    required
                    className="mt-1 bg-midnight border-midnight-lighter text-white"
                  >
                    <option value="France">France</option>
                    <option value="Étranger">Étranger</option>
                  </Select>
                </div>

                {showPaysResidence && (
                  <div>
                    <Label htmlFor="pays_residence_fiscale" className="text-cream">Pays de résidence *</Label>
                    <Input
                      id="pays_residence_fiscale"
                      value={formData.pays_residence_fiscale || ''}
                      onChange={(e) => handleChange('pays_residence_fiscale', e.target.value)}
                      required={showPaysResidence}
                      className="mt-1 bg-midnight border-midnight-lighter text-white"
                      placeholder="Pays"
                    />
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/client/prise-connaissance')}
                  className="bg-midnight-lighter border-midnight-lighter text-cream hover:bg-midnight hover:text-white"
                >
                  ← Précédent
                </Button>
                <Button
                  type="submit"
                  className="bg-gold text-midnight hover:bg-gold/90 font-semibold"
                >
                  Suivant →
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
