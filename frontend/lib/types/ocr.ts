/**
 * Types for OCR functionality
 */

import { TypeEnveloppeAudit } from './audit'

// Extracted line from OCR scan
export interface ExtractedLine {
  isin: string
  fundName: string
  amount: number
  confidence: number // OCR confidence score (0-1)
}

// OCR processing result
export interface OCRResult {
  text: string // Raw OCR text
  confidence: number // Overall confidence
  lines: ExtractedLine[]
  errors: string[]
}

// OCR processing status
export type OCRStatus = 'idle' | 'processing' | 'success' | 'error'

// OCR scan state
export interface OCRScanState {
  status: OCRStatus
  progress: number // 0-100
  result: OCRResult | null
  error: string | null
}

// Document for OCR scanning
export interface OCRDocument {
  id: string
  file: File
  preview?: string
  type_enveloppe: TypeEnveloppeAudit
  scan_result?: OCRResult
  status: OCRStatus
}
