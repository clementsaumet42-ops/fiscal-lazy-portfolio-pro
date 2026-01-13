'use client'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DollarSign, Home, TrendingUp, Briefcase } from 'lucide-react'

export function RevenusForm() {
  return (
    <div className="space-y-6">
      <Card className="bg-midnight-800 border-midnight-700 hover:border-gold-500 transition-all duration-300 shadow-xl p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-gold-500" />
          Revenus Salariaux
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Salaire net mensuel</label>
            <Input 
              type="number" 
              placeholder="3500" 
              className="bg-midnight-700 border-midnight-600 text-text-primary placeholder:text-text-muted focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Primes annuelles</label>
            <Input 
              type="number" 
              placeholder="5000" 
              className="bg-midnight-700 border-midnight-600 text-text-primary placeholder:text-text-muted focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Avantages en nature</label>
            <Input 
              type="number" 
              placeholder="0" 
              className="bg-midnight-700 border-midnight-600 text-text-primary placeholder:text-text-muted focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Participation / Intéressement</label>
            <Input 
              type="number" 
              placeholder="2000" 
              className="bg-midnight-700 border-midnight-600 text-text-primary placeholder:text-text-muted focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
            />
          </div>
        </div>
      </Card>

      <Card className="bg-midnight-800 border-midnight-700 hover:border-gold-500 transition-all duration-300 shadow-xl p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
          <Home className="w-6 h-6 text-gold-500" />
          Revenus Fonciers
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Loyers mensuels bruts</label>
            <Input 
              type="number" 
              placeholder="1200" 
              className="bg-midnight-700 border-midnight-600 text-text-primary placeholder:text-text-muted focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Charges déductibles</label>
            <Input 
              type="number" 
              placeholder="300" 
              className="bg-midnight-700 border-midnight-600 text-text-primary placeholder:text-text-muted focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Régime fiscal</label>
            <select className="w-full bg-midnight-700 border-midnight-600 text-text-primary rounded-lg px-4 py-2 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all">
              <option value="">Sélectionner</option>
              <option value="micro_foncier">Micro-foncier</option>
              <option value="reel">Réel</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="bg-midnight-800 border-midnight-700 hover:border-gold-500 transition-all duration-300 shadow-xl p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-gold-500" />
          Revenus Financiers
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Intérêts</label>
            <Input 
              type="number" 
              placeholder="500" 
              className="bg-midnight-700 border-midnight-600 text-text-primary placeholder:text-text-muted focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Dividendes</label>
            <Input 
              type="number" 
              placeholder="1500" 
              className="bg-midnight-700 border-midnight-600 text-text-primary placeholder:text-text-muted focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Plus-values</label>
            <Input 
              type="number" 
              placeholder="3000" 
              className="bg-midnight-700 border-midnight-600 text-text-primary placeholder:text-text-muted focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Régime fiscal</label>
            <select className="w-full bg-midnight-700 border-midnight-600 text-text-primary rounded-lg px-4 py-2 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all">
              <option value="">Sélectionner</option>
              <option value="flat_tax">Flat tax (30%)</option>
              <option value="bareme_progressif">Barème progressif</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="bg-midnight-800 border-midnight-700 hover:border-gold-500 transition-all duration-300 shadow-xl p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-gold-500" />
          Autres Revenus
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Pensions / Retraites</label>
            <Input 
              type="number" 
              placeholder="0" 
              className="bg-midnight-700 border-midnight-600 text-text-primary placeholder:text-text-muted focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Autres revenus</label>
            <Input 
              type="number" 
              placeholder="0" 
              className="bg-midnight-700 border-midnight-600 text-text-primary placeholder:text-text-muted focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button className="bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-midnight-900 font-semibold px-8 py-3 shadow-lg hover:shadow-gold transition-all duration-300">
          Enregistrer les revenus
        </Button>
      </div>
    </div>
  )
}
