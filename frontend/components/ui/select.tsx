'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  onValueChange?: (value: string) => void
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, onValueChange, ...props }, ref) => {
    return (
      <select
        className={cn(
          'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        onChange={(e) => {
          if (onValueChange) {
            onValueChange(e.target.value)
          }
          if (props.onChange) {
            props.onChange(e)
          }
        }}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = 'Select'

// Simple compatibility exports for basic select usage
// Note: These are simplified wrappers around native HTML select element
// For complex dropdown behavior, consider using a dedicated library like Radix UI or Headless UI
export const SelectTrigger = Select
export const SelectValue = ({ placeholder }: { placeholder?: string }) => <>{placeholder}</>
export const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => (
  <option value={value}>{children}</option>
)

export { Select }
