'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Scale, Users, TrendingDown, Info } from 'lucide-react'

const TYPES_HERITIERS = [
  { value: 'conjoint', label: 'Conjoint (exonéré)', abattement: 80_724 },
  { value: 'ligne_directe', label: 'Enfant / Ligne directe', abattement: 100_000 },
  { value: 'frere_soeur', label: 'Frère / Sœur', abattement: 15_932 },
]

export default function SuccessionPage({ params }: { params: { id: string } }) {
  const [montantTransmis, setMontantTransmis] = useState(500_000)
  const [typeHeritier, setTypeHeritier] = useState('ligne_directe')
  const [resultat, setResultat] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const calculerSuccession = async () => {
    setIsCalculating(true)
    try {
      const response = await fetch(
        `http://localhost:8000/api/parametres-fiscaux/calcul/succession?montant_transmis=${montantTransmis}&type_heritier=${typeHeritier}&annee=2026`,
        { method: 'POST' }
      )
      const data = await response.json()
      setResultat(data)
    } catch (error) {
      console.error('Erreur calcul succession:', error)
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <div className="min-h-screen bg-midnight-950">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2 flex items-center gap-3">
            <Scale className="w-10 h-10 text-gold-500" />
            Simulation Droits de Succession
          </h1>
          <p className="text-text-secondary">
            Client ID: <span className="text-gold-400 font-mono">{params.id}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulaire de simulation */}
          <Card className="bg-midnight-800 border-midnight-700 hover:border-gold-500 transition-all duration-300 shadow-xl p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-gold-500" />
              Paramètres de la Simulation
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Montant transmis (€)
                </label>
                <Input
                  type="number"
                  value={montantTransmis}
                  onChange={(e) => setMontantTransmis(Number(e.target.value))}
                  className="bg-midnight-700 border-midnight-600 text-text-primary placeholder:text-text-muted focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
                  placeholder="500000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Type d&apos;héritier
                </label>
                <select
                  value={typeHeritier}
                  onChange={(e) => setTypeHeritier(e.target.value)}
                  className="w-full bg-midnight-700 border-midnight-600 text-text-primary rounded-lg px-4 py-2 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all"
                >
                  {TYPES_HERITIERS.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-text-muted mt-1">
                  Abattement applicable: {TYPES_HERITIERS.find(t => t.value === typeHeritier)?.abattement.toLocaleString('fr-FR')} €
                </p>
              </div>

              <Button
                onClick={calculerSuccession}
                disabled={isCalculating}
                className="w-full bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-midnight-900 font-semibold py-3 shadow-lg hover:shadow-gold transition-all duration-300"
              >
                {isCalculating ? 'Calcul en cours...' : 'Calculer les droits de succession'}
              </Button>
            </div>
          </Card>

          {/* Résultats */}
          {resultat && (
            <Card className="bg-midnight-800 border-midnight-700 hover:border-gold-500 transition-all duration-300 shadow-xl p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
                <TrendingDown className="w-6 h-6 text-gold-500" />
                Résultats du Calcul
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-midnight-700 rounded-lg">
                  <span className="text-text-secondary">Montant transmis:</span>
                  <span className="text-text-primary font-semibold">
                    {resultat.montant_transmis?.toLocaleString('fr-FR')} €
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-midnight-700 rounded-lg">
                  <span className="text-text-secondary">Type héritier:</span>
                  <span className="text-text-primary font-semibold">
                    {TYPES_HERITIERS.find(t => t.value === resultat.type_heritier)?.label}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-midnight-700 rounded-lg">
                  <span className="text-text-secondary">Abattement:</span>
                  <span className="text-success font-semibold">
                    - {resultat.abattement?.toLocaleString('fr-FR')} €
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-midnight-700 rounded-lg">
                  <span className="text-text-secondary">Base imposable:</span>
                  <span className="text-text-primary font-semibold">
                    {resultat.base_imposable?.toLocaleString('fr-FR')} €
                  </span>
                </div>

                <div className="border-t border-midnight-600 pt-4">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-danger/20 to-danger/10 rounded-lg border border-danger/30">
                    <span className="text-text-primary font-semibold text-lg">Droits de succession dus:</span>
                    <span className="text-danger font-bold text-2xl">
                      {resultat.droits_dus?.toLocaleString('fr-FR')} €
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2 px-4">
                    <span className="text-text-muted text-sm">Taux effectif:</span>
                    <span className="text-text-secondary font-medium">
                      {resultat.taux_effectif} %
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Informations légales */}
        <Card className="bg-midnight-800 border-gold-500/30 p-6 mt-6">
          <h3 className="font-semibold text-gold-400 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Informations sur les Droits de Succession (CGI Art. 777 et suivants)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-text-secondary">
            <div className="bg-midnight-700 p-4 rounded-lg">
              <h4 className="font-semibold text-text-primary mb-2">Conjoint</h4>
              <ul className="space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-gold-400">•</span>
                  <span>Abattement: 80 724 €</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-400">•</span>
                  <span>Taux: 0% (exonéré)</span>
                </li>
              </ul>
            </div>

            <div className="bg-midnight-700 p-4 rounded-lg">
              <h4 className="font-semibold text-text-primary mb-2">Ligne directe</h4>
              <ul className="space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-gold-400">•</span>
                  <span>Abattement: 100 000 €</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-400">•</span>
                  <span>Taux: 5% à 45% progressif</span>
                </li>
              </ul>
            </div>

            <div className="bg-midnight-700 p-4 rounded-lg">
              <h4 className="font-semibold text-text-primary mb-2">Frère/Sœur</h4>
              <ul className="space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-gold-400">•</span>
                  <span>Abattement: 15 932 €</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-400">•</span>
                  <span>Taux: 35% puis 45%</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-4 p-4 bg-midnight-700 rounded-lg">
            <h4 className="font-semibold text-text-primary mb-2">Optimisations possibles</h4>
            <ul className="text-xs text-text-secondary space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-gold-400">→</span>
                <span>Donations de son vivant pour bénéficier de l&apos;abattement tous les 15 ans</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-400">→</span>
                <span>Assurance-vie avec clause bénéficiaire (abattement 152 500 € par bénéficiaire)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-400">→</span>
                <span>Démembrement de propriété (nue-propriété / usufruit)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-400">→</span>
                <span>Constitution d&apos;une SCI familiale</span>
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  )
}
