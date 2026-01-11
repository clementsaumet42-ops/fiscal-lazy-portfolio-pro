import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  value?: number
  onValueChange?: (value: number) => void
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onValueChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onValueChange) {
        onValueChange(Number(e.target.value))
      }
    }
    
    return (
      <input
        type="range"
        value={value}
        onChange={handleChange}
        className={cn(
          'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Slider.displayName = 'Slider'

export { Slider }
