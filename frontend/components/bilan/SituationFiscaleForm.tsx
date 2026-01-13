'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AlertCircle, Info } from 'lucide-react'
import type { SituationFiscale, TMI } from '@/lib/types/situation-fiscale'
import { BAREMES_IR_2024, PLAFONDS_2024 } from '@/lib/constants/references-cgi'

interface SituationFiscaleFormProps {
  value: SituationFiscale
  onChange: (situation: SituationFiscale) => void
  revenus?: number
}

export function SituationFiscaleForm({ value, onChange, revenus }: SituationFiscaleFormProps) {
  const [localValue, setLocalValue] = useState<SituationFiscale>(value)
  const [showAlert, setShowAlert] = useState(false)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (updates: Partial<SituationFiscale>) => {
    const newValue = { ...localValue, ...updates }
    setLocalValue(newValue)
    onChange(newValue)
  }

  const handleTMIChange = (tmi: TMI) => {
    handleChange({ tmi })
  }

  const handleSituationFamilialeChange = (situationFamiliale: SituationFiscale['situationFamiliale']) => {
    const nbPartsFiscales = situationFamiliale === 'marie' || situationFamiliale === 'pacse' ? 2 : 1
    handleChange({ situationFamiliale, nbPartsFiscales })
  }

  const handleBaremeChange = (optionBaremeProgressif: boolean) => {
    if (optionBaremeProgressif && !showAlert) {
      setShowAlert(true)
    }
    handleChange({ optionBaremeProgressif })
  }

  // Calcul automatique du plafond PER si revenus fournis
  useEffect(() => {
    if (revenus && revenus > 0) {
      const plafondCalcule = Math.min(
        revenus * PLAFONDS_2024.PER_DEDUCTIBLE_BASE,
        PLAFONDS_2024.PER_DEDUCTIBLE_MAX
      )
      const plafondDeductible = Math.max(plafondCalcule, PLAFONDS_2024.PER_DEDUCTIBLE_MIN)
      
      if (localValue.plafonds.per_deductible !== plafondDeductible) {
        handleChange({
          plafonds: { ...localValue.plafonds, per_deductible: plafondDeductible }
        })
      }
    }
  }, [revenus])

  const tmiOptions: { value: TMI; label: string; range: string }[] = [
    { value: 0, label: '0%', range: `0 - ${BAREMES_IR_2024[0].max.toLocaleString('fr-FR')}€` },
    { value: 0.11, label: '11%', range: `${BAREMES_IR_2024[0.11].min.toLocaleString('fr-FR')} - ${BAREMES_IR_2024[0.11].max.toLocaleString('fr-FR')}€` },
    { value: 0.30, label: '30%', range: `${BAREMES_IR_2024[0.30].min.toLocaleString('fr-FR')} - ${BAREMES_IR_2024[0.30].max.toLocaleString('fr-FR')}€` },
    { value: 0.41, label: '41%', range: `${BAREMES_IR_2024[0.41].min.toLocaleString('fr-FR')} - ${BAREMES_IR_2024[0.41].max.toLocaleString('fr-FR')}€` },
    { value: 0.45, label: '45%', range: `> ${BAREMES_IR_2024[0.41].max.toLocaleString('fr-FR')}€` }
  ]

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 Situation Fiscale
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* TMI */}
          <div>
            <Label htmlFor="tmi" className="mb-2 block">
              Tranche Marginale d'Imposition (TMI) *
            </Label>
            <select
              id="tmi"
              value={localValue.tmi}
              onChange={(e) => handleTMIChange(parseFloat(e.target.value) as TMI)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {tmiOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} - Revenus {option.range}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Votre TMI détermine la fiscalité de vos placements
            </p>
          </div>

          {/* RFR */}
          <div>
            <Label htmlFor="rfr" className="mb-2 block">
              Revenu Fiscal de Référence (RFR)
            </Label>
            <Input
              id="rfr"
              type="number"
              value={localValue.rfr}
              onChange={(e) => handleChange({ rfr: parseFloat(e.target.value) || 0 })}
              placeholder="Ex: 45000"
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-1">
              Indiqué sur votre avis d'imposition
            </p>
          </div>

          {/* Situation familiale */}
          <div>
            <Label htmlFor="situation_familiale" className="mb-2 block">
              Situation Familiale
            </Label>
            <select
              id="situation_familiale"
              value={localValue.situationFamiliale}
              onChange={(e) => handleSituationFamilialeChange(e.target.value as SituationFiscale['situationFamiliale'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="celibataire">Célibataire</option>
              <option value="marie">Marié(e)</option>
              <option value="pacse">Pacsé(e)</option>
              <option value="divorce">Divorcé(e)</option>
              <option value="veuf">Veuf(ve)</option>
            </select>
          </div>

          {/* Nombre de parts fiscales */}
          <div>
            <Label htmlFor="nb_parts" className="mb-2 block">
              Nombre de Parts Fiscales
            </Label>
            <Input
              id="nb_parts"
              type="number"
              step="0.5"
              value={localValue.nbPartsFiscales}
              onChange={(e) => handleChange({ nbPartsFiscales: parseFloat(e.target.value) || 1 })}
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-1">
              Base: 1 part (célibataire), 2 parts (couple)
            </p>
          </div>

          {/* Option barème progressif */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="option_bareme"
                checked={localValue.optionBaremeProgressif}
                onChange={(e) => handleBaremeChange(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <Label htmlFor="option_bareme" className="cursor-pointer">
                Option pour le barème progressif (CTO)
              </Label>
            </div>
            <p className="text-sm text-gray-500 mt-1 ml-7">
              Alternative au PFU 30% pour les revenus du CTO
            </p>
            
            {showAlert && localValue.optionBaremeProgressif && (
              <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-orange-900">
                  <p className="font-medium">⚠️ Attention</p>
                  <p>Cette option est irrévocable pour l'année fiscale en cours et s'applique à tous vos revenus de capitaux mobiliers.</p>
                </div>
              </div>
            )}
          </div>

          {/* Plafond PEA */}
          <div>
            <Label htmlFor="plafond_pea" className="mb-2 block">
              Plafond PEA Utilisé
            </Label>
            <Input
              id="plafond_pea"
              type="number"
              value={localValue.plafonds.pea}
              onChange={(e) => handleChange({
                plafonds: { ...localValue.plafonds, pea: parseFloat(e.target.value) || 0 }
              })}
              placeholder={`Max: ${PLAFONDS_2024.PEA.toLocaleString('fr-FR')}€`}
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-1">
              Plafond de versement: {PLAFONDS_2024.PEA.toLocaleString('fr-FR')}€
            </p>
          </div>

          {/* Plafond PER */}
          <div>
            <Label htmlFor="plafond_per" className="mb-2 block">
              Plafond PER Déductible
            </Label>
            <Input
              id="plafond_per"
              type="number"
              value={localValue.plafonds.per_deductible}
              onChange={(e) => handleChange({
                plafonds: { ...localValue.plafonds, per_deductible: parseFloat(e.target.value) || 0 }
              })}
              placeholder="Calculé automatiquement"
              className="w-full"
              disabled={!!revenus}
            />
            <p className="text-sm text-gray-500 mt-1">
              {revenus 
                ? `Calculé: 10% × ${revenus.toLocaleString('fr-FR')}€` 
                : `Min: ${PLAFONDS_2024.PER_DEDUCTIBLE_MIN.toLocaleString('fr-FR')}€, Max: ${PLAFONDS_2024.PER_DEDUCTIBLE_MAX.toLocaleString('fr-FR')}€`
              }
            </p>
          </div>
        </div>

        {/* Aide pédagogique */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">💡 Pourquoi ces informations ?</p>
              <p>
                Votre situation fiscale permet de calculer précisément le drag fiscal de vos placements 
                selon les règles du Code Général des Impôts (CGI). Les calculs prennent en compte :
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>L'ancienneté de vos contrats (PEA, assurance-vie)</li>
                <li>Les abattements applicables (4 600€ ou 9 200€ après 8 ans)</li>
                <li>Le choix PFU vs barème progressif</li>
                <li>Les déductions PER selon vos revenus</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
