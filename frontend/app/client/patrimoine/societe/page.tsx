'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SocieteIS } from '@/lib/types/assessment'
import { formatCurrency, formatDate, generateId } from '@/lib/utils/assessment/helpers'
import { Building2, Plus, Trash2, Info } from 'lucide-react'

export default function SocietePage() {
  const router = useRouter()
  const { assessment, addSocieteIS, updateSocieteIS, removeSocieteIS } = useClientStore()
  
  const [showAddSociete, setShowAddSociete] = useState(false)
  const [newSociete, setNewSociete] = useState<Partial<SocieteIS>>({
    raison_sociale: '',
    forme_juridique: 'SARL',
    pourcentage_detention: 0,
    valeur_titres: 0,
    dividendes_annuels: 0,
    date_creation: new Date(),
  })

  const handleAddSociete = () => {
    if (!newSociete.raison_sociale) {
      alert('La raison sociale est requise')
      return
    }

    const societe: SocieteIS = {
      id: generateId(),
      raison_sociale: newSociete.raison_sociale,
      forme_juridique: newSociete.forme_juridique as any,
      pourcentage_detention: newSociete.pourcentage_detention || 0,
      valeur_titres: newSociete.valeur_titres || 0,
      dividendes_annuels: newSociete.dividendes_annuels || 0,
      date_creation: newSociete.date_creation || new Date(),
    }

    addSocieteIS(societe)
    setShowAddSociete(false)
    setNewSociete({
      raison_sociale: '',
      forme_juridique: 'SARL',
      pourcentage_detention: 0,
      valeur_titres: 0,
      dividendes_annuels: 0,
      date_creation: new Date(),
    })
  }

  const totals = useMemo(() => {
    const totalValeur = assessment.societes_is.reduce((sum, s) => sum + s.valeur_titres, 0)
    const totalDividendes = assessment.societes_is.reduce((sum, s) => sum + s.dividendes_annuels, 0)
    return { totalValeur, totalDividendes }
  }, [assessment.societes_is])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-6">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-[#FFFBEB]/70 text-sm">Étape 8 sur 11</p>
          <h1 className="text-3xl font-bold text-white mt-2">🏢 Sociétés IS</h1>
          <p className="text-[#FFFBEB]/60 mt-2">Participations dans des sociétés soumises à l'IS</p>
        </div>

        <div className="mb-8">
          <div className="w-full bg-[#1E293B] rounded-full h-2">
            <div className="bg-[#F59E0B] h-2 rounded-full transition-all duration-300" style={{ width: '72%' }}></div>
          </div>
        </div>

        {/* Add Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setShowAddSociete(true)}
            className="border-[#F59E0B] text-[#F59E0B]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une société
          </Button>
        </div>

        {/* Add Form */}
        {showAddSociete && (
          <Card className="mb-6 bg-[#1E293B] border-[#F59E0B]/30">
            <CardHeader>
              <CardTitle className="text-white">Nouvelle société</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-[#FFFBEB]">Raison sociale *</Label>
                  <Input
                    value={newSociete.raison_sociale}
                    onChange={(e) => setNewSociete({ ...newSociete, raison_sociale: e.target.value })}
                    placeholder="Ma Société SAS"
                    className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                  />
                </div>
                <div>
                  <Label className="text-[#FFFBEB]">Forme juridique</Label>
                  <Select
                    value={newSociete.forme_juridique}
                    onChange={(e) => setNewSociete({ ...newSociete, forme_juridique: e.target.value as any })}
                    className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                  >
                    <option value="SARL">SARL</option>
                    <option value="SAS">SAS</option>
                    <option value="SA">SA</option>
                    <option value="SCI IS">SCI IS</option>
                  </Select>
                </div>
                <div>
                  <Label className="text-[#FFFBEB]">Pourcentage de détention (%)</Label>
                  <Input
                    type="number"
                    max="100"
                    value={newSociete.pourcentage_detention}
                    onChange={(e) => setNewSociete({ ...newSociete, pourcentage_detention: Math.min(100, parseFloat(e.target.value) || 0) })}
                    className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                  />
                </div>
                <div>
                  <Label className="text-[#FFFBEB]">Valeur des titres (€)</Label>
                  <Input
                    type="number"
                    value={newSociete.valeur_titres}
                    onChange={(e) => setNewSociete({ ...newSociete, valeur_titres: parseFloat(e.target.value) || 0 })}
                    className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                  />
                </div>
                <div>
                  <Label className="text-[#FFFBEB]">Dividendes annuels perçus (€)</Label>
                  <Input
                    type="number"
                    value={newSociete.dividendes_annuels}
                    onChange={(e) => setNewSociete({ ...newSociete, dividendes_annuels: parseFloat(e.target.value) || 0 })}
                    className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                  />
                </div>
                <div>
                  <Label className="text-[#FFFBEB]">Date de création</Label>
                  <Input
                    type="date"
                    value={newSociete.date_creation?.toISOString().split('T')[0]}
                    onChange={(e) => setNewSociete({ ...newSociete, date_creation: new Date(e.target.value) })}
                    className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="bg-[#F59E0B] text-[#0F172A]" onClick={handleAddSociete}>Ajouter</Button>
                <Button variant="outline" onClick={() => setShowAddSociete(false)} className="border-[#334155] text-white">Annuler</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Valuation Help */}
        <Card className="mb-6 bg-blue-500/10 border-blue-500/30">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[#FFFBEB] font-semibold mb-1">Évaluation des titres</p>
                <p className="text-[#FFFBEB]/70 text-sm">
                  La valeur des titres peut être estimée selon plusieurs méthodes: valeur comptable (actif net), multiple de l'EBITDA, 
                  actualisation des flux de trésorerie, ou valorisation par comparables. Consultez un expert-comptable pour une évaluation précise.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sociétés List */}
        <Card className="mb-6 bg-[#1E293B] border-[#334155]">
          <CardHeader>
            <CardTitle className="text-white">Liste des participations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#334155]">
                    <TableHead className="text-[#F59E0B]">Raison sociale</TableHead>
                    <TableHead className="text-[#F59E0B]">Forme</TableHead>
                    <TableHead className="text-[#F59E0B] text-right">Détention</TableHead>
                    <TableHead className="text-[#F59E0B] text-right">Valeur titres</TableHead>
                    <TableHead className="text-[#F59E0B] text-right">Dividendes/an</TableHead>
                    <TableHead className="text-[#F59E0B]">Création</TableHead>
                    <TableHead className="text-[#F59E0B]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assessment.societes_is.length === 0 ? (
                    <TableRow className="border-[#334155]">
                      <TableCell colSpan={7} className="text-center text-[#FFFBEB]/50 py-8">
                        Aucune société. Cliquez sur "Ajouter une société" pour commencer.
                      </TableCell>
                    </TableRow>
                  ) : (
                    assessment.societes_is.map(societe => (
                      <TableRow key={societe.id} className="border-[#334155] hover:bg-[#0F172A]/50">
                        <TableCell className="text-white font-semibold">{societe.raison_sociale}</TableCell>
                        <TableCell className="text-[#FFFBEB]/70">{societe.forme_juridique}</TableCell>
                        <TableCell className="text-right text-white">{societe.pourcentage_detention}%</TableCell>
                        <TableCell className="text-right font-semibold text-white">{formatCurrency(societe.valeur_titres)}</TableCell>
                        <TableCell className="text-right text-green-400 font-semibold">{formatCurrency(societe.dividendes_annuels)}</TableCell>
                        <TableCell className="text-[#FFFBEB]/70">{formatDate(societe.date_creation)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSocieteIS(societe.id)}
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

        {/* Summary */}
        <Card className="bg-gradient-to-r from-[#F59E0B]/20 to-[#F59E0B]/5 border-[#F59E0B]/50 mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-[#FFFBEB]/70">Total valeur des participations</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(totals.totalValeur)}</p>
              </div>
              <div>
                <p className="text-sm text-[#FFFBEB]/70">Total dividendes annuels</p>
                <p className="text-3xl font-bold text-[#F59E0B]">{formatCurrency(totals.totalDividendes)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => router.push('/client/patrimoine/immobilier')}
            className="border-[#334155] text-white"
          >
            ← Immobilier
          </Button>
          <Button
            className="bg-[#F59E0B] text-[#0F172A] hover:bg-[#D97706]"
            onClick={() => router.push('/client/patrimoine/autres')}
          >
            Suivant →
          </Button>
        </div>
      </div>
    </div>
  )
}
