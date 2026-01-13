'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BilanSuccessoral, Donation } from '@/lib/types/assessment'
import { bilanSuccessoralSchema } from '@/lib/validation/bilan-schemas'
import { formatDate, formatCurrency, generateId } from '@/lib/utils/assessment/helpers'
import { FileText, Gift, Heart, Users, Plus, Trash2 } from 'lucide-react'

export default function BilanSuccessoralPage() {
  const router = useRouter()
  const { assessment, setBilanSuccessoral } = useClientStore()
  
  const [formData, setFormData] = useState<BilanSuccessoral>(
    assessment.bilan_successoral || {
      testament_existe: false,
      donations_realisees: [],
      assurances_vie_beneficiaires: [],
      objectif_transmission: 'Enfants',
      souhaits_particuliers: '',
    }
  )

  const [showAddDonation, setShowAddDonation] = useState(false)
  const [newDonation, setNewDonation] = useState<Partial<Donation>>({
    date: new Date(),
    beneficiaire: '',
    montant: 0,
    type: 'Don manuel',
    abattement_utilise: 0,
  })

  const handleChange = (field: keyof BilanSuccessoral, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddDonation = () => {
    if (!newDonation.beneficiaire || !newDonation.montant) {
      alert('Le bénéficiaire et le montant sont requis')
      return
    }

    const donation: Donation = {
      id: generateId(),
      date: newDonation.date || new Date(),
      beneficiaire: newDonation.beneficiaire,
      montant: newDonation.montant,
      type: newDonation.type as any,
      abattement_utilise: newDonation.abattement_utilise || 0,
    }

    setFormData(prev => ({
      ...prev,
      donations_realisees: [...prev.donations_realisees, donation],
    }))

    setShowAddDonation(false)
    setNewDonation({
      date: new Date(),
      beneficiaire: '',
      montant: 0,
      type: 'Don manuel',
      abattement_utilise: 0,
    })
  }

  const handleRemoveDonation = (donationId: string) => {
    setFormData(prev => ({
      ...prev,
      donations_realisees: prev.donations_realisees.filter(d => d.id !== donationId),
    }))
  }

  const handleNext = () => {
    const result = bilanSuccessoralSchema.safeParse(formData)
    
    if (!result.success) {
      alert('Veuillez corriger les erreurs dans le formulaire')
      return
    }
    
    setBilanSuccessoral(formData)
    router.push('/client/patrimoine/liquidites')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[#FFFBEB]/70 text-sm">Étape 4 sur 11</p>
          <h1 className="text-3xl font-bold text-white mt-2">
            📜 Bilan Successoral
          </h1>
          <p className="text-[#FFFBEB]/60 mt-2">
            Planification de la transmission patrimoniale
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-[#1E293B] rounded-full h-2">
            <div className="bg-[#F59E0B] h-2 rounded-full transition-all duration-300" style={{ width: '36%' }}></div>
          </div>
        </div>

        {/* Testament Section */}
        <Card className="bg-[#1E293B] border-[#334155] mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#F59E0B]" />
              <CardTitle className="text-white">Testament</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-[#FFFBEB]">Testament existe ?</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.testament_existe === true}
                    onChange={() => handleChange('testament_existe', true)}
                    className="text-[#F59E0B] focus:ring-[#F59E0B]"
                  />
                  <span className="text-white">Oui</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.testament_existe === false}
                    onChange={() => handleChange('testament_existe', false)}
                    className="text-[#F59E0B] focus:ring-[#F59E0B]"
                  />
                  <span className="text-white">Non</span>
                </label>
              </div>
            </div>

            {formData.testament_existe && (
              <>
                <div>
                  <Label className="text-[#FFFBEB]">Type de testament</Label>
                  <Select
                    value={formData.type_testament || ''}
                    onChange={(e) => handleChange('type_testament', e.target.value)}
                    className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                  >
                    <option value="">Sélectionner...</option>
                    <option value="Olographe">Olographe</option>
                    <option value="Authentique">Authentique</option>
                    <option value="Mystique">Mystique</option>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#FFFBEB]">Date du testament</Label>
                    <Input
                      type="date"
                      value={formData.date_testament?.toISOString().split('T')[0] || ''}
                      onChange={(e) => handleChange('date_testament', e.target.value ? new Date(e.target.value) : undefined)}
                      className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#FFFBEB]">Notaire (optionnel)</Label>
                    <Input
                      value={formData.notaire || ''}
                      onChange={(e) => handleChange('notaire', e.target.value)}
                      placeholder="Me Dupont..."
                      className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Prior Donations Section */}
        <Card className="bg-[#1E293B] border-[#334155] mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#F59E0B]" />
                <CardTitle className="text-white">Donations antérieures</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddDonation(true)}
                className="border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B]/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une donation
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showAddDonation && (
              <div className="mb-6 p-4 border border-[#F59E0B]/30 rounded-lg bg-[#0F172A]">
                <h4 className="text-white font-semibold mb-4">Nouvelle donation</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="text-[#FFFBEB]">Date *</Label>
                    <Input
                      type="date"
                      value={newDonation.date?.toISOString().split('T')[0]}
                      onChange={(e) => setNewDonation({ ...newDonation, date: new Date(e.target.value) })}
                      className="mt-1 bg-[#1E293B] border-[#334155] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#FFFBEB]">Bénéficiaire *</Label>
                    <Input
                      value={newDonation.beneficiaire}
                      onChange={(e) => setNewDonation({ ...newDonation, beneficiaire: e.target.value })}
                      placeholder="Pierre Dupont"
                      className="mt-1 bg-[#1E293B] border-[#334155] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#FFFBEB]">Montant (€) *</Label>
                    <Input
                      type="number"
                      value={newDonation.montant}
                      onChange={(e) => setNewDonation({ ...newDonation, montant: parseFloat(e.target.value) || 0 })}
                      className="mt-1 bg-[#1E293B] border-[#334155] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#FFFBEB]">Type</Label>
                    <Select
                      value={newDonation.type}
                      onChange={(e) => setNewDonation({ ...newDonation, type: e.target.value as any })}
                      className="mt-1 bg-[#1E293B] border-[#334155] text-white"
                    >
                      <option value="Don manuel">Don manuel</option>
                      <option value="Donation-partage">Donation-partage</option>
                      <option value="Donation simple">Donation simple</option>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[#FFFBEB]">Abattement utilisé (€)</Label>
                    <Input
                      type="number"
                      value={newDonation.abattement_utilise}
                      onChange={(e) => setNewDonation({ ...newDonation, abattement_utilise: parseFloat(e.target.value) || 0 })}
                      className="mt-1 bg-[#1E293B] border-[#334155] text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-[#F59E0B] text-[#0F172A] hover:bg-[#D97706]"
                    onClick={handleAddDonation}
                  >
                    Ajouter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddDonation(false)}
                    className="border-[#334155] text-[#FFFBEB]"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#334155]">
                    <TableHead className="text-[#F59E0B]">Date</TableHead>
                    <TableHead className="text-[#F59E0B]">Bénéficiaire</TableHead>
                    <TableHead className="text-[#F59E0B]">Montant</TableHead>
                    <TableHead className="text-[#F59E0B]">Type</TableHead>
                    <TableHead className="text-[#F59E0B]">Abattement utilisé</TableHead>
                    <TableHead className="text-[#F59E0B]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.donations_realisees.length === 0 ? (
                    <TableRow className="border-[#334155]">
                      <TableCell colSpan={6} className="text-center text-[#FFFBEB]/50 py-8">
                        Aucune donation. Cliquez sur "Ajouter une donation" pour commencer.
                      </TableCell>
                    </TableRow>
                  ) : (
                    formData.donations_realisees.map(donation => (
                      <TableRow key={donation.id} className="border-[#334155] hover:bg-[#0F172A]/50">
                        <TableCell className="text-white">{formatDate(donation.date)}</TableCell>
                        <TableCell className="text-white">{donation.beneficiaire}</TableCell>
                        <TableCell className="text-white">{formatCurrency(donation.montant)}</TableCell>
                        <TableCell className="text-[#FFFBEB]/70">{donation.type}</TableCell>
                        <TableCell className="text-[#FFFBEB]/70">{formatCurrency(donation.abattement_utilise)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveDonation(donation.id)}
                            className="hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Life Insurance Beneficiaries */}
        <Card className="bg-[#1E293B] border-[#334155] mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-[#F59E0B]" />
              <CardTitle className="text-white">Bénéficiaires Assurance-Vie</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-[#FFFBEB]/70 text-sm">
                ℹ️ Les bénéficiaires seront définis lors de la saisie des contrats d'assurance-vie dans la section suivante.
              </p>
              {assessment.assurances_vie.length > 0 && (
                <div className="mt-3">
                  <p className="text-white text-sm font-semibold mb-2">Contrats déjà enregistrés:</p>
                  <ul className="list-disc list-inside text-[#FFFBEB]/70 text-sm">
                    {assessment.assurances_vie.map(av => (
                      <li key={av.id}>{av.etablissement} - {av.numero_contrat}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transmission Objectives */}
        <Card className="bg-[#1E293B] border-[#334155] mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#F59E0B]" />
              <CardTitle className="text-white">Objectifs de transmission</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-[#FFFBEB]">Objectif principal</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {['Conjoint', 'Enfants', 'Petits-enfants', 'Tiers', 'Œuvre'].map(option => (
                  <div
                    key={option}
                    onClick={() => handleChange('objectif_transmission', option as any)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.objectif_transmission === option
                        ? 'border-[#F59E0B] bg-[#F59E0B]/10'
                        : 'border-[#334155] bg-[#0F172A] hover:border-[#F59E0B]/50'
                    }`}
                  >
                    <p className="text-center font-semibold text-white">{option}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-[#FFFBEB]">Souhaits particuliers (optionnel)</Label>
              <Textarea
                value={formData.souhaits_particuliers}
                onChange={(e) => handleChange('souhaits_particuliers', e.target.value)}
                placeholder="Clauses spécifiques, conditions particulières..."
                rows={4}
                className="mt-1 bg-[#0F172A] border-[#334155] text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => router.push('/client/bilan/fiscal')}
            className="border-[#334155] text-[#FFFBEB]"
          >
            ← Bilan fiscal
          </Button>
          <Button
            className="bg-[#F59E0B] text-[#0F172A] hover:bg-[#D97706]"
            onClick={handleNext}
          >
            Suivant →
          </Button>
        </div>
      </div>
    </div>
  )
}
