'use client'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function FinancierForm() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">💰 Liquidités</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Comptes courants</label>
            <Input type="number" placeholder="5000" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Livret A</label>
            <Input type="number" placeholder="22950" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">LDDS</label>
            <Input type="number" placeholder="12000" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">LEP</label>
            <Input type="number" placeholder="10000" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Autres livrets</label>
            <Input type="number" placeholder="0" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">📈 PEA (Plan d&apos;Épargne en Actions)</h2>
          <Button variant="outline" className="text-sm">+ Ajouter un PEA</Button>
        </div>
        <div className="text-gray-500 text-sm">
          Aucun PEA enregistré. Le PEA permet d&apos;investir en actions avec une fiscalité avantageuse après 5 ans.
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">💼 CTO (Compte-Titres Ordinaire)</h2>
          <Button variant="outline" className="text-sm">+ Ajouter un CTO</Button>
        </div>
        <div className="text-gray-500 text-sm">
          Aucun CTO enregistré. Le CTO offre une grande liberté d&apos;investissement sans plafond.
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">🏦 Assurances-Vie</h2>
          <Button variant="outline" className="text-sm">+ Ajouter une AV</Button>
        </div>
        <div className="text-gray-500 text-sm">
          Aucune assurance-vie enregistrée. L&apos;assurance-vie offre une fiscalité avantageuse pour la transmission.
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">🎯 PER (Plan Épargne Retraite)</h2>
          <Button variant="outline" className="text-sm">+ Ajouter un PER</Button>
        </div>
        <div className="text-gray-500 text-sm">
          Aucun PER enregistré. Le PER permet de préparer sa retraite avec des avantages fiscaux.
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">₿ Cryptomonnaies</h2>
          <Button variant="outline" className="text-sm">+ Ajouter une plateforme</Button>
        </div>
        <div className="text-gray-500 text-sm">
          Aucun compte crypto enregistré. Attention : les cryptomonnaies sont soumises à la flat tax de 30%.
        </div>
      </Card>

      <Card className="p-6 bg-blue-50">
        <h3 className="font-semibold mb-2">📊 Résumé Patrimoine Financier</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Liquidités totales:</span>
            <span className="font-semibold float-right">49 950 €</span>
          </div>
          <div>
            <span className="text-gray-600">Valorisation PEA:</span>
            <span className="font-semibold float-right">0 €</span>
          </div>
          <div>
            <span className="text-gray-600">Valorisation CTO:</span>
            <span className="font-semibold float-right">0 €</span>
          </div>
          <div>
            <span className="text-gray-600">Assurances-vie:</span>
            <span className="font-semibold float-right">0 €</span>
          </div>
          <div>
            <span className="text-gray-600">PER:</span>
            <span className="font-semibold float-right">0 €</span>
          </div>
          <div>
            <span className="text-gray-600">Crypto:</span>
            <span className="font-semibold float-right">0 €</span>
          </div>
          <div className="col-span-2 pt-2 border-t border-gray-300">
            <span className="text-gray-900 font-semibold">Total valorisation:</span>
            <span className="font-bold float-right text-green-600 text-lg">49 950 €</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">Plus-values latentes:</span>
            <span className="font-semibold float-right">0 €</span>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Enregistrer le patrimoine financier
        </Button>
      </div>
    </div>
  )
}
