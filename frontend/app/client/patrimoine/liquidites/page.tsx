'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Liquidites, CompteCourant, AutreLivret } from '@/lib/types/assessment'
import { generateId, formatCurrency } from '@/lib/utils/assessment/helpers'
import { Wallet, Plus, Trash2, TrendingUp, Banknote } from 'lucide-react'

export default function LiquiditesPage() {
  const router = useRouter()
  const { assessment, setLiquidites, getPatrimoineBrut } = useClientStore()
  
  const [formData, setFormData] = useState<Liquidites>(
    assessment.liquidites || {
      comptes_courants: [],
      livret_a: { montant: 0, taux: 3 },
      ldds: { montant: 0, taux: 3 },
      lep: null,
      autres_livrets: [],
    }
  )

  const [showLEP, setShowLEP] = useState(formData.lep !== null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLiquidites(formData)
    router.push('/client/patrimoine/assurance-vie')
  }

  const addCompteCourant = () => {
    setFormData(prev => ({
      ...prev,
      comptes_courants: [...prev.comptes_courants, {
        id: generateId(),
        banque: '',
        montant: 0,
      }]
    }))
  }

  const removeCompteCourant = (id: string) => {
    setFormData(prev => ({
      ...prev,
      comptes_courants: prev.comptes_courants.filter(c => c.id !== id)
    }))
  }

  const updateCompteCourant = (id: string, field: keyof CompteCourant, value: any) => {
    setFormData(prev => ({
      ...prev,
      comptes_courants: prev.comptes_courants.map(c => 
        c.id === id ? { ...c, [field]: value } : c
      )
    }))
  }

  const addAutreLivret = () => {
    setFormData(prev => ({
      ...prev,
      autres_livrets: [...prev.autres_livrets, {
        id: generateId(),
        nom: '',
        montant: 0,
        taux: 0,
      }]
    }))
  }

  const removeAutreLivret = (id: string) => {
    setFormData(prev => ({
      ...prev,
      autres_livrets: prev.autres_livrets.filter(l => l.id !== id)
    }))
  }

  const updateAutreLivret = (id: string, field: keyof AutreLivret, value: any) => {
    setFormData(prev => ({
      ...prev,
      autres_livrets: prev.autres_livrets.map(l => 
        l.id === id ? { ...l, [field]: value } : l
      )
    }))
  }

  const toggleLEP = () => {
    if (showLEP) {
      setFormData(prev => ({ ...prev, lep: null }))
      setShowLEP(false)
    } else {
      setFormData(prev => ({ ...prev, lep: { montant: 0, taux: 5 } }))
      setShowLEP(true)
    }
  }

  // Calculate total liquidites
  const totalLiquidites = 
    formData.comptes_courants.reduce((sum, c) => sum + c.montant, 0) +
    formData.livret_a.montant +
    formData.ldds.montant +
    (formData.lep?.montant || 0) +
    formData.autres_livrets.reduce((sum, l) => sum + l.montant, 0)

  return (
    <div className="min-h-screen bg-midnight">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            💵 Liquidités
          </h1>
          <p className="text-cream/70 text-lg">
            Étape 5/11 - Recensons vos comptes et livrets d'épargne
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-midnight-lighter rounded-full h-2">
            <div className="bg-gold h-2 rounded-full transition-all duration-300" style={{ width: '45%' }}></div>
          </div>
          <p className="text-cream/70 text-sm mt-2">Progression: 5 sur 11 étapes</p>
        </div>

        {/* Total Summary Card */}
        <Card className="mb-6 bg-gradient-to-r from-gold/20 to-gold/10 border-gold">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cream/70 text-sm mb-1">Total Liquidités</p>
                <p className="text-4xl font-bold text-gold">{formatCurrency(totalLiquidites)}</p>
              </div>
              <Wallet className="w-16 h-16 text-gold/50" />
            </div>
          </CardContent>
        </Card>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Comptes Courants Section */}
          <Card className="bg-midnight-light border-midnight-lighter">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Banknote className="w-6 h-6 text-gold" />
                  <CardTitle className="text-white">Comptes Courants ({formData.comptes_courants.length})</CardTitle>
                </div>
                <Button
                  type="button"
                  onClick={addCompteCourant}
                  variant="outline"
                  size="sm"
                  className="bg-midnight-lighter border-gold text-gold hover:bg-gold hover:text-midnight"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {formData.comptes_courants.length > 0 ? (
                <div className="space-y-3">
                  {formData.comptes_courants.map((compte) => (
                    <Card key={compte.id} className="bg-midnight border-midnight-lighter">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <Label className="text-cream text-sm">Banque</Label>
                              <Input
                                value={compte.banque}
                                onChange={(e) => updateCompteCourant(compte.id, 'banque', e.target.value)}
                                className="mt-1 bg-midnight-light border-midnight-lighter text-white"
                                placeholder="Nom de la banque"
                              />
                            </div>
                            
                            <div>
                              <Label className="text-cream text-sm">Montant (€)</Label>
                              <Input
                                type="number"
                                value={compte.montant}
                                onChange={(e) => updateCompteCourant(compte.id, 'montant', parseFloat(e.target.value) || 0)}
                                className="mt-1 bg-midnight-light border-midnight-lighter text-white"
                                placeholder="0"
                              />
                            </div>
                          </div>
                          
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCompteCourant(compte.id)}
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
                <p className="text-cream/50 text-center py-4">Aucun compte courant ajouté</p>
              )}
            </CardContent>
          </Card>

          {/* Livrets Réglementés Section */}
          <Card className="bg-midnight-light border-midnight-lighter">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-gold" />
                <CardTitle className="text-white">Livrets Réglementés</CardTitle>
              </div>
              <CardDescription className="text-cream/70">
                Livrets à taux réglementés par l'État
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Livret A */}
              <div className="p-4 bg-midnight/50 rounded-lg border border-midnight-lighter">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-white">Livret A</h4>
                  <span className="text-sm text-gold">Taux: {formData.livret_a.taux}%</span>
                </div>
                <div>
                  <Label className="text-cream text-sm">Montant (€)</Label>
                  <Input
                    type="number"
                    value={formData.livret_a.montant}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      livret_a: { ...prev.livret_a, montant: parseFloat(e.target.value) || 0 }
                    }))}
                    className="mt-1 bg-midnight border-midnight-lighter text-white"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* LDDS */}
              <div className="p-4 bg-midnight/50 rounded-lg border border-midnight-lighter">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-white">LDDS</h4>
                  <span className="text-sm text-gold">Taux: {formData.ldds.taux}%</span>
                </div>
                <div>
                  <Label className="text-cream text-sm">Montant (€)</Label>
                  <Input
                    type="number"
                    value={formData.ldds.montant}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      ldds: { ...prev.ldds, montant: parseFloat(e.target.value) || 0 }
                    }))}
                    className="mt-1 bg-midnight border-midnight-lighter text-white"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* LEP */}
              <div className="p-4 bg-midnight/50 rounded-lg border border-midnight-lighter">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-white">LEP (Livret d'Épargne Populaire)</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={toggleLEP}
                    className={showLEP ? "border-red-400 text-red-400" : "border-gold text-gold"}
                  >
                    {showLEP ? 'Retirer' : 'Ajouter'}
                  </Button>
                </div>
                {showLEP && (
                  <>
                    <span className="text-sm text-gold mb-3 block">Taux: {formData.lep?.taux || 5}%</span>
                    <div>
                      <Label className="text-cream text-sm">Montant (€)</Label>
                      <Input
                        type="number"
                        value={formData.lep?.montant || 0}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          lep: { montant: parseFloat(e.target.value) || 0, taux: prev.lep?.taux || 5 }
                        }))}
                        className="mt-1 bg-midnight border-midnight-lighter text-white"
                        placeholder="0"
                      />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Autres Livrets Section */}
          <Card className="bg-midnight-light border-midnight-lighter">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-6 h-6 text-gold" />
                  <CardTitle className="text-white">Autres Livrets ({formData.autres_livrets.length})</CardTitle>
                </div>
                <Button
                  type="button"
                  onClick={addAutreLivret}
                  variant="outline"
                  size="sm"
                  className="bg-midnight-lighter border-gold text-gold hover:bg-gold hover:text-midnight"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              <CardDescription className="text-cream/70">
                Livrets bancaires non réglementés
              </CardDescription>
            </CardHeader>
            <CardContent>
              {formData.autres_livrets.length > 0 ? (
                <div className="space-y-3">
                  {formData.autres_livrets.map((livret) => (
                    <Card key={livret.id} className="bg-midnight border-midnight-lighter">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <Label className="text-cream text-sm">Nom du livret</Label>
                              <Input
                                value={livret.nom}
                                onChange={(e) => updateAutreLivret(livret.id, 'nom', e.target.value)}
                                className="mt-1 bg-midnight-light border-midnight-lighter text-white"
                                placeholder="Ex: Livret Boursorama"
                              />
                            </div>
                            
                            <div>
                              <Label className="text-cream text-sm">Montant (€)</Label>
                              <Input
                                type="number"
                                value={livret.montant}
                                onChange={(e) => updateAutreLivret(livret.id, 'montant', parseFloat(e.target.value) || 0)}
                                className="mt-1 bg-midnight-light border-midnight-lighter text-white"
                                placeholder="0"
                              />
                            </div>
                            
                            <div>
                              <Label className="text-cream text-sm">Taux (%)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={livret.taux}
                                onChange={(e) => updateAutreLivret(livret.id, 'taux', parseFloat(e.target.value) || 0)}
                                className="mt-1 bg-midnight-light border-midnight-lighter text-white"
                                placeholder="0"
                              />
                            </div>
                          </div>
                          
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAutreLivret(livret.id)}
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
                <p className="text-cream/50 text-center py-4">Aucun autre livret ajouté</p>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/client/bilan/successoral')}
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
