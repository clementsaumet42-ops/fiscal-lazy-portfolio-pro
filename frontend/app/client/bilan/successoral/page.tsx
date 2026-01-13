'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { BilanSuccessoral, Donation } from '@/lib/types/assessment'
import { generateId, formatDate, formatCurrency } from '@/lib/utils/assessment/helpers'
import { FileText, Gift, Heart, Trash2, Plus } from 'lucide-react'

export default function BilanSuccessoralPage() {
  const router = useRouter()
  const { assessment, setBilanSuccessoral } = useClientStore()
  
  const [formData, setFormData] = useState<BilanSuccessoral>(
    assessment.bilan_successoral || {
      testament_existe: false,
      donations_realisees: [],
      assurances_vie_beneficiaires: [],
      objectif_transmission: 'Conjoint',
      souhaits_particuliers: '',
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setBilanSuccessoral(formData)
    router.push('/client/patrimoine/liquidites')
  }

  const handleChange = (field: keyof BilanSuccessoral, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addDonation = () => {
    setFormData(prev => ({
      ...prev,
      donations_realisees: [...prev.donations_realisees, {
        id: generateId(),
        date: new Date(),
        beneficiaire: '',
        montant: 0,
        type: 'Don manuel',
        abattement_utilise: 0,
      }]
    }))
  }

  const removeDonation = (id: string) => {
    setFormData(prev => ({
      ...prev,
      donations_realisees: prev.donations_realisees.filter(d => d.id !== id)
    }))
  }

  const updateDonation = (id: string, field: keyof Donation, value: any) => {
    setFormData(prev => ({
      ...prev,
      donations_realisees: prev.donations_realisees.map(d => 
        d.id === id ? { ...d, [field]: value } : d
      )
    }))
  }

  const addBeneficiaire = () => {
    setFormData(prev => ({
      ...prev,
      assurances_vie_beneficiaires: [...prev.assurances_vie_beneficiaires, {
        contrat_id: '',
        beneficiaires: '',
        clause_type: 'Standard',
      }]
    }))
  }

  const removeBeneficiaire = (index: number) => {
    setFormData(prev => ({
      ...prev,
      assurances_vie_beneficiaires: prev.assurances_vie_beneficiaires.filter((_, i) => i !== index)
    }))
  }

  const updateBeneficiaire = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      assurances_vie_beneficiaires: prev.assurances_vie_beneficiaires.map((b, i) => 
        i === index ? { ...b, [field]: value } : b
      )
    }))
  }

  const showTestamentFields = formData.testament_existe

  return (
    <div className="min-h-screen bg-midnight">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            📜 Bilan Successoral
          </h1>
          <p className="text-cream/70 text-lg">
            Étape 4/11 - Planification de la transmission de votre patrimoine
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-midnight-lighter rounded-full h-2">
            <div className="bg-gold h-2 rounded-full transition-all duration-300" style={{ width: '36%' }}></div>
          </div>
          <p className="text-cream/70 text-sm mt-2">Progression: 4 sur 11 étapes</p>
        </div>
        
        <Card className="bg-midnight-light border-midnight-lighter">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-gold" />
              <CardTitle className="text-white">Transmission et Succession</CardTitle>
            </div>
            <CardDescription className="text-cream/70">
              Organisons la transmission de votre patrimoine selon vos souhaits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Testament Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gold" />
                  Testament
                </h3>
                
                <div>
                  <Label htmlFor="testament_existe" className="text-cream">Avez-vous un testament ?</Label>
                  <Select
                    id="testament_existe"
                    value={formData.testament_existe ? 'oui' : 'non'}
                    onChange={(e) => handleChange('testament_existe', e.target.value === 'oui')}
                    className="mt-1 bg-midnight border-midnight-lighter text-white"
                  >
                    <option value="non">Non</option>
                    <option value="oui">Oui</option>
                  </Select>
                </div>

                {showTestamentFields && (
                  <>
                    <div>
                      <Label htmlFor="type_testament" className="text-cream">Type de testament</Label>
                      <Select
                        id="type_testament"
                        value={formData.type_testament || ''}
                        onChange={(e) => handleChange('type_testament', e.target.value)}
                        className="mt-1 bg-midnight border-midnight-lighter text-white"
                      >
                        <option value="">-- Sélectionner --</option>
                        <option value="Olographe">Olographe (manuscrit)</option>
                        <option value="Authentique">Authentique (notaire)</option>
                        <option value="Mystique">Mystique</option>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="date_testament" className="text-cream">Date du testament</Label>
                      <Input
                        id="date_testament"
                        type="date"
                        value={formData.date_testament instanceof Date ? formData.date_testament.toISOString().split('T')[0] : ''}
                        onChange={(e) => handleChange('date_testament', new Date(e.target.value))}
                        className="mt-1 bg-midnight border-midnight-lighter text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="notaire" className="text-cream">Notaire (nom et coordonnées)</Label>
                      <Input
                        id="notaire"
                        value={formData.notaire || ''}
                        onChange={(e) => handleChange('notaire', e.target.value)}
                        className="mt-1 bg-midnight border-midnight-lighter text-white"
                        placeholder="Maître Dupont, Paris"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Donations Section */}
              <div className="space-y-4 pt-6 border-t border-midnight-lighter">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Gift className="w-5 h-5 text-gold" />
                    Donations réalisées ({formData.donations_realisees.length})
                  </h3>
                  <Button
                    type="button"
                    onClick={addDonation}
                    variant="outline"
                    size="sm"
                    className="bg-midnight-lighter border-gold text-gold hover:bg-gold hover:text-midnight"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter une donation
                  </Button>
                </div>

                {formData.donations_realisees.length > 0 && (
                  <div className="space-y-3">
                    {formData.donations_realisees.map((donation) => (
                      <Card key={donation.id} className="bg-midnight border-midnight-lighter">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-4">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              <div>
                                <Label className="text-cream text-sm">Date</Label>
                                <Input
                                  type="date"
                                  value={donation.date instanceof Date ? donation.date.toISOString().split('T')[0] : ''}
                                  onChange={(e) => updateDonation(donation.id, 'date', new Date(e.target.value))}
                                  className="mt-1 bg-midnight-light border-midnight-lighter text-white"
                                />
                              </div>
                              
                              <div>
                                <Label className="text-cream text-sm">Bénéficiaire</Label>
                                <Input
                                  value={donation.beneficiaire}
                                  onChange={(e) => updateDonation(donation.id, 'beneficiaire', e.target.value)}
                                  className="mt-1 bg-midnight-light border-midnight-lighter text-white"
                                  placeholder="Nom du bénéficiaire"
                                />
                              </div>
                              
                              <div>
                                <Label className="text-cream text-sm">Montant (€)</Label>
                                <Input
                                  type="number"
                                  value={donation.montant}
                                  onChange={(e) => updateDonation(donation.id, 'montant', parseFloat(e.target.value) || 0)}
                                  className="mt-1 bg-midnight-light border-midnight-lighter text-white"
                                  placeholder="0"
                                />
                              </div>
                              
                              <div>
                                <Label className="text-cream text-sm">Type</Label>
                                <Select
                                  value={donation.type}
                                  onChange={(e) => updateDonation(donation.id, 'type', e.target.value)}
                                  className="mt-1 bg-midnight-light border-midnight-lighter text-white"
                                >
                                  <option value="Don manuel">Don manuel</option>
                                  <option value="Donation-partage">Donation-partage</option>
                                  <option value="Donation simple">Donation simple</option>
                                </Select>
                              </div>
                              
                              <div>
                                <Label className="text-cream text-sm">Abattement utilisé (€)</Label>
                                <Input
                                  type="number"
                                  value={donation.abattement_utilise}
                                  onChange={(e) => updateDonation(donation.id, 'abattement_utilise', parseFloat(e.target.value) || 0)}
                                  className="mt-1 bg-midnight-light border-midnight-lighter text-white"
                                  placeholder="0"
                                />
                              </div>
                            </div>
                            
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDonation(donation.id)}
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

              {/* Assurance-Vie Beneficiaries Section */}
              <div className="space-y-4 pt-6 border-t border-midnight-lighter">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Heart className="w-5 h-5 text-gold" />
                    Bénéficiaires Assurance-Vie ({formData.assurances_vie_beneficiaires.length})
                  </h3>
                  <Button
                    type="button"
                    onClick={addBeneficiaire}
                    variant="outline"
                    size="sm"
                    className="bg-midnight-lighter border-gold text-gold hover:bg-gold hover:text-midnight"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter une clause
                  </Button>
                </div>

                {formData.assurances_vie_beneficiaires.length > 0 && (
                  <div className="space-y-3">
                    {formData.assurances_vie_beneficiaires.map((ben, index) => (
                      <Card key={index} className="bg-midnight border-midnight-lighter">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-4">
                            <div className="flex-1 space-y-3">
                              <div>
                                <Label className="text-cream text-sm">Contrat d'assurance-vie (ID)</Label>
                                <Input
                                  value={ben.contrat_id}
                                  onChange={(e) => updateBeneficiaire(index, 'contrat_id', e.target.value)}
                                  className="mt-1 bg-midnight-light border-midnight-lighter text-white"
                                  placeholder="ID du contrat"
                                />
                              </div>
                              
                              <div>
                                <Label className="text-cream text-sm">Clause bénéficiaire</Label>
                                <Textarea
                                  value={ben.beneficiaires}
                                  onChange={(e) => updateBeneficiaire(index, 'beneficiaires', e.target.value)}
                                  className="mt-1 bg-midnight-light border-midnight-lighter text-white"
                                  placeholder="Ex: Mon conjoint à 100%, à défaut mes enfants à parts égales"
                                  rows={3}
                                />
                              </div>
                              
                              <div>
                                <Label className="text-cream text-sm">Type de clause</Label>
                                <Select
                                  value={ben.clause_type}
                                  onChange={(e) => updateBeneficiaire(index, 'clause_type', e.target.value)}
                                  className="mt-1 bg-midnight-light border-midnight-lighter text-white"
                                >
                                  <option value="Standard">Standard</option>
                                  <option value="Démembrement">Démembrement</option>
                                  <option value="À terme">À terme</option>
                                  <option value="Par ordre">Par ordre</option>
                                </Select>
                              </div>
                            </div>
                            
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeBeneficiaire(index)}
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

              {/* Transmission Objectives Section */}
              <div className="space-y-4 pt-6 border-t border-midnight-lighter">
                <h3 className="text-lg font-semibold text-white">Objectifs de transmission</h3>
                
                <div>
                  <Label htmlFor="objectif_transmission" className="text-cream">Objectif principal</Label>
                  <Select
                    id="objectif_transmission"
                    value={formData.objectif_transmission}
                    onChange={(e) => handleChange('objectif_transmission', e.target.value)}
                    className="mt-1 bg-midnight border-midnight-lighter text-white"
                  >
                    <option value="Conjoint">Protéger le conjoint</option>
                    <option value="Enfants">Transmettre aux enfants</option>
                    <option value="Petits-enfants">Transmettre aux petits-enfants</option>
                    <option value="Tiers">Transmettre à un tiers</option>
                    <option value="Œuvre">Legs à une œuvre</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="souhaits_particuliers" className="text-cream">Souhaits particuliers</Label>
                  <Textarea
                    id="souhaits_particuliers"
                    value={formData.souhaits_particuliers}
                    onChange={(e) => handleChange('souhaits_particuliers', e.target.value)}
                    className="mt-1 bg-midnight border-midnight-lighter text-white"
                    placeholder="Décrivez ici vos souhaits particuliers concernant la transmission de votre patrimoine..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/client/bilan/fiscal')}
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
