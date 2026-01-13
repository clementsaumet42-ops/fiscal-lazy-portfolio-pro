'use client'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Home, ShoppingCart, CreditCard, Users, PiggyBank } from 'lucide-react'

export function ChargesForm() {
  return (
    <div className="space-y-6">
      <Card className="bg-midnight-800 border-midnight-700 hover:border-gold-500 transition-all duration-300 shadow-xl p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
          <Home className="w-6 h-6 text-gold-500" />
          Charges Fixes
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Crédit immobilier mensuel</label>
            <Input type="number" placeholder="1200" className="bg-midnight-700 border-midnight-600 text-text-primary placeholder:text-text-muted focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Loyer mensuel</label>
            <Input type="number" placeholder="0" className="bg-midnight-700 border-midnight-600 text-text-primary placeholder:text-text-muted focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Charges copropriété (mensuel)</label>
            <Input type="number" placeholder="150" className="bg-midnight-700 border-midnight-600 text-text-primary placeholder:text-text-muted focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Taxe foncière annuelle</label>
            <Input type="number" placeholder="1500" className="bg-midnight-700 border-midnight-600 text-text-primary placeholder:text-text-muted focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Taxe habitation annuelle</label>
            <Input type="number" placeholder="0" className="bg-midnight-700 border-midnight-600 text-text-primary placeholder:text-text-muted focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Assurances annuelles</label>
            <Input type="number" placeholder="2000" className="bg-midnight-700 border-midnight-600 text-text-primary placeholder:text-text-muted focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20" />
          </div>
        </div>
      </Card>

      <Card className="bg-midnight-800 border-midnight-700 hover:border-gold-500 transition-all duration-300 shadow-xl p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-gold-500" />
          Charges Courantes
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Alimentation mensuel</label>
            <Input type="number" placeholder="600" className="bg-midnight-700 border-midnight-600 text-text-primary placeholder:text-text-muted focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Énergie mensuel</label>
            <Input type="number" placeholder="150" className="bg-midnight-700 border-midnight-600 text-text-primary placeholder:text-text-muted focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Transport mensuel</label>
            <Input type="number" placeholder="200" className="bg-midnight-700 border-midnight-600 text-text-primary placeholder:text-text-muted focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Télécommunications mensuel</label>
            <Input type="number" placeholder="80" className="bg-midnight-700 border-midnight-600 text-text-primary placeholder:text-text-muted focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20" />
          </div>
        </div>
      </Card>

      <Card className="bg-midnight-800 border-midnight-700 hover:border-gold-500 transition-all duration-300 shadow-xl p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-gold-500" />
          Crédits à la Consommation
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Mensualité totale</label>
            <Input type="number" placeholder="0" className="bg-midnight-700 border-midnight-600 text-text-primary placeholder:text-text-muted focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Capital restant dû</label>
            <Input type="number" placeholder="0" className="bg-midnight-700 border-midnight-600 text-text-primary placeholder:text-text-muted focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20" />
          </div>
        </div>
      </Card>

      <Card className="bg-midnight-800 border-midnight-700 hover:border-gold-500 transition-all duration-300 shadow-xl p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
          <Users className="w-6 h-6 text-gold-500" />
          Charges Familiales
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Frais scolarité annuels</label>
            <Input type="number" placeholder="5000" className="bg-midnight-700 border-midnight-600 text-text-primary placeholder:text-text-muted focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Frais garde enfants (mensuel)</label>
            <Input type="number" placeholder="400" className="bg-midnight-700 border-midnight-600 text-text-primary placeholder:text-text-muted focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Pensions alimentaires versées</label>
            <Input type="number" placeholder="0" className="bg-midnight-700 border-midnight-600 text-text-primary placeholder:text-text-muted focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20" />
          </div>
        </div>
      </Card>

      <Card className="bg-midnight-800 border-midnight-700 hover:border-gold-500 transition-all duration-300 shadow-xl p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
          <PiggyBank className="w-6 h-6 text-gold-500" />
          Épargne Régulière
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Épargne sécurité mensuelle</label>
            <Input type="number" placeholder="300" className="bg-midnight-700 border-midnight-600 text-text-primary placeholder:text-text-muted focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Épargne projets mensuelle</label>
            <Input type="number" placeholder="200" className="bg-midnight-700 border-midnight-600 text-text-primary placeholder:text-text-muted focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Épargne retraite mensuelle</label>
            <Input type="number" placeholder="500" className="bg-midnight-700 border-midnight-600 text-text-primary placeholder:text-text-muted focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20" />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button className="bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-midnight-900 font-semibold px-8 py-3 shadow-lg hover:shadow-gold transition-all duration-300">
          Enregistrer les charges
        </Button>
      </div>
    </div>
  )
}
