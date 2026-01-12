'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useClientStore } from '@/store/client-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BilanStepper } from '@/components/bilan/BilanStepper'
import { RevenusCharges } from '@/lib/types/bilan'
import { DollarSign, CreditCard, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function RevenusChargesPage() {
  const router = useRouter()
  const { bilan, setRevenus } = useClientStore()
  
  const [formData, setFormData] = useState<RevenusCharges>(
    bilan.revenus || {
      revenus: {
        salaires_nets_mensuels: 0,
        revenus_locatifs_mensuels: 0,
        autres_revenus_mensuels: 0,
      },
      charges: {
        credit_immobilier_mensuel: 0,
        loyer_mensuel: 0,
        autres_credits_mensuels: 0,
        autres_charges_mensuelles: 0,
      },
      capacite_epargne_mensuelle: 0,
    }
  )

  // Calcul automatique de la capacité d'épargne
  useEffect(() => {
    const totalRevenus = 
      formData.revenus.salaires_nets_mensuels +
      formData.revenus.revenus_locatifs_mensuels +
      formData.revenus.autres_revenus_mensuels

    const totalCharges =
      formData.charges.credit_immobilier_mensuel +
      formData.charges.loyer_mensuel +
      formData.charges.autres_credits_mensuels +
      formData.charges.autres_charges_mensuelles

    setFormData(prev => ({
      ...prev,
      capacite_epargne_mensuelle: Math.max(0, totalRevenus - totalCharges)
    }))
  }, [formData.revenus, formData.charges])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setRevenus(formData)
    router.push('/client/bilan/patrimoine')
  }

  const handleRevenuChange = (field: keyof typeof formData.revenus, value: number) => {
    setFormData(prev => ({
      ...prev,
      revenus: { ...prev.revenus, [field]: value }
    }))
  }

  const handleChargeChange = (field: keyof typeof formData.charges, value: number) => {
    setFormData(prev => ({
      ...prev,
      charges: { ...prev.charges, [field]: value }
    }))
  }

  const totalRevenus = 
    formData.revenus.salaires_nets_mensuels +
    formData.revenus.revenus_locatifs_mensuels +
    formData.revenus.autres_revenus_mensuels

  const totalCharges =
    formData.charges.credit_immobilier_mensuel +
    formData.charges.loyer_mensuel +
    formData.charges.autres_credits_mensuels +
    formData.charges.autres_charges_mensuelles

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📋 Bilan Patrimonial</h1>
        <p className="text-gray-600">Étape 2/4 - Revenus et charges</p>
      </div>

      <BilanStepper currentStep={2} />
      
      <form onSubmit={handleSubmit} className="space-y-6 mt-8">
        {/* Revenus */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <CardTitle>Revenus mensuels</CardTitle>
            </div>
            <CardDescription>
              Renseignez l'ensemble des revenus mensuels nets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Salaires nets mensuels (€)</label>
              <Input
                type="number"
                min="0"
                step="100"
                value={formData.revenus.salaires_nets_mensuels}
                onChange={(e) => handleRevenuChange('salaires_nets_mensuels', parseFloat(e.target.value) || 0)}
                placeholder="3500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Revenus locatifs mensuels (€)</label>
              <Input
                type="number"
                min="0"
                step="100"
                value={formData.revenus.revenus_locatifs_mensuels}
                onChange={(e) => handleRevenuChange('revenus_locatifs_mensuels', parseFloat(e.target.value) || 0)}
                placeholder="800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Autres revenus mensuels (€)</label>
              <Input
                type="number"
                min="0"
                step="100"
                value={formData.revenus.autres_revenus_mensuels}
                onChange={(e) => handleRevenuChange('autres_revenus_mensuels', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">Pensions, rentes, dividendes...</p>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total revenus mensuels</span>
                <span className="text-xl font-bold text-green-600">{formatCurrency(totalRevenus)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charges */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-red-600" />
              <CardTitle>Charges mensuelles</CardTitle>
            </div>
            <CardDescription>
              Renseignez l'ensemble des charges mensuelles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Crédit immobilier mensuel (€)</label>
              <Input
                type="number"
                min="0"
                step="100"
                value={formData.charges.credit_immobilier_mensuel}
                onChange={(e) => handleChargeChange('credit_immobilier_mensuel', parseFloat(e.target.value) || 0)}
                placeholder="1200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Loyer mensuel (€)</label>
              <Input
                type="number"
                min="0"
                step="100"
                value={formData.charges.loyer_mensuel}
                onChange={(e) => handleChargeChange('loyer_mensuel', parseFloat(e.target.value) || 0)}
                placeholder="800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Autres crédits mensuels (€)</label>
              <Input
                type="number"
                min="0"
                step="50"
                value={formData.charges.autres_credits_mensuels}
                onChange={(e) => handleChargeChange('autres_credits_mensuels', parseFloat(e.target.value) || 0)}
                placeholder="300"
              />
              <p className="text-xs text-gray-500 mt-1">Crédit auto, crédit conso...</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Autres charges mensuelles (€)</label>
              <Input
                type="number"
                min="0"
                step="100"
                value={formData.charges.autres_charges_mensuelles}
                onChange={(e) => handleChargeChange('autres_charges_mensuelles', parseFloat(e.target.value) || 0)}
                placeholder="1500"
              />
              <p className="text-xs text-gray-500 mt-1">Vie quotidienne, assurances, impôts...</p>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total charges mensuelles</span>
                <span className="text-xl font-bold text-red-600">{formatCurrency(totalCharges)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Capacité d'épargne */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-blue-900">Capacité d'épargne mensuelle</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-lg">Disponible pour épargner</span>
              <span className="text-3xl font-bold text-blue-900">
                {formatCurrency(formData.capacite_epargne_mensuelle)}
              </span>
            </div>
            <p className="text-sm text-blue-700 mt-2">
              Calculé automatiquement : Revenus - Charges
            </p>
          </CardContent>
        </Card>

        {/* Boutons de navigation */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/client/bilan/situation')}
          >
            Retour : Situation
          </Button>
          <Button type="submit" size="lg">
            Suivant : Patrimoine existant
          </Button>
        </div>
      </form>
    </div>
  )
}
