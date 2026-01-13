'use client'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

export function ImmobilierForm() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">🏠 Résidence Principale</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Type de bien</label>
            <Select>
              <option value="">Sélectionner</option>
              <option value="appartement">Appartement</option>
              <option value="maison">Maison</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Valeur de marché</label>
            <Input type="number" placeholder="350000" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Année d'acquisition</label>
            <Input type="number" placeholder="2020" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Prix d'acquisition</label>
            <Input type="number" placeholder="300000" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Surface (m²)</label>
            <Input type="number" placeholder="80" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Crédit restant dû</label>
            <Input type="number" placeholder="200000" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Adresse</label>
            <Input type="text" placeholder="12 rue de la Paix, 75001 Paris" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">🏢 Biens Locatifs</h2>
          <Button variant="outline" className="text-sm">+ Ajouter un bien</Button>
        </div>
        <div className="text-gray-500 text-sm">
          Aucun bien locatif enregistré. Cliquez sur &quot;Ajouter un bien&quot; pour commencer.
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">🏛️ SCPI</h2>
          <Button variant="outline" className="text-sm">+ Ajouter une SCPI</Button>
        </div>
        <div className="text-gray-500 text-sm">
          Aucune SCPI enregistrée. Les SCPI permettent d&apos;investir dans l&apos;immobilier de manière mutualisée.
        </div>
      </Card>

      <Card className="p-6 bg-blue-50">
        <h3 className="font-semibold mb-2">📊 Résumé Patrimoine Immobilier</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Valeur totale brute:</span>
            <span className="font-semibold float-right">350 000 €</span>
          </div>
          <div>
            <span className="text-gray-600">Endettement total:</span>
            <span className="font-semibold float-right">200 000 €</span>
          </div>
          <div>
            <span className="text-gray-600">Valeur nette:</span>
            <span className="font-semibold float-right text-green-600">150 000 €</span>
          </div>
          <div>
            <span className="text-gray-600">Revenus locatifs annuels:</span>
            <span className="font-semibold float-right">0 €</span>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Enregistrer le patrimoine immobilier
        </Button>
      </div>
    </div>
  )
}
