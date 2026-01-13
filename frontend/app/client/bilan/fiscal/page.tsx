'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { BilanFiscal } from '@/lib/types/assessment'
import { formatCurrency, getTMIColor } from '@/lib/utils/assessment/helpers'
import { DollarSign, FileText, Calculator, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react'

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
      tmi: 30,
      ir_annee_precedente: 0,
      prelevements_sociaux: 0,
      nombre_parts_fiscales: 1,
    }
  )

  const [openSection, setOpenSection] = useState<'revenus' | 'charges' | 'fiscalite'>('revenus')

  // Sync form data with assessment state when it changes (for persist hydration)
  useEffect(() => {
    if (assessment.bilan_fiscal) {
      setFormData(assessment.bilan_fiscal)
    }
  }, [assessment.bilan_fiscal])

  // Auto-calculate revenus fonciers nets
  useEffect(() => {
    const nets = formData.revenus_fonciers.loyers_bruts - formData.revenus_fonciers.charges_deductibles
    if (nets !== formData.revenus_fonciers.revenus_nets) {
      setFormData(prev => ({
        ...prev,
        revenus_fonciers: {
          ...prev.revenus_fonciers,
          revenus_nets: nets
        }
      }))
    }
  }, [formData.revenus_fonciers.loyers_bruts, formData.revenus_fonciers.charges_deductibles])

  // Auto-calculate revenus mobiliers total
  useEffect(() => {
    const total = formData.revenus_mobiliers.dividendes + formData.revenus_mobiliers.interets
    if (total !== formData.revenus_mobiliers.total) {
      setFormData(prev => ({
        ...prev,
        revenus_mobiliers: {
          ...prev.revenus_mobiliers,
          total
        }
      }))
    }
  }, [formData.revenus_mobiliers.dividendes, formData.revenus_mobiliers.interets])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setBilanFiscal(formData)
    router.push('/client/bilan/successoral')
  }

  const handleChange = (field: string, value: any) => {
    const keys = field.split('.')
    if (keys.length === 1) {
      setFormData(prev => ({ ...prev, [field]: value }))
    } else if (keys.length === 2) {
      setFormData(prev => ({
        ...prev,
        [keys[0]]: {
          ...(prev as any)[keys[0]],
          [keys[1]]: value
        }
      }))
    }
  }

  const toggleSection = (section: 'revenus' | 'charges' | 'fiscalite') => {
    setOpenSection(openSection === section ? openSection : section)
  }

  return (
    <div className="min-h-screen bg-midnight">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            💰 Situation Fiscale
          </h1>
          <p className="text-cream/70 text-lg">
            Étape 3/11 - Analysons votre situation fiscale complète
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-midnight-lighter rounded-full h-2">
            <div className="bg-gold h-2 rounded-full transition-all duration-300" style={{ width: '27%' }}></div>
          </div>
          <p className="text-cream/70 text-sm mt-2">Progression: 3 sur 11 étapes</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section 1: Revenus */}
          <Card className="bg-midnight-light border-midnight-lighter">
            <CardHeader 
              className="cursor-pointer hover:bg-midnight-lighter/30 transition-colors"
              onClick={() => toggleSection('revenus')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-gold" />
                  <CardTitle className="text-white">Revenus</CardTitle>
                </div>
                {openSection === 'revenus' ? (
                  <ChevronUp className="w-5 h-5 text-gold" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gold" />
                )}
              </div>
            </CardHeader>
            {openSection === 'revenus' && (
              <CardContent className="space-y-4">
                {/* Salaires */}
                <div>
                  <Label htmlFor="revenus_salaires" className="text-cream">Salaires nets annuels</Label>
                  <Input
                    id="revenus_salaires"
                    type="number"
                    value={formData.revenus_salaires}
                    onChange={(e) => handleChange('revenus_salaires', parseFloat(e.target.value) || 0)}
                    className="mt-1 bg-midnight border-midnight-lighter text-white"
                    placeholder="0"
                  />
                </div>

                {/* BIC/BNC/BA */}
                <div>
                  <Label htmlFor="revenus_bic_bnc_ba" className="text-cream">BIC / BNC / BA (revenus professionnels)</Label>
                  <Input
                    id="revenus_bic_bnc_ba"
                    type="number"
                    value={formData.revenus_bic_bnc_ba}
                    onChange={(e) => handleChange('revenus_bic_bnc_ba', parseFloat(e.target.value) || 0)}
                    className="mt-1 bg-midnight border-midnight-lighter text-white"
                    placeholder="0"
                  />
                </div>

                {/* Revenus fonciers */}
                <div className="space-y-3 p-4 bg-midnight/50 rounded-lg border border-midnight-lighter">
                  <h4 className="font-semibold text-white">Revenus fonciers</h4>
                  
                  <div>
                    <Label className="text-cream">Loyers bruts annuels</Label>
                    <Input
                      type="number"
                      value={formData.revenus_fonciers.loyers_bruts}
                      onChange={(e) => handleChange('revenus_fonciers.loyers_bruts', parseFloat(e.target.value) || 0)}
                      className="mt-1 bg-midnight border-midnight-lighter text-white"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-cream">Charges déductibles</Label>
                    <Input
                      type="number"
                      value={formData.revenus_fonciers.charges_deductibles}
                      onChange={(e) => handleChange('revenus_fonciers.charges_deductibles', parseFloat(e.target.value) || 0)}
                      className="mt-1 bg-midnight border-midnight-lighter text-white"
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="pt-2 border-t border-midnight-lighter">
                    <Label className="text-cream">Revenus nets (calculé automatiquement)</Label>
                    <div className="mt-1 p-2 bg-midnight-lighter rounded text-gold font-semibold">
                      {formatCurrency(formData.revenus_fonciers.revenus_nets)}
                    </div>
                  </div>
                </div>

                {/* Revenus mobiliers */}
                <div className="space-y-3 p-4 bg-midnight/50 rounded-lg border border-midnight-lighter">
                  <h4 className="font-semibold text-white">Revenus mobiliers</h4>
                  
                  <div>
                    <Label className="text-cream">Dividendes</Label>
                    <Input
                      type="number"
                      value={formData.revenus_mobiliers.dividendes}
                      onChange={(e) => handleChange('revenus_mobiliers.dividendes', parseFloat(e.target.value) || 0)}
                      className="mt-1 bg-midnight border-midnight-lighter text-white"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-cream">Intérêts</Label>
                    <Input
                      type="number"
                      value={formData.revenus_mobiliers.interets}
                      onChange={(e) => handleChange('revenus_mobiliers.interets', parseFloat(e.target.value) || 0)}
                      className="mt-1 bg-midnight border-midnight-lighter text-white"
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="pt-2 border-t border-midnight-lighter">
                    <Label className="text-cream">Total (calculé automatiquement)</Label>
                    <div className="mt-1 p-2 bg-midnight-lighter rounded text-gold font-semibold">
                      {formatCurrency(formData.revenus_mobiliers.total)}
                    </div>
                  </div>
                </div>

                {/* Plus-values */}
                <div className="space-y-3 p-4 bg-midnight/50 rounded-lg border border-midnight-lighter">
                  <h4 className="font-semibold text-white">Plus-values</h4>
                  
                  <div>
                    <Label className="text-cream">Plus-values mobilières</Label>
                    <Input
                      type="number"
                      value={formData.plus_values.mobilieres}
                      onChange={(e) => handleChange('plus_values.mobilieres', parseFloat(e.target.value) || 0)}
                      className="mt-1 bg-midnight border-midnight-lighter text-white"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-cream">Plus-values immobilières</Label>
                    <Input
                      type="number"
                      value={formData.plus_values.immobilieres}
                      onChange={(e) => handleChange('plus_values.immobilieres', parseFloat(e.target.value) || 0)}
                      className="mt-1 bg-midnight border-midnight-lighter text-white"
                      placeholder="0"
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Section 2: Charges déductibles */}
          <Card className="bg-midnight-light border-midnight-lighter">
            <CardHeader 
              className="cursor-pointer hover:bg-midnight-lighter/30 transition-colors"
              onClick={() => toggleSection('charges')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-6 h-6 text-gold" />
                  <CardTitle className="text-white">Charges déductibles</CardTitle>
                </div>
                {openSection === 'charges' ? (
                  <ChevronUp className="w-5 h-5 text-gold" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gold" />
                )}
              </div>
            </CardHeader>
            {openSection === 'charges' && (
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="pensions_alimentaires" className="text-cream">Pensions alimentaires</Label>
                  <Input
                    id="pensions_alimentaires"
                    type="number"
                    value={formData.pensions_alimentaires}
                    onChange={(e) => handleChange('pensions_alimentaires', parseFloat(e.target.value) || 0)}
                    className="mt-1 bg-midnight border-midnight-lighter text-white"
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="dons_associations" className="text-cream">Dons aux associations</Label>
                  <Input
                    id="dons_associations"
                    type="number"
                    value={formData.dons_associations}
                    onChange={(e) => handleChange('dons_associations', parseFloat(e.target.value) || 0)}
                    className="mt-1 bg-midnight border-midnight-lighter text-white"
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="emploi_domicile" className="text-cream">Emploi à domicile</Label>
                  <Input
                    id="emploi_domicile"
                    type="number"
                    value={formData.emploi_domicile}
                    onChange={(e) => handleChange('emploi_domicile', parseFloat(e.target.value) || 0)}
                    className="mt-1 bg-midnight border-midnight-lighter text-white"
                    placeholder="0"
                  />
                </div>

                <div className="space-y-3 p-4 bg-midnight/50 rounded-lg border border-midnight-lighter">
                  <h4 className="font-semibold text-white">Investissements défiscalisation</h4>
                  
                  <div>
                    <Label className="text-cream">Loi Pinel</Label>
                    <Input
                      type="number"
                      value={formData.investissements_defiscalisation.pinel}
                      onChange={(e) => handleChange('investissements_defiscalisation.pinel', parseFloat(e.target.value) || 0)}
                      className="mt-1 bg-midnight border-midnight-lighter text-white"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-cream">Loi Malraux</Label>
                    <Input
                      type="number"
                      value={formData.investissements_defiscalisation.malraux}
                      onChange={(e) => handleChange('investissements_defiscalisation.malraux', parseFloat(e.target.value) || 0)}
                      className="mt-1 bg-midnight border-midnight-lighter text-white"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-cream">Loi Girardin</Label>
                    <Input
                      type="number"
                      value={formData.investissements_defiscalisation.girardin}
                      onChange={(e) => handleChange('investissements_defiscalisation.girardin', parseFloat(e.target.value) || 0)}
                      className="mt-1 bg-midnight border-midnight-lighter text-white"
                      placeholder="0"
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Section 3: Fiscalité */}
          <Card className="bg-midnight-light border-midnight-lighter">
            <CardHeader 
              className="cursor-pointer hover:bg-midnight-lighter/30 transition-colors"
              onClick={() => toggleSection('fiscalite')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="w-6 h-6 text-gold" />
                  <CardTitle className="text-white">Fiscalité</CardTitle>
                </div>
                {openSection === 'fiscalite' ? (
                  <ChevronUp className="w-5 h-5 text-gold" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gold" />
                )}
              </div>
            </CardHeader>
            {openSection === 'fiscalite' && (
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="tmi" className="text-cream flex items-center gap-2">
                    Taux Marginal d'Imposition (TMI) *
                    <Badge className={getTMIColor(formData.tmi)}>
                      {formData.tmi}%
                    </Badge>
                  </Label>
                  <Select
                    id="tmi"
                    value={formData.tmi.toString()}
                    onChange={(e) => handleChange('tmi', parseInt(e.target.value) as 0 | 11 | 30 | 41 | 45)}
                    required
                    className="mt-1 bg-midnight border-midnight-lighter text-white"
                  >
                    <option value="0">0% - Non imposable</option>
                    <option value="11">11% - 1ère tranche</option>
                    <option value="30">30% - 2ème tranche</option>
                    <option value="41">41% - 3ème tranche</option>
                    <option value="45">45% - 4ème tranche</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="ir_annee_precedente" className="text-cream">Impôt sur le revenu année précédente</Label>
                  <Input
                    id="ir_annee_precedente"
                    type="number"
                    value={formData.ir_annee_precedente}
                    onChange={(e) => handleChange('ir_annee_precedente', parseFloat(e.target.value) || 0)}
                    className="mt-1 bg-midnight border-midnight-lighter text-white"
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="ifi_du" className="text-cream">IFI dû (si applicable)</Label>
                  <Input
                    id="ifi_du"
                    type="number"
                    value={formData.ifi_du || 0}
                    onChange={(e) => handleChange('ifi_du', parseFloat(e.target.value) || undefined)}
                    className="mt-1 bg-midnight border-midnight-lighter text-white"
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="prelevements_sociaux" className="text-cream">Prélèvements sociaux</Label>
                  <Input
                    id="prelevements_sociaux"
                    type="number"
                    value={formData.prelevements_sociaux}
                    onChange={(e) => handleChange('prelevements_sociaux', parseFloat(e.target.value) || 0)}
                    className="mt-1 bg-midnight border-midnight-lighter text-white"
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="nombre_parts_fiscales" className="text-cream">Nombre de parts fiscales</Label>
                  <Input
                    id="nombre_parts_fiscales"
                    type="number"
                    step="0.5"
                    value={formData.nombre_parts_fiscales}
                    onChange={(e) => handleChange('nombre_parts_fiscales', parseFloat(e.target.value) || 1)}
                    className="mt-1 bg-midnight border-midnight-lighter text-white"
                    placeholder="1"
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/client/bilan/civil')}
              className="bg-midnight-lighter border-midnight-lighter text-cream hover:bg-midnight hover:text-white"
            >
              ← Précédent
            </Button>
            <Button
              type="submit"
              className="bg-gold text-midnight hover:bg-gold/90 font-semibold"
            >
              Suivant →
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
