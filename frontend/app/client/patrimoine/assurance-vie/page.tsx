'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ContratAssuranceVie, SupportUC } from '@/lib/types/assessment'
import { formatCurrency, formatPercentage, formatDate, generateId, calculatePerformance, isValidISIN } from '@/lib/utils/assessment/helpers'
import { Shield, Plus, Trash2, Building2, TrendingUp } from 'lucide-react'

export default function AssuranceViePage() {
  const router = useRouter()
  const { assessment, addAssuranceVie, updateAssuranceVie, removeAssuranceVie, addSupportAV, removeSupportAV } = useClientStore()
  
  const [selectedContrat, setSelectedContrat] = useState<string | null>(
    assessment.assurances_vie.length > 0 ? assessment.assurances_vie[0].id : null
  )
  
  const [showAddContrat, setShowAddContrat] = useState(false)
  const [showAddSupport, setShowAddSupport] = useState(false)
  
  const [newContrat, setNewContrat] = useState<Partial<ContratAssuranceVie>>({
    etablissement: '',
    numero_contrat: '',
    date_souscription: new Date(),
    montant_fonds_euro: 0,
    frais_entree: 0,
    frais_gestion_annuels: 0,
    frais_arbitrage: 0,
    anteriorite_fiscale: new Date(),
    versements_avant_70_ans: 0,
    versements_apres_70_ans: 0,
    clause_beneficiaire: '',
  })
  
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
    
    const contrat: ContratAssuranceVie = {
      id: generateId(),
      etablissement: newContrat.etablissement,
      numero_contrat: newContrat.numero_contrat,
      date_souscription: newContrat.date_souscription || new Date(),
      montant_fonds_euro: newContrat.montant_fonds_euro || 0,
      montant_unites_compte: 0,
      montant_total: newContrat.montant_fonds_euro || 0,
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
      alert('ISIN invalide')
      return
    }
    
    const { euros, percentage } = calculatePerformance(
      newSupport.montant_investi || 0,
      newSupport.valeur_actuelle || 0
    )
    
    const support: SupportUC = {
      id: generateId(),
      nom_support: newSupport.nom_support,
      isin: newSupport.isin.toUpperCase(),
      categorie: newSupport.categorie as any,
      montant_investi: newSupport.montant_investi || 0,
      valeur_actuelle: newSupport.valeur_actuelle || 0,
      performance_euros: euros,
      performance_pct: percentage,
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

  const contractMetrics = useMemo(() => {
    if (!currentContrat) return null
    
    const totalInvested = currentContrat.montant_fonds_euro + 
      currentContrat.supports_uc.reduce((sum, s) => sum + s.montant_investi, 0)
    const totalCurrent = currentContrat.montant_total
    const performanceEuros = totalCurrent - totalInvested
    const performancePct = totalInvested > 0 ? (performanceEuros / totalInvested) * 100 : 0
    const fraisAnnuels = currentContrat.montant_total * (currentContrat.frais_gestion_annuels / 100)
    
    // Calculate 8-year status
    const today = new Date()
    const anteriorite = new Date(currentContrat.anteriorite_fiscale)
    const yearsOld = (today.getTime() - anteriorite.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    let fiscalStatus = '< 4 ans'
    let fiscalStatusColor = 'bg-orange-500'
    if (yearsOld >= 8) {
      fiscalStatus = '> 8 ans'
      fiscalStatusColor = 'bg-green-500'
    } else if (yearsOld >= 4) {
      fiscalStatus = '4-8 ans'
      fiscalStatusColor = 'bg-yellow-500'
    }
    
    const ucPercentage = totalCurrent > 0 ? (currentContrat.montant_unites_compte / totalCurrent) * 100 : 0
    const euroPercentage = totalCurrent > 0 ? (currentContrat.montant_fonds_euro / totalCurrent) * 100 : 0
    
    return {
      totalInvested,
      performanceEuros,
      performancePct,
      fraisAnnuels,
      fiscalStatus,
      fiscalStatusColor,
      ucPercentage,
      euroPercentage,
    }
  }, [currentContrat])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[#FFFBEB]/70 text-sm">Étape 6 sur 11</p>
          <h1 className="text-3xl font-bold text-white mt-2">
            🛡️ Assurance-Vie
          </h1>
          <p className="text-[#FFFBEB]/60 mt-2">
            Contrats d'assurance-vie avec détail des supports
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-[#1E293B] rounded-full h-2">
            <div className="bg-[#F59E0B] h-2 rounded-full transition-all duration-300" style={{ width: '54%' }}></div>
          </div>
        </div>

        {/* Contract Selector */}
        <div className="mb-6 flex gap-4 flex-wrap">
          {assessment.assurances_vie.map(contrat => (
            <Button
              key={contrat.id}
              variant={selectedContrat === contrat.id ? 'default' : 'outline'}
              onClick={() => setSelectedContrat(contrat.id)}
              className={selectedContrat === contrat.id ? 'bg-[#F59E0B] text-[#0F172A]' : 'border-[#334155] text-white'}
            >
              <Shield className="w-4 h-4 mr-2" />
              {contrat.etablissement}
            </Button>
          ))}
          <Button
            variant="outline"
            onClick={() => setShowAddContrat(!showAddContrat)}
            className="border-[#F59E0B] text-[#F59E0B]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau contrat
          </Button>
        </div>

        {/* Add Contract Form */}
        {showAddContrat && (
          <Card className="mb-6 bg-[#1E293B] border-[#F59E0B]/30">
            <CardHeader>
              <CardTitle className="text-white">Nouveau contrat d'assurance-vie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label className="text-[#FFFBEB]">Établissement *</Label>
                  <Input
                    value={newContrat.etablissement}
                    onChange={(e) => setNewContrat({ ...newContrat, etablissement: e.target.value })}
                    placeholder="AXA, Generali..."
                    className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                  />
                </div>
                <div>
                  <Label className="text-[#FFFBEB]">N° de contrat *</Label>
                  <Input
                    value={newContrat.numero_contrat}
                    onChange={(e) => setNewContrat({ ...newContrat, numero_contrat: e.target.value })}
                    className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                  />
                </div>
                <div>
                  <Label className="text-[#FFFBEB]">Date de souscription</Label>
                  <Input
                    type="date"
                    value={newContrat.date_souscription?.toISOString().split('T')[0]}
                    onChange={(e) => setNewContrat({ ...newContrat, date_souscription: new Date(e.target.value) })}
                    className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="bg-[#F59E0B] text-[#0F172A]" onClick={handleAddContrat}>Ajouter</Button>
                <Button variant="outline" onClick={() => setShowAddContrat(false)} className="border-[#334155] text-white">Annuler</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Contract Display */}
        {currentContrat ? (
          <>
            {/* Contract Header */}
            <Card className="mb-6 bg-[#1E293B] border-[#334155]">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white text-2xl flex items-center gap-2">
                      <Shield className="w-6 h-6 text-[#F59E0B]" />
                      {currentContrat.etablissement}
                    </CardTitle>
                    <p className="text-[#FFFBEB]/70 mt-1">
                      Contrat n° {currentContrat.numero_contrat} • Souscrit le {formatDate(currentContrat.date_souscription)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-[#F59E0B]">
                      {formatCurrency(currentContrat.montant_total)}
                    </p>
                    <p className="text-[#FFFBEB]/70 text-sm">Valorisation totale</p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-[#1E293B] border-[#334155]">
                <CardContent className="pt-6">
                  <p className="text-[#FFFBEB]/70 text-sm">Performance globale</p>
                  <p className={`text-2xl font-bold ${contractMetrics && contractMetrics.performanceEuros >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {contractMetrics && formatCurrency(contractMetrics.performanceEuros)}
                  </p>
                  <p className={`text-sm ${contractMetrics && contractMetrics.performancePct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {contractMetrics && (contractMetrics.performancePct >= 0 ? '+' : '')}{contractMetrics?.performancePct.toFixed(2)}%
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#1E293B] border-[#334155]">
                <CardContent className="pt-6">
                  <p className="text-[#FFFBEB]/70 text-sm">Frais annuels</p>
                  <p className="text-2xl font-bold text-orange-400">
                    {contractMetrics && formatCurrency(contractMetrics.fraisAnnuels)}
                  </p>
                  <p className="text-sm text-[#FFFBEB]/50">{currentContrat.frais_gestion_annuels}%</p>
                </CardContent>
              </Card>

              <Card className="bg-[#1E293B] border-[#334155]">
                <CardContent className="pt-6">
                  <p className="text-[#FFFBEB]/70 text-sm">Statut fiscal</p>
                  <Badge className={`${contractMetrics?.fiscalStatusColor} text-white mt-2`}>
                    {contractMetrics?.fiscalStatus}
                  </Badge>
                  <p className="text-xs text-[#FFFBEB]/50 mt-1">Antériorité: {formatDate(currentContrat.anteriorite_fiscale)}</p>
                </CardContent>
              </Card>

              <Card className="bg-[#1E293B] border-[#334155]">
                <CardContent className="pt-6">
                  <p className="text-[#FFFBEB]/70 text-sm">Répartition</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-white">Fonds €</span>
                      <span className="text-[#F59E0B] font-semibold">{contractMetrics?.euroPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white">UC</span>
                      <span className="text-[#F59E0B] font-semibold">{contractMetrics?.ucPercentage.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Fonds Euro Section */}
            <Card className="mb-6 bg-[#1E293B] border-[#334155]">
              <CardHeader>
                <CardTitle className="text-white">Fonds Euro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#FFFBEB]">Montant fonds € (€)</Label>
                    <Input
                      type="number"
                      value={currentContrat.montant_fonds_euro}
                      onChange={(e) => {
                        const newValue = parseFloat(e.target.value) || 0
                        updateAssuranceVie(currentContrat.id, {
                          montant_fonds_euro: newValue,
                          montant_total: newValue + currentContrat.montant_unites_compte,
                        })
                      }}
                      className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="p-4 bg-[#F59E0B]/10 rounded-lg border border-[#F59E0B]/30 w-full">
                      <p className="text-sm text-[#FFFBEB]/70">Valeur fonds euro</p>
                      <p className="text-2xl font-bold text-[#F59E0B]">
                        {formatCurrency(currentContrat.montant_fonds_euro)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* UC Section */}
            <Card className="mb-6 bg-[#1E293B] border-[#334155]">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">Unités de Compte (UC)</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddSupport(!showAddSupport)}
                    className="border-[#F59E0B] text-[#F59E0B]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un support UC
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showAddSupport && (
                  <div className="mb-6 p-4 border border-[#F59E0B]/30 rounded-lg bg-[#0F172A]">
                    <h4 className="text-white font-semibold mb-4">Nouveau support UC</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label className="text-[#FFFBEB]">Support *</Label>
                        <Input
                          value={newSupport.nom_support}
                          onChange={(e) => setNewSupport({ ...newSupport, nom_support: e.target.value })}
                          placeholder="Carmignac Patrimoine..."
                          className="mt-1 bg-[#1E293B] border-[#334155] text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-[#FFFBEB]">ISIN *</Label>
                        <Input
                          value={newSupport.isin}
                          onChange={(e) => setNewSupport({ ...newSupport, isin: e.target.value.toUpperCase() })}
                          placeholder="FR0010135103"
                          className="mt-1 bg-[#1E293B] border-[#334155] text-white font-mono"
                        />
                      </div>
                      <div>
                        <Label className="text-[#FFFBEB]">Catégorie</Label>
                        <Select
                          value={newSupport.categorie}
                          onChange={(e) => setNewSupport({ ...newSupport, categorie: e.target.value as any })}
                          className="mt-1 bg-[#1E293B] border-[#334155] text-white"
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
                        <Label className="text-[#FFFBEB]">Montant investi (€)</Label>
                        <Input
                          type="number"
                          value={newSupport.montant_investi}
                          onChange={(e) => setNewSupport({ ...newSupport, montant_investi: parseFloat(e.target.value) || 0 })}
                          className="mt-1 bg-[#1E293B] border-[#334155] text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-[#FFFBEB]">Valeur actuelle (€)</Label>
                        <Input
                          type="number"
                          value={newSupport.valeur_actuelle}
                          onChange={(e) => setNewSupport({ ...newSupport, valeur_actuelle: parseFloat(e.target.value) || 0 })}
                          className="mt-1 bg-[#1E293B] border-[#334155] text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-[#FFFBEB]">Frais gestion (%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={newSupport.frais_gestion}
                          onChange={(e) => setNewSupport({ ...newSupport, frais_gestion: parseFloat(e.target.value) || 0 })}
                          className="mt-1 bg-[#1E293B] border-[#334155] text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-[#FFFBEB]">Date d'achat</Label>
                        <Input
                          type="date"
                          value={newSupport.date_achat?.toISOString().split('T')[0]}
                          onChange={(e) => setNewSupport({ ...newSupport, date_achat: new Date(e.target.value) })}
                          className="mt-1 bg-[#1E293B] border-[#334155] text-white"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-[#F59E0B] text-[#0F172A]" onClick={handleAddSupport}>Ajouter</Button>
                      <Button variant="outline" size="sm" onClick={() => setShowAddSupport(false)} className="border-[#334155] text-white">Annuler</Button>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#334155]">
                        <TableHead className="text-[#F59E0B]">Support</TableHead>
                        <TableHead className="text-[#F59E0B]">ISIN</TableHead>
                        <TableHead className="text-[#F59E0B]">Catégorie</TableHead>
                        <TableHead className="text-[#F59E0B] text-right">Investi</TableHead>
                        <TableHead className="text-[#F59E0B] text-right">Valeur</TableHead>
                        <TableHead className="text-[#F59E0B] text-right">+/- Value</TableHead>
                        <TableHead className="text-[#F59E0B] text-right">Perf %</TableHead>
                        <TableHead className="text-[#F59E0B] text-right">Frais</TableHead>
                        <TableHead className="text-[#F59E0B]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentContrat.supports_uc.length === 0 ? (
                        <TableRow className="border-[#334155]">
                          <TableCell colSpan={9} className="text-center text-[#FFFBEB]/50 py-8">
                            Aucun support UC. Cliquez sur "Ajouter un support UC" pour commencer.
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentContrat.supports_uc.map(support => (
                          <TableRow key={support.id} className="border-[#334155] hover:bg-[#0F172A]/50">
                            <TableCell className="text-white font-semibold">{support.nom_support}</TableCell>
                            <TableCell className="font-mono text-xs text-[#FFFBEB]/70">{support.isin}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{support.categorie}</Badge>
                            </TableCell>
                            <TableCell className="text-right text-white">{formatCurrency(support.montant_investi)}</TableCell>
                            <TableCell className="text-right font-semibold text-white">{formatCurrency(support.valeur_actuelle)}</TableCell>
                            <TableCell className={`text-right font-semibold ${support.performance_euros >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {formatCurrency(support.performance_euros)}
                            </TableCell>
                            <TableCell className={`text-right ${support.performance_pct >= 0 ? 'text-[#F59E0B]' : 'text-red-400'}`}>
                              {support.performance_pct >= 0 ? '+' : ''}{support.performance_pct.toFixed(2)}%
                            </TableCell>
                            <TableCell className="text-right text-[#FFFBEB]/70">{support.frais_gestion}%</TableCell>
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

            {/* Contract Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card className="bg-[#1E293B] border-[#334155]">
                <CardHeader>
                  <CardTitle className="text-white">Frais du contrat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-[#FFFBEB]">Frais d'entrée (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={currentContrat.frais_entree}
                      onChange={(e) => updateAssuranceVie(currentContrat.id, { frais_entree: parseFloat(e.target.value) || 0 })}
                      className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#FFFBEB]">Frais de gestion annuels (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={currentContrat.frais_gestion_annuels}
                      onChange={(e) => updateAssuranceVie(currentContrat.id, { frais_gestion_annuels: parseFloat(e.target.value) || 0 })}
                      className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#FFFBEB]">Frais d'arbitrage (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={currentContrat.frais_arbitrage}
                      onChange={(e) => updateAssuranceVie(currentContrat.id, { frais_arbitrage: parseFloat(e.target.value) || 0 })}
                      className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1E293B] border-[#334155]">
                <CardHeader>
                  <CardTitle className="text-white">Informations fiscales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-[#FFFBEB]">Anteriorité fiscale</Label>
                    <Input
                      type="date"
                      value={currentContrat.anteriorite_fiscale.toISOString().split('T')[0]}
                      onChange={(e) => updateAssuranceVie(currentContrat.id, { anteriorite_fiscale: new Date(e.target.value) })}
                      className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#FFFBEB]">Versements avant 70 ans (€)</Label>
                    <Input
                      type="number"
                      value={currentContrat.versements_avant_70_ans}
                      onChange={(e) => updateAssuranceVie(currentContrat.id, { versements_avant_70_ans: parseFloat(e.target.value) || 0 })}
                      className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#FFFBEB]">Versements après 70 ans (€)</Label>
                    <Input
                      type="number"
                      value={currentContrat.versements_apres_70_ans}
                      onChange={(e) => updateAssuranceVie(currentContrat.id, { versements_apres_70_ans: parseFloat(e.target.value) || 0 })}
                      className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Beneficiaries */}
            <Card className="mb-6 bg-[#1E293B] border-[#334155]">
              <CardHeader>
                <CardTitle className="text-white">Clause bénéficiaire</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={currentContrat.clause_beneficiaire}
                  onChange={(e) => updateAssuranceVie(currentContrat.id, { clause_beneficiaire: e.target.value })}
                  placeholder="Mon conjoint à défaut mes enfants nés ou à naître vivants ou représentés..."
                  rows={4}
                  className="bg-[#0F172A] border-[#334155] text-white"
                />
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="bg-[#1E293B] border-[#334155]">
            <CardContent className="py-12 text-center">
              <Shield className="w-16 h-16 text-[#F59E0B]/50 mx-auto mb-4" />
              <p className="text-[#FFFBEB]/70 text-lg">
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
            className="border-[#334155] text-white"
          >
            ← Liquidités
          </Button>
          <Button
            className="bg-[#F59E0B] text-[#0F172A] hover:bg-[#D97706]"
            size="lg"
            onClick={() => router.push('/client/patrimoine/bourse')}
          >
            Suivant : Enveloppes Boursières →
          </Button>
        </div>
      </div>
    </div>
  )
}
