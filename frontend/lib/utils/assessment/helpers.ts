/**
 * Utility functions for the Professional Assessment Workflow
 */

/**
 * Format a number as French currency (EUR)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format a number as French currency with decimals
 */
export function formatCurrencyDetailed(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format a percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)} %`
}

/**
 * Format a date as French format (dd/mm/yyyy)
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('fr-FR').format(d)
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Calculate performance between two values
 */
export function calculatePerformance(initial: number, current: number): {
  euros: number
  percentage: number
} {
  const euros = current - initial
  const percentage = initial > 0 ? (euros / initial) * 100 : 0
  return { euros, percentage }
}

/**
 * Calculate the total value of a position
 */
export function calculatePositionValue(quantity: number, unitPrice: number): number {
  return quantity * unitPrice
}

/**
 * Calculate annual fees amount from percentage
 */
export function calculateAnnualFees(amount: number, feePercentage: number): number {
  return amount * (feePercentage / 100)
}

/**
 * Parse a French date string (dd/mm/yyyy) to Date
 */
export function parseFrenchDate(dateStr: string): Date | null {
  const parts = dateStr.split('/')
  if (parts.length !== 3) return null
  const day = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1 // Month is 0-indexed
  const year = parseInt(parts[2], 10)
  return new Date(year, month, day)
}

/**
 * Calculate fiscal parts based on family situation
 */
export function calculateFiscalParts(
  situation: 'Célibataire' | 'Marié(e)' | 'Pacsé(e)' | 'Divorcé(e)' | 'Veuf(ve)',
  numberOfChildren: number
): number {
  let parts = 0
  
  // Base parts
  if (situation === 'Marié(e)' || situation === 'Pacsé(e)') {
    parts = 2
  } else {
    parts = 1
  }
  
  // Add children parts
  if (numberOfChildren === 1) {
    parts += 0.5
  } else if (numberOfChildren === 2) {
    parts += 1
  } else if (numberOfChildren >= 3) {
    parts += 1 + (numberOfChildren - 2)
  }
  
  return parts
}

/**
 * Get TMI color for display
 */
export function getTMIColor(tmi: 0 | 11 | 30 | 41 | 45): string {
  switch (tmi) {
    case 0:
      return 'bg-green-500'
    case 11:
      return 'bg-blue-500'
    case 30:
      return 'bg-yellow-500'
    case 41:
      return 'bg-orange-500'
    case 45:
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

/**
 * Validate ISIN code format
 */
export function isValidISIN(isin: string): boolean {
  // Basic ISIN validation (2 letters + 10 alphanumeric)
  return /^[A-Z]{2}[A-Z0-9]{10}$/.test(isin)
}
