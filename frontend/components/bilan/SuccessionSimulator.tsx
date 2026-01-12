'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

export function SuccessionSimulator() {
  const [montantTransmis, setMontantTransmis] = useState(200000)
  const [typeHeritier, setTypeHeritier] = useState('ligne_directe')
  const [resultat, setResultat] = useState<any>(null)

  const calculerSuccession = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/parametres-fiscaux/calcul/succession?montant_transmis=${montantTransmis}&type_heritier=${typeHeritier}&annee=2026`,
        { method: 'POST' }
      )
      const data = await response.json()
      setResultat(data)
    } catch (error) {
      console.error('Erreur calcul succession:', error)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">⚖️ Simulateur de Droits de Succession</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Montant transmis (€)</label>
            <Input 
              type="number" 
              value={montantTransmis}
              onChange={(e) => setMontantTransmis(Number(e.target.value))}
              placeholder="200000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type d&apos;héritier</label>
            <Select value={typeHeritier} onValueChange={setTypeHeritier}>
              <option value="ligne_directe">Ligne directe (enfants, parents)</option>
              <option value="conjoint">Conjoint survivant</option>
              <option value="frere_soeur">Frère / Sœur</option>
            </Select>
          </div>
        </div>
        <Button onClick={calculerSuccession} className="bg-blue-600 hover:bg-blue-700 text-white mt-4">
          Calculer les droits de succession
        </Button>

        {resultat && !resultat.erreur && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">Résultat du calcul</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Montant transmis:</span>
                <span className="font-semibold">{resultat.montant_transmis?.toLocaleString()} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type d&apos;héritier:</span>
                <span className="font-semibold capitalize">{resultat.type_heritier?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Abattement applicable:</span>
                <span className="font-semibold text-green-600">- {resultat.abattement?.toLocaleString()} €</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-300">
                <span className="text-gray-600">Base imposable:</span>
                <span className="font-semibold">{resultat.base_imposable?.toLocaleString()} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-900 font-semibold">Droits de succession dus:</span>
                <span className="font-bold text-red-600 text-lg">{resultat.droits_dus?.toLocaleString()} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taux effectif:</span>
                <span className="font-semibold">{resultat.taux_effectif} %</span>
              </div>
            </div>
          </div>
        )}

        {resultat && resultat.erreur && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg text-red-700">
            <p className="font-semibold">Erreur: {resultat.erreur}</p>
          </div>
        )}
      </Card>

      <Card className="p-6 bg-gray-50">
        <h3 className="font-semibold mb-4">📋 Barème des abattements 2026 (CGI Art. 777)</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Ligne directe (enfant, parent):</span>
            <span className="font-semibold">100 000 € / héritier</span>
          </div>
          <div className="flex justify-between">
            <span>Conjoint survivant:</span>
            <span className="font-semibold">Exonération totale</span>
          </div>
          <div className="flex justify-between">
            <span>Frère / Sœur:</span>
            <span className="font-semibold">15 932 €</span>
          </div>
          <div className="flex justify-between">
            <span>Neveu / Nièce:</span>
            <span className="font-semibold">7 967 €</span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">💡 Optimisations Possibles</h3>
        <div className="space-y-3">
          <div className="p-3 bg-green-50 rounded border border-green-200">
            <h4 className="font-semibold text-green-800 text-sm">Donation de son vivant</h4>
            <p className="text-xs text-green-700 mt-1">
              Même abattement tous les 15 ans. Permet de transmettre progressivement avec fiscalité réduite.
            </p>
            <p className="text-xs text-green-600 mt-1 font-semibold">
              Économie potentielle: variable selon montant et timing
            </p>
          </div>
          
          <div className="p-3 bg-blue-50 rounded border border-blue-200">
            <h4 className="font-semibold text-blue-800 text-sm">Assurance-vie</h4>
            <p className="text-xs text-blue-700 mt-1">
              152 500 € par bénéficiaire exonérés (versements avant 70 ans). Hors succession.
            </p>
            <p className="text-xs text-blue-600 mt-1 font-semibold">
              Économie potentielle: jusqu&apos;à 68 625 € / bénéficiaire (taux 45%)
            </p>
          </div>
          
          <div className="p-3 bg-purple-50 rounded border border-purple-200">
            <h4 className="font-semibold text-purple-800 text-sm">Démembrement de propriété</h4>
            <p className="text-xs text-purple-700 mt-1">
              Donation de la nue-propriété, conservation de l&apos;usufruit. Taxation réduite selon âge.
            </p>
            <p className="text-xs text-purple-600 mt-1 font-semibold">
              Économie potentielle: 30% à 60% selon âge du donateur
            </p>
          </div>
          
          <div className="p-3 bg-orange-50 rounded border border-orange-200">
            <h4 className="font-semibold text-orange-800 text-sm">SCI familiale</h4>
            <p className="text-xs text-orange-700 mt-1">
              Transmission progressive via donations de parts sociales avec décote (illiquidité).
            </p>
            <p className="text-xs text-orange-600 mt-1 font-semibold">
              Économie potentielle: 10% à 20% via décote sur valeur parts
            </p>
          </div>
        </div>
      </Card>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Points d&apos;attention</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Les calculs sont indicatifs et basés sur le CGI 2026</li>
          <li>• Abattements renouvelables tous les 15 ans</li>
          <li>• Pacte Dutreil possible pour entreprise familiale (-75%)</li>
          <li>• Consulter un notaire pour optimisation sur-mesure</li>
        </ul>
      </div>
    </div>
  )
}
