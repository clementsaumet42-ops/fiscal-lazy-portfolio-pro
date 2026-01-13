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
import { BilanSuccessoral, Donation, BeneficiaireAV } from '@/lib/types/assessment'
import { generateId, formatCurrency, formatDate } from '@/lib/utils/assessment/helpers'
import { FileText, Plus, Trash2, Users, Heart, Home, Gift, Calendar } from 'lucide-react'

export default function BilanSuccessoralPage() {
  const router = useRouter()
  const { assessment, setBilanSuccessoral } = useClientStore()
  
  const [formData, setFormData] = useState<BilanSuccessoral>(
    assessment.bilan_successoral || {
      testament_existe: false,
      type_testament: undefined,
      date_testament: undefined,
      notaire: undefined,
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

  // Donations management
  const addDonation = () => {
    const newDonation: Donation = {
      id: generateId(),
      date: new Date(),
      beneficiaire: '',
      montant: 0,
      type: 'Don manuel',
      abattement_utilise: 0,
    }
    setFormData(prev => ({
      ...prev,
      donations_realisees: [...prev.donations_realisees, newDonation]
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

  // Beneficiaries management
  const addBeneficiaire = () => {
    const newBenef: BeneficiaireAV = {
      contrat_id: '',
      beneficiaires: '',
      clause_type: 'Standard',
    }
    setFormData(prev => ({
      ...prev,
      assurances_vie_beneficiaires: [...prev.assurances_vie_beneficiaires, newBenef]
    }))
  }

  const removeBeneficiaire = (index: number) => {
    setFormData(prev => ({
      ...prev,
      assurances_vie_beneficiaires: prev.assurances_vie_beneficiaires.filter((_, i) => i !== index)
    }))
  }

  const updateBeneficiaire = (index: number, field: keyof BeneficiaireAV, value: any) => {
    setFormData(prev => ({
      ...prev,
      assurances_vie_beneficiaires: prev.assurances_vie_beneficiaires.map((b, i) =>
        i === index ? { ...b, [field]: value } : b
      )
    }))
  }

  const objectifsOptions = [
    { value: 'Conjoint', icon: Heart, label: 'Protéger le conjoint' },
    { value: 'Enfants', icon: Users, label: 'Transmettre aux enfants' },
    { value: 'Petits-enfants', icon: Users, label: 'Aux petits-enfants' },
    { value: 'Tiers', icon: Gift, label: 'Tiers / Ami' },
    { value: 'Œuvre', icon: Home, label: 'Œuvre / Association' },
  ]

  return (
    <div className="min-h-screen bg-midnight">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🏛️ Bilan Successoral
          </h1>
          <p className="text-cream/70 text-lg">
            Étape 5/11 - Testament, donations et transmission
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-midnight-lighter rounded-full h-2">
            <div className="bg-gold h-2 rounded-full transition-all duration-300" style={{ width: '45%' }}></div>
          </div>
          <p className="text-cream/70 text-sm mt-2">Progression: 5 sur 11 étapes</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Testament */}
          <Card className="bg-midnight-light border-midnight-lighter">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-gold" />
                <CardTitle className="text-white">Testament</CardTitle>
              </div>
              <CardDescription className="text-cream/70">
                Dispositions testamentaires
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="testament_existe">Avez-vous rédigé un testament ? *</Label>
                <Select
                  id="testament_existe"
                  value={formData.testament_existe ? 'true' : 'false'}
                  onChange={(e) => handleChange('testament_existe', e.target.value === 'true')}
                  required
                  className="mt-1"
                >
                  <option value="false">Non</option>
                  <option value="true">Oui</option>
                </Select>
              </div>

              {formData.testament_existe && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type_testament">Type de testament *</Label>
                      <Select
                        id="type_testament"
                        value={formData.type_testament || ''}
                        onChange={(e) => handleChange('type_testament', e.target.value)}
                        required
                        className="mt-1"
                      >
                        <option value="">Sélectionner...</option>
                        <option value="Olographe">Olographe (manuscrit)</option>
                        <option value="Authentique">Authentique (notaire)</option>
                        <option value="Mystique">Mystique (secret)</option>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="date_testament">Date du testament</Label>
                      <Input
                        id="date_testament"
                        type="date"
                        value={formData.date_testament instanceof Date 
                          ? formData.date_testament.toISOString().split('T')[0] 
                          : formData.date_testament || ''}
                        onChange={(e) => handleChange('date_testament', e.target.value ? new Date(e.target.value) : undefined)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notaire">Notaire (si applicable)</Label>
                    <Input
                      id="notaire"
                      value={formData.notaire || ''}
                      onChange={(e) => handleChange('notaire', e.target.value)}
                      placeholder="Nom du notaire"
                      className="mt-1"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Donations */}
          <Card className="bg-midnight-light border-midnight-lighter">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="w-6 h-6 text-gold" />
                  <CardTitle className="text-white">Donations réalisées</CardTitle>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addDonation}
                  className="border-gold text-gold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une donation
                </Button>
              </div>
              <CardDescription className="text-cream/70">
                {formData.donations_realisees.length} donation(s) enregistrée(s)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.donations_realisees.length === 0 ? (
                <div className="text-center py-8 text-cream/50">
                  Aucune donation enregistrée. Cliquez sur "Ajouter une donation" si nécessaire.
                </div>
              ) : (
                formData.donations_realisees.map((donation, index) => (
                  <div 
                    key={donation.id} 
                    className="p-4 border border-midnight-lighter rounded-lg bg-midnight/50 space-y-3"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gold" />
                        <h4 className="text-white font-semibold">Donation {index + 1}</h4>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDonation(donation.id)}
                        className="hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Date *</Label>
                        <Input
                          type="date"
                          value={donation.date instanceof Date 
                            ? donation.date.toISOString().split('T')[0] 
                            : donation.date}
                          onChange={(e) => updateDonation(donation.id, 'date', new Date(e.target.value))}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Bénéficiaire *</Label>
                        <Input
                          value={donation.beneficiaire}
                          onChange={(e) => updateDonation(donation.id, 'beneficiaire', e.target.value)}
                          placeholder="Nom du bénéficiaire"
                          required
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label>Montant (€) *</Label>
                        <Input
                          type="number"
                          value={donation.montant}
                          onChange={(e) => updateDonation(donation.id, 'montant', parseFloat(e.target.value) || 0)}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Type *</Label>
                        <Select
                          value={donation.type}
                          onChange={(e) => updateDonation(donation.id, 'type', e.target.value)}
                          required
                          className="mt-1"
                        >
                          <option value="Don manuel">Don manuel</option>
                          <option value="Donation-partage">Donation-partage</option>
                          <option value="Donation simple">Donation simple</option>
                        </Select>
                      </div>
                      <div>
                        <Label>Abattement utilisé (€)</Label>
                        <Input
                          type="number"
                          value={donation.abattement_utilise}
                          onChange={(e) => updateDonation(donation.id, 'abattement_utilise', parseFloat(e.target.value) || 0)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Life Insurance Beneficiaries */}
          <Card className="bg-midnight-light border-midnight-lighter">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-gold" />
                  <CardTitle className="text-white">Bénéficiaires assurances-vie</CardTitle>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addBeneficiaire}
                  className="border-gold text-gold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une clause
                </Button>
              </div>
              <CardDescription className="text-cream/70">
                Désignation des bénéficiaires pour vos contrats d'assurance-vie
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.assurances_vie_beneficiaires.length === 0 ? (
                <div className="text-center py-8 text-cream/50">
                  Aucun bénéficiaire désigné. Vous pourrez lier les clauses aux contrats lors de la saisie des assurances-vie.
                </div>
              ) : (
                formData.assurances_vie_beneficiaires.map((benef, index) => (
                  <div 
                    key={index} 
                    className="p-4 border border-midnight-lighter rounded-lg bg-midnight/50 space-y-3"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-white font-semibold">Clause {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBeneficiaire(index)}
                        className="hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label>Contrat (référence)</Label>
                        <Input
                          value={benef.contrat_id}
                          onChange={(e) => updateBeneficiaire(index, 'contrat_id', e.target.value)}
                          placeholder="ID ou numéro de contrat"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Bénéficiaires *</Label>
                        <Input
                          value={benef.beneficiaires}
                          onChange={(e) => updateBeneficiaire(index, 'beneficiaires', e.target.value)}
                          placeholder="Mon conjoint, mes enfants..."
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Type de clause *</Label>
                        <Select
                          value={benef.clause_type}
                          onChange={(e) => updateBeneficiaire(index, 'clause_type', e.target.value)}
                          required
                          className="mt-1"
                        >
                          <option value="Standard">Standard</option>
                          <option value="Démembrement">Démembrement</option>
                          <option value="À terme">À terme</option>
                          <option value="Par ordre">Par ordre</option>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Transmission Objectives */}
          <Card className="bg-midnight-light border-midnight-lighter">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-gold" />
                <CardTitle className="text-white">Objectifs de transmission</CardTitle>
              </div>
              <CardDescription className="text-cream/70">
                Vos souhaits pour la transmission de votre patrimoine
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-3 block">Objectif principal *</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {objectifsOptions.map(({ value, icon: Icon, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleChange('objectif_transmission', value)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.objectif_transmission === value
                          ? 'border-gold bg-gold/10 shadow-gold'
                          : 'border-midnight-lighter hover:border-gold/50'
                      }`}
                    >
                      <Icon className={`w-8 h-8 mx-auto mb-2 ${
                        formData.objectif_transmission === value ? 'text-gold' : 'text-cream/50'
                      }`} />
                      <p className="text-white text-sm text-center">{label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="souhaits">Souhaits particuliers</Label>
                <Textarea
                  id="souhaits"
                  value={formData.souhaits_particuliers}
                  onChange={(e) => handleChange('souhaits_particuliers', e.target.value)}
                  placeholder="Précisez vos souhaits particuliers concernant la transmission de votre patrimoine..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t border-midnight-lighter">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/client/bilan/fiscal')}
            >
              ← Retour
            </Button>
            <Button type="submit" variant="gold" size="lg">
              Suivant : Liquidités →
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
