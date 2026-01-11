'use client'

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface BarChartProps {
  data: Array<{
    name: string
    avant: number
    apres: number
  }>
  title?: string
}

export function BarChart({ data, title }: BarChartProps) {
  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <RechartsBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => formatCurrency(value)} />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend />
          <Bar dataKey="avant" fill="#ef4444" name="Avant optimisation" />
          <Bar dataKey="apres" fill="#10b981" name="Après optimisation" />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}
