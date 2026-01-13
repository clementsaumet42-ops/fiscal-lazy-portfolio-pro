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
import { ContratAssuranceVie, SupportUC } from '@/lib/types/assessment'
import { formatCurrency, formatPercentage, formatDate, generateId, calculatePerformance, isValidISIN } from '@/lib/utils/assessment/helpers'
import { Shield, Plus, Trash2, Eye, Building2, TrendingUp, DollarSign } from 'lucide-react'

export default function AssuranceViePage() {
  const router = useRouter()
  const { 
    assessment, 
    addAssuranceVie, 
    updateAssuranceVie, 
    removeAssuranceVie, 
    addSupportAV, 
    removeSupportAV 
  } = useClientStore()
  
  const [selectedContrat, setSelectedContrat] = useState<string | null>(
    assessment.assurances_vie.length > 0 ? assessment.assurances_vie[0].id : null
  )
  
  const [showAddContrat, setShowAddContrat] = useState(false)
  const [showAddSupport, setShowAddSupport] = useState(false)
  
  // Form for new contract
  const [newContrat, setNewContrat] = useState<Partial<ContratAssuranceVie>>({
    etablissement: '',
    numero_contrat: '',
    date_souscription: new Date(),
    montant_fonds_euro: 0,
    montant_unites_compte: 0,
    frais_entree: 0,
    frais_gestion_annuels: 0,
    frais_arbitrage: 0,
    anteriorite_fiscale: new Date(),
    versements_avant_70_ans: 0,
    versements_apres_70_ans: 0,
    clause_beneficiaire: '',
  })
  
  // Form for new support
  const [newSupport, setNewSupport] = useState<Partial<SupportUC>>({
    nom_support: '',
    isin: '',
    categorie: 'Actions',
    montant_investi: 0,
    valeur_actuelle: 0,
    frais_gestion: 0,
    date_achat: new Date(),
  })

  const currentContrat = assessment.assurances_vie.find(c => c.id === selectedContrat)

  const handleAddContrat = () => {
    if (!newContrat.etablissement || !newContrat.numero_contrat) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }
    
    const montant_total = (newContrat.montant_fonds_euro || 0) + (newContrat.montant_unites_compte || 0)
    
    const contrat: ContratAssuranceVie = {
      id: generateId(),
      etablissement: newContrat.etablissement,
      numero_contrat: newContrat.numero_contrat,
      date_souscription: newContrat.date_souscription || new Date(),
      montant_fonds_euro: newContrat.montant_fonds_euro || 0,
      montant_unites_compte: newContrat.montant_unites_compte || 0,
      montant_total,
      supports_uc: [],
      frais_entree: newContrat.frais_entree || 0,
      frais_gestion_annuels: newContrat.frais_gestion_annuels || 0,
      frais_arbitrage: newContrat.frais_arbitrage || 0,
      anteriorite_fiscale: newContrat.anteriorite_fiscale || new Date(),
      versements_avant_70_ans: newContrat.versements_avant_70_ans || 0,
      versements_apres_70_ans: newContrat.versements_apres_70_ans || 0,
      clause_beneficiaire: newContrat.clause_beneficiaire || '',
    }
    
    addAssuranceVie(contrat)
    setSelectedContrat(contrat.id)
    setShowAddContrat(false)
    setNewContrat({
      etablissement: '',
      numero_contrat: '',
      date_souscription: new Date(),
      montant_fonds_euro: 0,
      montant_unites_compte: 0,
      frais_entree: 0,
      frais_gestion_annuels: 0,
      frais_arbitrage: 0,
      anteriorite_fiscale: new Date(),
      versements_avant_70_ans: 0,
      versements_apres_70_ans: 0,
      clause_beneficiaire: '',
    })
  }

  const handleAddSupport = () => {
    if (!selectedContrat || !newSupport.nom_support || !newSupport.isin) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }
    
    if (!isValidISIN(newSupport.isin)) {
      alert('ISIN invalide. Format attendu: 2 lettres + 10 caractères alphanumériques')
      return
    }
    
    const montant_investi = newSupport.montant_investi || 0
    const valeur_actuelle = newSupport.valeur_actuelle || 0
    const { euros, percentage } = calculatePerformance(montant_investi, valeur_actuelle)
    
    const support: SupportUC = {
      id: generateId(),
      nom_support: newSupport.nom_support,
      isin: newSupport.isin.toUpperCase(),
      categorie: newSupport.categorie as any,
      montant_investi,
      valeur_actuelle,
      performance_euros: euros,
      performance_pct: percentage,
      frais_gestion: newSupport.frais_gestion || 0,
      date_achat: newSupport.date_achat || new Date(),
    }
    
    addSupportAV(selectedContrat, support)
    
    // Update contract totals
    if (currentContrat) {
      const totalUC = currentContrat.supports_uc.reduce((sum, s) => sum + s.valeur_actuelle, 0) + valeur_actuelle
      const montant_total = currentContrat.montant_fonds_euro + totalUC
      updateAssuranceVie(selectedContrat, {
        montant_unites_compte: totalUC,
        montant_total
      })
    }
    
    setShowAddSupport(false)
    setNewSupport({
      nom_support: '',
      isin: '',
      categorie: 'Actions',
      montant_investi: 0,
      valeur_actuelle: 0,
      frais_gestion: 0,
      date_achat: new Date(),
    })
  }

  const handleRemoveSupport = (supportId: string) => {
    if (!selectedContrat) return
    removeSupportAV(selectedContrat, supportId)
    
    // Recalculate contract totals
    if (currentContrat) {
      const totalUC = currentContrat.supports_uc
        .filter(s => s.id !== supportId)
        .reduce((sum, s) => sum + s.valeur_actuelle, 0)
      const montant_total = currentContrat.montant_fonds_euro + totalUC
      updateAssuranceVie(selectedContrat, {
        montant_unites_compte: totalUC,
        montant_total
      })
    }
  }

  // Calculate summary metrics
  const totalValorisation = assessment.assurances_vie.reduce((sum, c) => sum + c.montant_total, 0)
  const totalPerformance = assessment.assurances_vie.reduce((sum, c) => {
    return sum + c.supports_uc.reduce((s, sup) => s + sup.performance_euros, 0)
  }, 0)
  const totalFrais = assessment.assurances_vie.reduce((sum, c) => {
    return sum + (c.montant_total * c.frais_gestion_annuels / 100)
  }, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🛡️ Assurance-Vie
          </h1>
          <p className="text-gray-600 text-lg">
            Étape 6/11 - Détail de vos contrats d'assurance-vie
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gradient-to-br from-blue-50 to-white-lighter rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: '54%' }}></div>
          </div>
          <p className="text-gray-600 text-sm mt-2">Progression: 6 sur 11 étapes</p>
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
                <DollarSign className="w-10 h-10 text-blue-600/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-white-light border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Performance Globale</p>
                  <p className={`text-2xl font-bold ${totalPerformance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(totalPerformance)}
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-gray-700/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-white-light border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Frais Annuels</p>
                  <p className="text-2xl font-bold text-gray-700">{formatCurrency(totalFrais)}</p>
                </div>
                <Shield className="w-10 h-10 text-gray-700/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contracts List */}
        <Card className="bg-gradient-to-br from-blue-50 to-white-light border-gray-200 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-blue-600" />
                <CardTitle className="text-gray-900">Contrats d'Assurance-Vie ({assessment.assurances_vie.length})</CardTitle>
              </div>
              <Button
                onClick={() => setShowAddContrat(!showAddContrat)}
                variant="outline"
                size="sm"
                className="bg-gradient-to-br from-blue-50 to-white-lighter border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-midnight"
              >
                <Plus className="w-4 h-4 mr-1" />
                Nouveau contrat
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Add Contract Form */}
            {showAddContrat && (
              <Card className="mb-4 bg-gradient-to-br from-blue-50 to-white border-gray-200">
                <CardContent className="pt-4">
                  <h4 className="font-semibold text-gray-900 mb-4">Nouveau Contrat</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-700">Établissement *</Label>
                      <Input
                        value={newContrat.etablissement}
                        onChange={(e) => setNewContrat(prev => ({ ...prev, etablissement: e.target.value }))}
                        className="mt-1 bg-gradient-to-br from-blue-50 to-white-light border-gray-200 text-gray-900"
                        placeholder="Ex: AXA, Boursorama"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700">Numéro de contrat *</Label>
                      <Input
                        value={newContrat.numero_contrat}
                        onChange={(e) => setNewContrat(prev => ({ ...prev, numero_contrat: e.target.value }))}
                        className="mt-1 bg-gradient-to-br from-blue-50 to-white-light border-gray-200 text-gray-900"
                        placeholder="Ex: 123456789"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700">Date de souscription</Label>
                      <Input
                        type="date"
                        value={newContrat.date_souscription instanceof Date ? newContrat.date_souscription.toISOString().split('T')[0] : ''}
                        onChange={(e) => setNewContrat(prev => ({ ...prev, date_souscription: new Date(e.target.value) }))}
                        className="mt-1 bg-gradient-to-br from-blue-50 to-white-light border-gray-200 text-gray-900"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700">Montant fonds euro (€)</Label>
                      <Input
                        type="number"
                        value={newContrat.montant_fonds_euro}
                        onChange={(e) => setNewContrat(prev => ({ ...prev, montant_fonds_euro: parseFloat(e.target.value) || 0 }))}
                        className="mt-1 bg-gradient-to-br from-blue-50 to-white-light border-gray-200 text-gray-900"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700">Frais de gestion annuels (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newContrat.frais_gestion_annuels}
                        onChange={(e) => setNewContrat(prev => ({ ...prev, frais_gestion_annuels: parseFloat(e.target.value) || 0 }))}
                        className="mt-1 bg-gradient-to-br from-blue-50 to-white-light border-gray-200 text-gray-900"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddContrat(false)}
                      className="bg-gradient-to-br from-blue-50 to-white-lighter border-gray-200 text-gray-700"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="button"
                      onClick={handleAddContrat}
                      className="bg-blue-600 text-midnight hover:bg-blue-600/90"
                    >
                      Créer le contrat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contracts List */}
            {assessment.assurances_vie.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assessment.assurances_vie.map((contrat) => (
                  <Card 
                    key={contrat.id} 
                    className={`cursor-pointer transition-all ${
                      selectedContrat === contrat.id 
                        ? 'bg-blue-600/20 border-blue-600' 
                        : 'bg-gradient-to-br from-blue-50 to-white border-gray-200 hover:border-blue-600/50'
                    }`}
                    onClick={() => setSelectedContrat(contrat.id)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{contrat.etablissement}</h4>
                          <p className="text-sm text-gray-600 font-mono">{contrat.numero_contrat}</p>
                          <p className="text-xs text-gray-700/50 mt-1">Souscrit le {formatDate(contrat.date_souscription)}</p>
                          <div className="mt-3">
                            <p className="text-lg font-bold text-blue-600">{formatCurrency(contrat.montant_total)}</p>
                            <p className="text-xs text-gray-600">
                              Fonds euro: {formatCurrency(contrat.montant_fonds_euro)} | 
                              UC: {formatCurrency(contrat.montant_unites_compte)}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {selectedContrat === contrat.id && (
                            <Badge className="bg-blue-600 text-midnight">Sélectionné</Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeAssuranceVie(contrat.id)
                              if (selectedContrat === contrat.id) {
                                setSelectedContrat(assessment.assurances_vie[0]?.id || null)
                              }
                            }}
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
              <p className="text-gray-700/50 text-center py-8">Aucun contrat d'assurance-vie ajouté</p>
            )}
          </CardContent>
        </Card>

        {/* UC Supports Details */}
        {currentContrat && (
          <Card className="bg-gradient-to-br from-blue-50 to-white-light border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-6 h-6 text-blue-600" />
                  <CardTitle className="text-gray-900">
                    Supports UC - {currentContrat.etablissement} ({currentContrat.supports_uc.length})
                  </CardTitle>
                </div>
                <Button
                  onClick={() => setShowAddSupport(!showAddSupport)}
                  variant="outline"
                  size="sm"
                  className="bg-gradient-to-br from-blue-50 to-white-lighter border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-midnight"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter support
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Add Support Form */}
              {showAddSupport && (
                <Card className="mb-4 bg-gradient-to-br from-blue-50 to-white border-gray-200">
                  <CardContent className="pt-4">
                    <h4 className="font-semibold text-gray-900 mb-4">Nouveau Support UC</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-gray-700">Nom du support *</Label>
                        <Input
                          value={newSupport.nom_support}
                          onChange={(e) => setNewSupport(prev => ({ ...prev, nom_support: e.target.value }))}
                          className="mt-1 bg-gradient-to-br from-blue-50 to-white-light border-gray-200 text-gray-900"
                          placeholder="Ex: Amundi MSCI World"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-700">ISIN *</Label>
                        <Input
                          value={newSupport.isin}
                          onChange={(e) => setNewSupport(prev => ({ ...prev, isin: e.target.value.toUpperCase() }))}
                          className="mt-1 bg-gradient-to-br from-blue-50 to-white-light border-gray-200 text-gray-900 font-mono"
                          placeholder="FR0000000000"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-700">Catégorie</Label>
                        <Select
                          value={newSupport.categorie}
                          onChange={(e) => setNewSupport(prev => ({ ...prev, categorie: e.target.value as any }))}
                          className="mt-1 bg-gradient-to-br from-blue-50 to-white-light border-gray-200 text-gray-900"
                        >
                          <option value="Actions">Actions</option>
                          <option value="Obligations">Obligations</option>
                          <option value="Immobilier">Immobilier</option>
                          <option value="Monétaire">Monétaire</option>
                          <option value="Diversifié">Diversifié</option>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-gray-700">Montant investi (€)</Label>
                        <Input
                          type="number"
                          value={newSupport.montant_investi}
                          onChange={(e) => setNewSupport(prev => ({ ...prev, montant_investi: parseFloat(e.target.value) || 0 }))}
                          className="mt-1 bg-gradient-to-br from-blue-50 to-white-light border-gray-200 text-gray-900"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-700">Valeur actuelle (€)</Label>
                        <Input
                          type="number"
                          value={newSupport.valeur_actuelle}
                          onChange={(e) => setNewSupport(prev => ({ ...prev, valeur_actuelle: parseFloat(e.target.value) || 0 }))}
                          className="mt-1 bg-gradient-to-br from-blue-50 to-white-light border-gray-200 text-gray-900"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-700">Frais de gestion (%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={newSupport.frais_gestion}
                          onChange={(e) => setNewSupport(prev => ({ ...prev, frais_gestion: parseFloat(e.target.value) || 0 }))}
                          className="mt-1 bg-gradient-to-br from-blue-50 to-white-light border-gray-200 text-gray-900"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddSupport(false)}
                        className="bg-gradient-to-br from-blue-50 to-white-lighter border-gray-200 text-gray-700"
                      >
                        Annuler
                      </Button>
                      <Button
                        type="button"
                        onClick={handleAddSupport}
                        className="bg-blue-600 text-midnight hover:bg-blue-600/90"
                      >
                        Ajouter le support
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* UC Supports Table */}
              {currentContrat.supports_uc.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200">
                        <TableHead className="text-gray-700">Support</TableHead>
                        <TableHead className="text-gray-700">ISIN</TableHead>
                        <TableHead className="text-gray-700">Catégorie</TableHead>
                        <TableHead className="text-gray-700 text-right">Montant investi</TableHead>
                        <TableHead className="text-gray-700 text-right">Valeur actuelle</TableHead>
                        <TableHead className="text-gray-700 text-right">Perf (€)</TableHead>
                        <TableHead className="text-gray-700 text-right">Perf (%)</TableHead>
                        <TableHead className="text-gray-700 text-right">Frais</TableHead>
                        <TableHead className="text-gray-700 text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentContrat.supports_uc.map((support) => (
                        <TableRow key={support.id} className="border-gray-200 hover:bg-gradient-to-br from-blue-50 to-white-lighter/30">
                          <TableCell className="text-gray-900 font-medium">{support.nom_support}</TableCell>
                          <TableCell className="text-gray-600 font-mono text-sm">{support.isin}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-gray-700 border-cream/30">
                              {support.categorie}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-900 text-right">{formatCurrency(support.montant_investi)}</TableCell>
                          <TableCell className="text-gray-900 text-right">{formatCurrency(support.valeur_actuelle)}</TableCell>
                          <TableCell className={`text-right font-semibold ${support.performance_euros >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatCurrency(support.performance_euros)}
                          </TableCell>
                          <TableCell className={`text-right font-semibold ${support.performance_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatPercentage(support.performance_pct)}
                          </TableCell>
                          <TableCell className="text-gray-600 text-right">{formatPercentage(support.frais_gestion)}</TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveSupport(support.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-gray-700/50 text-center py-8">Aucun support UC ajouté pour ce contrat</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={() => router.push('/client/patrimoine/liquidites')}
            className="bg-gradient-to-br from-blue-50 to-white-lighter border-gray-200 text-gray-700 hover:bg-gradient-to-br from-blue-50 to-white hover:text-gray-900"
          >
            ← Précédent
          </Button>
          <Button
            onClick={() => router.push('/client/patrimoine/bourse')}
            className="bg-blue-600 text-midnight hover:bg-blue-600/90 font-semibold"
          >
            Suivant →
          </Button>
        </div>
      </div>
    </div>
  )
}
