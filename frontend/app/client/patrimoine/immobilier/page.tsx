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
import { BienImmobilier, PretImmobilier, RevenuLocatif, SCPI } from '@/lib/types/assessment'
import { generateId, formatCurrency } from '@/lib/utils/assessment/helpers'
import { Home, Plus, Trash2, TrendingUp, Building2 } from 'lucide-react'

export default function ImmobilierPage() {
  const router = useRouter()
  const { assessment, addBienImmobilier, removeBienImmobilier } = useClientStore()
  
  const [showAddBien, setShowAddBien] = useState(false)
  const [newBien, setNewBien] = useState({
    type: 'Résidence principale' as BienImmobilier['type'],
    adresse: '',
    valeur_venale: 0,
    hasPret: false,
    capital_restant_du: 0,
    mensualite: 0,
    taux: 0,
    hasRevenuLocatif: false,
    loyer_mensuel: 0,
    charges_mensuelles: 0,
    taxe_fonciere_annuelle: 0,
    // SCPI specific
    nom_scpi: '',
    nombre_parts: 0,
    valeur_part: 0,
    rendement_annuel: 0,
  })

  const handleAddBien = () => {
    if (!newBien.adresse && newBien.type !== 'SCPI') return
    
    const pret: PretImmobilier | null = newBien.hasPret ? {
      existe: true,
      capital_restant_du: newBien.capital_restant_du,
      mensualite: newBien.mensualite,
      taux: newBien.taux,
    } : null

    const revenus_locatifs: RevenuLocatif | undefined = newBien.hasRevenuLocatif ? {
      loyer_mensuel: newBien.loyer_mensuel,
      charges_mensuelles: newBien.charges_mensuelles,
      taxe_fonciere_annuelle: newBien.taxe_fonciere_annuelle,
      revenus_nets_annuels: (newBien.loyer_mensuel - newBien.charges_mensuelles) * 12 - newBien.taxe_fonciere_annuelle,
    } : undefined

    const scpi: SCPI | undefined = newBien.type === 'SCPI' ? {
      nom_scpi: newBien.nom_scpi,
      nombre_parts: newBien.nombre_parts,
      valeur_part: newBien.valeur_part,
      rendement_annuel: newBien.rendement_annuel,
    } : undefined

    const bien: BienImmobilier = {
      id: generateId(),
      type: newBien.type,
      adresse: newBien.type === 'SCPI' ? newBien.nom_scpi : newBien.adresse,
      valeur_venale: newBien.type === 'SCPI' ? newBien.nombre_parts * newBien.valeur_part : newBien.valeur_venale,
      pret,
      revenus_locatifs,
      scpi,
    }

    addBienImmobilier(bien)
    setShowAddBien(false)
    setNewBien({
      type: 'Résidence principale',
      adresse: '',
      valeur_venale: 0,
      hasPret: false,
      capital_restant_du: 0,
      mensualite: 0,
      taux: 0,
      hasRevenuLocatif: false,
      loyer_mensuel: 0,
      charges_mensuelles: 0,
      taxe_fonciere_annuelle: 0,
      nom_scpi: '',
      nombre_parts: 0,
      valeur_part: 0,
      rendement_annuel: 0,
    })
  }

  // Calculate totals
  const totalImmobilier = useMemo(() => {
    return assessment.biens_immobiliers.reduce((sum, b) => sum + b.valeur_venale, 0)
  }, [assessment.biens_immobiliers])

  const revenusLocatifs = useMemo(() => {
    return assessment.biens_immobiliers.reduce((sum, b) => {
      if (b.revenus_locatifs) {
        return sum + b.revenus_locatifs.revenus_nets_annuels
      }
      if (b.scpi) {
        return sum + b.scpi.rendement_annuel
      }
      return sum
    }, 0)
  }, [assessment.biens_immobiliers])

  const rendementMoyen = useMemo(() => {
    return totalImmobilier > 0 ? (revenusLocatifs / totalImmobilier) * 100 : 0
  }, [totalImmobilier, revenusLocatifs])

  const totalDettes = useMemo(() => {
    return assessment.biens_immobiliers.reduce((sum, b) => sum + (b.pret?.capital_restant_du || 0), 0)
  }, [assessment.biens_immobiliers])

  const getBienTypeIcon = (type: BienImmobilier['type']) => {
    switch (type) {
      case 'Résidence principale': return '🏠'
      case 'Résidence secondaire': return '🏡'
      case 'Locatif': return '🏢'
      case 'SCI': return '🏗️'
      case 'SCPI': return '📊'
      default: return '🏠'
    }
  }

  return (
    <div className="min-h-screen bg-midnight">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🏠 Immobilier
          </h1>
          <p className="text-cream/70 text-lg">
            Étape 8/11 - Résidences, biens locatifs et SCPI
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-midnight-lighter rounded-full h-2">
            <div className="bg-gold h-2 rounded-full transition-all duration-300" style={{ width: '72%' }}></div>
          </div>
          <p className="text-cream/70 text-sm mt-2">Progression: 8 sur 11 étapes</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-midnight-light border-midnight-lighter">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gold/10 rounded-lg">
                  <Home className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <p className="text-cream/70 text-sm">Total immobilier</p>
                  <p className="text-2xl font-bold text-gold">
                    {formatCurrency(totalImmobilier)}
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
                  <p className="text-cream/70 text-sm">Revenus annuels</p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(revenusLocatifs)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-midnight-light border-midnight-lighter">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-cream/70 text-sm">Rendement moyen</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {rendementMoyen.toFixed(2)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-midnight-light border-midnight-lighter">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <Building2 className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-cream/70 text-sm">Dettes immobilières</p>
                  <p className="text-2xl font-bold text-red-400">
                    {formatCurrency(totalDettes)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Biens immobiliers */}
        <Card className="bg-midnight-light border-midnight-lighter mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Home className="w-6 h-6 text-gold" />
                <CardTitle className="text-white">Biens immobiliers</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddBien(!showAddBien)}
                className="border-gold text-gold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un bien
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showAddBien && (
              <div className="mb-6 p-4 border border-gold/30 rounded-lg bg-midnight space-y-4">
                <h4 className="text-white font-semibold">Nouveau bien immobilier</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Type de bien *</Label>
                    <Select
                      value={newBien.type}
                      onChange={(e) => setNewBien({ ...newBien, type: e.target.value as any })}
                      className="mt-1"
                    >
                      <option value="Résidence principale">Résidence principale</option>
                      <option value="Résidence secondaire">Résidence secondaire</option>
                      <option value="Locatif">Bien locatif</option>
                      <option value="SCI">SCI</option>
                      <option value="SCPI">SCPI</option>
                    </Select>
                  </div>
                  
                  {newBien.type !== 'SCPI' ? (
                    <>
                      <div>
                        <Label>Adresse *</Label>
                        <Input
                          value={newBien.adresse}
                          onChange={(e) => setNewBien({ ...newBien, adresse: e.target.value })}
                          placeholder="123 rue de la Paix, Paris"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Valeur vénale (€) *</Label>
                        <Input
                          type="number"
                          value={newBien.valeur_venale}
                          onChange={(e) => setNewBien({ ...newBien, valeur_venale: parseFloat(e.target.value) || 0 })}
                          className="mt-1"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label>Nom SCPI *</Label>
                        <Input
                          value={newBien.nom_scpi}
                          onChange={(e) => setNewBien({ ...newBien, nom_scpi: e.target.value })}
                          placeholder="Corum Origin"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Nombre de parts *</Label>
                        <Input
                          type="number"
                          value={newBien.nombre_parts}
                          onChange={(e) => setNewBien({ ...newBien, nombre_parts: parseFloat(e.target.value) || 0 })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Prix par part (€) *</Label>
                        <Input
                          type="number"
                          value={newBien.valeur_part}
                          onChange={(e) => setNewBien({ ...newBien, valeur_part: parseFloat(e.target.value) || 0 })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Rendement annuel (€)</Label>
                        <Input
                          type="number"
                          value={newBien.rendement_annuel}
                          onChange={(e) => setNewBien({ ...newBien, rendement_annuel: parseFloat(e.target.value) || 0 })}
                          className="mt-1"
                        />
                      </div>
                    </>
                  )}
                </div>

                {newBien.type !== 'SCPI' && (
                  <>
                    {/* Prêt */}
                    <div className="pt-2">
                      <Label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newBien.hasPret}
                          onChange={(e) => setNewBien({ ...newBien, hasPret: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <span>Ce bien a un prêt en cours</span>
                      </Label>
                    </div>

                    {newBien.hasPret && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
                        <div>
                          <Label>Capital restant dû (€)</Label>
                          <Input
                            type="number"
                            value={newBien.capital_restant_du}
                            onChange={(e) => setNewBien({ ...newBien, capital_restant_du: parseFloat(e.target.value) || 0 })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Mensualité (€)</Label>
                          <Input
                            type="number"
                            value={newBien.mensualite}
                            onChange={(e) => setNewBien({ ...newBien, mensualite: parseFloat(e.target.value) || 0 })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Taux (%)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={newBien.taux}
                            onChange={(e) => setNewBien({ ...newBien, taux: parseFloat(e.target.value) || 0 })}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    )}

                    {/* Revenus locatifs */}
                    <div className="pt-2">
                      <Label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newBien.hasRevenuLocatif}
                          onChange={(e) => setNewBien({ ...newBien, hasRevenuLocatif: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <span>Ce bien génère des revenus locatifs</span>
                      </Label>
                    </div>

                    {newBien.hasRevenuLocatif && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
                        <div>
                          <Label>Loyer mensuel (€)</Label>
                          <Input
                            type="number"
                            value={newBien.loyer_mensuel}
                            onChange={(e) => setNewBien({ ...newBien, loyer_mensuel: parseFloat(e.target.value) || 0 })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Charges mensuelles (€)</Label>
                          <Input
                            type="number"
                            value={newBien.charges_mensuelles}
                            onChange={(e) => setNewBien({ ...newBien, charges_mensuelles: parseFloat(e.target.value) || 0 })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Taxe foncière annuelle (€)</Label>
                          <Input
                            type="number"
                            value={newBien.taxe_fonciere_annuelle}
                            onChange={(e) => setNewBien({ ...newBien, taxe_fonciere_annuelle: parseFloat(e.target.value) || 0 })}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="gold" size="sm" onClick={handleAddBien}>Ajouter</Button>
                  <Button variant="outline" size="sm" onClick={() => setShowAddBien(false)}>Annuler</Button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <Table className="bg-[#1E293B]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gold">Type</TableHead>
                    <TableHead className="text-gold">Adresse / Nom</TableHead>
                    <TableHead className="text-gold text-right">Valeur</TableHead>
                    <TableHead className="text-gold text-right">Dette</TableHead>
                    <TableHead className="text-gold text-right">Revenus/an</TableHead>
                    <TableHead className="text-gold text-right">Rendement</TableHead>
                    <TableHead className="text-gold"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assessment.biens_immobiliers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-cream/50 py-8">
                        Aucun bien immobilier. Cliquez sur "Ajouter un bien".
                      </TableCell>
                    </TableRow>
                  ) : (
                    assessment.biens_immobiliers.map(bien => {
                      const revenus = bien.revenus_locatifs?.revenus_nets_annuels || bien.scpi?.rendement_annuel || 0
                      const rendement = bien.valeur_venale > 0 ? (revenus / bien.valeur_venale) * 100 : 0
                      
                      return (
                        <TableRow key={bien.id} className="hover:bg-midnight-lighter/50">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{getBienTypeIcon(bien.type)}</span>
                              <span className="text-white text-sm">{bien.type}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-white font-semibold">{bien.adresse}</TableCell>
                          <TableCell className="text-right text-white">{formatCurrency(bien.valeur_venale)}</TableCell>
                          <TableCell className="text-right text-red-400">
                            {bien.pret?.capital_restant_du ? formatCurrency(bien.pret.capital_restant_du) : '-'}
                          </TableCell>
                          <TableCell className="text-right text-green-400">
                            {revenus > 0 ? formatCurrency(revenus) : '-'}
                          </TableCell>
                          <TableCell className="text-right text-gold">
                            {revenus > 0 ? `${rendement.toFixed(2)}%` : '-'}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeBienImmobilier(bien.id)}
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

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => router.push('/client/patrimoine/bourse')}
          >
            ← Retour : Bourse
          </Button>
          <Button
            variant="gold"
            size="lg"
            onClick={() => router.push('/client/patrimoine/societes-is')}
          >
            Suivant : Sociétés IS →
          </Button>
        </div>
      </div>
    </div>
  )
}
