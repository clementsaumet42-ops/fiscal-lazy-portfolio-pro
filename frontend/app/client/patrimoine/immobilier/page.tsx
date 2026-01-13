'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { BienImmobilier } from '@/lib/types/assessment'
import { generateId, formatCurrency } from '@/lib/utils/assessment/helpers'
import { Home, Plus, Trash2, Edit, Building, DollarSign } from 'lucide-react'

export default function ImmobilierPage() {
  const router = useRouter()
  const { assessment, addBienImmobilier, updateBienImmobilier, removeBienImmobilier } = useClientStore()
  
  const [showAddBien, setShowAddBien] = useState(false)
  const [editingBien, setEditingBien] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<Partial<BienImmobilier>>({
    type: 'Résidence principale',
    adresse: '',
    valeur_venale: 0,
    pret: null,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push('/client/patrimoine/societe')
  }

  const handleAddBien = () => {
    if (!formData.adresse || !formData.valeur_venale) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    const bien: BienImmobilier = {
      id: generateId(),
      type: formData.type as any,
      adresse: formData.adresse,
      valeur_venale: formData.valeur_venale,
      pret: formData.pret || null,
      revenus_locatifs: formData.revenus_locatifs,
      scpi: formData.scpi,
    }

    addBienImmobilier(bien)
    resetForm()
  }

  const handleUpdateBien = () => {
    if (!editingBien) return
    updateBienImmobilier(editingBien, formData)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      type: 'Résidence principale',
      adresse: '',
      valeur_venale: 0,
      pret: null,
    })
    setShowAddBien(false)
    setEditingBien(null)
  }

  const startEdit = (bien: BienImmobilier) => {
    setFormData(bien)
    setEditingBien(bien.id)
    setShowAddBien(true)
  }

  const showRevenuLocatif = formData.type === 'Locatif'
  const showSCPI = formData.type === 'SCPI'
  const showPret = formData.pret !== null

  // Calculate totals
  const totalValorisation = assessment.biens_immobiliers.reduce((sum, b) => sum + b.valeur_venale, 0)
  const totalEndettement = assessment.biens_immobiliers.reduce((sum, b) => sum + (b.pret?.capital_restant_du || 0), 0)
  const totalRevenuLocatif = assessment.biens_immobiliers.reduce((sum, b) => 
    sum + (b.revenus_locatifs?.revenus_nets_annuels || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🏠 Patrimoine Immobilier
          </h1>
          <p className="text-gray-600 text-lg">
            Étape 8/11 - Recensons vos biens immobiliers
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gradient-to-br from-blue-50 to-white-lighter rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: '72%' }}></div>
          </div>
          <p className="text-gray-600 text-sm mt-2">Progression: 8 sur 11 étapes</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-gold/20 to-gold/10 border-blue-600">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Valorisation Totale</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalValorisation)}</p>
                </div>
                <Home className="w-10 h-10 text-blue-600/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-white-light border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Endettement Total</p>
                  <p className="text-2xl font-bold text-red-400">{formatCurrency(totalEndettement)}</p>
                </div>
                <DollarSign className="w-10 h-10 text-gray-700/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-white-light border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Revenus Locatifs/An</p>
                  <p className="text-2xl font-bold text-green-400">{formatCurrency(totalRevenuLocatif)}</p>
                </div>
                <Building className="w-10 h-10 text-gray-700/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Biens List */}
        <Card className="bg-gradient-to-br from-blue-50 to-white-light border-gray-200 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Home className="w-6 h-6 text-blue-600" />
                <CardTitle className="text-gray-900">Biens Immobiliers ({assessment.biens_immobiliers.length})</CardTitle>
              </div>
              <Button
                onClick={() => setShowAddBien(!showAddBien)}
                variant="outline"
                size="sm"
                className="bg-gradient-to-br from-blue-50 to-white-lighter border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-midnight"
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter un bien
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Add/Edit Bien Form */}
            {showAddBien && (
              <Card className="mb-4 bg-gradient-to-br from-blue-50 to-white border-gray-200">
                <CardContent className="pt-4">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    {editingBien ? 'Modifier le bien' : 'Nouveau bien immobilier'}
                  </h4>
                  <div className="space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-700">Type de bien *</Label>
                        <Select
                          value={formData.type}
                          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                          className="mt-1 bg-gradient-to-br from-blue-50 to-white-light border-gray-200 text-gray-900"
                        >
                          <option value="Résidence principale">Résidence principale</option>
                          <option value="Résidence secondaire">Résidence secondaire</option>
                          <option value="Locatif">Locatif</option>
                          <option value="SCI">SCI</option>
                          <option value="SCPI">SCPI</option>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-gray-700">Adresse *</Label>
                        <Input
                          value={formData.adresse}
                          onChange={(e) => setFormData(prev => ({ ...prev, adresse: e.target.value }))}
                          className="mt-1 bg-gradient-to-br from-blue-50 to-white-light border-gray-200 text-gray-900"
                          placeholder="Adresse complète"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-700">Valeur vénale (€) *</Label>
                        <Input
                          type="number"
                          value={formData.valeur_venale}
                          onChange={(e) => setFormData(prev => ({ ...prev, valeur_venale: parseFloat(e.target.value) || 0 }))}
                          className="mt-1 bg-gradient-to-br from-blue-50 to-white-light border-gray-200 text-gray-900"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Crédit Section */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-semibold text-gray-900">Crédit immobilier</h5>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            pret: prev.pret ? null : {
                              existe: true,
                              capital_restant_du: 0,
                              mensualite: 0,
                              taux: 0,
                            }
                          }))}
                          className={showPret ? "border-red-400 text-red-400" : "border-blue-600 text-blue-600"}
                        >
                          {showPret ? 'Retirer' : 'Ajouter'}
                        </Button>
                      </div>
                      {showPret && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-gray-700 text-sm">Capital restant dû (€)</Label>
                            <Input
                              type="number"
                              value={formData.pret?.capital_restant_du || 0}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                pret: { ...prev.pret!, capital_restant_du: parseFloat(e.target.value) || 0 }
                              }))}
                              className="mt-1 bg-gradient-to-br from-blue-50 to-white-light border-gray-200 text-gray-900"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 text-sm">Mensualité (€)</Label>
                            <Input
                              type="number"
                              value={formData.pret?.mensualite || 0}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                pret: { ...prev.pret!, mensualite: parseFloat(e.target.value) || 0 }
                              }))}
                              className="mt-1 bg-gradient-to-br from-blue-50 to-white-light border-gray-200 text-gray-900"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 text-sm">Taux (%)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={formData.pret?.taux || 0}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                pret: { ...prev.pret!, taux: parseFloat(e.target.value) || 0 }
                              }))}
                              className="mt-1 bg-gradient-to-br from-blue-50 to-white-light border-gray-200 text-gray-900"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Revenus Locatifs (if Locatif) */}
                    {showRevenuLocatif && (
                      <div className="pt-4 border-t border-gray-200">
                        <h5 className="font-semibold text-gray-900 mb-3">Revenus locatifs</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-gray-700 text-sm">Loyers bruts annuels (€)</Label>
                            <Input
                              type="number"
                              value={formData.revenus_locatifs?.loyer_mensuel ? formData.revenus_locatifs.loyer_mensuel * 12 : 0}
                              onChange={(e) => {
                                const monthly = (parseFloat(e.target.value) || 0) / 12
                                setFormData(prev => ({
                                  ...prev,
                                  revenus_locatifs: {
                                    loyer_mensuel: monthly,
                                    charges_mensuelles: prev.revenus_locatifs?.charges_mensuelles || 0,
                                    taxe_fonciere_annuelle: prev.revenus_locatifs?.taxe_fonciere_annuelle || 0,
                                    revenus_nets_annuels: (monthly * 12) - ((prev.revenus_locatifs?.charges_mensuelles || 0) * 12) - (prev.revenus_locatifs?.taxe_fonciere_annuelle || 0)
                                  }
                                }))
                              }}
                              className="mt-1 bg-gradient-to-br from-blue-50 to-white-light border-gray-200 text-gray-900"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 text-sm">Charges déductibles annuelles (€)</Label>
                            <Input
                              type="number"
                              value={formData.revenus_locatifs?.charges_mensuelles ? formData.revenus_locatifs.charges_mensuelles * 12 : 0}
                              onChange={(e) => {
                                const monthly = (parseFloat(e.target.value) || 0) / 12
                                setFormData(prev => ({
                                  ...prev,
                                  revenus_locatifs: {
                                    loyer_mensuel: prev.revenus_locatifs?.loyer_mensuel || 0,
                                    charges_mensuelles: monthly,
                                    taxe_fonciere_annuelle: prev.revenus_locatifs?.taxe_fonciere_annuelle || 0,
                                    revenus_nets_annuels: ((prev.revenus_locatifs?.loyer_mensuel || 0) * 12) - (monthly * 12) - (prev.revenus_locatifs?.taxe_fonciere_annuelle || 0)
                                  }
                                }))
                              }}
                              className="mt-1 bg-gradient-to-br from-blue-50 to-white-light border-gray-200 text-gray-900"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 text-sm">Revenus nets annuels (calculé)</Label>
                            <div className="mt-1 p-2 bg-gradient-to-br from-blue-50 to-white-lighter rounded text-blue-600 font-semibold">
                              {formatCurrency(formData.revenus_locatifs?.revenus_nets_annuels || 0)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SCPI Details */}
                    {showSCPI && (
                      <div className="pt-4 border-t border-gray-200">
                        <h5 className="font-semibold text-gray-900 mb-3">Détails SCPI</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-gray-700 text-sm">Nom SCPI</Label>
                            <Input
                              value={formData.scpi?.nom_scpi || ''}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                scpi: {
                                  nom_scpi: e.target.value,
                                  nombre_parts: prev.scpi?.nombre_parts || 0,
                                  valeur_part: prev.scpi?.valeur_part || 0,
                                  rendement_annuel: prev.scpi?.rendement_annuel || 0,
                                }
                              }))}
                              className="mt-1 bg-gradient-to-br from-blue-50 to-white-light border-gray-200 text-gray-900"
                              placeholder="Ex: Corum Origin"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 text-sm">Nombre de parts</Label>
                            <Input
                              type="number"
                              value={formData.scpi?.nombre_parts || 0}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                scpi: { ...prev.scpi!, nombre_parts: parseFloat(e.target.value) || 0 }
                              }))}
                              className="mt-1 bg-gradient-to-br from-blue-50 to-white-light border-gray-200 text-gray-900"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 text-sm">Valeur de la part (€)</Label>
                            <Input
                              type="number"
                              value={formData.scpi?.valeur_part || 0}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                scpi: { ...prev.scpi!, valeur_part: parseFloat(e.target.value) || 0 }
                              }))}
                              className="mt-1 bg-gradient-to-br from-blue-50 to-white-light border-gray-200 text-gray-900"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 text-sm">Rendement annuel (%)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={formData.scpi?.rendement_annuel || 0}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                scpi: { ...prev.scpi!, rendement_annuel: parseFloat(e.target.value) || 0 }
                              }))}
                              className="mt-1 bg-gradient-to-br from-blue-50 to-white-light border-gray-200 text-gray-900"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                        className="bg-gradient-to-br from-blue-50 to-white-lighter border-gray-200 text-gray-700"
                      >
                        Annuler
                      </Button>
                      <Button
                        type="button"
                        onClick={editingBien ? handleUpdateBien : handleAddBien}
                        className="bg-blue-600 text-midnight hover:bg-blue-600/90"
                      >
                        {editingBien ? 'Mettre à jour' : 'Ajouter le bien'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Biens List */}
            {assessment.biens_immobiliers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assessment.biens_immobiliers.map((bien) => (
                  <Card key={bien.id} className="bg-gradient-to-br from-blue-50 to-white border-gray-200">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Home className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-semibold text-blue-600">{bien.type}</span>
                          </div>
                          <p className="text-gray-900 font-medium">{bien.adresse}</p>
                          <p className="text-2xl font-bold text-blue-600 mt-2">{formatCurrency(bien.valeur_venale)}</p>
                          {bien.pret && (
                            <p className="text-sm text-red-400 mt-1">
                              Dette: {formatCurrency(bien.pret.capital_restant_du || 0)}
                            </p>
                          )}
                          {bien.revenus_locatifs && (
                            <p className="text-sm text-green-400 mt-1">
                              Loyers nets: {formatCurrency(bien.revenus_locatifs.revenus_nets_annuels)}/an
                            </p>
                          )}
                          {bien.scpi && (
                            <p className="text-sm text-gray-600 mt-1">
                              {bien.scpi.nom_scpi} - {bien.scpi.nombre_parts} parts
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(bien)}
                            className="text-blue-600 hover:text-blue-600/80 hover:bg-blue-600/10"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBienImmobilier(bien.id)}
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
              <p className="text-gray-700/50 text-center py-8">Aucun bien immobilier ajouté</p>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/client/patrimoine/bourse')}
              className="bg-gradient-to-br from-blue-50 to-white-lighter border-gray-200 text-gray-700 hover:bg-gradient-to-br from-blue-50 to-white hover:text-gray-900"
            >
              ← Précédent
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 text-midnight hover:bg-blue-600/90 font-semibold"
            >
              Suivant →
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
