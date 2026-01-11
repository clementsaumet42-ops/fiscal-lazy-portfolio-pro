'use client';

import { use, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, TrendingUp, Info, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { getClasseActifLabel } from '@/lib/utils';

interface ETF {
  isin: string;
  ticker: string;
  nom: string;
  classe_actif: string;
  eligible_pea: boolean;
  eligible_opcvm_actions_is: boolean;
  pourcentage_actions: number;
  type_distribution: string;
  ter: number;
  emetteur: string;
  description?: string;
}

interface Eligibility {
  enveloppe: string;
  eligible: boolean;
  raison: string;
}

export default function ETFDetailPage({ params }: { params: Promise<{ isin: string }> }) {
  const resolvedParams = use(params);
  const [etf, setEtf] = useState<ETF | null>(null);
  const [eligibilities, setEligibilities] = useState<Eligibility[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadETFDetails();
  }, [resolvedParams.isin]);

  const loadETFDetails = async () => {
    try {
      // Données de démonstration
      const demoETF: ETF = {
        isin: resolvedParams.isin,
        ticker: 'EWLD.PA',
        nom: 'Amundi MSCI World UCITS ETF EUR',
        classe_actif: 'actions_monde',
        eligible_pea: true,
        eligible_opcvm_actions_is: true,
        pourcentage_actions: 100.0,
        type_distribution: 'capitalisant',
        ter: 0.38,
        emetteur: 'Amundi',
        description: 'Exposition monde via méthodologie PEA-compatible. Réplication physique.'
      };

      const demoEligibilities: Eligibility[] = [
        { enveloppe: 'PEA', eligible: true, raison: 'ETF éligible PEA (≥75% actions UE)' },
        { enveloppe: 'CTO', eligible: true, raison: 'Tous les ETFs sont éligibles en CTO' },
        { enveloppe: 'Assurance-Vie', eligible: true, raison: 'OPCVM éligible en Assurance-Vie' },
        { enveloppe: 'PER', eligible: true, raison: 'OPCVM éligible en PER' }
      ];

      setEtf(demoETF);
      setEligibilities(demoEligibilities);
    } catch (error) {
      console.error('Erreur chargement ETF:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!etf) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-600">ETF non trouvé</p>
            <Link href="/etfs">
              <Button className="mt-4">Retour à la liste</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-600">
        <Link href="/etfs" className="hover:text-blue-600">ETFs</Link>
        <span className="mx-2">/</span>
        <span>{etf.isin}</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{etf.nom}</h1>
          <p className="text-gray-600 mt-1">{etf.emetteur}</p>
        </div>
        {etf.eligible_pea && (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="w-4 h-4 mr-2" />
            Éligible PEA
          </Badge>
        )}
      </div>

      {/* Informations principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">ISIN</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-gray-900">{etf.isin}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ticker</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-gray-900">{etf.ticker}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">TER Annuel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-600">{etf.ter}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">% Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-purple-600">{etf.pourcentage_actions}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{etf.description}</p>
        </CardContent>
      </Card>

      {/* Caractéristiques */}
      <Card>
        <CardHeader>
          <CardTitle>Caractéristiques</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-600">Classe d'actif</dt>
              <dd className="text-gray-900">{getClasseActifLabel(etf.classe_actif)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Type de distribution</dt>
              <dd className="text-gray-900 capitalize">{etf.type_distribution}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Émetteur</dt>
              <dd className="text-gray-900">{etf.emetteur}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">OPCVM Actions IS</dt>
              <dd className="text-gray-900">{etf.eligible_opcvm_actions_is ? 'Oui (≥90%)' : 'Non'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Éligibilité par enveloppe */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            Éligibilité par Enveloppe
          </CardTitle>
          <CardDescription>
            Vérification automatique selon le Code Général des Impôts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eligibilities.map((elig, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 ${
                  elig.eligible ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {elig.eligible ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <h4 className="font-semibold text-gray-900">{elig.enveloppe}</h4>
                </div>
                <p className="text-sm text-gray-700">{elig.raison}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Link href="/etfs">
          <Button variant="outline">Retour à la liste</Button>
        </Link>
        <Button>Ajouter au portefeuille</Button>
      </div>
    </div>
  );
}
