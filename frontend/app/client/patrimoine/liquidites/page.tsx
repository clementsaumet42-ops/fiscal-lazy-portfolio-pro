'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Liquidites, CompteCourant, AutreLivret } from '@/lib/types/assessment'
import { liquiditesSchema } from '@/lib/validation/bilan-schemas'
import { formatCurrency, generateId } from '@/lib/utils/assessment/helpers'
import { Wallet, Plus, Trash2, PiggyBank } from 'lucide-react'

export default function LiquiditesPage() {
  const router = useRouter()
  const { assessment, setLiquidites } = useClientStore()
  
  const [formData, setFormData] = useState<Liquidites>(
    assessment.liquidites || {
      comptes_courants: [],
      livret_a: { montant: 0, taux: 3 },
      ldds: { montant: 0, taux: 3 },
      lep: null,
      autres_livrets: [],
    }
  )

  const [showAddCompte, setShowAddCompte] = useState(false)
  const [newCompte, setNewCompte] = useState<Partial<CompteCourant>>({
    banque: '',
    montant: 0,
  })

  const [showAddLivret, setShowAddLivret] = useState(false)
  const [newLivret, setNewLivret] = useState<Partial<AutreLivret>>({
    nom: '',
    montant: 0,
    taux: 0,
  })

  const [hasLEP, setHasLEP] = useState(formData.lep !== null)

  const handleChange = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev }
      const keys = field.split('.')
      
      if (keys.length === 1) {
        updated[keys[0] as keyof Liquidites] = value
      } else if (keys.length === 2) {
        (updated[keys[0] as keyof Liquidites] as any)[keys[1]] = value
      }
      
      return updated
    })
  }

  const handleAddCompte = () => {
    if (!newCompte.banque) {
      alert('Le nom de la banque est requis')
      return
    }

    const compte: CompteCourant = {
      id: generateId(),
      banque: newCompte.banque,
      montant: newCompte.montant || 0,
    }

    setFormData(prev => ({
      ...prev,
      comptes_courants: [...prev.comptes_courants, compte],
    }))

    setShowAddCompte(false)
    setNewCompte({ banque: '', montant: 0 })
  }

  const handleRemoveCompte = (compteId: string) => {
    setFormData(prev => ({
      ...prev,
      comptes_courants: prev.comptes_courants.filter(c => c.id !== compteId),
    }))
  }

  const handleAddLivret = () => {
    if (!newLivret.nom) {
      alert('Le nom du livret est requis')
      return
    }

    const livret: AutreLivret = {
      id: generateId(),
      nom: newLivret.nom,
      montant: newLivret.montant || 0,
      taux: newLivret.taux || 0,
    }

    setFormData(prev => ({
      ...prev,
      autres_livrets: [...prev.autres_livrets, livret],
    }))

    setShowAddLivret(false)
    setNewLivret({ nom: '', montant: 0, taux: 0 })
  }

  const handleRemoveLivret = (livretId: string) => {
    setFormData(prev => ({
      ...prev,
      autres_livrets: prev.autres_livrets.filter(l => l.id !== livretId),
    }))
  }

  const handleLEPToggle = (enabled: boolean) => {
    setHasLEP(enabled)
    if (enabled) {
      setFormData(prev => ({
        ...prev,
        lep: { montant: 0, taux: 6 },
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        lep: null,
      }))
    }
  }

  const totalLiquidites = useMemo(() => {
    const comptesTotal = formData.comptes_courants.reduce((sum, c) => sum + c.montant, 0)
    const livretA = formData.livret_a.montant
    const ldds = formData.ldds.montant
    const lep = formData.lep?.montant || 0
    const autresTotal = formData.autres_livrets.reduce((sum, l) => sum + l.montant, 0)
    
    return comptesTotal + livretA + ldds + lep + autresTotal
  }, [formData])

  const handleNext = () => {
    const result = liquiditesSchema.safeParse(formData)
    
    if (!result.success) {
      alert('Veuillez corriger les erreurs dans le formulaire')
      return
    }
    
    setLiquidites(formData)
    router.push('/client/patrimoine/assurance-vie')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[#FFFBEB]/70 text-sm">Étape 5 sur 11</p>
          <h1 className="text-3xl font-bold text-white mt-2">
            💵 Liquidités
          </h1>
          <p className="text-[#FFFBEB]/60 mt-2">
            Comptes courants, livrets et épargne disponible
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-[#1E293B] rounded-full h-2">
            <div className="bg-[#F59E0B] h-2 rounded-full transition-all duration-300" style={{ width: '45%' }}></div>
          </div>
        </div>

        {/* Comptes Courants */}
        <Card className="bg-[#1E293B] border-[#334155] mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#F59E0B]" />
                <CardTitle className="text-white">Comptes courants</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddCompte(true)}
                className="border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B]/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un compte
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showAddCompte && (
              <div className="mb-6 p-4 border border-[#F59E0B]/30 rounded-lg bg-[#0F172A]">
                <h4 className="text-white font-semibold mb-4">Nouveau compte</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="text-[#FFFBEB]">Banque *</Label>
                    <Input
                      value={newCompte.banque}
                      onChange={(e) => setNewCompte({ ...newCompte, banque: e.target.value })}
                      placeholder="BNP Paribas, Crédit Mutuel..."
                      className="mt-1 bg-[#1E293B] border-[#334155] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#FFFBEB]">Montant (€)</Label>
                    <Input
                      type="number"
                      value={newCompte.montant}
                      onChange={(e) => setNewCompte({ ...newCompte, montant: parseFloat(e.target.value) || 0 })}
                      className="mt-1 bg-[#1E293B] border-[#334155] text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-[#F59E0B] text-[#0F172A] hover:bg-[#D97706]"
                    onClick={handleAddCompte}
                  >
                    Ajouter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddCompte(false)}
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
                    <TableHead className="text-[#F59E0B]">Banque</TableHead>
                    <TableHead className="text-[#F59E0B] text-right">Montant</TableHead>
                    <TableHead className="text-[#F59E0B]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.comptes_courants.length === 0 ? (
                    <TableRow className="border-[#334155]">
                      <TableCell colSpan={3} className="text-center text-[#FFFBEB]/50 py-8">
                        Aucun compte. Cliquez sur "Ajouter un compte" pour commencer.
                      </TableCell>
                    </TableRow>
                  ) : (
                    formData.comptes_courants.map(compte => (
                      <TableRow key={compte.id} className="border-[#334155] hover:bg-[#0F172A]/50">
                        <TableCell className="text-white">{compte.banque}</TableCell>
                        <TableCell className="text-right text-white font-semibold">{formatCurrency(compte.montant)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCompte(compte.id)}
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

        {/* Livrets Réglementés */}
        <Card className="bg-[#1E293B] border-[#334155] mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-[#F59E0B]" />
              <CardTitle className="text-white">Livrets réglementés</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-[#FFFBEB]">Livret A - Montant (€)</Label>
                <Input
                  type="number"
                  value={formData.livret_a.montant}
                  onChange={(e) => handleChange('livret_a.montant', parseFloat(e.target.value) || 0)}
                  className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                />
                <p className="text-[#FFFBEB]/50 text-xs mt-1">Taux: 3%</p>
              </div>
              <div>
                <Label className="text-[#FFFBEB]">LDDS - Montant (€)</Label>
                <Input
                  type="number"
                  value={formData.ldds.montant}
                  onChange={(e) => handleChange('ldds.montant', parseFloat(e.target.value) || 0)}
                  className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                />
                <p className="text-[#FFFBEB]/50 text-xs mt-1">Taux: 3%</p>
              </div>
            </div>

            <div className="border-t border-[#334155] pt-4">
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  checked={hasLEP}
                  onChange={(e) => handleLEPToggle(e.target.checked)}
                  className="w-4 h-4 text-[#F59E0B] focus:ring-[#F59E0B]"
                />
                <Label className="text-[#FFFBEB]">J'ai un LEP (Livret d'Épargne Populaire)</Label>
              </div>
              {hasLEP && (
                <div>
                  <Label className="text-[#FFFBEB]">LEP - Montant (€)</Label>
                  <Input
                    type="number"
                    value={formData.lep?.montant || 0}
                    onChange={(e) => handleChange('lep.montant', parseFloat(e.target.value) || 0)}
                    className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                  />
                  <p className="text-[#FFFBEB]/50 text-xs mt-1">Taux: 6%</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Autres Livrets */}
        <Card className="bg-[#1E293B] border-[#334155] mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Autres livrets</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddLivret(true)}
                className="border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B]/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un livret
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showAddLivret && (
              <div className="mb-6 p-4 border border-[#F59E0B]/30 rounded-lg bg-[#0F172A]">
                <h4 className="text-white font-semibold mb-4">Nouveau livret</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label className="text-[#FFFBEB]">Nom *</Label>
                    <Input
                      value={newLivret.nom}
                      onChange={(e) => setNewLivret({ ...newLivret, nom: e.target.value })}
                      placeholder="Livret Jeune, CEL..."
                      className="mt-1 bg-[#1E293B] border-[#334155] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#FFFBEB]">Montant (€)</Label>
                    <Input
                      type="number"
                      value={newLivret.montant}
                      onChange={(e) => setNewLivret({ ...newLivret, montant: parseFloat(e.target.value) || 0 })}
                      className="mt-1 bg-[#1E293B] border-[#334155] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#FFFBEB]">Taux (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newLivret.taux}
                      onChange={(e) => setNewLivret({ ...newLivret, taux: parseFloat(e.target.value) || 0 })}
                      className="mt-1 bg-[#1E293B] border-[#334155] text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-[#F59E0B] text-[#0F172A] hover:bg-[#D97706]"
                    onClick={handleAddLivret}
                  >
                    Ajouter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddLivret(false)}
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
                    <TableHead className="text-[#F59E0B]">Nom</TableHead>
                    <TableHead className="text-[#F59E0B] text-right">Montant</TableHead>
                    <TableHead className="text-[#F59E0B] text-right">Taux</TableHead>
                    <TableHead className="text-[#F59E0B]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.autres_livrets.length === 0 ? (
                    <TableRow className="border-[#334155]">
                      <TableCell colSpan={4} className="text-center text-[#FFFBEB]/50 py-8">
                        Aucun autre livret.
                      </TableCell>
                    </TableRow>
                  ) : (
                    formData.autres_livrets.map(livret => (
                      <TableRow key={livret.id} className="border-[#334155] hover:bg-[#0F172A]/50">
                        <TableCell className="text-white">{livret.nom}</TableCell>
                        <TableCell className="text-right text-white font-semibold">{formatCurrency(livret.montant)}</TableCell>
                        <TableCell className="text-right text-[#FFFBEB]/70">{livret.taux}%</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveLivret(livret.id)}
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

        {/* Summary Card */}
        <Card className="bg-gradient-to-r from-[#F59E0B]/20 to-[#F59E0B]/5 border-[#F59E0B]/50 mb-6">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-[#FFFBEB]/70 text-sm mb-2">Total Liquidités</p>
              <p className="text-5xl font-bold text-[#F59E0B]">
                {formatCurrency(totalLiquidites)}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div>
                  <p className="text-xs text-[#FFFBEB]/50">Comptes courants</p>
                  <p className="text-lg font-semibold text-white">
                    {formatCurrency(formData.comptes_courants.reduce((sum, c) => sum + c.montant, 0))}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#FFFBEB]/50">Livret A + LDDS</p>
                  <p className="text-lg font-semibold text-white">
                    {formatCurrency(formData.livret_a.montant + formData.ldds.montant)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#FFFBEB]/50">LEP</p>
                  <p className="text-lg font-semibold text-white">
                    {formatCurrency(formData.lep?.montant || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#FFFBEB]/50">Autres livrets</p>
                  <p className="text-lg font-semibold text-white">
                    {formatCurrency(formData.autres_livrets.reduce((sum, l) => sum + l.montant, 0))}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => router.push('/client/bilan/successoral')}
            className="border-[#334155] text-[#FFFBEB]"
          >
            ← Bilan successoral
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
