'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercent } from '@/lib/utils/format';

export default function OptimisationPage() {
  const router = useRouter();
  const [profil, setProfil] = useState<any>(null);
  const [enveloppes, setEnveloppes] = useState<any>(null);
  const [allocation, setAllocation] = useState<any>(null);

  useEffect(() => {
    const profilStr = localStorage.getItem('client_profil');
    const enveloppesStr = localStorage.getItem('client_enveloppes');
    const allocationStr = localStorage.getItem('client_allocation');
    
    if (!profilStr || !enveloppesStr || !allocationStr) {
      alert('Veuillez compléter les étapes précédentes');
      router.push('/client/profil');
      return;
    }

    setProfil(JSON.parse(profilStr));
    setEnveloppes(JSON.parse(enveloppesStr));
    setAllocation(JSON.parse(allocationStr));
  }, [router]);

  const montantTotal = enveloppes 
    ? (enveloppes.pea || 0) + (enveloppes.cto || 0) + 
      (enveloppes.assurance_vie || 0) + (enveloppes.societe_is || 0)
    : 0;

  const impotAnnuel = allocation?.result?.fiscalite_estimee?.impot_annuel || 0;
  const impotTotal = allocation?.result?.fiscalite_estimee?.impot_total_horizon || 0;
  const tauxEffectif = montantTotal > 0 ? (impotAnnuel / montantTotal) * 100 : 0;

  const optimisations = [
    {
      titre: 'Asset Location Optimale',
      description: 'Placement des actifs dans les enveloppes les plus avantageuses fiscalement',
      economie: impotTotal * 0.15, // Estimation 15% d\'économie
      details: [
        'Actions dans PEA (exonération après 5 ans)',
        'Obligations dans Assurance Vie (fiscalité attractive)',
        'ETF distribuants en CTO (PFU 30%)',
      ],
    },
    {
      titre: 'Tax-Loss Harvesting',
      description: 'Compensation des plus-values par des moins-values latentes',
      economie: impotAnnuel * 0.1, // 10% de l\'impôt annuel
      details: [
        'Identification des moins-values latentes',
        'Remplacement par ETF similaires',
        'Respect du délai de 30 jours',
      ],
    },
    {
      titre: 'Ordre de Retrait Optimal',
      description: 'Stratégie de retrait minimisant l\'impact fiscal',
      economie: impotTotal * 0.08,
      details: [
        'Privilégier le PEA après 5 ans',
        'Assurance Vie après 8 ans',
        'CTO en dernier recours',
      ],
    },
  ];

  const economieTotal = optimisations.reduce((sum, opt) => sum + opt.economie, 0);

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Optimisation Fiscale</CardTitle>
            <CardDescription>Étape 4/6 - Stratégies pour minimiser l&apos;impact fiscal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Résumé fiscal */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Impôt Annuel</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(impotAnnuel)}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Impôt Total Horizon</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(impotTotal)}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Taux Effectif</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">
                    {formatPercent(tauxEffectif)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Optimisations proposées */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Stratégies d&apos;Optimisation</h3>
              {optimisations.map((opt, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{opt.titre}</CardTitle>
                        <CardDescription>{opt.description}</CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Économie estimée</p>
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(opt.economie)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {opt.details.map((detail, idx) => (
                        <li key={idx}>{detail}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Économie totale */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-300">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold">Économie Totale Estimée</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Avec l&apos;application de toutes les stratégies
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-600">
                      {formatCurrency(economieTotal)}
                    </p>
                    <p className="text-sm text-gray-600">
                      soit {formatPercent((economieTotal / impotTotal) * 100)} du total
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Avertissement</h4>
              <p className="text-sm text-yellow-700">
                Ces estimations sont fournies à titre indicatif. L&apos;optimisation fiscale doit 
                être validée par un expert-comptable et adaptée à la situation spécifique de 
                chaque client. Les règles fiscales peuvent évoluer.
              </p>
            </div>

            <div className="flex justify-between pt-6 border-t">
              <Button variant="outline" onClick={() => router.push('/client/allocation')}>
                Précédent
              </Button>
              <Button onClick={() => router.push('/client/backtests')}>
                Suivant : Backtests
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
