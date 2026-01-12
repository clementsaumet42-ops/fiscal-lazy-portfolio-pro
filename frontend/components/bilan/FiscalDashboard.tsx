'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function FiscalDashboard() {
  const [revenuImposable, setRevenuImposable] = useState(50000)
  const [nbParts, setNbParts] = useState(1)
  const [patrimoineImmo, setPatrimoineImmo] = useState(1000000)
  const [resultatIR, setResultatIR] = useState<any>(null)
  const [resultatIFI, setResultatIFI] = useState<any>(null)

  const calculerIR = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/parametres-fiscaux/calcul/ir?revenu_imposable=${revenuImposable}&nb_parts=${nbParts}&annee=2026`,
        { method: 'POST' }
      )
      const data = await response.json()
      setResultatIR(data)
    } catch (error) {
      console.error('Erreur calcul IR:', error)
    }
  }

  const calculerIFI = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/parametres-fiscaux/calcul/ifi?patrimoine_immobilier_net=${patrimoineImmo}&annee=2026`,
        { method: 'POST' }
      )
      const data = await response.json()
      setResultatIFI(data)
    } catch (error) {
      console.error('Erreur calcul IFI:', error)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">📋 Calcul Impôt sur le Revenu (IR)</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Revenu imposable annuel (€)</label>
            <Input 
              type="number" 
              value={revenuImposable}
              onChange={(e) => setRevenuImposable(Number(e.target.value))}
              placeholder="50000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nombre de parts fiscales</label>
            <Input 
              type="number" 
              step="0.5"
              value={nbParts}
              onChange={(e) => setNbParts(Number(e.target.value))}
              placeholder="1"
            />
          </div>
        </div>
        <Button onClick={calculerIR} className="bg-blue-600 hover:bg-blue-700 text-white">
          Calculer l&apos;IR
        </Button>

        {resultatIR && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">Résultat du calcul IR</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Revenu imposable:</div>
              <div className="font-semibold text-right">{resultatIR.revenu_imposable?.toLocaleString()} €</div>
              
              <div>Quotient familial:</div>
              <div className="font-semibold text-right">{resultatIR.quotient_familial?.toLocaleString()} €</div>
              
              <div>Impôt brut:</div>
              <div className="font-semibold text-right text-red-600">{resultatIR.impot_brut?.toLocaleString()} €</div>
              
              <div>Taux moyen:</div>
              <div className="font-semibold text-right">{resultatIR.taux_moyen} %</div>
              
              <div>Taux marginal:</div>
              <div className="font-semibold text-right">{resultatIR.taux_marginal} %</div>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">🏠 Calcul Impôt sur la Fortune Immobilière (IFI)</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Patrimoine immobilier net (€)</label>
          <Input 
            type="number" 
            value={patrimoineImmo}
            onChange={(e) => setPatrimoineImmo(Number(e.target.value))}
            placeholder="1000000"
          />
          <p className="text-xs text-gray-500 mt-1">
            Seuil d&apos;entrée IFI: 1 300 000 € • Décote applicable entre 1.3M€ et 1.4M€
          </p>
        </div>
        <Button onClick={calculerIFI} className="bg-blue-600 hover:bg-blue-700 text-white">
          Calculer l&apos;IFI
        </Button>

        {resultatIFI && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">Résultat du calcul IFI</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Patrimoine net:</div>
              <div className="font-semibold text-right">{resultatIFI.patrimoine_net?.toLocaleString()} €</div>
              
              <div>IFI applicable:</div>
              <div className="font-semibold text-right">
                {resultatIFI.applicable ? 'Oui' : 'Non (< 1.3M€)'}
              </div>
              
              <div>IFI dû:</div>
              <div className="font-semibold text-right text-red-600">{resultatIFI.ifi_du?.toLocaleString()} €</div>
              
              {resultatIFI.decote_appliquee && (
                <>
                  <div className="col-span-2 text-green-600 text-xs">
                    ✓ Décote appliquée (patrimoine entre 1.3M€ et 1.4M€)
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6 bg-gray-50">
        <h3 className="font-semibold mb-2">📊 Synthèse Fiscale Annuelle</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Impôt sur le revenu (IR):</span>
            <span className="font-semibold float-right text-red-600">
              {resultatIR ? `${resultatIR.impot_brut?.toLocaleString()} €` : '- €'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">IFI:</span>
            <span className="font-semibold float-right text-red-600">
              {resultatIFI ? `${resultatIFI.ifi_du?.toLocaleString()} €` : '- €'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Prélèvements sociaux (17.2%):</span>
            <span className="font-semibold float-right text-red-600">- €</span>
          </div>
          <div className="col-span-2 pt-2 border-t border-gray-300">
            <span className="text-gray-900 font-semibold">Fiscalité totale annuelle:</span>
            <span className="font-bold float-right text-red-600 text-lg">
              {(resultatIR && resultatIFI) 
                ? `${(resultatIR.impot_brut + resultatIFI.ifi_du).toLocaleString()} €`
                : '- €'
              }
            </span>
          </div>
        </div>
      </Card>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">ℹ️ Informations</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Les calculs sont basés sur les barèmes 2026 du Code Général des Impôts</li>
          <li>• IR: Barème progressif par tranches (Art. 197 CGI)</li>
          <li>• IFI: Seuil à 1.3M€ avec décote jusqu&apos;à 1.4M€ (Art. 964 CGI)</li>
          <li>• Prélèvements sociaux: 17.2% sur revenus du capital (CSG + CRDS)</li>
        </ul>
      </div>
    </div>
  )
}
