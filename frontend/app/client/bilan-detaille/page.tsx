'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RevenusForm } from '@/components/bilan/RevenusForm'
import { ChargesForm } from '@/components/bilan/ChargesForm'
import { ImmobilierForm } from '@/components/bilan/ImmobilierForm'
import { FinancierForm } from '@/components/bilan/FinancierForm'
import { FiscalDashboard } from '@/components/bilan/FiscalDashboard'
import { SuccessionSimulator } from '@/components/bilan/SuccessionSimulator'
import { Coins, Receipt, Home, Briefcase, FileText, Scale } from 'lucide-react'

export default function BilanDetaillePage() {
  return (
    <div className="min-h-screen bg-midnight-950">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            Bilan Patrimonial Professionnel
          </h1>
          <p className="text-text-secondary">
            Analyse complète et détaillée du patrimoine client
          </p>
        </div>
        
        <Tabs defaultValue="revenus" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-midnight-800 border border-midnight-700 p-1 rounded-lg mb-6">
            <TabsTrigger 
              value="revenus" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold-500 data-[state=active]:to-gold-400 data-[state=active]:text-midnight-900 data-[state=active]:font-semibold data-[state=active]:shadow-lg text-text-secondary hover:text-text-primary transition-all"
            >
              <Coins className="w-4 h-4 mr-2" />
              Revenus
            </TabsTrigger>
            <TabsTrigger 
              value="charges"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold-500 data-[state=active]:to-gold-400 data-[state=active]:text-midnight-900 data-[state=active]:font-semibold data-[state=active]:shadow-lg text-text-secondary hover:text-text-primary transition-all"
            >
              <Receipt className="w-4 h-4 mr-2" />
              Charges
            </TabsTrigger>
            <TabsTrigger 
              value="immobilier"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold-500 data-[state=active]:to-gold-400 data-[state=active]:text-midnight-900 data-[state=active]:font-semibold data-[state=active]:shadow-lg text-text-secondary hover:text-text-primary transition-all"
            >
              <Home className="w-4 h-4 mr-2" />
              Immobilier
            </TabsTrigger>
            <TabsTrigger 
              value="financier"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold-500 data-[state=active]:to-gold-400 data-[state=active]:text-midnight-900 data-[state=active]:font-semibold data-[state=active]:shadow-lg text-text-secondary hover:text-text-primary transition-all"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Financier
            </TabsTrigger>
            <TabsTrigger 
              value="fiscal"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold-500 data-[state=active]:to-gold-400 data-[state=active]:text-midnight-900 data-[state=active]:font-semibold data-[state=active]:shadow-lg text-text-secondary hover:text-text-primary transition-all"
            >
              <FileText className="w-4 h-4 mr-2" />
              Fiscal
            </TabsTrigger>
            <TabsTrigger 
              value="succession"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold-500 data-[state=active]:to-gold-400 data-[state=active]:text-midnight-900 data-[state=active]:font-semibold data-[state=active]:shadow-lg text-text-secondary hover:text-text-primary transition-all"
            >
              <Scale className="w-4 h-4 mr-2" />
              Succession
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="revenus"><RevenusForm /></TabsContent>
          <TabsContent value="charges"><ChargesForm /></TabsContent>
          <TabsContent value="immobilier"><ImmobilierForm /></TabsContent>
          <TabsContent value="financier"><FinancierForm /></TabsContent>
          <TabsContent value="fiscal"><FiscalDashboard /></TabsContent>
          <TabsContent value="succession"><SuccessionSimulator /></TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
