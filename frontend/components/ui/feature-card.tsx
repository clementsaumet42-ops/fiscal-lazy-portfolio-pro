import * as React from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

export interface FeatureCardProps {
  title: string
  description: string
  icon: LucideIcon
  className?: string
}

export function FeatureCard({ title, description, icon: Icon, className }: FeatureCardProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-midnight-light border border-midnight-lighter p-8 transition-all duration-300 hover:border-gold hover:shadow-gold cursor-pointer',
        className
      )}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold/0 via-gold/0 to-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative">
        {/* Icon container with glow */}
        <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gold/10 text-gold group-hover:bg-gold group-hover:text-midnight transition-all duration-300 group-hover:shadow-gold">
          <Icon className="w-8 h-8" />
        </div>
        
        {/* Content */}
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-gold transition-colors duration-300">
          {title}
        </h3>
        
        <p className="text-cream/70 leading-relaxed">
          {description}
        </p>
      </div>
      
      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gold/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  )
}
