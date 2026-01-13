'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useClientStore } from '@/store/client-store'
import type { SituationFiscale, TMI, SituationFamiliale } from '@/lib/types/situation-fiscale'
import { PLAFONDS_2024 } from '@/lib/types/situation-fiscale'
import { Info, Save } from 'lucide-react'

/**
 * Formulaire pour saisir la situation fiscale du client
 * Utilisé pour les calculs TCO professionnels conformes au CGI
 */
export default function SituationFiscaleForm() {
  const { situationFiscale, setSituationFiscale } = useClientStore()
  
  // État local du formulaire
  const [tmi, setTmi] = useState<TMI>(situationFiscale?.tmi || 0.30)
  const [rfr, setRfr] = useState<number>(situationFiscale?.rfr || 0)
  const [nbPartsFiscales, setNbPartsFiscales] = useState<number>(
    situationFiscale?.nbPartsFiscales || 1
  )
  const [situationFamiliale, setSituationFamilialeLocal] = useState<SituationFamiliale>(
    situationFiscale?.situationFamiliale || 'celibataire'
  )
  const [optionBaremeProgressif, setOptionBaremeProgressif] = useState<boolean>(
    situationFiscale?.optionBaremeProgressif || false
  )
  const [peaUtilise, setPeaUtilise] = useState<number>(
    situationFiscale?.plafonds.peaUtilise || 0
  )
  const [perDeductibleUtilise, setPerDeductibleUtilise] = useState<number>(
    situationFiscale?.plafonds.perDeductibleUtilise || 0
  )
  const [revenusProAnnuels, setRevenusProAnnuels] = useState<number>(
    situationFiscale?.revenusProAnnuels || 0
  )

  // Charger les valeurs depuis le store au montage
  useEffect(() => {
    if (situationFiscale) {
      setTmi(situationFiscale.tmi)
      setRfr(situationFiscale.rfr)
      setNbPartsFiscales(situationFiscale.nbPartsFiscales)
      setSituationFamilialeLocal(situationFiscale.situationFamiliale)
      setOptionBaremeProgressif(situationFiscale.optionBaremeProgressif)
      setPeaUtilise(situationFiscale.plafonds.peaUtilise)
      setPerDeductibleUtilise(situationFiscale.plafonds.perDeductibleUtilise)
      setRevenusProAnnuels(situationFiscale.revenusProAnnuels || 0)
    }
  }, [situationFiscale])

  const handleSave = () => {
    const newSituation: SituationFiscale = {
      tmi,
      rfr,
      nbPartsFiscales,
      situationFamiliale,
      optionBaremeProgressif,
      plafonds: {
        peaUtilise,
        perDeductibleUtilise,
      },
      revenusProAnnuels: revenusProAnnuels > 0 ? revenusProAnnuels : undefined,
    }
    
    setSituationFiscale(newSituation)
  }

  // Calcul du plafond PER disponible
  const plafondPerBase = PLAFONDS_2024.PER_PLAFOND_BASE
  const plafondPerRevenus = revenusProAnnuels * PLAFONDS_2024.PER_TAUX_REVENUS_PROS
  const plafondPerTotal = Math.max(plafondPerBase, plafondPerRevenus)
  const plafondPerDisponible = plafondPerTotal - perDeductibleUtilise

  // Calcul du plafond PEA disponible
  const plafondPeaDisponible = PLAFONDS_2024.PEA_MAX - peaUtilise

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 Situation Fiscale
        </CardTitle>
        <p className="text-sm text-gray-600">
          Ces informations permettent de calculer précisément le coût fiscal de vos enveloppes selon le CGI
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* TMI */}
          <div className="space-y-2">
            <Label htmlFor="tmi" className="font-medium">
              Tranche Marginale d'Imposition (TMI) *
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {[0, 0.11, 0.30, 0.41, 0.45].map((rate) => (
                <Button
                  key={rate}
                  type="button"
                  variant={tmi === rate ? 'default' : 'outline'}
                  onClick={() => setTmi(rate as TMI)}
                  className="w-full"
                >
                  {(rate * 100).toFixed(0)}%
                </Button>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Votre taux marginal d'imposition selon votre dernier avis d'impôt
            </p>
          </div>

          {/* Situation familiale */}
          <div className="space-y-2">
            <Label htmlFor="situation-familiale" className="font-medium">
              Situation Familiale
            </Label>
            <select
              id="situation-familiale"
              value={situationFamiliale}
              onChange={(e) => setSituationFamilialeLocal(e.target.value as SituationFamiliale)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="celibataire">Célibataire</option>
              <option value="marie">Marié(e)</option>
              <option value="pacse">Pacsé(e)</option>
              <option value="divorce">Divorcé(e)</option>
              <option value="veuf">Veuf(ve)</option>
            </select>
          </div>

          {/* RFR et parts fiscales */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rfr" className="font-medium">
                Revenu Fiscal de Référence
              </Label>
              <Input
                id="rfr"
                type="number"
                min="0"
                step="1000"
                value={rfr}
                onChange={(e) => setRfr(parseFloat(e.target.value) || 0)}
                placeholder="50000"
              />
              <p className="text-xs text-gray-500">Indiqué sur votre avis d'impôt</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="parts" className="font-medium">
                Nombre de parts fiscales
              </Label>
              <Input
                id="parts"
                type="number"
                min="1"
                step="0.5"
                value={nbPartsFiscales}
                onChange={(e) => setNbPartsFiscales(parseFloat(e.target.value) || 1)}
                placeholder="1"
              />
              <p className="text-xs text-gray-500">Ex: 1, 1.5, 2, 2.5, etc.</p>
            </div>
          </div>

          {/* Option barème progressif (CTO) */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <input
                id="bareme-progressif"
                type="checkbox"
                checked={optionBaremeProgressif}
                onChange={(e) => setOptionBaremeProgressif(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <Label htmlFor="bareme-progressif" className="font-medium cursor-pointer">
                  Option pour le barème progressif (CTO)
                </Label>
                <p className="text-xs text-gray-500 mt-1">
                  Intéressant si votre TMI est inférieure à 30% (alternative au PFU 30%)
                </p>
              </div>
            </div>
          </div>

          {/* Revenus professionnels (pour PER) */}
          <div className="space-y-2">
            <Label htmlFor="revenus-pro" className="font-medium">
              Revenus professionnels annuels (pour calcul plafond PER)
            </Label>
            <Input
              id="revenus-pro"
              type="number"
              min="0"
              step="1000"
              value={revenusProAnnuels}
              onChange={(e) => setRevenusProAnnuels(parseFloat(e.target.value) || 0)}
              placeholder="60000"
            />
            {revenusProAnnuels > 0 && (
              <p className="text-xs text-gray-500">
                Plafond PER déductible : {plafondPerTotal.toLocaleString('fr-FR')}€
                (max entre {plafondPerBase.toLocaleString('fr-FR')}€ et 10% de vos revenus)
              </p>
            )}
          </div>

          {/* Plafonds utilisés */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3 text-sm">Plafonds utilisés</h4>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pea-utilise" className="font-medium text-sm">
                  PEA : Montant déjà versé
                </Label>
                <Input
                  id="pea-utilise"
                  type="number"
                  min="0"
                  max={PLAFONDS_2024.PEA_MAX}
                  step="1000"
                  value={peaUtilise}
                  onChange={(e) => setPeaUtilise(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
                <p className="text-xs text-gray-500">
                  Plafond disponible : {plafondPeaDisponible.toLocaleString('fr-FR')}€ / {PLAFONDS_2024.PEA_MAX.toLocaleString('fr-FR')}€
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="per-utilise" className="font-medium text-sm">
                  PER : Plafond de déduction déjà utilisé cette année
                </Label>
                <Input
                  id="per-utilise"
                  type="number"
                  min="0"
                  step="1000"
                  value={perDeductibleUtilise}
                  onChange={(e) => setPerDeductibleUtilise(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
                {revenusProAnnuels > 0 && (
                  <p className="text-xs text-gray-500">
                    Plafond disponible : {plafondPerDisponible.toLocaleString('fr-FR')}€ / {plafondPerTotal.toLocaleString('fr-FR')}€
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Information CGI */}
          <div className="bg-blue-100 border border-blue-200 rounded-lg p-4 flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">📖 Calculs conformes au Code Général des Impôts</p>
              <p>
                Ces informations permettent d'appliquer les bonnes tranches fiscales selon les articles 
                150-0 A (PEA), 200 A (CTO), 125-0 A (AV), et 163 quatervicies (PER) du CGI.
              </p>
            </div>
          </div>

          {/* Bouton de sauvegarde */}
          <Button
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <Save className="w-4 h-4 mr-2" />
            Enregistrer ma situation fiscale
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
