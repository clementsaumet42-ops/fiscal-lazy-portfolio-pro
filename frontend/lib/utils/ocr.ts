/**
 * OCR utility functions using Tesseract.js
 */

import { createWorker } from 'tesseract.js'
import { ExtractedLine, OCRResult } from '@/lib/types/ocr'

/**
 * Extract text from image or PDF using Tesseract OCR
 */
export async function extractTextFromImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ text: string; confidence: number }> {
  const worker = await createWorker('fra', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 100))
      }
    },
  })

  try {
    const { data } = await worker.recognize(file)
    await worker.terminate()

    return {
      text: data.text,
      confidence: data.confidence / 100, // Convert to 0-1 range
    }
  } catch (error) {
    await worker.terminate()
    throw error
  }
}

/**
 * Extract ISIN codes from text
 * Pattern: 2 letters + 10 alphanumeric characters
 */
export function extractISINs(text: string): string[] {
  const pattern = /\b[A-Z]{2}[A-Z0-9]{10}\b/g
  const matches = text.match(pattern) || []
  // Remove duplicates
  return Array.from(new Set(matches))
}

/**
 * Extract monetary amounts from text (French format)
 * Supports: "1 234,56 €", "1234,56€", "1.234,56 EUR", etc.
 */
export function extractAmounts(text: string): number[] {
  const patterns = [
    // Pattern 1: 1 234,56 € or 1234,56 €
    /(\d{1,3}(?:[\s]\d{3})*(?:,\d{2})?)\s*€/g,
    // Pattern 2: 1 234,56 EUR or 1234,56 EUR
    /(\d{1,3}(?:[\s]\d{3})*(?:,\d{2})?)\s*EUR/gi,
    // Pattern 3: 1.234,56 (with dots as thousands separator)
    /(\d{1,3}(?:[.]\d{3})*(?:,\d{2})?)\s*[€EUR]/gi,
  ]

  const amounts: number[] = []

  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      const amountStr = match[1]
        .replace(/\s/g, '') // Remove spaces
        .replace(/\./g, '') // Remove dots (thousands separator)
        .replace(',', '.') // Replace comma with dot (decimal separator)

      const amount = parseFloat(amountStr)
      if (!isNaN(amount) && amount > 0) {
        amounts.push(amount)
      }
    }
  }

  return amounts
}

/**
 * Extract fund names from text lines
 * Heuristic: Lines that appear before ISIN codes
 */
function extractFundNames(text: string, isins: string[]): Map<string, string> {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0)
  const fundNames = new Map<string, string>()

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Check if this line contains an ISIN
    const isinInLine = isins.find((isin) => line.includes(isin))
    
    if (isinInLine) {
      // Look for fund name in previous lines or same line
      let fundName = ''
      
      // Try to extract from same line (before ISIN)
      const isinIndex = line.indexOf(isinInLine)
      const beforeISIN = line.substring(0, isinIndex).trim()
      
      if (beforeISIN.length > 5) {
        fundName = beforeISIN
      } else if (i > 0) {
        // Try previous line
        fundName = lines[i - 1]
      }
      
      // Clean up fund name
      fundName = fundName
        .replace(/^[^a-zA-Z]+/, '') // Remove leading non-letters
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim()
      
      if (fundName.length > 3) {
        fundNames.set(isinInLine, fundName)
      }
    }
  }

  return fundNames
}

/**
 * Parse OCR text to extract structured data
 */
export function parseOCRText(text: string, confidence: number): OCRResult {
  const errors: string[] = []
  const lines: ExtractedLine[] = []

  try {
    // Extract ISINs
    const isins = extractISINs(text)
    
    if (isins.length === 0) {
      errors.push('Aucun code ISIN détecté dans le document')
    }

    // Extract amounts
    const amounts = extractAmounts(text)
    
    if (amounts.length === 0) {
      errors.push('Aucun montant détecté dans le document')
    }

    // Extract fund names
    const fundNames = extractFundNames(text, isins)

    // Match ISINs with amounts (simple heuristic: pair them in order)
    const minLength = Math.min(isins.length, amounts.length)
    
    for (let i = 0; i < minLength; i++) {
      const isin = isins[i]
      const amount = amounts[i]
      const fundName = fundNames.get(isin) || `Fonds ${isin}`
      
      lines.push({
        isin,
        fundName,
        amount,
        confidence: confidence,
      })
    }

    // If we have more ISINs than amounts, add them with 0 amount
    for (let i = minLength; i < isins.length; i++) {
      const isin = isins[i]
      const fundName = fundNames.get(isin) || `Fonds ${isin}`
      
      lines.push({
        isin,
        fundName,
        amount: 0,
        confidence: confidence * 0.5, // Lower confidence for missing amounts
      })
      
      errors.push(`Montant non détecté pour ${isin}`)
    }

  } catch (error) {
    errors.push(`Erreur lors du parsing: ${error}`)
  }

  return {
    text,
    confidence,
    lines,
    errors,
  }
}

/**
 * Process document with OCR
 */
export async function processDocumentOCR(
  file: File,
  onProgress?: (progress: number) => void
): Promise<OCRResult> {
  try {
    // Extract text using OCR
    const { text, confidence } = await extractTextFromImage(file, onProgress)
    
    // Parse extracted text
    const result = parseOCRText(text, confidence)
    
    return result
  } catch (error) {
    throw new Error(`Erreur OCR: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Validate ISIN code format
 */
export function validateISIN(isin: string): boolean {
  // Basic format check: 2 letters + 10 alphanumeric
  const pattern = /^[A-Z]{2}[A-Z0-9]{10}$/
  
  if (!pattern.test(isin)) {
    return false
  }
  
  // Check digit validation (simplified)
  // Full ISIN validation would require more complex checksum calculation
  return true
}

/**
 * Format amount for display
 */
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}
