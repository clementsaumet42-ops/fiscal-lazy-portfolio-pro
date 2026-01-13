'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

export default function ParametresFiscauxPage() {
  const [annee, setAnnee] = useState(2026)
  const [parametres, setParametres] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const chargerParametres = async () => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:8000/api/parametres-fiscaux/annee/${annee}`)
      const data = await response.json()
      setParametres(data)
    } catch (error) {
      console.error('Erreur chargement paramètres:', error)
    } finally {
      setLoading(false)
    }
  }

  const sauvegarderParametres = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/parametres-fiscaux/annee/${annee}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parametres)
      })
      
      if (response.ok) {
        alert('Paramètres fiscaux sauvegardés avec succès !')
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  useEffect(() => {
    chargerParametres()
  }, [annee])

  if (loading || !parametres) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">⚙️ Configuration Paramètres Fiscaux</h1>
        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium">Année:</label>
          <Select value={annee.toString()} onValueChange={(v) => setAnnee(Number(v))} className="w-32">
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </Select>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">📋 Impôt sur le Revenu (IR)</h2>
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-600 mb-2">Barème progressif (CGI Art. 197)</div>
            {parametres.tranches_ir?.map((tranche: any, index: number) => (
              <div key={index} className="grid grid-cols-4 gap-4 p-3 bg-gray-50 rounded">
                <div>
                  <label className="text-xs">Min (€)</label>
                  <Input 
                    type="number" 
                    value={tranche.min}
                    onChange={(e) => {
                      const newTranches = [...parametres.tranches_ir]
                      newTranches[index].min = Number(e.target.value)
                      setParametres({...parametres, tranches_ir: newTranches})
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs">Max (€)</label>
                  <Input 
                    type="number" 
                    value={tranche.max || ''}
                    placeholder="Infini"
                    onChange={(e) => {
                      const newTranches = [...parametres.tranches_ir]
                      newTranches[index].max = e.target.value ? Number(e.target.value) : null
                      setParametres({...parametres, tranches_ir: newTranches})
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs">Taux (%)</label>
                  <Input 
                    type="number" 
                    step="0.01"
                    value={(tranche.taux * 100).toFixed(2)}
                    onChange={(e) => {
                      const newTranches = [...parametres.tranches_ir]
                      newTranches[index].taux = Number(e.target.value) / 100
                      setParametres({...parametres, tranches_ir: newTranches})
                    }}
                  />
                </div>
                <div className="flex items-end">
                  <span className="text-xs text-gray-500">Tranche {index + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">🏠 Impôt sur la Fortune Immobilière (IFI)</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Seuil d&apos;entrée IFI (€)</label>
            <Input 
              type="number"
              value={parametres.seuil_ifi}
              onChange={(e) => setParametres({...parametres, seuil_ifi: Number(e.target.value)})}
            />
          </div>
          <div className="text-sm font-medium text-gray-600 mb-2">Barème IFI (CGI Art. 964)</div>
          <div className="space-y-2">
            {parametres.tranches_ifi?.slice(0, 3).map((tranche: any, index: number) => (
              <div key={index} className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded text-sm">
                <div>Min: {tranche.min.toLocaleString()} €</div>
                <div>Max: {tranche.max?.toLocaleString() || 'Infini'} €</div>
                <div>Taux: {(tranche.taux * 100).toFixed(2)} %</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">💰 Prélèvements Sociaux</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">CSG déductible (%)</label>
              <Input 
                type="number"
                step="0.001"
                value={(parametres.taux_csg_deductible * 100).toFixed(2)}
                onChange={(e) => setParametres({...parametres, taux_csg_deductible: Number(e.target.value) / 100})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CSG non déductible (%)</label>
              <Input 
                type="number"
                step="0.001"
                value={(parametres.taux_csg_non_deductible * 100).toFixed(2)}
                onChange={(e) => setParametres({...parametres, taux_csg_non_deductible: Number(e.target.value) / 100})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CRDS (%)</label>
              <Input 
                type="number"
                step="0.001"
                value={(parametres.taux_crds * 100).toFixed(2)}
                onChange={(e) => setParametres({...parametres, taux_crds: Number(e.target.value) / 100})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Prélèvement solidarité (%)</label>
              <Input 
                type="number"
                step="0.001"
                value={(parametres.taux_prelevement_solidarite * 100).toFixed(2)}
                onChange={(e) => setParametres({...parametres, taux_prelevement_solidarite: Number(e.target.value) / 100})}
              />
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <div className="font-semibold">
              Total prélèvements sociaux: {(parametres.taux_prelevements_sociaux * 100).toFixed(2)} %
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">📊 Flat Tax / PFU</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Part IR (%)</label>
              <Input 
                type="number"
                step="0.01"
                value={(parametres.taux_pfu_ir * 100).toFixed(2)}
                onChange={(e) => setParametres({...parametres, taux_pfu_ir: Number(e.target.value) / 100})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Part PS (%)</label>
              <Input 
                type="number"
                step="0.01"
                value={(parametres.taux_pfu_ps * 100).toFixed(2)}
                onChange={(e) => setParametres({...parametres, taux_pfu_ps: Number(e.target.value) / 100})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total PFU (%)</label>
              <Input 
                type="number"
                step="0.01"
                value={(parametres.taux_pfu_total * 100).toFixed(2)}
                readOnly
                className="bg-gray-100"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">💼 Plafonds Enveloppes Fiscales</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Plafond PEA (€)</label>
              <Input 
                type="number"
                value={parametres.plafond_pea}
                onChange={(e) => setParametres({...parametres, plafond_pea: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Plafond Livret A (€)</label>
              <Input 
                type="number"
                value={parametres.plafond_livret_a}
                onChange={(e) => setParametres({...parametres, plafond_livret_a: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Plafond LDDS (€)</label>
              <Input 
                type="number"
                value={parametres.plafond_ldds}
                onChange={(e) => setParametres({...parametres, plafond_ldds: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Plafond LEP (€)</label>
              <Input 
                type="number"
                value={parametres.plafond_lep}
                onChange={(e) => setParametres({...parametres, plafond_lep: Number(e.target.value)})}
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={chargerParametres}>
            Annuler les modifications
          </Button>
          <Button onClick={sauvegarderParametres} className="bg-blue-600 hover:bg-blue-700 text-white">
            💾 Sauvegarder les paramètres
          </Button>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
        <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Attention</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Ces paramètres impactent tous les calculs fiscaux de l&apos;application</li>
          <li>• Vérifier la conformité avec le Code Général des Impôts (CGI) en vigueur</li>
          <li>• Les modifications sont sauvegardées immédiatement et visibles par tous les utilisateurs</li>
        </ul>
      </div>
    </div>
  )
}
