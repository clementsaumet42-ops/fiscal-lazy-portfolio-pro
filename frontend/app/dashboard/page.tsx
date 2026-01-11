'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/format';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total_clients: 0,
    total_aum: 0,
    performance_moyenne: 0,
  });

  useEffect(() => {
    // Charger les statistiques (pour l'instant données de démonstration)
    setStats({
      total_clients: 12,
      total_aum: 2450000,
      performance_moyenne: 7.8,
    });
  }, []);

  // Données de démonstration pour les graphiques
  const performanceData = [
    { date: 'Jan', performance: 100 },
    { date: 'Fév', performance: 102 },
    { date: 'Mar', performance: 98 },
    { date: 'Avr', performance: 105 },
    { date: 'Mai', performance: 108 },
    { date: 'Juin', performance: 112 },
    { date: 'Juil', performance: 110 },
    { date: 'Août', performance: 115 },
    { date: 'Sep', performance: 113 },
    { date: 'Oct', performance: 118 },
    { date: 'Nov', performance: 120 },
    { date: 'Déc', performance: 125 },
  ];

  const enveloppeData = [
    { name: 'PEA', value: 40, montant: 980000 },
    { name: 'CTO', value: 30, montant: 735000 },
    { name: 'AV', value: 20, montant: 490000 },
    { name: 'IS', value: 10, montant: 245000 },
  ];

  const clientsRecentData = [
    { name: 'Martin', aum: 180000, performance: 8.2, date: '2024-01-05' },
    { name: 'Dubois', aum: 250000, performance: 7.5, date: '2024-01-03' },
    { name: 'Bernard', aum: 120000, performance: 9.1, date: '2023-12-28' },
    { name: 'Thomas', aum: 310000, performance: 6.8, date: '2023-12-20' },
    { name: 'Petit', aum: 95000, performance: 8.5, date: '2023-12-15' },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Dashboard Expert-Comptable</h1>

      {/* KPIs */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-600">{stats.total_clients}</p>
            <p className="text-xs text-blue-700 mt-1">Portefeuilles actifs</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800">AUM Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">
              {formatCurrency(stats.total_aum)}
            </p>
            <p className="text-xs text-green-700 mt-1">Actifs sous gestion</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Performance Moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-purple-600">+{stats.performance_moyenne}%</p>
            <p className="text-xs text-purple-700 mt-1">Rendement annuel</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Performance Portefeuilles (YTD)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="performance" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Performance (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par Enveloppe</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={enveloppeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {enveloppeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string, props: any) => {
                    return [formatCurrency(props.payload.montant), name];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Liste des clients */}
      <Card>
        <CardHeader>
          <CardTitle>Clients Récents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Client</th>
                  <th className="text-right py-3 px-4">AUM</th>
                  <th className="text-right py-3 px-4">Performance</th>
                  <th className="text-right py-3 px-4">Date</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clientsRecentData.map((client, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{client.name}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(client.aum)}</td>
                    <td className={`py-3 px-4 text-right font-semibold ${
                      client.performance > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      +{client.performance}%
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-gray-600">
                      {new Date(client.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Voir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques supplémentaires */}
      <div className="grid md:grid-cols-4 gap-4 mt-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Nouveaux Clients (30j)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">3</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Rapports Générés</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">18</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Économie Fiscale Totale</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">45 K€</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Taux de Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">98%</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
