'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { AutresActifs, CryptoMonnaie, MetalPrecieux, OeuvreArt, VehiculeCollection } from '@/lib/types/assessment'
import { generateId, formatCurrency } from '@/lib/utils/assessment/helpers'
import { Gem, Plus, Trash2, Palette, Car, Bitcoin } from 'lucide-react'

export default function AutresActifsPage() {
  const router = useRouter()
  const { assessment, setAutresActifs } = useClientStore()
  
  const [formData, setFormData] = useState<AutresActifs>(
    assessment.autres_actifs || {
      crypto_monnaies: [],
      metaux_precieux: [],
      oeuvres_art: [],
      vehicules_collection: [],
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setAutresActifs(formData)
    router.push('/client/synthese')
  }

  // Crypto functions
  const addCrypto = () => {
    setFormData(prev => ({
      ...prev,
      crypto_monnaies: [...prev.crypto_monnaies, {
        id: generateId(),
        nom: '',
        quantite: 0,
        valeur_unitaire: 0,
        valeur_totale: 0,
      }]
    }))
  }

  const removeCrypto = (id: string) => {
    setFormData(prev => ({
      ...prev,
      crypto_monnaies: prev.crypto_monnaies.filter(c => c.id !== id)
    }))
  }

  const updateCrypto = (id: string, field: keyof CryptoMonnaie, value: any) => {
    setFormData(prev => ({
      ...prev,
      crypto_monnaies: prev.crypto_monnaies.map(c => {
        if (c.id === id) {
          const updated = { ...c, [field]: value }
          if (field === 'quantite' || field === 'valeur_unitaire') {
            updated.valeur_totale = updated.quantite * updated.valeur_unitaire
          }
          return updated
        }
        return c
      })
    }))
  }

  // Metaux functions
  const addMetal = () => {
    setFormData(prev => ({
      ...prev,
      metaux_precieux: [...prev.metaux_precieux, {
        id: generateId(),
        type: 'Or',
        quantite_grammes: 0,
        valeur_totale: 0,
      }]
    }))
  }

  const removeMetal = (id: string) => {
    setFormData(prev => ({
      ...prev,
      metaux_precieux: prev.metaux_precieux.filter(m => m.id !== id)
    }))
  }

  const updateMetal = (id: string, field: keyof MetalPrecieux, value: any) => {
    setFormData(prev => ({
      ...prev,
      metaux_precieux: prev.metaux_precieux.map(m => 
        m.id === id ? { ...m, [field]: value } : m
      )
    }))
  }

  // Oeuvres d'art functions
  const addOeuvre = () => {
    setFormData(prev => ({
      ...prev,
      oeuvres_art: [...prev.oeuvres_art, {
        id: generateId(),
        description: '',
        valeur_estimee: 0,
        date_acquisition: new Date(),
      }]
    }))
  }

  const removeOeuvre = (id: string) => {
    setFormData(prev => ({
      ...prev,
      oeuvres_art: prev.oeuvres_art.filter(o => o.id !== id)
    }))
  }

  const updateOeuvre = (id: string, field: keyof OeuvreArt, value: any) => {
    setFormData(prev => ({
      ...prev,
      oeuvres_art: prev.oeuvres_art.map(o => 
        o.id === id ? { ...o, [field]: value } : o
      )
    }))
  }

  // Vehicules functions
  const addVehicule = () => {
    setFormData(prev => ({
      ...prev,
      vehicules_collection: [...prev.vehicules_collection, {
        id: generateId(),
        modele: '',
        annee: new Date().getFullYear(),
        valeur_estimee: 0,
      }]
    }))
  }

  const removeVehicule = (id: string) => {
    setFormData(prev => ({
      ...prev,
      vehicules_collection: prev.vehicules_collection.filter(v => v.id !== id)
    }))
  }

  const updateVehicule = (id: string, field: keyof VehiculeCollection, value: any) => {
    setFormData(prev => ({
      ...prev,
      vehicules_collection: prev.vehicules_collection.map(v => 
        v.id === id ? { ...v, [field]: value } : v
      )
    }))
  }

  // Calculate total
  const totalAutresActifs = 
    formData.crypto_monnaies.reduce((sum, c) => sum + c.valeur_totale, 0) +
    formData.metaux_precieux.reduce((sum, m) => sum + m.valeur_totale, 0) +
    formData.oeuvres_art.reduce((sum, o) => sum + o.valeur_estimee, 0) +
    formData.vehicules_collection.reduce((sum, v) => sum + v.valeur_estimee, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            💎 Autres Actifs
          </h1>
          <p className="text-gray-600 text-lg">
            Étape 10/11 - Actifs alternatifs et collections
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gradient-to-br from-blue-50 to-white-lighter rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: '90%' }}></div>
          </div>
          <p className="text-gray-600 text-sm mt-2">Progression: 10 sur 11 étapes</p>
        </div>

        {/* Total Summary */}
        <Card className="mb-6 bg-gradient-to-r from-gold/20 to-gold/10 border-blue-600">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Autres Actifs</p>
                <p className="text-4xl font-bold text-blue-600">{formatCurrency(totalAutresActifs)}</p>
              </div>
              <Gem className="w-16 h-16 text-blue-600/50" />
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cryptomonnaies */}
          <Card className="bg-gradient-to-br from-blue-50 to-white-light border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bitcoin className="w-6 h-6 text-blue-600" />
                  <CardTitle className="text-gray-900">Cryptomonnaies ({formData.crypto_monnaies.length})</CardTitle>
                </div>
                <Button
                  type="button"
                  onClick={addCrypto}
                  variant="outline"
                  size="sm"
                  className="bg-gradient-to-br from-blue-50 to-white-lighter border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-midnight"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {formData.crypto_monnaies.length > 0 ? (
                <div className="space-y-3">
                  {formData.crypto_monnaies.map((crypto) => (
                    <Card key={crypto.id} className="bg-gradient-to-br from-blue-50 to-white border-gray-200">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div>
                              <Label className="text-gray-700 text-sm">Nom</Label>
                              <Input
                                value={crypto.nom}
                                onChange={(e) => updateCrypto(crypto.id, 'nom', e.target.value)}
                                className="mt-1 bg-gradient-to-br from-blue-50 to-white-light border-gray-200 text-gray-900"
                                placeholder="Bitcoin, Ethereum..."
                              />
                            </div>
                            <div>
                              <Label className="text-gray-700 text-sm">Quantité</Label>
                              <Input
                                type="number"
                                step="0.00000001"
                                value={crypto.quantite}
                                onChange={(e) => updateCrypto(crypto.id, 'quantite', parseFloat(e.target.value) || 0)}
                                className="mt-1 bg-gradient-to-br from-blue-50 to-white-light border-gray-200 text-gray-900"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <Label className="text-gray-700 text-sm">Valeur unitaire (€)</Label>
                              <Input
                                type="number"
                                value={crypto.valeur_unitaire}
                                onChange={(e) => updateCrypto(crypto.id, 'valeur_unitaire', parseFloat(e.target.value) || 0)}
                                className="mt-1 bg-gradient-to-br from-blue-50 to-white-light border-gray-200 text-gray-900"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <Label className="text-gray-700 text-sm">Valeur totale</Label>
                              <div className="mt-1 p-2 bg-gradient-to-br from-blue-50 to-white-lighter rounded text-blue-600 font-semibold">
                                {formatCurrency(crypto.valeur_totale)}
                              </div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCrypto(crypto.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 mt-6"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-700/50 text-center py-4">Aucune cryptomonnaie ajoutée</p>
              )}
            </CardContent>
          </Card>

          {/* Métaux précieux */}
          <Card className="bg-gradient-to-br from-blue-50 to-white-light border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gem className="w-6 h-6 text-blue-600" />
                  <CardTitle className="text-gray-900">Métaux Précieux ({formData.metaux_precieux.length})</CardTitle>
                </div>
                <Button
                  type="button"
                  onClick={addMetal}
                  variant="outline"
                  size="sm"
                  className="bg-gradient-to-br from-blue-50 to-white-lighter border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-midnight"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {formData.metaux_precieux.length > 0 ? (
                <div className="space-y-3">
                  {formData.metaux_precieux.map((metal) => (
                    <Card key={metal.id} className="bg-gradient-to-br from-blue-50 to-white border-gray-200">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <Label className="text-gray-700 text-sm">Type</Label>
                              <Select
                                value={metal.type}
                                onChange={(e) => updateMetal(metal.id, 'type', e.target.value)}
                                className="mt-1 bg-gradient-to-br from-blue-50 to-white-light border-gray-200 text-gray-900"
                              >
                                <option value="Or">Or</option>
                                <option value="Argent">Argent</option>
                                <option value="Platine">Platine</option>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-gray-700 text-sm">Quantité (grammes)</Label>
                              <Input
                                type="number"
                                value={metal.quantite_grammes}
                                onChange={(e) => updateMetal(metal.id, 'quantite_grammes', parseFloat(e.target.value) || 0)}
                                className="mt-1 bg-gradient-to-br from-blue-50 to-white-light border-gray-200 text-gray-900"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <Label className="text-gray-700 text-sm">Valeur totale (€)</Label>
                              <Input
                                type="number"
                                value={metal.valeur_totale}
                                onChange={(e) => updateMetal(metal.id, 'valeur_totale', parseFloat(e.target.value) || 0)}
                                className="mt-1 bg-gradient-to-br from-blue-50 to-white-light border-gray-200 text-gray-900"
                                placeholder="0"
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMetal(metal.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 mt-6"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-700/50 text-center py-4">Aucun métal précieux ajouté</p>
              )}
            </CardContent>
          </Card>

          {/* Œuvres d'art */}
          <Card className="bg-gradient-to-br from-blue-50 to-white-light border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="w-6 h-6 text-blue-600" />
                  <CardTitle className="text-gray-900">Œuvres d'Art ({formData.oeuvres_art.length})</CardTitle>
                </div>
                <Button
                  type="button"
                  onClick={addOeuvre}
                  variant="outline"
                  size="sm"
                  className="bg-gradient-to-br from-blue-50 to-white-lighter border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-midnight"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {formData.oeuvres_art.length > 0 ? (
                <div className="space-y-3">
                  {formData.oeuvres_art.map((oeuvre) => (
                    <Card key={oeuvre.id} className="bg-gradient-to-br from-blue-50 to-white border-gray-200">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <Label className="text-gray-700 text-sm">Description</Label>
                              <Input
                                value={oeuvre.description}
                                onChange={(e) => updateOeuvre(oeuvre.id, 'description', e.target.value)}
                                className="mt-1 bg-gradient-to-br from-blue-50 to-white-light border-gray-200 text-gray-900"
                                placeholder="Tableau, sculpture..."
                              />
                            </div>
                            <div>
                              <Label className="text-gray-700 text-sm">Valeur estimée (€)</Label>
                              <Input
                                type="number"
                                value={oeuvre.valeur_estimee}
                                onChange={(e) => updateOeuvre(oeuvre.id, 'valeur_estimee', parseFloat(e.target.value) || 0)}
                                className="mt-1 bg-gradient-to-br from-blue-50 to-white-light border-gray-200 text-gray-900"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <Label className="text-gray-700 text-sm">Date d'acquisition</Label>
                              <Input
                                type="date"
                                value={oeuvre.date_acquisition instanceof Date ? oeuvre.date_acquisition.toISOString().split('T')[0] : ''}
                                onChange={(e) => updateOeuvre(oeuvre.id, 'date_acquisition', new Date(e.target.value))}
                                className="mt-1 bg-gradient-to-br from-blue-50 to-white-light border-gray-200 text-gray-900"
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOeuvre(oeuvre.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 mt-6"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-700/50 text-center py-4">Aucune œuvre d'art ajoutée</p>
              )}
            </CardContent>
          </Card>

          {/* Véhicules de collection */}
          <Card className="bg-gradient-to-br from-blue-50 to-white-light border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="w-6 h-6 text-blue-600" />
                  <CardTitle className="text-gray-900">Véhicules de Collection ({formData.vehicules_collection.length})</CardTitle>
                </div>
                <Button
                  type="button"
                  onClick={addVehicule}
                  variant="outline"
                  size="sm"
                  className="bg-gradient-to-br from-blue-50 to-white-lighter border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-midnight"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {formData.vehicules_collection.length > 0 ? (
                <div className="space-y-3">
                  {formData.vehicules_collection.map((vehicule) => (
                    <Card key={vehicule.id} className="bg-gradient-to-br from-blue-50 to-white border-gray-200">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <Label className="text-gray-700 text-sm">Modèle</Label>
                              <Input
                                value={vehicule.modele}
                                onChange={(e) => updateVehicule(vehicule.id, 'modele', e.target.value)}
                                className="mt-1 bg-gradient-to-br from-blue-50 to-white-light border-gray-200 text-gray-900"
                                placeholder="Ferrari, Porsche..."
                              />
                            </div>
                            <div>
                              <Label className="text-gray-700 text-sm">Année</Label>
                              <Input
                                type="number"
                                value={vehicule.annee}
                                onChange={(e) => updateVehicule(vehicule.id, 'annee', parseInt(e.target.value) || new Date().getFullYear())}
                                className="mt-1 bg-gradient-to-br from-blue-50 to-white-light border-gray-200 text-gray-900"
                                placeholder={new Date().getFullYear().toString()}
                              />
                            </div>
                            <div>
                              <Label className="text-gray-700 text-sm">Valeur estimée (€)</Label>
                              <Input
                                type="number"
                                value={vehicule.valeur_estimee}
                                onChange={(e) => updateVehicule(vehicule.id, 'valeur_estimee', parseFloat(e.target.value) || 0)}
                                className="mt-1 bg-gradient-to-br from-blue-50 to-white-light border-gray-200 text-gray-900"
                                placeholder="0"
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVehicule(vehicule.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 mt-6"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-700/50 text-center py-4">Aucun véhicule de collection ajouté</p>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/client/patrimoine/societe')}
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
