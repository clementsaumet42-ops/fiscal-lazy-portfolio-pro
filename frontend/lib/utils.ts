import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Allocation } from './types'

/**
 * Utility to merge Tailwind CSS classes
 * Used by shadcn/ui components
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as EUR currency
 * @param amount - Amount in euros
 * @returns Formatted string (e.g., "1 234,56 €")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format a number as percentage
 * @param value - Value as number (e.g., 8.25 for 8.25%)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string (e.g., "8,25 %")
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100)
}

/**
 * Format a decimal as percentage
 * @param value - Decimal value (e.g., 0.0825 for 8.25%)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string (e.g., "8,25 %")
 */
export function formatPercent(value: number, decimals: number = 2): string {
  // formatPercent expects decimal values (0.0825), so pass directly
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Format a date in French locale
 * @param date - Date object or ISO string
 * @returns Formatted date (e.g., "11/01/2026")
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('fr-FR').format(d)
}

/**
 * Format a large number with thousands separators
 * @param value - Number to format
 * @returns Formatted string (e.g., "1 234 567")
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value)
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Calculate percentage of total
 */
export function percentageOf(value: number, total: number): number {
  if (total === 0) return 0
  return (value / total) * 100
}

/**
 * Validate allocation percentages
 * @param allocation - Allocation object
 * @returns true if allocation is valid (sums to 100%)
 */
export function validateAllocation(allocation: Allocation): boolean {
  const total = getTotalAllocation(allocation)
  return Math.abs(total - 100) < 0.5
}

/**
 * Get total allocation percentage
 * @param allocation - Allocation object
 * @returns Total percentage
 */
export function getTotalAllocation(allocation: Allocation): number {
  return (
    allocation.actions_monde +
    allocation.actions_europe +
    allocation.obligations +
    allocation.immobilier +
    allocation.cash
  )
}

/**
 * Get color for chart based on index
 * @param index - Index of the data point
 * @returns Color string
 */
export function getChartColor(index: number): string {
  const colors = [
    '#3b82f6', // blue-500
    '#10b981', // green-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#14b8a6', // teal-500
    '#f97316', // orange-500
  ]
  return colors[index % colors.length]
}
