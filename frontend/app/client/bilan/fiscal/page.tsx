'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { BilanFiscal } from '@/lib/types/assessment'
import { formatCurrency, calculateFiscalParts } from '@/lib/utils/assessment/helpers'
import { DollarSign, TrendingDown, FileText, Calculator, Users } from 'lucide-react'

export default function BilanFiscalPage() {
  const router = useRouter()
  const { assessment, setBilanFiscal } = useClientStore()
  
  const [formData, setFormData] = useState<BilanFiscal>(
    assessment.bilan_fiscal || {
      revenus_salaires: 0,
      revenus_bic_bnc_ba: 0,
      revenus_fonciers: {
        loyers_bruts: 0,
        charges_deductibles: 0,
        revenus_nets: 0,
      },
      revenus_mobiliers: {
        dividendes: 0,
        interets: 0,
        total: 0,
      },
      plus_values: {
        mobilieres: 0,
        immobilieres: 0,
      },
      pensions_alimentaires: 0,
      dons_associations: 0,
      emploi_domicile: 0,
      investissements_defiscalisation: {
        pinel: 0,
        malraux: 0,
        girardin: 0,
      },
      tmi: 0,
      ir_annee_precedente: 0,
      ifi_du: undefined,
      prelevements_sociaux: 0,
      nombre_parts_fiscales: 1,
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setBilanFiscal(formData)
    router.push('/client/bilan/successoral')
  }

  const handleChange = (field: keyof BilanFiscal, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      
      // Auto-calculate revenus_fonciers.revenus_nets
      if (field === 'revenus_fonciers') {
        const rf = value as BilanFiscal['revenus_fonciers']
        updated.revenus_fonciers = {
          ...rf,
          revenus_nets: rf.loyers_bruts - rf.charges_deductibles
        }
      }
      
      // Auto-calculate revenus_mobiliers.total
      if (field === 'revenus_mobiliers') {
        const rm = value as BilanFiscal['revenus_mobiliers']
        updated.revenus_mobiliers = {
          ...rm,
          total: rm.dividendes + rm.interets
        }
      }
      
      return updated
    })
  }

  const handleNestedChange = (
    parent: 'revenus_fonciers' | 'revenus_mobiliers' | 'plus_values' | 'investissements_defiscalisation',
    field: string,
    value: number
  ) => {
    const updated = { ...formData[parent], [field]: value } as any
    
    if (parent === 'revenus_fonciers') {
      updated.revenus_nets = updated.loyers_bruts - updated.charges_deductibles
    } else if (parent === 'revenus_mobiliers') {
      updated.total = updated.dividendes + updated.interets
    }
    
    handleChange(parent, updated)
  }

  // Calculate total taxable income
  const revenuImposable = useMemo(() => {
    return (
      formData.revenus_salaires +
      formData.revenus_bic_bnc_ba +
      formData.revenus_fonciers.revenus_nets +
      formData.revenus_mobiliers.total +
      formData.plus_values.mobilieres +
      formData.plus_values.immobilieres
    )
  }, [formData])

  // Calculate total deductions
  const chargesDeductibles = useMemo(() => {
    return (
      formData.pensions_alimentaires +
      formData.dons_associations +
      formData.emploi_domicile +
      formData.investissements_defiscalisation.pinel +
      formData.investissements_defiscalisation.malraux +
      formData.investissements_defiscalisation.girardin
    )
  }, [formData])

  const getTMIColor = (tmi: number) => {
    switch (tmi) {
      case 0: return 'bg-green-500'
      case 11: return 'bg-blue-500'
      case 30: return 'bg-yellow-500'
      case 41: return 'bg-orange-500'
      case 45: return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-midnight">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            💰 Bilan Fiscal
          </h1>
          <p className="text-cream/70 text-lg">
            Étape 4/11 - Revenus, charges déductibles et impôts
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-midnight-lighter rounded-full h-2">
            <div className="bg-gold h-2 rounded-full transition-all duration-300" style={{ width: '36%' }}></div>
          </div>
          <p className="text-cream/70 text-sm mt-2">Progression: 4 sur 11 étapes</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-midnight-light border-midnight-lighter">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gold/10 rounded-lg">
                  <DollarSign className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <p className="text-cream/70 text-sm">Revenus imposables</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(revenuImposable)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-midnight-light border-midnight-lighter">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-cream/70 text-sm">Charges déductibles</p>
                  <p className="text-2xl font-bold text-green-400">
                    -{formatCurrency(chargesDeductibles)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-midnight-light border-midnight-lighter">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Calculator className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-cream/70 text-sm">Revenu net imposable</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {formatCurrency(Math.max(0, revenuImposable - chargesDeductibles))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Income Section */}
          <Card className="bg-midnight-light border-midnight-lighter">
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-gold" />
                <CardTitle className="text-white">Revenus</CardTitle>
              </div>
              <CardDescription className="text-cream/70">
                Ensemble de vos revenus annuels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="revenus_salaires">Revenus salariaux / Pensions (€)</Label>
                  <Input
                    id="revenus_salaires"
                    type="number"
                    value={formData.revenus_salaires}
                    onChange={(e) => handleChange('revenus_salaires', parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="revenus_bic">BIC / BNC / BA (€)</Label>
                  <Input
                    id="revenus_bic"
                    type="number"
                    value={formData.revenus_bic_bnc_ba}
                    onChange={(e) => handleChange('revenus_bic_bnc_ba', parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Revenus fonciers */}
              <div className="p-4 border border-midnight-lighter rounded-lg bg-midnight/50">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gold" />
                  Revenus fonciers
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label>Loyers bruts (€)</Label>
                    <Input
                      type="number"
                      value={formData.revenus_fonciers.loyers_bruts}
                      onChange={(e) => handleNestedChange('revenus_fonciers', 'loyers_bruts', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Charges déductibles (€)</Label>
                    <Input
                      type="number"
                      value={formData.revenus_fonciers.charges_deductibles}
                      onChange={(e) => handleNestedChange('revenus_fonciers', 'charges_deductibles', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Revenus nets (€)</Label>
                    <Input
                      type="number"
                      value={formData.revenus_fonciers.revenus_nets}
                      readOnly
                      disabled
                      className="mt-1 bg-midnight-lighter"
                    />
                  </div>
                </div>
              </div>

              {/* Revenus mobiliers */}
              <div className="p-4 border border-midnight-lighter rounded-lg bg-midnight/50">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gold" />
                  Revenus mobiliers
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label>Dividendes (€)</Label>
                    <Input
                      type="number"
                      value={formData.revenus_mobiliers.dividendes}
                      onChange={(e) => handleNestedChange('revenus_mobiliers', 'dividendes', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Intérêts (€)</Label>
                    <Input
                      type="number"
                      value={formData.revenus_mobiliers.interets}
                      onChange={(e) => handleNestedChange('revenus_mobiliers', 'interets', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Total (€)</Label>
                    <Input
                      type="number"
                      value={formData.revenus_mobiliers.total}
                      readOnly
                      disabled
                      className="mt-1 bg-midnight-lighter"
                    />
                  </div>
                </div>
              </div>

              {/* Plus-values */}
              <div className="p-4 border border-midnight-lighter rounded-lg bg-midnight/50">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gold" />
                  Plus-values
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Plus-values mobilières (€)</Label>
                    <Input
                      type="number"
                      value={formData.plus_values.mobilieres}
                      onChange={(e) => handleNestedChange('plus_values', 'mobilieres', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Plus-values immobilières (€)</Label>
                    <Input
                      type="number"
                      value={formData.plus_values.immobilieres}
                      onChange={(e) => handleNestedChange('plus_values', 'immobilieres', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deductions Section */}
          <Card className="bg-midnight-light border-midnight-lighter">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingDown className="w-6 h-6 text-gold" />
                <CardTitle className="text-white">Charges déductibles</CardTitle>
              </div>
              <CardDescription className="text-cream/70">
                Réductions et déductions fiscales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Pensions alimentaires (€)</Label>
                  <Input
                    type="number"
                    value={formData.pensions_alimentaires}
                    onChange={(e) => handleChange('pensions_alimentaires', parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Dons aux associations (€)</Label>
                  <Input
                    type="number"
                    value={formData.dons_associations}
                    onChange={(e) => handleChange('dons_associations', parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Emploi à domicile (€)</Label>
                  <Input
                    type="number"
                    value={formData.emploi_domicile}
                    onChange={(e) => handleChange('emploi_domicile', parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Défiscalisation */}
              <div className="p-4 border border-midnight-lighter rounded-lg bg-midnight/50">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gold" />
                  Investissements défiscalisants
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label>Loi Pinel (€)</Label>
                    <Input
                      type="number"
                      value={formData.investissements_defiscalisation.pinel}
                      onChange={(e) => handleNestedChange('investissements_defiscalisation', 'pinel', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Loi Malraux (€)</Label>
                    <Input
                      type="number"
                      value={formData.investissements_defiscalisation.malraux}
                      onChange={(e) => handleNestedChange('investissements_defiscalisation', 'malraux', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Loi Girardin (€)</Label>
                    <Input
                      type="number"
                      value={formData.investissements_defiscalisation.girardin}
                      onChange={(e) => handleNestedChange('investissements_defiscalisation', 'girardin', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax Information */}
          <Card className="bg-midnight-light border-midnight-lighter">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calculator className="w-6 h-6 text-gold" />
                <CardTitle className="text-white">Impôts</CardTitle>
              </div>
              <CardDescription className="text-cream/70">
                Situation fiscale et taux d'imposition
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* TMI Selector */}
              <div>
                <Label className="mb-3 block">Taux Marginal d'Imposition (TMI) *</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[0, 11, 30, 41, 45].map(tmi => (
                    <button
                      key={tmi}
                      type="button"
                      onClick={() => handleChange('tmi', tmi)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.tmi === tmi
                          ? 'border-gold bg-gold/10 shadow-gold'
                          : 'border-midnight-lighter hover:border-gold/50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full ${getTMIColor(tmi)} mx-auto mb-2`}></div>
                      <p className="text-white font-bold text-xl">{tmi}%</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ir_precedent">Impôt sur le revenu N-1 (€)</Label>
                  <Input
                    id="ir_precedent"
                    type="number"
                    value={formData.ir_annee_precedente}
                    onChange={(e) => handleChange('ir_annee_precedente', parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="ifi">IFI dû (€, si applicable)</Label>
                  <Input
                    id="ifi"
                    type="number"
                    value={formData.ifi_du || ''}
                    onChange={(e) => handleChange('ifi_du', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prelevements">Prélèvements sociaux (€)</Label>
                  <Input
                    id="prelevements"
                    type="number"
                    value={formData.prelevements_sociaux}
                    onChange={(e) => handleChange('prelevements_sociaux', parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="parts">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gold" />
                      Nombre de parts fiscales *
                    </div>
                  </Label>
                  <Input
                    id="parts"
                    type="number"
                    step="0.5"
                    value={formData.nombre_parts_fiscales}
                    onChange={(e) => handleChange('nombre_parts_fiscales', parseFloat(e.target.value) || 1)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t border-midnight-lighter">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/client/bilan/civil')}
            >
              ← Retour
            </Button>
            <Button type="submit" variant="gold" size="lg">
              Suivant : Bilan successoral →
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
