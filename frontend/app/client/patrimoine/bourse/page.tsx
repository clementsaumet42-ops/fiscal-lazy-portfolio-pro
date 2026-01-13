'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { EnveloppeBourse, SupportBourse } from '@/lib/types/assessment'
import { formatCurrency, formatPercentage, formatDate, generateId, calculatePerformance, calculatePositionValue, isValidISIN } from '@/lib/utils/assessment/helpers'
import { TrendingUp, Plus, Trash2, Building2, BarChart3, Wallet } from 'lucide-react'

export default function EnveloppeBoursePage() {
  const router = useRouter()
  const { assessment, addEnveloppeBourse, updateEnveloppeBourse, removeEnveloppeBourse, addSupportBourse, removeSupportBourse } = useClientStore()
  
  const [selectedEnveloppe, setSelectedEnveloppe] = useState<string | null>(
    assessment.enveloppes_bourse.length > 0 ? assessment.enveloppes_bourse[0].id : null
  )
  
  const [showAddEnveloppe, setShowAddEnveloppe] = useState(false)
  const [showAddSupport, setShowAddSupport] = useState(false)
  
  // Form for new envelope
  const [newEnveloppe, setNewEnveloppe] = useState<Partial<EnveloppeBourse>>({
    type: 'PEA',
    etablissement: '',
    numero_compte: '',
    date_ouverture: new Date(),
  })
  
  // Form for new support
  const [newSupport, setNewSupport] = useState<Partial<SupportBourse>>({
    nom: '',
    isin: '',
    type: 'ETF',
    zone_geo: 'Monde',
    quantite: 0,
    pru: 0,
    valeur_actuelle: 0,
    frais_ter: 0,
    frais_courtage: 0,
    date_achat: new Date(),
  })

  const currentEnveloppe = assessment.enveloppes_bourse.find(e => e.id === selectedEnveloppe)

  const handleAddEnveloppe = () => {
    if (!newEnveloppe.etablissement || !newEnveloppe.numero_compte) return
    
    const enveloppe: EnveloppeBourse = {
      id: generateId(),
      type: newEnveloppe.type as 'PEA' | 'CTO' | 'PER',
      etablissement: newEnveloppe.etablissement,
      numero_compte: newEnveloppe.numero_compte,
      date_ouverture: newEnveloppe.date_ouverture || new Date(),
      supports: [],
      montant_total_valorise: 0,
      performance_globale_euros: 0,
      performance_globale_pct: 0,
      frais_annuels_totaux: 0,
    }
    
    addEnveloppeBourse(enveloppe)
    setSelectedEnveloppe(enveloppe.id)
    setShowAddEnveloppe(false)
    setNewEnveloppe({ type: 'PEA', etablissement: '', numero_compte: '', date_ouverture: new Date() })
  }

  const handleAddSupport = () => {
    if (!selectedEnveloppe || !newSupport.nom || !newSupport.isin) return
    
    if (!isValidISIN(newSupport.isin)) {
      alert('ISIN invalide. Format attendu: 2 lettres + 10 caractères alphanumériques')
      return
    }
    
    const quantite = newSupport.quantite || 0
    const pru = newSupport.pru || 0
    const valeur_actuelle = newSupport.valeur_actuelle || 0
    
    const valeur_totale_ligne = calculatePositionValue(quantite, valeur_actuelle)
    const { euros, percentage } = calculatePerformance(quantite * pru, valeur_totale_ligne)
    
    const support: SupportBourse = {
      id: generateId(),
      nom: newSupport.nom,
      isin: newSupport.isin.toUpperCase(),
      type: newSupport.type as 'ETF' | 'Action' | 'Obligation' | 'Fonds',
      zone_geo: newSupport.zone_geo as any,
      quantite,
      pru,
      valeur_actuelle,
      valeur_totale_ligne,
      plus_value_latente_euros: euros,
      plus_value_latente_pct: percentage,
      frais_ter: newSupport.frais_ter || 0,
      frais_courtage: newSupport.frais_courtage || 0,
      date_achat: newSupport.date_achat || new Date(),
    }
    
    addSupportBourse(selectedEnveloppe, support)
    
    // Recalculate envelope totals
    if (currentEnveloppe) {
      const updatedSupports = [...currentEnveloppe.supports, support]
      const montant_total_valorise = updatedSupports.reduce((sum, s) => sum + s.valeur_totale_ligne, 0)
      const performance_globale_euros = updatedSupports.reduce((sum, s) => sum + s.plus_value_latente_euros, 0)
      const totalInvested = updatedSupports.reduce((sum, s) => sum + (s.quantite * s.pru), 0)
      const performance_globale_pct = totalInvested > 0 ? (performance_globale_euros / totalInvested) * 100 : 0
      const frais_annuels_totaux = updatedSupports.reduce((sum, s) => sum + (s.valeur_totale_ligne * s.frais_ter / 100), 0)
      
      updateEnveloppeBourse(selectedEnveloppe, {
        montant_total_valorise,
        performance_globale_euros,
        performance_globale_pct,
        frais_annuels_totaux,
      })
    }
    
    setShowAddSupport(false)
    setNewSupport({
      nom: '',
      isin: '',
      type: 'ETF',
      zone_geo: 'Monde',
      quantite: 0,
      pru: 0,
      valeur_actuelle: 0,
      frais_ter: 0,
      frais_courtage: 0,
      date_achat: new Date(),
    })
  }

  const handleRemoveSupport = (supportId: string) => {
    if (!selectedEnveloppe || !currentEnveloppe) return
    
    removeSupportBourse(selectedEnveloppe, supportId)
    
    // Recalculate envelope totals
    const updatedSupports = currentEnveloppe.supports.filter(s => s.id !== supportId)
    const montant_total_valorise = updatedSupports.reduce((sum, s) => sum + s.valeur_totale_ligne, 0)
    const performance_globale_euros = updatedSupports.reduce((sum, s) => sum + s.plus_value_latente_euros, 0)
    const totalInvested = updatedSupports.reduce((sum, s) => sum + (s.quantite * s.pru), 0)
    const performance_globale_pct = totalInvested > 0 ? (performance_globale_euros / totalInvested) * 100 : 0
    const frais_annuels_totaux = updatedSupports.reduce((sum, s) => sum + (s.valeur_totale_ligne * s.frais_ter / 100), 0)
    
    updateEnveloppeBourse(selectedEnveloppe, {
      montant_total_valorise,
      performance_globale_euros,
      performance_globale_pct,
      frais_annuels_totaux,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📊 Enveloppes Boursières
          </h1>
          <p className="text-gray-600 text-lg">
            Étape 7/11 - PEA, CTO, PER - Suivi détaillé de vos positions
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gradient-to-br from-blue-50 to-white-lighter rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: '63%' }}></div>
          </div>
          <p className="text-gray-600 text-sm mt-2">Progression: 7 sur 11 étapes</p>
        </div>

        {/* Envelope Selector */}
        <div className="mb-6 flex gap-4 flex-wrap">
          {assessment.enveloppes_bourse.map(env => (
            <Button
              key={env.id}
              variant={selectedEnveloppe === env.id ? 'gold' : 'outline'}
              onClick={() => setSelectedEnveloppe(env.id)}
              className="flex items-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              {env.type} - {env.etablissement}
            </Button>
          ))}
          <Button
            variant="outline"
            onClick={() => setShowAddEnveloppe(!showAddEnveloppe)}
            className="border-blue-600 text-blue-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle enveloppe
          </Button>
        </div>

        {/* Add Envelope Form */}
        {showAddEnveloppe && (
          <Card className="mb-6 bg-gradient-to-br from-blue-50 to-white-light border-blue-600/30">
            <CardHeader>
              <CardTitle className="text-gray-900">Nouvelle enveloppe boursière</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Type *</Label>
                  <Select
                    value={newEnveloppe.type}
                    onChange={(e) => setNewEnveloppe({ ...newEnveloppe, type: e.target.value as any })}
                  >
                    <option value="PEA">PEA</option>
                    <option value="CTO">CTO</option>
                    <option value="PER">PER</option>
                  </Select>
                </div>
                <div>
                  <Label>Établissement *</Label>
                  <Input
                    value={newEnveloppe.etablissement}
                    onChange={(e) => setNewEnveloppe({ ...newEnveloppe, etablissement: e.target.value })}
                    placeholder="Boursorama, Fortuneo..."
                  />
                </div>
                <div>
                  <Label>Numéro de compte *</Label>
                  <Input
                    value={newEnveloppe.numero_compte}
                    onChange={(e) => setNewEnveloppe({ ...newEnveloppe, numero_compte: e.target.value })}
                    placeholder="12345678"
                  />
                </div>
                <div>
                  <Label>Date d'ouverture</Label>
                  <Input
                    type="date"
                    value={newEnveloppe.date_ouverture?.toISOString().split('T')[0]}
                    onChange={(e) => setNewEnveloppe({ ...newEnveloppe, date_ouverture: new Date(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="gold" onClick={handleAddEnveloppe}>Ajouter</Button>
                <Button variant="outline" onClick={() => setShowAddEnveloppe(false)}>Annuler</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Envelope Display */}
        {currentEnveloppe ? (
          <>
            {/* Account Header Card */}
            <Card className="mb-6 bg-gradient-to-br from-blue-50 to-white-light border-gray-200">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-gray-900 text-2xl flex items-center gap-2">
                      <Wallet className="w-6 h-6 text-blue-600" />
                      {currentEnveloppe.type} - {currentEnveloppe.etablissement}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Compte n° {currentEnveloppe.numero_compte} • Ouvert le {formatDate(currentEnveloppe.date_ouverture)}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-blue-600">
                      {formatCurrency(currentEnveloppe.montant_total_valorise)}
                    </p>
                    <p className="text-gray-600 text-sm">Valorisation totale</p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-blue-50 to-white-light border-gray-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-600/10 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Performance globale</p>
                      <p className={`text-2xl font-bold ${currentEnveloppe.performance_globale_euros >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(currentEnveloppe.performance_globale_euros)}
                      </p>
                      <p className={`text-sm ${currentEnveloppe.performance_globale_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {currentEnveloppe.performance_globale_pct >= 0 ? '+' : ''}{currentEnveloppe.performance_globale_pct.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-white-light border-gray-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-600/10 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Nombre de lignes</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {currentEnveloppe.supports.length}
                      </p>
                      <p className="text-sm text-gray-700/50">Position(s)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-white-light border-gray-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-500/10 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Frais annuels</p>
                      <p className="text-2xl font-bold text-orange-400">
                        {formatCurrency(currentEnveloppe.frais_annuels_totaux)}
                      </p>
                      <p className="text-sm text-gray-700/50">TER total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Holdings Table */}
            <Card className="mb-6 bg-gradient-to-br from-blue-50 to-white-light border-gray-200">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-gray-900">Positions</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddSupport(!showAddSupport)}
                    className="border-blue-600 text-blue-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une ligne
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showAddSupport && (
                  <div className="mb-6 p-4 border border-blue-600/30 rounded-lg bg-gradient-to-br from-blue-50 to-white">
                    <h4 className="text-gray-900 font-semibold mb-4">Nouvelle position</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label>Nom du support *</Label>
                        <Input
                          value={newSupport.nom}
                          onChange={(e) => setNewSupport({ ...newSupport, nom: e.target.value })}
                          placeholder="Amundi MSCI World"
                        />
                      </div>
                      <div>
                        <Label>Code ISIN *</Label>
                        <Input
                          value={newSupport.isin}
                          onChange={(e) => setNewSupport({ ...newSupport, isin: e.target.value.toUpperCase() })}
                          placeholder="FR0010756098"
                          className="font-mono"
                        />
                      </div>
                      <div>
                        <Label>Type *</Label>
                        <Select
                          value={newSupport.type}
                          onChange={(e) => setNewSupport({ ...newSupport, type: e.target.value as any })}
                        >
                          <option value="ETF">ETF</option>
                          <option value="Action">Action</option>
                          <option value="Obligation">Obligation</option>
                          <option value="Fonds">Fonds</option>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                      <div>
                        <Label>Zone géo</Label>
                        <Select
                          value={newSupport.zone_geo}
                          onChange={(e) => setNewSupport({ ...newSupport, zone_geo: e.target.value as any })}
                        >
                          <option value="Monde">Monde</option>
                          <option value="Europe">Europe</option>
                          <option value="USA">USA</option>
                          <option value="France">France</option>
                          <option value="Émergents">Émergents</option>
                        </Select>
                      </div>
                      <div>
                        <Label>Quantité *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={newSupport.quantite}
                          onChange={(e) => setNewSupport({ ...newSupport, quantite: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label>PRU (€) *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={newSupport.pru}
                          onChange={(e) => setNewSupport({ ...newSupport, pru: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label>Cours actuel (€) *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={newSupport.valeur_actuelle}
                          onChange={(e) => setNewSupport({ ...newSupport, valeur_actuelle: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label>TER (%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={newSupport.frais_ter}
                          onChange={(e) => setNewSupport({ ...newSupport, frais_ter: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="gold" size="sm" onClick={handleAddSupport}>Ajouter</Button>
                      <Button variant="outline" size="sm" onClick={() => setShowAddSupport(false)}>Annuler</Button>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <Table className="bg-[#1E293B]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-blue-600">Support</TableHead>
                        <TableHead className="text-blue-600">ISIN</TableHead>
                        <TableHead className="text-blue-600">Type</TableHead>
                        <TableHead className="text-blue-600 text-right">Qté</TableHead>
                        <TableHead className="text-blue-600 text-right">PRU</TableHead>
                        <TableHead className="text-blue-600 text-right">Cours</TableHead>
                        <TableHead className="text-blue-600 text-right">Valeur</TableHead>
                        <TableHead className="text-blue-600 text-right">+/- Value</TableHead>
                        <TableHead className="text-blue-600 text-right">Perf %</TableHead>
                        <TableHead className="text-blue-600 text-right">TER</TableHead>
                        <TableHead className="text-blue-600"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentEnveloppe.supports.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={11} className="text-center text-gray-700/50 py-8">
                            Aucune position. Cliquez sur "Ajouter une ligne" pour commencer.
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentEnveloppe.supports.map(support => (
                          <TableRow key={support.id} className="hover:bg-gradient-to-br from-blue-50 to-white-lighter/50">
                            <TableCell>
                              <div>
                                <p className="font-semibold text-gray-900">{support.nom}</p>
                                <p className="text-xs text-gray-700/50">{support.zone_geo}</p>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-gray-600">{support.isin}</TableCell>
                            <TableCell>
                              <Badge variant={support.type === 'ETF' ? 'default' : 'secondary'}>
                                {support.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-gray-900">{support.quantite}</TableCell>
                            <TableCell className="text-right text-gray-900">{formatCurrency(support.pru)}</TableCell>
                            <TableCell className="text-right text-gray-900">{formatCurrency(support.valeur_actuelle)}</TableCell>
                            <TableCell className="text-right font-semibold text-gray-900">
                              {formatCurrency(support.valeur_totale_ligne)}
                            </TableCell>
                            <TableCell className={`text-right font-semibold ${support.plus_value_latente_euros >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {formatCurrency(support.plus_value_latente_euros)}
                            </TableCell>
                            <TableCell className={`text-right ${support.plus_value_latente_pct >= 0 ? 'text-[#F59E0B]' : 'text-red-400'}`}>
                              {support.plus_value_latente_pct >= 0 ? '+' : ''}{support.plus_value_latente_pct.toFixed(2)}%
                            </TableCell>
                            <TableCell className="text-right text-gray-600">{support.frais_ter}%</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveSupport(support.id)}
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
          </>
        ) : (
          <Card className="bg-gradient-to-br from-blue-50 to-white-light border-gray-200">
            <CardContent className="py-12 text-center">
              <Building2 className="w-16 h-16 text-blue-600/50 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                Aucune enveloppe boursière. Cliquez sur "Nouvelle enveloppe" pour commencer.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => router.push('/client/patrimoine/assurance-vie')}
          >
            ← Retour : Assurance-Vie
          </Button>
          <Button
            variant="gold"
            size="lg"
            onClick={() => router.push('/client/patrimoine/immobilier')}
          >
            Suivant : Immobilier →
          </Button>
        </div>
      </div>
    </div>
  )
}
