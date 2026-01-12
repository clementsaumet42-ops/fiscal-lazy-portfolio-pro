'use client'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

export function RevenusForm() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">💰 Revenus Salariaux</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Salaire net mensuel</label>
            <Input type="number" placeholder="3500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Primes annuelles</label>
            <Input type="number" placeholder="5000" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Avantages en nature</label>
            <Input type="number" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Participation / Intéressement</label>
            <Input type="number" placeholder="2000" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">🏠 Revenus Fonciers</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Loyers mensuels bruts</label>
            <Input type="number" placeholder="1200" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Charges déductibles</label>
            <Input type="number" placeholder="300" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Régime fiscal</label>
            <Select>
              <option value="">Sélectionner</option>
              <option value="micro_foncier">Micro-foncier</option>
              <option value="reel">Réel</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">💼 Revenus Financiers</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Intérêts</label>
            <Input type="number" placeholder="500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Dividendes</label>
            <Input type="number" placeholder="1500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Plus-values</label>
            <Input type="number" placeholder="3000" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Régime fiscal</label>
            <Select>
              <option value="">Sélectionner</option>
              <option value="flat_tax">Flat tax (30%)</option>
              <option value="bareme_progressif">Barème progressif</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">📊 Autres Revenus</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Pensions / Retraites</label>
            <Input type="number" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Autres revenus</label>
            <Input type="number" placeholder="0" />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Enregistrer les revenus
        </Button>
      </div>
    </div>
  )
}
