'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calculator, TrendingUp, Home, DollarSign } from 'lucide-react'

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
      {/* Calcul IR */}
      <Card className="bg-midnight-800 border-midnight-700 hover:border-gold-500 transition-all duration-300 shadow-xl p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
          <Calculator className="w-6 h-6 text-gold-500" />
          Calcul Impôt sur le Revenu (IR)
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Revenu imposable annuel (€)
            </label>
            <Input 
              type="number" 
              value={revenuImposable}
              onChange={(e) => setRevenuImposable(Number(e.target.value))}
              className="bg-midnight-700 border-midnight-600 text-text-primary placeholder:text-text-muted focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
              placeholder="50000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Nombre de parts fiscales
            </label>
            <Input 
              type="number" 
              step="0.5"
              value={nbParts}
              onChange={(e) => setNbParts(Number(e.target.value))}
              className="bg-midnight-700 border-midnight-600 text-text-primary placeholder:text-text-muted focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
              placeholder="1"
            />
          </div>
        </div>
        <Button 
          onClick={calculerIR} 
          className="bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-midnight-900 font-semibold shadow-lg hover:shadow-gold transition-all duration-300"
        >
          Calculer l&apos;IR
        </Button>

        {resultatIR && (
          <div className="mt-6 p-5 bg-midnight-700 rounded-lg border border-midnight-600">
            <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gold-400" />
              Résultat du calcul IR
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between items-center p-2 bg-midnight-800 rounded">
                <span className="text-text-secondary">Revenu imposable:</span>
                <span className="text-text-primary font-semibold">{resultatIR.revenu_imposable?.toLocaleString('fr-FR')} €</span>
              </div>
              
              <div className="flex justify-between items-center p-2 bg-midnight-800 rounded">
                <span className="text-text-secondary">Quotient familial:</span>
                <span className="text-text-primary font-semibold">{resultatIR.quotient_familial?.toLocaleString('fr-FR')} €</span>
              </div>
              
              <div className="flex justify-between items-center p-2 bg-midnight-800 rounded">
                <span className="text-text-secondary">Impôt brut:</span>
                <span className="text-danger font-semibold">{resultatIR.impot_brut?.toLocaleString('fr-FR')} €</span>
              </div>
              
              <div className="flex justify-between items-center p-2 bg-midnight-800 rounded">
                <span className="text-text-secondary">Taux moyen:</span>
                <span className="text-text-primary font-semibold">{resultatIR.taux_moyen} %</span>
              </div>
              
              <div className="flex justify-between items-center p-2 bg-midnight-800 rounded col-span-2">
                <span className="text-text-secondary">Taux marginal:</span>
                <span className="text-gold-400 font-semibold">{resultatIR.taux_marginal} %</span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Calcul IFI */}
      <Card className="bg-midnight-800 border-midnight-700 hover:border-gold-500 transition-all duration-300 shadow-xl p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
          <Home className="w-6 h-6 text-gold-500" />
          Calcul Impôt sur la Fortune Immobilière (IFI)
        </h2>
        <div className="mb-6">
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Patrimoine immobilier net (€)
          </label>
          <Input 
            type="number" 
            value={patrimoineImmo}
            onChange={(e) => setPatrimoineImmo(Number(e.target.value))}
            className="bg-midnight-700 border-midnight-600 text-text-primary placeholder:text-text-muted focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
            placeholder="1000000"
          />
          <p className="text-xs text-text-muted mt-1">
            Seuil d&apos;entrée IFI: 1 300 000 € • Décote applicable entre 1.3M€ et 1.4M€
          </p>
        </div>
        <Button 
          onClick={calculerIFI} 
          className="bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-midnight-900 font-semibold shadow-lg hover:shadow-gold transition-all duration-300"
        >
          Calculer l&apos;IFI
        </Button>

        {resultatIFI && (
          <div className="mt-6 p-5 bg-midnight-700 rounded-lg border border-midnight-600">
            <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gold-400" />
              Résultat du calcul IFI
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between items-center p-2 bg-midnight-800 rounded">
                <span className="text-text-secondary">Patrimoine net:</span>
                <span className="text-text-primary font-semibold">{resultatIFI.patrimoine_net?.toLocaleString('fr-FR')} €</span>
              </div>
              
              <div className="flex justify-between items-center p-2 bg-midnight-800 rounded">
                <span className="text-text-secondary">IFI applicable:</span>
                <span className="text-text-primary font-semibold">
                  {resultatIFI.applicable ? '✓ Oui' : '✗ Non (< 1.3M€)'}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-2 bg-midnight-800 rounded col-span-2">
                <span className="text-text-secondary">IFI dû:</span>
                <span className="text-danger font-semibold text-lg">{resultatIFI.ifi_du?.toLocaleString('fr-FR')} €</span>
              </div>
              
              {resultatIFI.decote_appliquee && (
                <div className="col-span-2 text-success text-xs bg-success/10 p-2 rounded border border-success/30">
                  ✓ Décote appliquée (patrimoine entre 1.3M€ et 1.4M€)
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Synthèse fiscale */}
      <Card className="bg-gradient-to-br from-midnight-800 to-midnight-900 border-gold-500/30 shadow-premium p-6">
        <h3 className="font-semibold text-gold-400 mb-4 flex items-center gap-2">
          <DollarSign className="w-6 h-6" />
          Synthèse Fiscale Annuelle
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-midnight-700 rounded-lg">
            <span className="text-text-secondary">Impôt sur le revenu (IR):</span>
            <span className="font-semibold text-danger">
              {resultatIR ? `${resultatIR.impot_brut?.toLocaleString('fr-FR')} €` : '- €'}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-midnight-700 rounded-lg">
            <span className="text-text-secondary">IFI:</span>
            <span className="font-semibold text-danger">
              {resultatIFI ? `${resultatIFI.ifi_du?.toLocaleString('fr-FR')} €` : '- €'}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-midnight-700 rounded-lg">
            <span className="text-text-secondary">Prélèvements sociaux (17.2%):</span>
            <span className="font-semibold text-danger">À calculer</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-danger/20 to-danger/10 rounded-lg border-2 border-danger/30 mt-4">
            <span className="text-text-primary font-bold text-lg">Fiscalité totale annuelle:</span>
            <span className="font-bold text-danger text-2xl">
              {(resultatIR && resultatIFI) 
                ? `${(resultatIR.impot_brut + resultatIFI.ifi_du).toLocaleString('fr-FR')} €`
                : '- €'
              }
            </span>
          </div>
        </div>
      </Card>

      {/* Informations légales */}
      <Card className="bg-midnight-800 border-gold-500/30 p-6">
        <h4 className="font-semibold text-gold-400 mb-3">ℹ️ Informations</h4>
        <ul className="text-sm text-text-secondary space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-gold-400">•</span>
            <span>Les calculs sont basés sur les barèmes 2026 du Code Général des Impôts</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gold-400">•</span>
            <span>IR: Barème progressif par tranches (Art. 197 CGI)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gold-400">•</span>
            <span>IFI: Seuil à 1.3M€ avec décote jusqu&apos;à 1.4M€ (Art. 964 CGI)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gold-400">•</span>
            <span>Prélèvements sociaux: 17.2% sur revenus du capital (CSG + CRDS)</span>
          </li>
        </ul>
      </Card>
    </div>
  )
}
