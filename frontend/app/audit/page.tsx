'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { AlertTriangle, CheckCircle, DollarSign, Target, Award } from 'lucide-react';

interface AuditResult {
  success: boolean;
  client_id: string;
  valeur_totale: number;
  plus_value_latente_totale: number;
  performance_globale_pct: number;
  allocation: {
    par_classe_actif: Record<string, number>;
    par_enveloppe: Record<string, number>;
    par_zone_geo: Record<string, number>;
    diversification_score: number;
  };
  analyse_fiscale: {
    economie_annuelle_estimee: number;
    cout_fiscal_actuel: number;
    cout_fiscal_optimal: number;
    taux_optimisation: number;
    recommandations: string[];
  };
  problemes_eligibilite: Array<{
    isin: string;
    nom_actif: string;
    enveloppe_type: string;
    probleme: string;
    impact: string;
    suggestion: string;
  }>;
  score_diversification: number;
  score_fiscal: number;
  score_global: number;
  top_recommandations: string[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AuditPage() {
  const [auditData, setAuditData] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runAudit = async () => {
    setLoading(true);
    try {
      // Données de démonstration
      const demoData: AuditResult = {
        success: true,
        client_id: 'demo_client',
        valeur_totale: 60000,
        plus_value_latente_totale: 11000,
        performance_globale_pct: 22.4,
        allocation: {
          par_classe_actif: {
            'Actions Monde': 41.7,
            'Actions Europe': 25.0,
            'Actions Emergents': 13.3,
            'Actions USA': 20.0
          },
          par_enveloppe: {
            'PEA': 66.7,
            'CTO': 13.3,
            'Assurance-Vie': 20.0
          },
          par_zone_geo: {
            'Monde': 41.7,
            'Europe': 25.0,
            'Emergents': 13.3,
            'USA': 20.0
          },
          diversification_score: 50.0
        },
        analyse_fiscale: {
          economie_annuelle_estimee: 985.0,
          cout_fiscal_actuel: 2315.0,
          cout_fiscal_optimal: 1330.0,
          taux_optimisation: 42.5,
          recommandations: [
            'Bon usage du PEA (66.7%)',
            'Envisager augmentation Assurance-Vie pour diversification fiscale'
          ]
        },
        problemes_eligibilite: [],
        score_diversification: 50.0,
        score_fiscal: 42.5,
        score_global: 47.0,
        top_recommandations: [
          '✅ Portefeuille bien diversifié géographiquement',
          '💰 Optimisation fiscale correcte - Économie de 985€/an',
          '📈 Performance globale solide: +22.4%'
        ]
      };
      
      setAuditData(demoData);
    } catch (error) {
      console.error('Erreur audit:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAudit();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Analyse du portefeuille en cours...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!auditData) {
    return (
      <div className="container mx-auto p-6">
        <p>Aucune donnée d&apos;audit disponible</p>
      </div>
    );
  }

  // Préparer les données pour les graphiques
  const allocationData = Object.entries(auditData.allocation.par_classe_actif).map(([name, value]) => ({
    name,
    value
  }));

  const enveloppeData = Object.entries(auditData.allocation.par_enveloppe).map(([name, value]) => ({
    name,
    value
  }));

  const scoreData = [
    { name: 'Diversification', score: auditData.score_diversification },
    { name: 'Fiscal', score: auditData.score_fiscal },
    { name: 'Global', score: auditData.score_global }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit de Portefeuille</h1>
          <p className="text-gray-600 mt-1">Client&colon; {auditData.client_id}</p>
        </div>
        <Button onClick={runAudit} disabled={loading}>
          Actualiser l&apos;audit
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Valeur Totale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {auditData.valeur_totale.toLocaleString('fr-FR')} €
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Plus-value Latente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{auditData.plus_value_latente_totale.toLocaleString('fr-FR')} €
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              +{auditData.performance_globale_pct.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Économie Fiscale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {auditData.analyse_fiscale.economie_annuelle_estimee.toLocaleString('fr-FR')} €/an
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Scores d&apos;Optimisation
          </CardTitle>
          <CardDescription>Évaluation de la qualité du portefeuille (0-100)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData}>
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Allocation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Allocation par Classe d&apos;Actifs</CardTitle>
            <CardDescription>Répartition du portefeuille</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Allocation par Enveloppe</CardTitle>
            <CardDescription>Répartition fiscale</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={enveloppeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {enveloppeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommandations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Recommandations Prioritaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {auditData.top_recommandations.map((reco, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-lg">{reco}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Analyse Fiscale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Analyse Fiscale Détaillée
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Coût fiscal actuel</p>
              <p className="text-xl font-semibold">{auditData.analyse_fiscale.cout_fiscal_actuel.toLocaleString('fr-FR')} €</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Coût fiscal optimal</p>
              <p className="text-xl font-semibold text-green-600">{auditData.analyse_fiscale.cout_fiscal_optimal.toLocaleString('fr-FR')} €</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Taux d&apos;optimisation</p>
              <p className="text-xl font-semibold text-blue-600">{auditData.analyse_fiscale.taux_optimisation.toFixed(1)}%</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Recommandations fiscales&colon;</h4>
            <ul className="space-y-1">
              {auditData.analyse_fiscale.recommandations.map((reco, idx) => (
                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  {reco}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Problèmes d'éligibilité */}
      {auditData.problemes_eligibilite.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              Problèmes d&apos;Éligibilité Détectés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {auditData.problemes_eligibilite.map((pb, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-900">{pb.nom_actif} ({pb.isin})</h4>
                  <p className="text-sm text-gray-700 mt-1">{pb.probleme}</p>
                  <p className="text-sm text-red-700 mt-1"><strong>Impact:</strong> {pb.impact}</p>
                  <p className="text-sm text-green-700 mt-1"><strong>Suggestion:</strong> {pb.suggestion}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
