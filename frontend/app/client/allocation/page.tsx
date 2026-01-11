'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PROFILS_RISQUE, STRATEGIES } from '@/lib/constants';
import { optimizationApi } from '@/lib/api/endpoints/optimization';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AllocationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [allocation, setAllocation] = useState<any>(null);
  const [profil, setProfil] = useState<any>(null);
  const [enveloppes, setEnveloppes] = useState<any>(null);
  
  const [horizonInvestissement, setHorizonInvestissement] = useState(20);
  const [toleranceRisque, setToleranceRisque] = useState<'faible' | 'moderee' | 'elevee'>('moderee');
  const [strategie, setStrategie] = useState<'lazy' | 'lifecycle' | 'tax_optimized'>('lazy');

  useEffect(() => {
    const profilStr = localStorage.getItem('client_profil');
    const enveloppesStr = localStorage.getItem('client_enveloppes');
    
    if (!profilStr || !enveloppesStr) {
      alert('Veuillez compléter les étapes précédentes');
      router.push('/client/profil');
      return;
    }

    setProfil(JSON.parse(profilStr));
    setEnveloppes(JSON.parse(enveloppesStr));
  }, [router]);

  const calculerAllocation = async () => {
    if (!profil || !enveloppes) return;

    setLoading(true);
    try {
      const request = {
        profil: {
          age: profil.age,
          horizon_investissement: horizonInvestissement,
          tolerance_risque: toleranceRisque,
        },
        enveloppes: {
          ...(enveloppes.pea > 0 && { pea: { montant: enveloppes.pea } }),
          ...(enveloppes.cto > 0 && { cto: { montant: enveloppes.cto } }),
          ...(enveloppes.assurance_vie > 0 && { assurance_vie: { montant: enveloppes.assurance_vie } }),
          ...(enveloppes.societe_is > 0 && { 
            societe_is: { 
              montant: enveloppes.societe_is,
              taux_is: enveloppes.taux_is || 15 
            } 
          }),
        },
        strategie,
      };

      const result = await optimizationApi.optimizeAllocation(request);
      setAllocation(result);
      
      // Sauvegarder pour les étapes suivantes
      localStorage.setItem('client_allocation', JSON.stringify({
        request,
        result,
      }));
    } catch (error) {
      console.error('Erreur lors du calcul d\'allocation:', error);
      alert('Erreur lors du calcul. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const pieData = allocation?.allocation_globale 
    ? Object.entries(allocation.allocation_globale).map(([name, value]) => ({
        name,
        value: value as number,
      }))
    : [];

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Allocation d&apos;Actifs</CardTitle>
            <CardDescription>Étape 3/6 - Définissez votre stratégie d&apos;investissement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="horizon">Horizon d&apos;investissement (années)</Label>
                <Input
                  id="horizon"
                  type="number"
                  min="1"
                  max="50"
                  value={horizonInvestissement}
                  onChange={(e) => setHorizonInvestissement(Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="risque">Tolérance au risque</Label>
                <Select
                  id="risque"
                  value={toleranceRisque}
                  onChange={(e) => setToleranceRisque(e.target.value as any)}
                >
                  {PROFILS_RISQUE.map(profil => (
                    <option key={profil.value} value={profil.value}>
                      {profil.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="strategie">Stratégie</Label>
                <Select
                  id="strategie"
                  value={strategie}
                  onChange={(e) => setStrategie(e.target.value as any)}
                >
                  {STRATEGIES.map(strat => (
                    <option key={strat.value} value={strat.value}>
                      {strat.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <Button 
              onClick={calculerAllocation} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Calcul en cours...' : 'Calculer l\'allocation optimale'}
            </Button>

            {allocation && (
              <div className="space-y-6 mt-8">
                <div className="border-t pt-6">
                  <h3 className="text-xl font-semibold mb-4">Allocation Globale</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Performance Attendue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Rendement annuel:</span>
                          <span className="font-semibold">
                            {allocation.performance_attendue?.rendement_annuel?.toFixed(2) || 'N/A'}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Volatilité:</span>
                          <span className="font-semibold">
                            {allocation.performance_attendue?.volatilite?.toFixed(2) || 'N/A'}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Fiscalité Estimée</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Impôt annuel:</span>
                          <span className="font-semibold">
                            {allocation.fiscalite_estimee?.impot_annuel?.toLocaleString('fr-FR') || 'N/A'} €
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total sur horizon:</span>
                          <span className="font-semibold">
                            {allocation.fiscalite_estimee?.impot_total_horizon?.toLocaleString('fr-FR') || 'N/A'} €
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6 border-t">
              <Button variant="outline" onClick={() => router.push('/client/enveloppes')}>
                Précédent
              </Button>
              <Button 
                onClick={() => router.push('/client/optimisation')}
                disabled={!allocation}
              >
                Suivant : Optimisation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
