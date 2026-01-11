'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

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

export default function ETFListPage() {
  const [etfs, setEtfs] = useState<ETF[]>([]);
  const [filteredETFs, setFilteredETFs] = useState<ETF[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPEA, setFilterPEA] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadETFs();
  }, []);

  useEffect(() => {
    filterETFs();
  }, [searchTerm, filterPEA, etfs]);

  const loadETFs = async () => {
    try {
      // Données de démonstration
      const demoETFs: ETF[] = [
        {
          isin: 'FR0011869353',
          ticker: 'EWLD.PA',
          nom: 'Amundi MSCI World UCITS ETF EUR',
          classe_actif: 'actions_monde',
          eligible_pea: true,
          eligible_opcvm_actions_is: true,
          pourcentage_actions: 100.0,
          type_distribution: 'capitalisant',
          ter: 0.38,
          emetteur: 'Amundi',
          description: 'Exposition monde via méthodologie PEA-compatible'
        },
        {
          isin: 'FR0013412285',
          ticker: 'PCEU.PA',
          nom: 'Amundi MSCI Europe UCITS ETF EUR',
          classe_actif: 'actions_europe',
          eligible_pea: true,
          eligible_opcvm_actions_is: true,
          pourcentage_actions: 100.0,
          type_distribution: 'capitalisant',
          ter: 0.15,
          emetteur: 'Amundi',
          description: 'Actions large cap Europe. TER très bas'
        },
        {
          isin: 'LU1681043599',
          ticker: 'PAEEM.PA',
          nom: 'Amundi MSCI Emerging Markets UCITS ETF EUR',
          classe_actif: 'actions_emergents',
          eligible_pea: false,
          eligible_opcvm_actions_is: true,
          pourcentage_actions: 100.0,
          type_distribution: 'capitalisant',
          ter: 0.20,
          emetteur: 'Amundi',
          description: 'Actions marchés émergents. Non PEA'
        },
        {
          isin: 'FR0013412020',
          ticker: 'SP500.PA',
          nom: 'Amundi S&P 500 UCITS ETF EUR',
          classe_actif: 'actions_usa',
          eligible_pea: true,
          eligible_opcvm_actions_is: true,
          pourcentage_actions: 100.0,
          type_distribution: 'capitalisant',
          ter: 0.15,
          emetteur: 'Amundi',
          description: 'Exposition S&P 500 éligible PEA'
        }
      ];
      
      setEtfs(demoETFs);
      setFilteredETFs(demoETFs);
    } catch (error) {
      console.error('Erreur chargement ETFs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterETFs = () => {
    let filtered = etfs;

    if (searchTerm) {
      filtered = filtered.filter(etf =>
        etf.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        etf.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        etf.isin.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterPEA) {
      filtered = filtered.filter(etf => etf.eligible_pea);
    }

    setFilteredETFs(filtered);
  };

  const getClasseActifLabel = (classe: string) => {
    const labels: Record<string, string> = {
      'actions_monde': 'Actions Monde',
      'actions_europe': 'Actions Europe',
      'actions_usa': 'Actions USA',
      'actions_emergents': 'Actions Émergents',
      'obligations_gouvernementales': 'Obligations Gouv.',
      'obligations_corporate': 'Obligations Corp.',
      'small_caps': 'Small Caps',
      'or': 'Or'
    };
    return labels[classe] || classe;
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Univers d'ETFs</h1>
        <p className="text-gray-600 mt-1">
          {filteredETFs.length} ETF{filteredETFs.length > 1 ? 's' : ''} disponible{filteredETFs.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Rechercher par nom, ticker ou ISIN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              variant={filterPEA ? 'default' : 'outline'}
              onClick={() => setFilterPEA(!filterPEA)}
            >
              {filterPEA ? <CheckCircle className="w-4 h-4 mr-2" /> : null}
              Éligibles PEA uniquement
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des ETFs */}
      <div className="grid grid-cols-1 gap-4">
        {filteredETFs.map((etf) => (
          <Link key={etf.isin} href={`/etfs/${etf.isin}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{etf.nom}</h3>
                      {etf.eligible_pea && (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          PEA
                        </Badge>
                      )}
                      {!etf.eligible_pea && (
                        <Badge variant="secondary">
                          <XCircle className="w-3 h-3 mr-1" />
                          Non PEA
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-6 text-sm text-gray-600 mb-2">
                      <span><strong>ISIN:</strong> {etf.isin}</span>
                      <span><strong>Ticker:</strong> {etf.ticker}</span>
                      <span><strong>Émetteur:</strong> {etf.emetteur}</span>
                    </div>

                    <p className="text-sm text-gray-700 mb-3">{etf.description}</p>

                    <div className="flex gap-4 text-sm">
                      <Badge variant="outline">{getClasseActifLabel(etf.classe_actif)}</Badge>
                      <span className="text-gray-600">
                        <strong>TER:</strong> {etf.ter}%
                      </span>
                      <span className="text-gray-600">
                        <strong>Actions:</strong> {etf.pourcentage_actions}%
                      </span>
                      <Badge variant="outline">{etf.type_distribution}</Badge>
                    </div>
                  </div>

                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredETFs.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-600">Aucun ETF ne correspond à vos critères de recherche.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
