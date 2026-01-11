'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { generateCustomReport } from '@/lib/utils/pdf';
import { formatCurrency, formatPercent, formatDate } from '@/lib/utils/format';

export default function RapportPage() {
  const router = useRouter();
  const [profil, setProfil] = useState<any>(null);
  const [enveloppes, setEnveloppes] = useState<any>(null);
  const [allocation, setAllocation] = useState<any>(null);
  const [backtest, setBacktest] = useState<any>(null);

  useEffect(() => {
    const profilStr = localStorage.getItem('client_profil');
    const enveloppesStr = localStorage.getItem('client_enveloppes');
    const allocationStr = localStorage.getItem('client_allocation');
    const backtestStr = localStorage.getItem('client_backtest');
    
    if (!profilStr || !enveloppesStr || !allocationStr) {
      alert('Veuillez compléter les étapes précédentes');
      router.push('/client/profil');
      return;
    }

    setProfil(JSON.parse(profilStr));
    setEnveloppes(JSON.parse(enveloppesStr));
    setAllocation(JSON.parse(allocationStr));
    if (backtestStr) {
      setBacktest(JSON.parse(backtestStr));
    }
  }, [router]);

  const genererPDF = () => {
    if (!profil || !enveloppes) return;

    const reportData = {
      nom: profil.nom,
      age: profil.age,
      revenu_annuel: profil.revenu_annuel,
      taux_imposition: profil.taux_imposition,
      enveloppes,
      allocation: allocation?.result,
      backtest,
    };

    generateCustomReport(reportData, `rapport_${profil.nom.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
  };

  const montantTotal = enveloppes 
    ? (enveloppes.pea || 0) + (enveloppes.cto || 0) + 
      (enveloppes.assurance_vie || 0) + (enveloppes.societe_is || 0)
    : 0;

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Génération du Rapport</CardTitle>
            <CardDescription>Étape 6/6 - Résumé et export PDF</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div id="rapport-content" className="space-y-6">
              {/* Informations Client */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardHeader>
                  <CardTitle>Informations Client</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nom</p>
                    <p className="font-semibold">{profil?.nom}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Âge</p>
                    <p className="font-semibold">{profil?.age} ans</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Revenu Annuel</p>
                    <p className="font-semibold">{formatCurrency(profil?.revenu_annuel || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">TMI</p>
                    <p className="font-semibold">{profil?.taux_imposition}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Situation</p>
                    <p className="font-semibold">{profil?.situation_familiale}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Parts Fiscales</p>
                    <p className="font-semibold">{profil?.nombre_parts_fiscales}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Enveloppes */}
              <Card>
                <CardHeader>
                  <CardTitle>Répartition par Enveloppe</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {enveloppes?.pea > 0 && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">PEA</span>
                      <span className="font-semibold text-blue-600">
                        {formatCurrency(enveloppes.pea)}
                      </span>
                    </div>
                  )}
                  {enveloppes?.cto > 0 && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">CTO</span>
                      <span className="font-semibold text-blue-600">
                        {formatCurrency(enveloppes.cto)}
                      </span>
                    </div>
                  )}
                  {enveloppes?.assurance_vie > 0 && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Assurance Vie</span>
                      <span className="font-semibold text-blue-600">
                        {formatCurrency(enveloppes.assurance_vie)}
                      </span>
                    </div>
                  )}
                  {enveloppes?.societe_is > 0 && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Société IS</span>
                      <span className="font-semibold text-blue-600">
                        {formatCurrency(enveloppes.societe_is)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 font-bold text-lg">
                    <span>Total</span>
                    <span className="text-blue-600">{formatCurrency(montantTotal)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Allocation */}
              {allocation?.result?.allocation_globale && (
                <Card>
                  <CardHeader>
                    <CardTitle>Allocation d&apos;Actifs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(allocation.result.allocation_globale).map(([asset, pct]: [string, any]) => (
                      <div key={asset} className="flex justify-between items-center">
                        <span className="font-medium">{asset}</span>
                        <div className="flex items-center gap-4">
                          <div className="w-48 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="font-semibold w-16 text-right">
                            {formatPercent(pct)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Performance */}
              {allocation?.result?.performance_attendue && (
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Attendue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Rendement Annuel</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatPercent(allocation.result.performance_attendue.rendement_annuel)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Volatilité</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {formatPercent(allocation.result.performance_attendue.volatilite)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Fiscalité */}
              {allocation?.result?.fiscalite_estimee && (
                <Card>
                  <CardHeader>
                    <CardTitle>Impact Fiscal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Impôt Annuel Estimé</p>
                        <p className="text-2xl font-bold text-red-600">
                          {formatCurrency(allocation.result.fiscalite_estimee.impot_annuel)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total sur Horizon</p>
                        <p className="text-2xl font-bold text-red-600">
                          {formatCurrency(allocation.result.fiscalite_estimee.impot_total_horizon)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Backtest Results */}
              {backtest?.performance && (
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Historique (Backtest)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">CAGR</p>
                        <p className="text-xl font-bold text-blue-600">
                          {formatPercent(backtest.performance.cagr)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Volatilité</p>
                        <p className="text-xl font-bold text-orange-600">
                          {formatPercent(backtest.performance.volatilite)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Sharpe Ratio</p>
                        <p className="text-xl font-bold text-green-600">
                          {backtest.performance.sharpe_ratio.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Max Drawdown</p>
                        <p className="text-xl font-bold text-red-600">
                          {formatPercent(backtest.performance.max_drawdown)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Disclaimer */}
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Avertissement Légal</h4>
                  <p className="text-sm text-yellow-700">
                    Ce rapport est fourni à titre informatif uniquement. Il ne constitue pas un 
                    conseil en investissement, financier, juridique ou fiscal. Les performances 
                    passées ne préjugent pas des performances futures. Consultez un expert-comptable 
                    qualifié avant toute décision d&apos;investissement.
                  </p>
                  <p className="text-xs text-yellow-600 mt-2">
                    Généré le {formatDate(new Date())} par Fiscal Lazy Portfolio Pro
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-4 pt-6 border-t">
              <Button 
                onClick={genererPDF}
                size="lg"
                className="flex-1"
              >
                📄 Télécharger le Rapport PDF
              </Button>
            </div>

            <div className="flex justify-between pt-6 border-t">
              <Button variant="outline" onClick={() => router.push('/client/backtests')}>
                Précédent
              </Button>
              <Button onClick={() => router.push('/dashboard')}>
                Terminer & Aller au Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
