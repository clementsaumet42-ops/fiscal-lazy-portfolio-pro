'use client'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function ChargesForm() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">🏡 Charges Fixes</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Crédit immobilier mensuel</label>
            <Input type="number" placeholder="1200" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Loyer mensuel</label>
            <Input type="number" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Charges copropriété (mensuel)</label>
            <Input type="number" placeholder="150" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Taxe foncière annuelle</label>
            <Input type="number" placeholder="1500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Taxe habitation annuelle</label>
            <Input type="number" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Assurances annuelles</label>
            <Input type="number" placeholder="2000" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">🛒 Charges Courantes</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Alimentation mensuel</label>
            <Input type="number" placeholder="600" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Énergie mensuel</label>
            <Input type="number" placeholder="150" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Transport mensuel</label>
            <Input type="number" placeholder="200" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Télécommunications mensuel</label>
            <Input type="number" placeholder="80" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">💳 Crédits à la Consommation</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Mensualité totale</label>
            <Input type="number" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Capital restant dû</label>
            <Input type="number" placeholder="0" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">👨‍👩‍👧‍👦 Charges Familiales</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Frais scolarité annuels</label>
            <Input type="number" placeholder="5000" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Frais garde enfants (mensuel)</label>
            <Input type="number" placeholder="400" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Pensions alimentaires versées</label>
            <Input type="number" placeholder="0" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">💰 Épargne Régulière</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Épargne sécurité mensuelle</label>
            <Input type="number" placeholder="300" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Épargne projets mensuelle</label>
            <Input type="number" placeholder="200" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Épargne retraite mensuelle</label>
            <Input type="number" placeholder="500" />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Enregistrer les charges
        </Button>
      </div>
    </div>
  )
}
