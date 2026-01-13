'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Liquidites, CompteCourant, AutreLivret } from '@/lib/types/assessment'
import { generateId, formatCurrency } from '@/lib/utils/assessment/helpers'
import { Wallet, Plus, Trash2, TrendingUp, Banknote } from 'lucide-react'

export default function LiquiditesPage() {
  const router = useRouter()
  const { assessment, setLiquidites } = useClientStore()
  
  const [formData, setFormData] = useState<Liquidites>(
    assessment.liquidites || {
      comptes_courants: [],
      livret_a: { montant: 0, taux: 3.0 },
      ldds: { montant: 0, taux: 3.0 },
      lep: null,
      autres_livrets: [],
    }
  )

  const [showAddCompte, setShowAddCompte] = useState(false)
  const [showAddLivret, setShowAddLivret] = useState(false)
  const [newCompte, setNewCompte] = useState({ banque: '', montant: 0 })
  const [newLivret, setNewLivret] = useState({ nom: '', montant: 0, taux: 0 })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLiquidites(formData)
    router.push('/client/patrimoine/assurance-vie')
  }

  const updateLivretA = (field: 'montant' | 'taux', value: number) => {
    setFormData(prev => ({
      ...prev,
      livret_a: { ...prev.livret_a, [field]: value }
    }))
  }

  const updateLDDS = (field: 'montant' | 'taux', value: number) => {
    setFormData(prev => ({
      ...prev,
      ldds: { ...prev.ldds, [field]: value }
    }))
  }

  const updateLEP = (field: 'montant' | 'taux', value: number) => {
    setFormData(prev => ({
      ...prev,
      lep: prev.lep ? { ...prev.lep, [field]: value } : { montant: field === 'montant' ? value : 0, taux: field === 'taux' ? value : 5.0 }
    }))
  }

  const removeLEP = () => {
    setFormData(prev => ({ ...prev, lep: null }))
  }

  const addLEP = () => {
    setFormData(prev => ({ ...prev, lep: { montant: 0, taux: 5.0 } }))
  }

  const addCompte = () => {
    if (!newCompte.banque) return
    const compte: CompteCourant = {
      id: generateId(),
      banque: newCompte.banque,
      montant: newCompte.montant,
    }
    setFormData(prev => ({
      ...prev,
      comptes_courants: [...prev.comptes_courants, compte]
    }))
    setNewCompte({ banque: '', montant: 0 })
    setShowAddCompte(false)
  }

  const removeCompte = (id: string) => {
    setFormData(prev => ({
      ...prev,
      comptes_courants: prev.comptes_courants.filter(c => c.id !== id)
    }))
  }

  const addLivret = () => {
    if (!newLivret.nom) return
    const livret: AutreLivret = {
      id: generateId(),
      nom: newLivret.nom,
      montant: newLivret.montant,
      taux: newLivret.taux,
    }
    setFormData(prev => ({
      ...prev,
      autres_livrets: [...prev.autres_livrets, livret]
    }))
    setNewLivret({ nom: '', montant: 0, taux: 0 })
    setShowAddLivret(false)
  }

  const removeLivret = (id: string) => {
    setFormData(prev => ({
      ...prev,
      autres_livrets: prev.autres_livrets.filter(l => l.id !== id)
    }))
  }

  // Calculate totals
  const totalLiquidites = useMemo(() => {
    const comptesTotal = formData.comptes_courants.reduce((sum, c) => sum + c.montant, 0)
    const livretATotal = formData.livret_a.montant
    const lddsTotal = formData.ldds.montant
    const lepTotal = formData.lep?.montant || 0
    const autresTotal = formData.autres_livrets.reduce((sum, l) => sum + l.montant, 0)
    return comptesTotal + livretATotal + lddsTotal + lepTotal + autresTotal
  }, [formData])

  const rendementMoyen = useMemo(() => {
    let totalWeighted = 0
    let totalAmount = 0
    
    // Livret A
    if (formData.livret_a.montant > 0) {
      totalWeighted += formData.livret_a.montant * formData.livret_a.taux
      totalAmount += formData.livret_a.montant
    }
    
    // LDDS
    if (formData.ldds.montant > 0) {
      totalWeighted += formData.ldds.montant * formData.ldds.taux
      totalAmount += formData.ldds.montant
    }
    
    // LEP
    if (formData.lep && formData.lep.montant > 0) {
      totalWeighted += formData.lep.montant * formData.lep.taux
      totalAmount += formData.lep.montant
    }
    
    // Autres livrets
    formData.autres_livrets.forEach(l => {
      if (l.montant > 0) {
        totalWeighted += l.montant * l.taux
        totalAmount += l.montant
      }
    })
    
    return totalAmount > 0 ? totalWeighted / totalAmount : 0
  }, [formData])

  return (
    <div className="min-h-screen bg-midnight">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            💵 Liquidités
          </h1>
          <p className="text-cream/70 text-lg">
            Étape 6/11 - Comptes courants et livrets d'épargne
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-midnight-lighter rounded-full h-2">
            <div className="bg-gold h-2 rounded-full transition-all duration-300" style={{ width: '54%' }}></div>
          </div>
          <p className="text-cream/70 text-sm mt-2">Progression: 6 sur 11 étapes</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-midnight-light border-midnight-lighter">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gold/10 rounded-lg">
                  <Wallet className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <p className="text-cream/70 text-sm">Total liquidités</p>
                  <p className="text-3xl font-bold text-gold">
                    {formatCurrency(totalLiquidites)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-midnight-light border-midnight-lighter">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-cream/70 text-sm">Rendement moyen pondéré</p>
                  <p className="text-3xl font-bold text-green-400">
                    {rendementMoyen.toFixed(2)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Comptes Courants */}
          <Card className="bg-midnight-light border-midnight-lighter">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Banknote className="w-6 h-6 text-gold" />
                  <CardTitle className="text-white">Comptes courants</CardTitle>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddCompte(!showAddCompte)}
                  className="border-gold text-gold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un compte
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showAddCompte && (
                <div className="mb-4 p-4 border border-gold/30 rounded-lg bg-midnight">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <Label>Banque *</Label>
                      <Input
                        value={newCompte.banque}
                        onChange={(e) => setNewCompte({ ...newCompte, banque: e.target.value })}
                        placeholder="BNP Paribas, Société Générale..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Montant (€) *</Label>
                      <Input
                        type="number"
                        value={newCompte.montant}
                        onChange={(e) => setNewCompte({ ...newCompte, montant: parseFloat(e.target.value) || 0 })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="gold" size="sm" onClick={addCompte}>Ajouter</Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowAddCompte(false)}>Annuler</Button>
                  </div>
                </div>
              )}

              <Table className="bg-[#1E293B]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gold">Banque</TableHead>
                    <TableHead className="text-gold text-right">Montant</TableHead>
                    <TableHead className="text-gold"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.comptes_courants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-cream/50 py-8">
                        Aucun compte courant. Cliquez sur "Ajouter un compte".
                      </TableCell>
                    </TableRow>
                  ) : (
                    formData.comptes_courants.map(compte => (
                      <TableRow key={compte.id} className="hover:bg-midnight-lighter/50">
                        <TableCell className="font-semibold text-white">{compte.banque}</TableCell>
                        <TableCell className="text-right text-white">{formatCurrency(compte.montant)}</TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCompte(compte.id)}
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
            </CardContent>
          </Card>

          {/* Livrets réglementés */}
          <Card className="bg-midnight-light border-midnight-lighter">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Wallet className="w-6 h-6 text-gold" />
                <CardTitle className="text-white">Livrets réglementés</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Livret A */}
              <div className="p-4 border border-midnight-lighter rounded-lg bg-midnight/50">
                <h4 className="text-white font-semibold mb-3">Livret A</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Montant (€)</Label>
                    <Input
                      type="number"
                      value={formData.livret_a.montant}
                      onChange={(e) => updateLivretA('montant', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Taux (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.livret_a.taux}
                      onChange={(e) => updateLivretA('taux', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* LDDS */}
              <div className="p-4 border border-midnight-lighter rounded-lg bg-midnight/50">
                <h4 className="text-white font-semibold mb-3">LDDS (Livret de Développement Durable et Solidaire)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Montant (€)</Label>
                    <Input
                      type="number"
                      value={formData.ldds.montant}
                      onChange={(e) => updateLDDS('montant', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Taux (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.ldds.taux}
                      onChange={(e) => updateLDDS('taux', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* LEP */}
              {formData.lep ? (
                <div className="p-4 border border-midnight-lighter rounded-lg bg-midnight/50">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-white font-semibold">LEP (Livret d'Épargne Populaire)</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeLEP}
                      className="hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Montant (€)</Label>
                      <Input
                        type="number"
                        value={formData.lep.montant}
                        onChange={(e) => updateLEP('montant', parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Taux (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.lep.taux}
                        onChange={(e) => updateLEP('taux', parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addLEP}
                  className="w-full border-dashed border-gold/50 text-gold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un LEP (si éligible)
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Autres livrets */}
          <Card className="bg-midnight-light border-midnight-lighter">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-6 h-6 text-gold" />
                  <CardTitle className="text-white">Autres livrets</CardTitle>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddLivret(!showAddLivret)}
                  className="border-gold text-gold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un livret
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showAddLivret && (
                <div className="mb-4 p-4 border border-gold/30 rounded-lg bg-midnight">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <div>
                      <Label>Nom *</Label>
                      <Input
                        value={newLivret.nom}
                        onChange={(e) => setNewLivret({ ...newLivret, nom: e.target.value })}
                        placeholder="Livret B, Livret Jeune..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Montant (€) *</Label>
                      <Input
                        type="number"
                        value={newLivret.montant}
                        onChange={(e) => setNewLivret({ ...newLivret, montant: parseFloat(e.target.value) || 0 })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Taux (%) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newLivret.taux}
                        onChange={(e) => setNewLivret({ ...newLivret, taux: parseFloat(e.target.value) || 0 })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="gold" size="sm" onClick={addLivret}>Ajouter</Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowAddLivret(false)}>Annuler</Button>
                  </div>
                </div>
              )}

              <Table className="bg-[#1E293B]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gold">Type</TableHead>
                    <TableHead className="text-gold text-right">Montant</TableHead>
                    <TableHead className="text-gold text-right">Taux</TableHead>
                    <TableHead className="text-gold"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.autres_livrets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-cream/50 py-8">
                        Aucun autre livret. Cliquez sur "Ajouter un livret".
                      </TableCell>
                    </TableRow>
                  ) : (
                    formData.autres_livrets.map(livret => (
                      <TableRow key={livret.id} className="hover:bg-midnight-lighter/50">
                        <TableCell className="font-semibold text-white">{livret.nom}</TableCell>
                        <TableCell className="text-right text-white">{formatCurrency(livret.montant)}</TableCell>
                        <TableCell className="text-right text-white">{livret.taux}%</TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLivret(livret.id)}
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
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t border-midnight-lighter">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/client/bilan/successoral')}
            >
              ← Retour
            </Button>
            <Button type="submit" variant="gold" size="lg">
              Suivant : Assurance-Vie →
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
