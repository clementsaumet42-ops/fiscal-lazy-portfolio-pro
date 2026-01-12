import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface PatrimoineCardProps {
  titre: string
  montant: number
  pourcentage?: number
  icon?: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger'
  details?: string
  trend?: 'up' | 'down' | 'neutral'
}

export function PatrimoineCard({
  titre,
  montant,
  pourcentage,
  icon,
  variant = 'default',
  details,
  trend = 'neutral'
}: PatrimoineCardProps) {
  const variantClasses = {
    default: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-orange-50 border-orange-200',
    danger: 'bg-red-50 border-red-200',
  }

  const textVariantClasses = {
    default: 'text-blue-900',
    success: 'text-green-900',
    warning: 'text-orange-900',
    danger: 'text-red-900',
  }

  return (
    <Card className={`${variantClasses[variant]} border`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className={`text-sm font-medium ${textVariantClasses[variant]}`}>
            {titre}
          </CardTitle>
          {icon && <div className="text-2xl">{icon}</div>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="flex items-baseline justify-between">
            <div className={`text-2xl font-bold ${textVariantClasses[variant]}`}>
              {formatCurrency(montant)}
            </div>
            {trend !== 'neutral' && (
              <div className="flex items-center">
                {trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
              </div>
            )}
          </div>
          {pourcentage !== undefined && (
            <div className="text-sm text-gray-600">
              {pourcentage.toFixed(1)}% du total
            </div>
          )}
          {details && (
            <div className="text-xs text-gray-500 mt-2">
              {details}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
