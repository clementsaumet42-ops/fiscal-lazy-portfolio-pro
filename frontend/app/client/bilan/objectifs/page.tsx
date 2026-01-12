'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { BilanStepper } from '@/components/bilan/BilanStepper'
import { ObjectifsPatrimoniaux } from '@/lib/types/bilan'
import { Target, Clock, TrendingUp, CheckCircle } from 'lucide-react'

export default function ObjectifsPatrimoniauxPage() {
  const router = useRouter()
  const { bilan, setObjectifs } = useClientStore()
  
  const [formData, setFormData] = useState<ObjectifsPatrimoniaux>(
    bilan.objectifs || {
      objectif_principal: 'retraite',
      horizon_placement: 'long_terme',
      tolerance_risque: 'equilibre',
      objectifs_secondaires: [],
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setObjectifs(formData)
    // Redirect to audit or allocation depending on workflow
    router.push('/client/parcours')
  }

  const handleChange = (field: keyof ObjectifsPatrimoniaux, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📋 Bilan Patrimonial</h1>
        <p className="text-gray-600">Étape 4/4 - Objectifs patrimoniaux</p>
      </div>

      <BilanStepper currentStep={4} />
      
      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <CardTitle>Définir vos objectifs</CardTitle>
          </div>
          <CardDescription>
            Identifiez vos objectifs patrimoniaux et votre profil d'investisseur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Objectif principal */}
            <div>
              <label className="block text-sm font-medium mb-3">
                <Target className="w-4 h-4 inline mr-1" />
                Objectif principal *
              </label>
              <Select
                value={formData.objectif_principal}
                onChange={(e) => handleChange('objectif_principal', e.target.value)}
                className="w-full"
              >
                <option value="retraite">Préparer ma retraite</option>
                <option value="transmission">Transmission patrimoniale</option>
                <option value="revenus_complementaires">Générer des revenus complémentaires</option>
                <option value="achat_immobilier">Financer un achat immobilier</option>
                <option value="autre">Autre objectif</option>
              </Select>
              
              {formData.objectif_principal === 'autre' && (
                <div className="mt-3">
                  <Input
                    placeholder="Précisez votre objectif..."
                    value={formData.objectif_principal_details || ''}
                    onChange={(e) => handleChange('objectif_principal_details', e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Horizon de placement */}
            <div>
              <label className="block text-sm font-medium mb-3">
                <Clock className="w-4 h-4 inline mr-1" />
                Horizon de placement *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    handleChange('horizon_placement', 'court_terme')
                    handleChange('horizon_placement_annees', 3)
                  }}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.horizon_placement === 'court_terme'
                      ? 'border-primary bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold mb-1">Court terme</div>
                    <div className="text-sm text-gray-600">&lt; 5 ans</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleChange('horizon_placement', 'moyen_terme')
                    handleChange('horizon_placement_annees', 10)
                  }}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.horizon_placement === 'moyen_terme'
                      ? 'border-primary bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold mb-1">Moyen terme</div>
                    <div className="text-sm text-gray-600">5 - 15 ans</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleChange('horizon_placement', 'long_terme')
                    handleChange('horizon_placement_annees', 20)
                  }}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.horizon_placement === 'long_terme'
                      ? 'border-primary bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold mb-1">Long terme</div>
                    <div className="text-sm text-gray-600">&gt; 15 ans</div>
                  </div>
                </button>
              </div>
              
              {formData.horizon_placement && (
                <div className="mt-3">
                  <label className="block text-sm font-medium mb-2">
                    Précisez le nombre d'années
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.horizon_placement_annees || ''}
                    onChange={(e) => handleChange('horizon_placement_annees', parseInt(e.target.value))}
                    placeholder="10"
                  />
                </div>
              )}
            </div>

            {/* Tolérance au risque */}
            <div>
              <label className="block text-sm font-medium mb-3">
                <TrendingUp className="w-4 h-4 inline mr-1" />
                Tolérance au risque *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {[
                  { value: 'prudent', label: 'Prudent', emoji: '🛡️', desc: 'Sécurité avant tout' },
                  { value: 'equilibre', label: 'Équilibré', emoji: '⚖️', desc: 'Équilibre risque/rendement' },
                  { value: 'dynamique', label: 'Dynamique', emoji: '📈', desc: 'Croissance privilégiée' },
                  { value: 'offensif', label: 'Offensif', emoji: '🚀', desc: 'Rendement maximal' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleChange('tolerance_risque', option.value)}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      formData.tolerance_risque === option.value
                        ? 'border-primary bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">{option.emoji}</div>
                      <div className="font-semibold text-sm mb-1">{option.label}</div>
                      <div className="text-xs text-gray-600">{option.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Description des profils de risque */}
            <Card className="bg-gray-50">
              <CardContent className="py-4">
                <h4 className="font-semibold mb-3 text-sm">Comprendre les profils de risque :</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <div><strong>Prudent :</strong> Priorité à la préservation du capital (60% obligations, 40% actions)</div>
                  <div><strong>Équilibré :</strong> Recherche d'équilibre (60% actions, 40% obligations)</div>
                  <div><strong>Dynamique :</strong> Recherche de croissance (80% actions, 20% obligations)</div>
                  <div><strong>Offensif :</strong> Maximisation du rendement (100% actions)</div>
                </div>
              </CardContent>
            </Card>

            {/* Objectifs secondaires (optionnel) */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Objectifs secondaires (optionnel)
              </label>
              <div className="space-y-2">
                {[
                  'Constituer une épargne de précaution',
                  'Financer les études des enfants',
                  'Optimiser ma fiscalité',
                  'Diversifier mon patrimoine',
                  'Préparer un projet immobilier',
                ].map((obj) => (
                  <label key={obj} className="flex items-center gap-2 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.objectifs_secondaires?.includes(obj)}
                      onChange={(e) => {
                        const current = formData.objectifs_secondaires || []
                        if (e.target.checked) {
                          handleChange('objectifs_secondaires', [...current, obj])
                        } else {
                          handleChange('objectifs_secondaires', current.filter(o => o !== obj))
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{obj}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Message de succès */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-900 mb-1">Bilan patrimonial complété !</h4>
                    <p className="text-sm text-green-700">
                      Toutes les informations nécessaires ont été collectées. Vous allez pouvoir accéder 
                      au parcours complet : audit de l'existant et recommandations personnalisées.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Boutons de navigation */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/client/bilan/patrimoine')}
              >
                Retour : Patrimoine
              </Button>
              <Button type="submit" size="lg" className="bg-green-600 hover:bg-green-700">
                Terminer le bilan 🎉
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
