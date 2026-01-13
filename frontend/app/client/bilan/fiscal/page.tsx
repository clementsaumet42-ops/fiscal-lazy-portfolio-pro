'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { BilanFiscal } from '@/lib/types/assessment'
import { bilanFiscalSchema } from '@/lib/validation/bilan-schemas'
import { formatCurrency, getTMIColor } from '@/lib/utils/assessment/helpers'
import { Coins, FileText, TrendingDown, Calculator } from 'lucide-react'

export default function BilanFiscalPage() {
  const router = useRouter()
  const { assessment, setBilanFiscal } = useClientStore()
  
  const [formData, setFormData] = useState<BilanFiscal>(
    assessment.bilan_fiscal || {
      revenus_salaires: 0,
      revenus_bic_bnc_ba: 0,
      revenus_fonciers: { loyers_bruts: 0, charges_deductibles: 0, revenus_nets: 0 },
      revenus_mobiliers: { dividendes: 0, interets: 0, total: 0 },
      plus_values: { mobilieres: 0, immobilieres: 0 },
      pensions_alimentaires: 0,
      dons_associations: 0,
      emploi_domicile: 0,
      investissements_defiscalisation: { pinel: 0, malraux: 0, girardin: 0 },
      tmi: 0,
      ir_annee_precedente: 0,
      ifi_du: 0,
      prelevements_sociaux: 0,
      nombre_parts_fiscales: 1,
    }
  )

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev }
      const keys = field.split('.')
      
      if (keys.length === 1) {
        updated[keys[0] as keyof BilanFiscal] = value
      } else if (keys.length === 2) {
        (updated[keys[0] as keyof BilanFiscal] as any)[keys[1]] = value
      }
      
      return updated
    })
  }

  // Auto-calculations
  const calculatedValues = useMemo(() => {
    const revenusFonciersNets = formData.revenus_fonciers.loyers_bruts - formData.revenus_fonciers.charges_deductibles
    const revenusMobiliersTotal = formData.revenus_mobiliers.dividendes + formData.revenus_mobiliers.interets
    
    const totalRevenus = 
      formData.revenus_salaires +
      formData.revenus_bic_bnc_ba +
      revenusFonciersNets +
      revenusMobiliersTotal +
      formData.plus_values.mobilieres +
      formData.plus_values.immobilieres
    
    const totalCharges = 
      formData.pensions_alimentaires +
      formData.dons_associations +
      formData.emploi_domicile +
      formData.investissements_defiscalisation.pinel +
      formData.investissements_defiscalisation.malraux +
      formData.investissements_defiscalisation.girardin
    
    const rfr = totalRevenus - totalCharges
    
    return {
      revenusFonciersNets,
      revenusMobiliersTotal,
      totalRevenus,
      totalCharges,
      rfr,
    }
  }, [formData])

  // Update calculated fields
  useMemo(() => {
    handleChange('revenus_fonciers.revenus_nets', calculatedValues.revenusFonciersNets)
    handleChange('revenus_mobiliers.total', calculatedValues.revenusMobiliersTotal)
  }, [calculatedValues.revenusFonciersNets, calculatedValues.revenusMobiliersTotal])

  const handleNext = () => {
    // Update calculated fields before validation
    const dataToValidate = {
      ...formData,
      revenus_fonciers: {
        ...formData.revenus_fonciers,
        revenus_nets: calculatedValues.revenusFonciersNets,
      },
      revenus_mobiliers: {
        ...formData.revenus_mobiliers,
        total: calculatedValues.revenusMobiliersTotal,
      },
    }
    
    const result = bilanFiscalSchema.safeParse(dataToValidate)
    
    if (!result.success) {
      const newErrors: Record<string, string> = {}
      result.error.errors.forEach(err => {
        const field = err.path.join('.')
        newErrors[field] = err.message
      })
      setErrors(newErrors)
      alert('Veuillez corriger les erreurs dans le formulaire')
      return
    }
    
    setBilanFiscal(dataToValidate)
    router.push('/client/bilan/successoral')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[#FFFBEB]/70 text-sm">Étape 3 sur 11</p>
          <h1 className="text-3xl font-bold text-white mt-2">
            💰 Bilan Fiscal
          </h1>
          <p className="text-[#FFFBEB]/60 mt-2">
            Revenus, charges déductibles et imposition
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-[#1E293B] rounded-full h-2">
            <div className="bg-[#F59E0B] h-2 rounded-full transition-all duration-300" style={{ width: '27%' }}></div>
          </div>
        </div>

        {/* Income Section */}
        <Card className="bg-[#1E293B] border-[#334155] mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-[#F59E0B]" />
              <CardTitle className="text-white">Revenus</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-[#FFFBEB]">Salaires nets imposables (€)</Label>
              <Input
                type="number"
                value={formData.revenus_salaires}
                onChange={(e) => handleChange('revenus_salaires', parseFloat(e.target.value) || 0)}
                className="mt-1 bg-[#0F172A] border-[#334155] text-white"
              />
            </div>

            <div>
              <Label className="text-[#FFFBEB]">Revenus BIC/BNC/BA (€)</Label>
              <Input
                type="number"
                value={formData.revenus_bic_bnc_ba}
                onChange={(e) => handleChange('revenus_bic_bnc_ba', parseFloat(e.target.value) || 0)}
                className="mt-1 bg-[#0F172A] border-[#334155] text-white"
              />
            </div>

            <div className="border-t border-[#334155] pt-4">
              <h4 className="text-white font-semibold mb-3">Revenus fonciers</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#FFFBEB]">Loyers bruts annuels (€)</Label>
                  <Input
                    type="number"
                    value={formData.revenus_fonciers.loyers_bruts}
                    onChange={(e) => handleChange('revenus_fonciers.loyers_bruts', parseFloat(e.target.value) || 0)}
                    className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                  />
                </div>
                <div>
                  <Label className="text-[#FFFBEB]">Charges déductibles (€)</Label>
                  <Input
                    type="number"
                    value={formData.revenus_fonciers.charges_deductibles}
                    onChange={(e) => handleChange('revenus_fonciers.charges_deductibles', parseFloat(e.target.value) || 0)}
                    className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                  />
                </div>
              </div>
              <div className="mt-3 p-3 bg-[#F59E0B]/10 rounded-lg border border-[#F59E0B]/30">
                <p className="text-sm text-[#FFFBEB]/70">Revenus nets</p>
                <p className="text-2xl font-bold text-[#F59E0B]">
                  {formatCurrency(calculatedValues.revenusFonciersNets)}
                </p>
              </div>
            </div>

            <div className="border-t border-[#334155] pt-4">
              <h4 className="text-white font-semibold mb-3">Revenus mobiliers</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#FFFBEB]">Dividendes (€)</Label>
                  <Input
                    type="number"
                    value={formData.revenus_mobiliers.dividendes}
                    onChange={(e) => handleChange('revenus_mobiliers.dividendes', parseFloat(e.target.value) || 0)}
                    className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                  />
                </div>
                <div>
                  <Label className="text-[#FFFBEB]">Intérêts (€)</Label>
                  <Input
                    type="number"
                    value={formData.revenus_mobiliers.interets}
                    onChange={(e) => handleChange('revenus_mobiliers.interets', parseFloat(e.target.value) || 0)}
                    className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                  />
                </div>
              </div>
              <div className="mt-3 p-3 bg-[#F59E0B]/10 rounded-lg border border-[#F59E0B]/30">
                <p className="text-sm text-[#FFFBEB]/70">Total revenus mobiliers</p>
                <p className="text-2xl font-bold text-[#F59E0B]">
                  {formatCurrency(calculatedValues.revenusMobiliersTotal)}
                </p>
              </div>
            </div>

            <div className="border-t border-[#334155] pt-4">
              <h4 className="text-white font-semibold mb-3">Plus-values</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#FFFBEB]">Plus-values mobilières (€)</Label>
                  <Input
                    type="number"
                    value={formData.plus_values.mobilieres}
                    onChange={(e) => handleChange('plus_values.mobilieres', parseFloat(e.target.value) || 0)}
                    className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                  />
                </div>
                <div>
                  <Label className="text-[#FFFBEB]">Plus-values immobilières (€)</Label>
                  <Input
                    type="number"
                    value={formData.plus_values.immobilieres}
                    onChange={(e) => handleChange('plus_values.immobilieres', parseFloat(e.target.value) || 0)}
                    className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deductions Section */}
        <Card className="bg-[#1E293B] border-[#334155] mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-[#F59E0B]" />
              <CardTitle className="text-white">Charges déductibles</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-[#FFFBEB]">Pensions alimentaires (€)</Label>
                <Input
                  type="number"
                  value={formData.pensions_alimentaires}
                  onChange={(e) => handleChange('pensions_alimentaires', parseFloat(e.target.value) || 0)}
                  className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                />
              </div>
              <div>
                <Label className="text-[#FFFBEB]">Dons aux associations (€)</Label>
                <Input
                  type="number"
                  value={formData.dons_associations}
                  onChange={(e) => handleChange('dons_associations', parseFloat(e.target.value) || 0)}
                  className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                />
              </div>
              <div>
                <Label className="text-[#FFFBEB]">Emploi à domicile (€)</Label>
                <Input
                  type="number"
                  value={formData.emploi_domicile}
                  onChange={(e) => handleChange('emploi_domicile', parseFloat(e.target.value) || 0)}
                  className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                />
              </div>
            </div>

            <div className="border-t border-[#334155] pt-4">
              <h4 className="text-white font-semibold mb-3">Investissements défiscalisation</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-[#FFFBEB]">Pinel (€)</Label>
                  <Input
                    type="number"
                    value={formData.investissements_defiscalisation.pinel}
                    onChange={(e) => handleChange('investissements_defiscalisation.pinel', parseFloat(e.target.value) || 0)}
                    className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                  />
                </div>
                <div>
                  <Label className="text-[#FFFBEB]">Malraux (€)</Label>
                  <Input
                    type="number"
                    value={formData.investissements_defiscalisation.malraux}
                    onChange={(e) => handleChange('investissements_defiscalisation.malraux', parseFloat(e.target.value) || 0)}
                    className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                  />
                </div>
                <div>
                  <Label className="text-[#FFFBEB]">Girardin (€)</Label>
                  <Input
                    type="number"
                    value={formData.investissements_defiscalisation.girardin}
                    onChange={(e) => handleChange('investissements_defiscalisation.girardin', parseFloat(e.target.value) || 0)}
                    className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tax Information Section */}
        <Card className="bg-[#1E293B] border-[#334155] mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#F59E0B]" />
              <CardTitle className="text-white">Informations fiscales</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-[#FFFBEB]">TMI (Taux Marginal d'Imposition) *</Label>
                <Select
                  value={formData.tmi.toString()}
                  onChange={(e) => handleChange('tmi', parseInt(e.target.value))}
                  className={`mt-1 border-[#334155] text-white ${formData.tmi > 0 ? 'bg-[#F59E0B]/20' : 'bg-[#0F172A]'}`}
                >
                  <option value="0">0%</option>
                  <option value="11">11%</option>
                  <option value="30">30%</option>
                  <option value="41">41%</option>
                  <option value="45">45%</option>
                </Select>
              </div>
              <div>
                <Label className="text-[#FFFBEB]">Nombre de parts fiscales</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={formData.nombre_parts_fiscales}
                  onChange={(e) => handleChange('nombre_parts_fiscales', parseFloat(e.target.value) || 1)}
                  className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-[#FFFBEB]">IR année précédente (€)</Label>
                <Input
                  type="number"
                  value={formData.ir_annee_precedente}
                  onChange={(e) => handleChange('ir_annee_precedente', parseFloat(e.target.value) || 0)}
                  className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                />
              </div>
              <div>
                <Label className="text-[#FFFBEB]">IFI dû (€)</Label>
                <Input
                  type="number"
                  value={formData.ifi_du || 0}
                  onChange={(e) => handleChange('ifi_du', parseFloat(e.target.value) || 0)}
                  className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                />
              </div>
              <div>
                <Label className="text-[#FFFBEB]">Prélèvements sociaux (€)</Label>
                <Input
                  type="number"
                  value={formData.prelevements_sociaux}
                  onChange={(e) => handleChange('prelevements_sociaux', parseFloat(e.target.value) || 0)}
                  className="mt-1 bg-[#0F172A] border-[#334155] text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card className="bg-gradient-to-r from-[#F59E0B]/20 to-[#F59E0B]/5 border-[#F59E0B]/50 mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#F59E0B]" />
              <CardTitle className="text-white">Synthèse fiscale</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-[#FFFBEB]/70">Total revenus</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(calculatedValues.totalRevenus)}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#FFFBEB]/70">Total charges déductibles</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(calculatedValues.totalCharges)}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#FFFBEB]/70">Revenu fiscal de référence estimé</p>
                <p className="text-3xl font-bold text-[#F59E0B]">
                  {formatCurrency(calculatedValues.rfr)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => router.push('/client/bilan/civil')}
            className="border-[#334155] text-[#FFFBEB]"
          >
            ← Bilan civil
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
