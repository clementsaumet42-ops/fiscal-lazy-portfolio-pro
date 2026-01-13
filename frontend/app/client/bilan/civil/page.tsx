'use client'

import { useState, useEffect } from 'react'
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

  // Sync form data with assessment state when it changes (for persist hydration)
  useEffect(() => {
    if (assessment.bilan_civil) {
      setFormData(assessment.bilan_civil)
    }
  }, [assessment.bilan_civil])

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            👤 Situation Civile
          </h1>
          <p className="text-gray-600">
            Informations personnelles et familiales
          </p>
        </div>
        
        <Card className="shadow-lg mb-6">
          <CardHeader className="bg-white border-b border-gray-100">
            <div className="flex items-center gap-2">
              <User className="w-6 h-6 text-blue-600" />
              <CardTitle className="text-gray-900">Bilan Civil</CardTitle>
            </div>
            <CardDescription className="text-gray-600">
              Ces informations sont essentielles pour comprendre votre situation personnelle et familiale.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Informations Personnelles
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nom" className="text-gray-700">Nom *</Label>
                    <Input
                      id="nom"
                      value={formData.nom}
                      onChange={(e) => handleChange('nom', e.target.value)}
                      required
                      className="mt-1 bg-white border-gray-300 text-gray-900"
                      placeholder="Nom de famille"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="prenom" className="text-gray-700">Prénom *</Label>
                    <Input
                      id="prenom"
                      value={formData.prenom}
                      onChange={(e) => handleChange('prenom', e.target.value)}
                      required
                      className="mt-1 bg-white border-gray-300 text-gray-900"
                      placeholder="Prénom"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date_naissance" className="text-gray-700">Date de naissance *</Label>
                    <Input
                      id="date_naissance"
                      type="date"
                      value={formData.date_naissance instanceof Date ? formData.date_naissance.toISOString().split('T')[0] : ''}
                      onChange={(e) => handleChange('date_naissance', new Date(e.target.value))}
                      required
                      className="mt-1 bg-white border-gray-300 text-gray-900"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="lieu_naissance" className="text-gray-700">Lieu de naissance *</Label>
                    <Input
                      id="lieu_naissance"
                      value={formData.lieu_naissance}
                      onChange={(e) => handleChange('lieu_naissance', e.target.value)}
                      required
                      className="mt-1 bg-white border-gray-300 text-gray-900"
                      placeholder="Ville, Pays"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="nationalite" className="text-gray-700">Nationalité *</Label>
                  <Input
                    id="nationalite"
                    value={formData.nationalite}
                    onChange={(e) => handleChange('nationalite', e.target.value)}
                    required
                    className="mt-1 bg-white border-gray-300 text-gray-900"
                    placeholder="Ex: Française"
                  />
                </div>
              </div>

              {/* Family Situation Section */}
              <div className="space-y-4 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Situation Familiale
                </h3>
                
                <div>
                  <Label htmlFor="situation_familiale" className="text-gray-700">Situation familiale *</Label>
                  <Select
                    id="situation_familiale"
                    value={formData.situation_familiale}
                    onChange={(e) => handleChange('situation_familiale', e.target.value)}
                    required
                    className="mt-1 bg-white border-gray-300 text-gray-900"
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
                    <Label htmlFor="regime_matrimonial" className="text-gray-700">Régime matrimonial *</Label>
                    <Select
                      id="regime_matrimonial"
                      value={formData.regime_matrimonial || ''}
                      onChange={(e) => handleChange('regime_matrimonial', e.target.value)}
                      required={showRegimeMatrimonial}
                      className="mt-1 bg-white border-gray-300 text-gray-900"
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
                    <Label htmlFor="date_mariage" className="text-gray-700">Date de mariage</Label>
                    <Input
                      id="date_mariage"
                      type="date"
                      value={formData.date_mariage instanceof Date ? formData.date_mariage.toISOString().split('T')[0] : ''}
                      onChange={(e) => handleChange('date_mariage', new Date(e.target.value))}
                      className="mt-1 bg-white border-gray-300 text-gray-900"
                    />
                  </div>
                )}
              </div>

              {/* Children Section */}
              <div className="space-y-4 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Baby className="w-5 h-5 text-blue-600" />
                    Enfants ({formData.enfants.length})
                  </h3>
                  <Button
                    type="button"
                    onClick={addEnfant}
                    variant="outline"
                    size="sm"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter un enfant
                  </Button>
                </div>

                {formData.enfants.length > 0 && (
                  <div className="space-y-3">
                    {formData.enfants.map((enfant, index) => (
                      <Card key={enfant.id} className="bg-gray-50 border-gray-200">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-4">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <Label className="text-gray-700 text-sm">Prénom</Label>
                                <Input
                                  value={enfant.prenom}
                                  onChange={(e) => updateEnfant(enfant.id, 'prenom', e.target.value)}
                                  className="mt-1 bg-white border-gray-300 text-gray-900"
                                  placeholder="Prénom"
                                />
                              </div>
                              
                              <div>
                                <Label className="text-gray-700 text-sm">Date de naissance</Label>
                                <Input
                                  type="date"
                                  value={enfant.date_naissance instanceof Date ? enfant.date_naissance.toISOString().split('T')[0] : ''}
                                  onChange={(e) => updateEnfant(enfant.id, 'date_naissance', new Date(e.target.value))}
                                  className="mt-1 bg-white border-gray-300 text-gray-900"
                                />
                              </div>
                              
                              <div>
                                <Label className="text-gray-700 text-sm">Lien de filiation</Label>
                                <Select
                                  value={enfant.lien_filiation}
                                  onChange={(e) => updateEnfant(enfant.id, 'lien_filiation', e.target.value)}
                                  className="mt-1 bg-white border-gray-300 text-gray-900"
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
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-6"
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
              <div className="space-y-4 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  Résidence Fiscale
                </h3>
                
                <div>
                  <Label htmlFor="residence_fiscale" className="text-gray-700">Résidence fiscale *</Label>
                  <Select
                    id="residence_fiscale"
                    value={formData.residence_fiscale}
                    onChange={(e) => handleChange('residence_fiscale', e.target.value)}
                    required
                    className="mt-1 bg-white border-gray-300 text-gray-900"
                  >
                    <option value="France">France</option>
                    <option value="Étranger">Étranger</option>
                  </Select>
                </div>

                {showPaysResidence && (
                  <div>
                    <Label htmlFor="pays_residence_fiscale" className="text-gray-700">Pays de résidence *</Label>
                    <Input
                      id="pays_residence_fiscale"
                      value={formData.pays_residence_fiscale || ''}
                      onChange={(e) => handleChange('pays_residence_fiscale', e.target.value)}
                      required={showPaysResidence}
                      className="mt-1 bg-white border-gray-300 text-gray-900"
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
                  onClick={() => router.push('/client/demarrer')}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  ← Retour
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
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
