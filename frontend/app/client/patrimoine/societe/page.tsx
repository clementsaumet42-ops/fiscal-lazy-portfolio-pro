'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { SocieteIS } from '@/lib/types/assessment'
import { generateId, formatCurrency, formatPercentage } from '@/lib/utils/assessment/helpers'
import { Building2, Plus, Trash2, Edit, DollarSign, TrendingUp } from 'lucide-react'

export default function SocietePage() {
  const router = useRouter()
  const { assessment, addSocieteIS, updateSocieteIS, removeSocieteIS } = useClientStore()
  
  const [showAddSociete, setShowAddSociete] = useState(false)
  const [editingSociete, setEditingSociete] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<Partial<SocieteIS>>({
    raison_sociale: '',
    forme_juridique: 'SARL',
    pourcentage_detention: 0,
    valeur_titres: 0,
    dividendes_annuels: 0,
    date_creation: new Date(),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push('/client/patrimoine/autres')
  }

  const handleAddSociete = () => {
    if (!formData.raison_sociale || !formData.valeur_titres) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    const societe: SocieteIS = {
      id: generateId(),
      raison_sociale: formData.raison_sociale,
      forme_juridique: formData.forme_juridique as any,
      pourcentage_detention: formData.pourcentage_detention || 0,
      valeur_titres: formData.valeur_titres,
      dividendes_annuels: formData.dividendes_annuels || 0,
      date_creation: formData.date_creation || new Date(),
    }

    addSocieteIS(societe)
    resetForm()
  }

  const handleUpdateSociete = () => {
    if (!editingSociete) return
    updateSocieteIS(editingSociete, formData)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      raison_sociale: '',
      forme_juridique: 'SARL',
      pourcentage_detention: 0,
      valeur_titres: 0,
      dividendes_annuels: 0,
      date_creation: new Date(),
    })
    setShowAddSociete(false)
    setEditingSociete(null)
  }

  const startEdit = (societe: SocieteIS) => {
    setFormData(societe)
    setEditingSociete(societe.id)
    setShowAddSociete(true)
  }

  // Calculate totals
  const totalValorisation = assessment.societes_is.reduce((sum, s) => sum + s.valeur_titres, 0)
  const totalDividendes = assessment.societes_is.reduce((sum, s) => sum + s.dividendes_annuels, 0)

  return (
    <div className="min-h-screen bg-midnight">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🏢 Sociétés IS
          </h1>
          <p className="text-cream/70 text-lg">
            Étape 9/11 - Participations dans des sociétés soumises à l'IS
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-midnight-lighter rounded-full h-2">
            <div className="bg-gold h-2 rounded-full transition-all duration-300" style={{ width: '81%' }}></div>
          </div>
          <p className="text-cream/70 text-sm mt-2">Progression: 9 sur 11 étapes</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-gold/20 to-gold/10 border-gold">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cream/70 text-sm mb-1">Valorisation Totale</p>
                  <p className="text-2xl font-bold text-gold">{formatCurrency(totalValorisation)}</p>
                </div>
                <DollarSign className="w-10 h-10 text-gold/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-midnight-light border-midnight-lighter">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cream/70 text-sm mb-1">Dividendes Annuels</p>
                  <p className="text-2xl font-bold text-green-400">{formatCurrency(totalDividendes)}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-cream/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Societes List */}
        <Card className="bg-midnight-light border-midnight-lighter mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-gold" />
                <CardTitle className="text-white">Participations ({assessment.societes_is.length})</CardTitle>
              </div>
              <Button
                onClick={() => setShowAddSociete(!showAddSociete)}
                variant="outline"
                size="sm"
                className="bg-midnight-lighter border-gold text-gold hover:bg-gold hover:text-midnight"
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter une société
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Add/Edit Form */}
            {showAddSociete && (
              <Card className="mb-4 bg-midnight border-midnight-lighter">
                <CardContent className="pt-4">
                  <h4 className="font-semibold text-white mb-4">
                    {editingSociete ? 'Modifier la société' : 'Nouvelle société'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-cream">Raison sociale *</Label>
                      <Input
                        value={formData.raison_sociale}
                        onChange={(e) => setFormData(prev => ({ ...prev, raison_sociale: e.target.value }))}
                        className="mt-1 bg-midnight-light border-midnight-lighter text-white"
                        placeholder="Nom de la société"
                      />
                    </div>
                    <div>
                      <Label className="text-cream">Forme juridique</Label>
                      <Select
                        value={formData.forme_juridique}
                        onChange={(e) => setFormData(prev => ({ ...prev, forme_juridique: e.target.value as any }))}
                        className="mt-1 bg-midnight-light border-midnight-lighter text-white"
                      >
                        <option value="SARL">SARL</option>
                        <option value="SAS">SAS</option>
                        <option value="SA">SA</option>
                        <option value="SCI IS">SCI IS</option>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-cream">% de détention</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.pourcentage_detention}
                        onChange={(e) => setFormData(prev => ({ ...prev, pourcentage_detention: parseFloat(e.target.value) || 0 }))}
                        className="mt-1 bg-midnight-light border-midnight-lighter text-white"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label className="text-cream">Valeur des titres (€) *</Label>
                      <Input
                        type="number"
                        value={formData.valeur_titres}
                        onChange={(e) => setFormData(prev => ({ ...prev, valeur_titres: parseFloat(e.target.value) || 0 }))}
                        className="mt-1 bg-midnight-light border-midnight-lighter text-white"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label className="text-cream">Dividendes annuels (€)</Label>
                      <Input
                        type="number"
                        value={formData.dividendes_annuels}
                        onChange={(e) => setFormData(prev => ({ ...prev, dividendes_annuels: parseFloat(e.target.value) || 0 }))}
                        className="mt-1 bg-midnight-light border-midnight-lighter text-white"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label className="text-cream">Date de création</Label>
                      <Input
                        type="date"
                        value={formData.date_creation instanceof Date ? formData.date_creation.toISOString().split('T')[0] : ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, date_creation: new Date(e.target.value) }))}
                        className="mt-1 bg-midnight-light border-midnight-lighter text-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      className="bg-midnight-lighter border-midnight-lighter text-cream"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="button"
                      onClick={editingSociete ? handleUpdateSociete : handleAddSociete}
                      className="bg-gold text-midnight hover:bg-gold/90"
                    >
                      {editingSociete ? 'Mettre à jour' : 'Ajouter'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Societes List */}
            {assessment.societes_is.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assessment.societes_is.map((societe) => (
                  <Card key={societe.id} className="bg-midnight border-midnight-lighter">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Building2 className="w-5 h-5 text-gold" />
                            <span className="text-sm font-semibold text-gold">{societe.forme_juridique}</span>
                          </div>
                          <p className="text-white font-medium text-lg">{societe.raison_sociale}</p>
                          <p className="text-sm text-cream/70 mt-1">Détention: {formatPercentage(societe.pourcentage_detention)}</p>
                          <p className="text-2xl font-bold text-gold mt-2">{formatCurrency(societe.valeur_titres)}</p>
                          {societe.dividendes_annuels > 0 && (
                            <p className="text-sm text-green-400 mt-1">
                              Dividendes: {formatCurrency(societe.dividendes_annuels)}/an
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(societe)}
                            className="text-gold hover:text-gold/80 hover:bg-gold/10"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSocieteIS(societe.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-cream/50 text-center py-8">Aucune participation ajoutée</p>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/client/patrimoine/immobilier')}
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
      </div>
    </div>
  )
}
