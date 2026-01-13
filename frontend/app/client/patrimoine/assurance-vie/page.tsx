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
import { Badge } from '@/components/ui/badge'
import { ContratAssuranceVie, SupportUC } from '@/lib/types/assessment'
import { generateId, formatCurrency, formatDate, calculatePerformance, isValidISIN } from '@/lib/utils/assessment/helpers'
import { Shield, Plus, Trash2, TrendingUp, Wallet, PieChart } from 'lucide-react'

export default function AssuranceViePage() {
  const router = useRouter()
  const { assessment, addAssuranceVie, updateAssuranceVie, removeAssuranceVie, addSupportAV, removeSupportAV } = useClientStore()
  
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
    if (!newContrat.etablissement || !newContrat.numero_contrat) return
    
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
    if (!selectedContrat || !newSupport.nom_support || !newSupport.isin) return
    
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
      performance_pct: percentage,
      performance_euros: euros,
      frais_gestion: newSupport.frais_gestion || 0,
      date_achat: newSupport.date_achat || new Date(),
    }
    
    addSupportAV(selectedContrat, support)
    
    // Recalculate contract totals
    if (currentContrat) {
      const updatedSupports = [...currentContrat.supports_uc, support]
      const montant_unites_compte = updatedSupports.reduce((sum, s) => sum + s.valeur_actuelle, 0)
      const montant_total = currentContrat.montant_fonds_euro + montant_unites_compte
      
      updateAssuranceVie(selectedContrat, {
        montant_unites_compte,
        montant_total,
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
    if (!selectedContrat || !currentContrat) return
    
    removeSupportAV(selectedContrat, supportId)
    
    // Recalculate contract totals
    const updatedSupports = currentContrat.supports_uc.filter(s => s.id !== supportId)
    const montant_unites_compte = updatedSupports.reduce((sum, s) => sum + s.valeur_actuelle, 0)
    const montant_total = currentContrat.montant_fonds_euro + montant_unites_compte
    
    updateAssuranceVie(selectedContrat, {
      montant_unites_compte,
      montant_total,
    })
  }

  // Calculate totals across all contracts
  const totalAV = useMemo(() => {
    return assessment.assurances_vie.reduce((sum, av) => sum + av.montant_total, 0)
  }, [assessment.assurances_vie])

  const performanceGlobale = useMemo(() => {
    if (!currentContrat || currentContrat.supports_uc.length === 0) return { euros: 0, pct: 0 }
    const totalPerf = currentContrat.supports_uc.reduce((sum, s) => sum + s.performance_euros, 0)
    const totalInvesti = currentContrat.supports_uc.reduce((sum, s) => sum + s.montant_investi, 0)
    return {
      euros: totalPerf,
      pct: totalInvesti > 0 ? (totalPerf / totalInvesti) * 100 : 0
    }
  }, [currentContrat])

  const fraisTotaux = useMemo(() => {
    if (!currentContrat) return 0
    const fraisUC = currentContrat.supports_uc.reduce((sum, s) => sum + (s.valeur_actuelle * s.frais_gestion / 100), 0)
    const fraisContrat = currentContrat.montant_total * (currentContrat.frais_gestion_annuels / 100)
    return fraisUC + fraisContrat
  }, [currentContrat])

  const fiscaliteApplicable = useMemo(() => {
    if (!currentContrat) return 'Non définie'
    const age = new Date().getFullYear() - currentContrat.anteriorite_fiscale.getFullYear()
    if (age < 4) return 'Moins de 4 ans'
    if (age < 8) return '4 à 8 ans'
    return 'Plus de 8 ans (fiscalité avantageuse)'
  }, [currentContrat])

  return (
    <div className="min-h-screen bg-midnight">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🛡️ Assurance-Vie
          </h1>
          <p className="text-cream/70 text-lg">
            Étape 7/11 - Contrats et supports détaillés
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-midnight-lighter rounded-full h-2">
            <div className="bg-gold h-2 rounded-full transition-all duration-300" style={{ width: '63%' }}></div>
          </div>
          <p className="text-cream/70 text-sm mt-2">Progression: 7 sur 11 étapes</p>
        </div>

        {/* Contract Selector */}
        <div className="mb-6 flex gap-4 flex-wrap">
          {assessment.assurances_vie.map(contrat => (
            <Button
              key={contrat.id}
              variant={selectedContrat === contrat.id ? 'gold' : 'outline'}
              onClick={() => setSelectedContrat(contrat.id)}
              className="flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              {contrat.etablissement} - {contrat.numero_contrat}
            </Button>
          ))}
          <Button
            variant="outline"
            onClick={() => setShowAddContrat(!showAddContrat)}
            className="border-gold text-gold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau contrat
          </Button>
        </div>

        {/* Add Contract Form */}
        {showAddContrat && (
          <Card className="mb-6 bg-midnight-light border-gold/30">
            <CardHeader>
              <CardTitle className="text-white">Nouveau contrat d'assurance-vie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label>Établissement *</Label>
                  <Input
                    value={newContrat.etablissement}
                    onChange={(e) => setNewContrat({ ...newContrat, etablissement: e.target.value })}
                    placeholder="Linxea, Fortuneo..."
                  />
                </div>
                <div>
                  <Label>Numéro de contrat *</Label>
                  <Input
                    value={newContrat.numero_contrat}
                    onChange={(e) => setNewContrat({ ...newContrat, numero_contrat: e.target.value })}
                    placeholder="AV123456"
                  />
                </div>
                <div>
                  <Label>Date de souscription</Label>
                  <Input
                    type="date"
                    value={newContrat.date_souscription?.toISOString().split('T')[0]}
                    onChange={(e) => setNewContrat({ ...newContrat, date_souscription: new Date(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label>Montant Fonds Euro (€)</Label>
                  <Input
                    type="number"
                    value={newContrat.montant_fonds_euro}
                    onChange={(e) => setNewContrat({ ...newContrat, montant_fonds_euro: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Clause bénéficiaire</Label>
                  <Input
                    value={newContrat.clause_beneficiaire}
                    onChange={(e) => setNewContrat({ ...newContrat, clause_beneficiaire: e.target.value })}
                    placeholder="Mon conjoint, à défaut mes enfants..."
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="gold" onClick={handleAddContrat}>Ajouter</Button>
                <Button variant="outline" onClick={() => setShowAddContrat(false)}>Annuler</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Contract Display */}
        {currentContrat ? (
          <>
            {/* Contract Header Card */}
            <Card className="mb-6 bg-midnight-light border-midnight-lighter">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white text-2xl flex items-center gap-2">
                      <Shield className="w-6 h-6 text-gold" />
                      {currentContrat.etablissement}
                    </CardTitle>
                    <CardDescription className="text-cream/70">
                      Contrat n° {currentContrat.numero_contrat} • Souscrit le {formatDate(currentContrat.date_souscription)}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gold">
                      {formatCurrency(currentContrat.montant_total)}
                    </p>
                    <p className="text-cream/70 text-sm">Valorisation totale</p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-midnight-light border-midnight-lighter">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gold/10 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <p className="text-cream/70 text-sm">Performance</p>
                      <p className={`text-xl font-bold ${performanceGlobale.euros >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(performanceGlobale.euros)}
                      </p>
                      <p className={`text-xs ${performanceGlobale.pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {performanceGlobale.pct >= 0 ? '+' : ''}{performanceGlobale.pct.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-midnight-light border-midnight-lighter">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-500/10 rounded-lg">
                      <Wallet className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-cream/70 text-sm">Frais totaux</p>
                      <p className="text-xl font-bold text-orange-400">
                        {formatCurrency(fraisTotaux)}
                      </p>
                      <p className="text-xs text-cream/50">Par an</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-midnight-light border-midnight-lighter">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <PieChart className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-cream/70 text-sm">Fonds Euro</p>
                      <p className="text-xl font-bold text-blue-400">
                        {formatCurrency(currentContrat.montant_fonds_euro)}
                      </p>
                      <p className="text-xs text-cream/50">
                        {currentContrat.montant_total > 0 ? ((currentContrat.montant_fonds_euro / currentContrat.montant_total) * 100).toFixed(0) : 0}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-midnight-light border-midnight-lighter">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-500/10 rounded-lg">
                      <Shield className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-cream/70 text-sm">Fiscalité</p>
                      <p className="text-sm font-bold text-purple-400">
                        {fiscaliteApplicable}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Supports UC Table */}
            <Card className="mb-6 bg-midnight-light border-midnight-lighter">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">Supports Unités de Compte</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddSupport(!showAddSupport)}
                    className="border-gold text-gold"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un support
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showAddSupport && (
                  <div className="mb-6 p-4 border border-gold/30 rounded-lg bg-midnight">
                    <h4 className="text-white font-semibold mb-4">Nouveau support UC</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label>Nom du support *</Label>
                        <Input
                          value={newSupport.nom_support}
                          onChange={(e) => setNewSupport({ ...newSupport, nom_support: e.target.value })}
                          placeholder="Carmignac Patrimoine"
                        />
                      </div>
                      <div>
                        <Label>Code ISIN *</Label>
                        <Input
                          value={newSupport.isin}
                          onChange={(e) => setNewSupport({ ...newSupport, isin: e.target.value.toUpperCase() })}
                          placeholder="FR0010135103"
                          className="font-mono"
                        />
                      </div>
                      <div>
                        <Label>Catégorie *</Label>
                        <Select
                          value={newSupport.categorie}
                          onChange={(e) => setNewSupport({ ...newSupport, categorie: e.target.value as any })}
                        >
                          <option value="Actions">Actions</option>
                          <option value="Obligations">Obligations</option>
                          <option value="Immobilier">Immobilier</option>
                          <option value="Monétaire">Monétaire</option>
                          <option value="Diversifié">Diversifié</option>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <Label>Montant investi (€) *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={newSupport.montant_investi}
                          onChange={(e) => setNewSupport({ ...newSupport, montant_investi: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label>Valeur actuelle (€) *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={newSupport.valeur_actuelle}
                          onChange={(e) => setNewSupport({ ...newSupport, valeur_actuelle: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label>Frais gestion (%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={newSupport.frais_gestion}
                          onChange={(e) => setNewSupport({ ...newSupport, frais_gestion: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label>Date d'achat</Label>
                        <Input
                          type="date"
                          value={newSupport.date_achat instanceof Date ? newSupport.date_achat.toISOString().split('T')[0] : ''}
                          onChange={(e) => setNewSupport({ ...newSupport, date_achat: new Date(e.target.value) })}
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
                        <TableHead className="text-gold">Support</TableHead>
                        <TableHead className="text-gold">ISIN</TableHead>
                        <TableHead className="text-gold">Catégorie</TableHead>
                        <TableHead className="text-gold text-right">Investi</TableHead>
                        <TableHead className="text-gold text-right">Valeur</TableHead>
                        <TableHead className="text-gold text-right">+/- Value</TableHead>
                        <TableHead className="text-gold text-right">Perf %</TableHead>
                        <TableHead className="text-gold text-right">Frais</TableHead>
                        <TableHead className="text-gold"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentContrat.supports_uc.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center text-cream/50 py-8">
                            Aucun support UC. Cliquez sur "Ajouter un support" pour commencer.
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentContrat.supports_uc.map(support => (
                          <TableRow key={support.id} className="hover:bg-midnight-lighter/50">
                            <TableCell>
                              <div>
                                <p className="font-semibold text-white">{support.nom_support}</p>
                                <p className="text-xs text-cream/50">{formatDate(support.date_achat)}</p>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-cream/70">{support.isin}</TableCell>
                            <TableCell>
                              <Badge variant={support.categorie === 'Actions' ? 'default' : 'secondary'}>
                                {support.categorie}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-white">{formatCurrency(support.montant_investi)}</TableCell>
                            <TableCell className="text-right font-semibold text-white">{formatCurrency(support.valeur_actuelle)}</TableCell>
                            <TableCell className={`text-right font-semibold ${support.performance_euros >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {formatCurrency(support.performance_euros)}
                            </TableCell>
                            <TableCell className={`text-right ${support.performance_pct >= 0 ? 'text-gold' : 'text-red-400'}`}>
                              {support.performance_pct >= 0 ? '+' : ''}{support.performance_pct.toFixed(2)}%
                            </TableCell>
                            <TableCell className="text-right text-cream/70">{support.frais_gestion}%</TableCell>
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
          <Card className="bg-midnight-light border-midnight-lighter">
            <CardContent className="py-12 text-center">
              <Shield className="w-16 h-16 text-gold/50 mx-auto mb-4" />
              <p className="text-cream/70 text-lg">
                Aucun contrat d'assurance-vie. Cliquez sur "Nouveau contrat" pour commencer.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => router.push('/client/patrimoine/liquidites')}
          >
            ← Retour : Liquidités
          </Button>
          <Button
            variant="gold"
            size="lg"
            onClick={() => router.push('/client/patrimoine/bourse')}
          >
            Suivant : Bourse →
          </Button>
        </div>
      </div>
    </div>
  )
}
