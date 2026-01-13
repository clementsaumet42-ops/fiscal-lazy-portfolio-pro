import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'gold' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
    
    const variants = {
      default: 'bg-midnight-light text-white hover:bg-midnight-lighter border border-midnight-lighter',
      gold: 'bg-gold text-midnight hover:bg-gold-dark shadow-md hover:shadow-gold font-semibold',
      secondary: 'bg-midnight-light text-white hover:bg-midnight-lighter border border-midnight-lighter',
      outline: 'border-2 border-gold text-gold hover:bg-gold/10 backdrop-blur-sm',
      ghost: 'hover:bg-midnight-light text-white',
      link: 'text-gold underline-offset-4 hover:underline',
      destructive: 'bg-red-600 text-white hover:bg-red-700',
    }
    
    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-lg px-8',
      icon: 'h-10 w-10',
    }
    
    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }
