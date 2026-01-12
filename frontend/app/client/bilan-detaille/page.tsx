'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RevenusForm } from '@/components/bilan/RevenusForm'
import { ChargesForm } from '@/components/bilan/ChargesForm'
import { ImmobilierForm } from '@/components/bilan/ImmobilierForm'
import { FinancierForm } from '@/components/bilan/FinancierForm'
import { FiscalDashboard } from '@/components/bilan/FiscalDashboard'
import { SuccessionSimulator } from '@/components/bilan/SuccessionSimulator'

export default function BilanDetaillePage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Bilan Patrimonial Détaillé</h1>
      
      <Tabs defaultValue="revenus" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="revenus">💰 Revenus</TabsTrigger>
          <TabsTrigger value="charges">📊 Charges</TabsTrigger>
          <TabsTrigger value="immobilier">🏠 Immobilier</TabsTrigger>
          <TabsTrigger value="financier">💼 Financier</TabsTrigger>
          <TabsTrigger value="fiscal">📋 Fiscal</TabsTrigger>
          <TabsTrigger value="succession">⚖️ Succession</TabsTrigger>
        </TabsList>
        
        <TabsContent value="revenus"><RevenusForm /></TabsContent>
        <TabsContent value="charges"><ChargesForm /></TabsContent>
        <TabsContent value="immobilier"><ImmobilierForm /></TabsContent>
        <TabsContent value="financier"><FinancierForm /></TabsContent>
        <TabsContent value="fiscal"><FiscalDashboard /></TabsContent>
        <TabsContent value="succession"><SuccessionSimulator /></TabsContent>
      </Tabs>
    </div>
  )
}
