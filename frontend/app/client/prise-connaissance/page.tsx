'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PriseConnaissance } from '@/lib/types/assessment'
import { FileText, Target, Clock, TrendingUp } from 'lucide-react'

export default function PriseConnaissancePage() {
  const router = useRouter()
  const { assessment, setPriseConnaissance } = useClientStore()
  
  const [formData, setFormData] = useState<PriseConnaissance>(
    assessment.prise_connaissance || {
      type_client: 'Nouveau client',
      objectif_principal: 'Optimisation fiscale',
      horizon_temps: 'Moyen terme (5-15 ans)',
      tolerance_risque: 'Équilibré',
      notes: '',
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPriseConnaissance(formData)
    router.push('/client/bilan/civil')
  }

  const handleChange = (field: keyof PriseConnaissance, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-midnight">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            📋 Prise de Connaissance Client
          </h1>
          <p className="text-cream/70 text-lg">
            Étape 1/11 - Comprenons d'abord votre situation et vos besoins
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-midnight-lighter rounded-full h-2">
            <div className="bg-gold h-2 rounded-full transition-all duration-300" style={{ width: '9%' }}></div>
          </div>
          <p className="text-cream/70 text-sm mt-2">Progression: 1 sur 11 étapes</p>
        </div>
        
        <Card className="bg-midnight-light border-midnight-lighter">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-gold" />
              <CardTitle className="text-white">Découverte initiale</CardTitle>
            </div>
            <CardDescription className="text-cream/70">
              Ces informations nous permettront de mieux comprendre vos attentes et de personnaliser votre accompagnement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type de client */}
              <div>
                <Label htmlFor="type_client" className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gold" />
                  Type de client *
                </Label>
                <Select
                  id="type_client"
                  value={formData.type_client}
                  onChange={(e) => handleChange('type_client', e.target.value as any)}
                  required
                  className="mt-1"
                >
                  <option value="Nouveau client">Nouveau client</option>
                  <option value="Bilan annuel">Bilan annuel</option>
                  <option value="Projet spécifique">Projet spécifique</option>
                </Select>
              </div>

              {/* Objectif principal */}
              <div>
                <Label htmlFor="objectif_principal" className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-gold" />
                  Objectif principal *
                </Label>
                <Select
                  id="objectif_principal"
                  value={formData.objectif_principal}
                  onChange={(e) => handleChange('objectif_principal', e.target.value as any)}
                  required
                  className="mt-1"
                >
                  <option value="Optimisation fiscale">Optimisation fiscale</option>
                  <option value="Préparation retraite">Préparation retraite</option>
                  <option value="Transmission patrimoine">Transmission patrimoine</option>
                  <option value="Diversification">Diversification</option>
                  <option value="Réduction fiscalité">Réduction fiscalité</option>
                </Select>
              </div>

              {/* Horizon temps */}
              <div>
                <Label htmlFor="horizon_temps" className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gold" />
                  Horizon de temps *
                </Label>
                <Select
                  id="horizon_temps"
                  value={formData.horizon_temps}
                  onChange={(e) => handleChange('horizon_temps', e.target.value as any)}
                  required
                  className="mt-1"
                >
                  <option value="Court terme (<5 ans)">Court terme (&lt;5 ans)</option>
                  <option value="Moyen terme (5-15 ans)">Moyen terme (5-15 ans)</option>
                  <option value="Long terme (>15 ans)">Long terme (&gt;15 ans)</option>
                </Select>
              </div>

              {/* Tolérance au risque */}
              <div>
                <Label htmlFor="tolerance_risque" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gold" />
                  Tolérance au risque *
                </Label>
                <Select
                  id="tolerance_risque"
                  value={formData.tolerance_risque}
                  onChange={(e) => handleChange('tolerance_risque', e.target.value as any)}
                  required
                  className="mt-1"
                >
                  <option value="Prudent">Prudent</option>
                  <option value="Équilibré">Équilibré</option>
                  <option value="Dynamique">Dynamique</option>
                  <option value="Agressif">Agressif</option>
                </Select>
                <p className="text-cream/50 text-sm mt-2">
                  {formData.tolerance_risque === 'Prudent' && 'Privilégie la sécurité du capital avec des rendements modérés'}
                  {formData.tolerance_risque === 'Équilibré' && 'Recherche un équilibre entre sécurité et performance'}
                  {formData.tolerance_risque === 'Dynamique' && 'Accepte une volatilité modérée pour un meilleur rendement'}
                  {formData.tolerance_risque === 'Agressif' && 'Accepte une forte volatilité pour maximiser les rendements'}
                </p>
              </div>

              {/* Notes libres */}
              <div>
                <Label htmlFor="notes">
                  Notes complémentaires (optionnel)
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Contexte particulier, projets spécifiques, contraintes..."
                  rows={4}
                  className="mt-1"
                />
              </div>

              {/* Boutons de navigation */}
              <div className="flex justify-between pt-6 border-t border-midnight-lighter">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/client/parcours')}
                >
                  ← Retour
                </Button>
                <Button type="submit" variant="gold" size="lg">
                  Suivant : État civil →
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info box */}
        <div className="mt-6 p-4 bg-midnight-light border border-gold/20 rounded-lg">
          <p className="text-cream/70 text-sm">
            💡 <strong className="text-gold">Conseil :</strong> Ces informations sont sauvegardées automatiquement. Vous pouvez revenir à tout moment pour compléter ou modifier votre dossier.
          </p>
        </div>
      </div>
    </div>
  )
}
