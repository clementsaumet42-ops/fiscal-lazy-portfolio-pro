import * as React from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

export interface StatCardProps {
  value: string | number
  label: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatCard({ value, label, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-midnight-light border border-midnight-lighter p-6 transition-all duration-300 hover:border-gold hover:shadow-gold',
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gold/5 blur-2xl" />
      
      <div className="relative">
        {Icon && (
          <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gold/10 text-gold">
            <Icon className="w-6 h-6" />
          </div>
        )}
        
        <div className="mb-2">
          <div className="text-4xl font-bold text-gold tracking-tight">
            {value}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-cream/70 font-medium">
            {label}
          </div>
          
          {trend && (
            <div
              className={cn(
                'text-xs font-semibold',
                trend.isPositive ? 'text-success' : 'text-error'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
