'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SocieteIS } from '@/lib/types/assessment'
import { generateId, formatCurrency, formatDate } from '@/lib/utils/assessment/helpers'
import { Building2, Plus, Trash2, TrendingUp, Briefcase } from 'lucide-react'

export default function SocietesISPage() {
  const router = useRouter()
  const { assessment, addSocieteIS, removeSocieteIS } = useClientStore()
  
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
    if (!newSociete.raison_sociale) return
    
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

  // Calculate totals
  const nombreSocietes = useMemo(() => {
    return assessment.societes_is.length
  }, [assessment.societes_is])

  const valorisationTotale = useMemo(() => {
    return assessment.societes_is.reduce((sum, s) => sum + s.valeur_titres, 0)
  }, [assessment.societes_is])

  const dividendesTotaux = useMemo(() => {
    return assessment.societes_is.reduce((sum, s) => sum + s.dividendes_annuels, 0)
  }, [assessment.societes_is])

  const rendementMoyen = useMemo(() => {
    return valorisationTotale > 0 ? (dividendesTotaux / valorisationTotale) * 100 : 0
  }, [valorisationTotale, dividendesTotaux])

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-midnight-light border-midnight-lighter">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gold/10 rounded-lg">
                  <Building2 className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <p className="text-cream/70 text-sm">Nombre de sociétés</p>
                  <p className="text-3xl font-bold text-gold">
                    {nombreSocietes}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-midnight-light border-midnight-lighter">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Briefcase className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-cream/70 text-sm">Valorisation totale</p>
                  <p className="text-3xl font-bold text-blue-400">
                    {formatCurrency(valorisationTotale)}
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
                  <p className="text-cream/70 text-sm">Dividendes annuels</p>
                  <p className="text-3xl font-bold text-green-400">
                    {formatCurrency(dividendesTotaux)}
                  </p>
                  <p className="text-xs text-cream/50">
                    Rendement: {rendementMoyen.toFixed(2)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sociétés IS */}
        <Card className="bg-midnight-light border-midnight-lighter mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-gold" />
                <CardTitle className="text-white">Vos sociétés</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddSociete(!showAddSociete)}
                className="border-gold text-gold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une société
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showAddSociete && (
              <div className="mb-6 p-4 border border-gold/30 rounded-lg bg-midnight space-y-4">
                <h4 className="text-white font-semibold">Nouvelle société</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Raison sociale *</Label>
                    <Input
                      value={newSociete.raison_sociale}
                      onChange={(e) => setNewSociete({ ...newSociete, raison_sociale: e.target.value })}
                      placeholder="Ma Société SAS"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Forme juridique *</Label>
                    <Select
                      value={newSociete.forme_juridique}
                      onChange={(e) => setNewSociete({ ...newSociete, forme_juridique: e.target.value as any })}
                      className="mt-1"
                    >
                      <option value="SARL">SARL</option>
                      <option value="SAS">SAS</option>
                      <option value="SA">SA</option>
                      <option value="SCI IS">SCI IS</option>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Pourcentage de détention (%) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newSociete.pourcentage_detention}
                      onChange={(e) => setNewSociete({ ...newSociete, pourcentage_detention: parseFloat(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Valeur des titres (€) *</Label>
                    <Input
                      type="number"
                      value={newSociete.valeur_titres}
                      onChange={(e) => setNewSociete({ ...newSociete, valeur_titres: parseFloat(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Dividendes annuels (€)</Label>
                    <Input
                      type="number"
                      value={newSociete.dividendes_annuels}
                      onChange={(e) => setNewSociete({ ...newSociete, dividendes_annuels: parseFloat(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Date de création</Label>
                    <Input
                      type="date"
                      value={newSociete.date_creation instanceof Date 
                        ? newSociete.date_creation.toISOString().split('T')[0] 
                        : newSociete.date_creation}
                      onChange={(e) => setNewSociete({ ...newSociete, date_creation: new Date(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="gold" size="sm" onClick={handleAddSociete}>Ajouter</Button>
                  <Button variant="outline" size="sm" onClick={() => setShowAddSociete(false)}>Annuler</Button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <Table className="bg-[#1E293B]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gold">Raison sociale</TableHead>
                    <TableHead className="text-gold">Forme</TableHead>
                    <TableHead className="text-gold text-right">Détention</TableHead>
                    <TableHead className="text-gold text-right">Valeur titres</TableHead>
                    <TableHead className="text-gold text-right">Dividendes/an</TableHead>
                    <TableHead className="text-gold text-right">Rendement</TableHead>
                    <TableHead className="text-gold">Création</TableHead>
                    <TableHead className="text-gold"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assessment.societes_is.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-cream/50 py-8">
                        Aucune société. Cliquez sur "Ajouter une société".
                      </TableCell>
                    </TableRow>
                  ) : (
                    assessment.societes_is.map(societe => {
                      const rendement = societe.valeur_titres > 0 ? (societe.dividendes_annuels / societe.valeur_titres) * 100 : 0
                      
                      return (
                        <TableRow key={societe.id} className="hover:bg-midnight-lighter/50">
                          <TableCell className="text-white font-semibold">{societe.raison_sociale}</TableCell>
                          <TableCell className="text-white">{societe.forme_juridique}</TableCell>
                          <TableCell className="text-right text-white">{societe.pourcentage_detention}%</TableCell>
                          <TableCell className="text-right text-white">{formatCurrency(societe.valeur_titres)}</TableCell>
                          <TableCell className="text-right text-green-400">
                            {societe.dividendes_annuels > 0 ? formatCurrency(societe.dividendes_annuels) : '-'}
                          </TableCell>
                          <TableCell className="text-right text-gold">
                            {societe.dividendes_annuels > 0 ? `${rendement.toFixed(2)}%` : '-'}
                          </TableCell>
                          <TableCell className="text-white text-sm">{formatDate(societe.date_creation)}</TableCell>
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
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Info box */}
        <div className="mb-6 p-4 bg-midnight-light border border-gold/20 rounded-lg">
          <p className="text-cream/70 text-sm">
            💡 <strong className="text-gold">Note :</strong> Les sociétés soumises à l'IS (Impôt sur les Sociétés) constituent souvent une part importante du patrimoine des entrepreneurs et chefs d'entreprise. La valorisation et les dividendes sont des éléments clés pour l'optimisation fiscale et patrimoniale.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => router.push('/client/patrimoine/immobilier')}
          >
            ← Retour : Immobilier
          </Button>
          <Button
            variant="gold"
            size="lg"
            onClick={() => router.push('/client/patrimoine/autres')}
          >
            Suivant : Autres actifs →
          </Button>
        </div>
      </div>
    </div>
  )
}
