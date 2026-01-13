/**
 * ISIN Validation Service using OpenFIGI API
 * Validates ISIN codes and enriches data with fund information
 */

import { ISINCache } from '@/lib/cache/isin-cache'

export interface ISINValidationResult {
  isValid: boolean
  isin: string
  fundName?: string
  assetClass?: string
  securityType?: string
  eligible_pea?: boolean
  confidence: number
  source: 'OpenFIGI' | 'fallback' | 'cache'
  warning?: string
}

interface OpenFIGIResponse {
  data?: Array<{
    name?: string
    ticker?: string
    exchCode?: string
    marketSector?: string
    securityType?: string
    securityType2?: string
    shareClassFIGI?: string
  }>
  error?: string
}

// EU/EEA country codes eligible for PEA
const PEA_ELIGIBLE_COUNTRIES = [
  'FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'AT', 'IE', 'PT', 'FI',
  'GR', 'LU', 'DK', 'SE', 'PL', 'CZ', 'HU', 'RO', 'BG', 'HR',
  'SK', 'SI', 'LT', 'LV', 'EE', 'CY', 'MT', 'IS', 'NO', 'LI'
]

// EU stock exchanges
const PEA_ELIGIBLE_EXCHANGES = ['PA', 'BR', 'MI', 'AM', 'DB', 'SW', 'LI', 'VI', 'HE']

// Cache instance
let cacheInstance: ISINCache | null = null

/**
 * Get or create cache instance
 */
async function getCache(): Promise<ISINCache> {
  if (!cacheInstance) {
    cacheInstance = new ISINCache()
    await cacheInstance.init()
  }
  return cacheInstance
}

/**
 * Validate ISIN format using regex
 * ISIN format: 2 country letters + 9 alphanumeric characters + 1 check digit (total 12 chars)
 * Example: FR0010315770
 */
function validateISINFormat(isin: string): boolean {
  return /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(isin)
}

/**
 * Calculate ISIN checksum using Luhn mod N algorithm
 */
function calculateISINChecksum(isin: string): number {
  // Convert letters to numbers (A=10, B=11, ..., Z=35)
  let digits = ''
  for (let i = 0; i < 11; i++) {
    const char = isin[i]
    if (char >= 'A' && char <= 'Z') {
      digits += (char.charCodeAt(0) - 55).toString()
    } else {
      digits += char
    }
  }

  // Apply Luhn algorithm
  let sum = 0
  let isEven = false

  // Process digits from right to left
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10)

    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    isEven = !isEven
  }

  return (10 - (sum % 10)) % 10
}

/**
 * Validate ISIN checksum
 */
function validateISINChecksum(isin: string): boolean {
  if (!validateISINFormat(isin)) {
    return false
  }

  const expectedChecksum = parseInt(isin[11], 10)
  const calculatedChecksum = calculateISINChecksum(isin)

  return expectedChecksum === calculatedChecksum
}

/**
 * Check if security is eligible for PEA
 */
function checkPEAEligibility(
  isin: string,
  marketSector?: string,
  exchCode?: string
): boolean {
  // Check country code
  const countryCode = isin.substring(0, 2)
  if (!PEA_ELIGIBLE_COUNTRIES.includes(countryCode)) {
    return false
  }

  // Check if it's equity
  if (marketSector && !marketSector.toLowerCase().includes('equity')) {
    return false
  }

  // Check exchange
  if (exchCode && PEA_ELIGIBLE_EXCHANGES.includes(exchCode)) {
    return true
  }

  // Default: if country is eligible and it's equity, likely eligible
  if (marketSector && marketSector.toLowerCase().includes('equity')) {
    return true
  }

  return false
}

/**
 * Call OpenFIGI API to validate and enrich ISIN
 */
async function validateWithOpenFIGI(isin: string): Promise<ISINValidationResult> {
  const apiUrl = 'https://api.openfigi.com/v3/mapping'
  const apiKey = process.env.NEXT_PUBLIC_OPENFIGI_API_KEY

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (apiKey) {
    headers['X-OPENFIGI-APIKEY'] = apiKey
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5000)

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify([
        {
          idType: 'ID_ISIN',
          idValue: isin,
        },
      ]),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('RATE_LIMIT')
      }
      throw new Error(`API error: ${response.status}`)
    }

    const results: OpenFIGIResponse[] = await response.json()
    const result = results[0]

    if (result.error) {
      return {
        isValid: false,
        isin,
        confidence: 0.5,
        source: 'OpenFIGI',
        warning: `OpenFIGI error: ${result.error}`,
      }
    }

    if (result.data && result.data.length > 0) {
      const data = result.data[0]
      const eligible_pea = checkPEAEligibility(
        isin,
        data.marketSector,
        data.exchCode
      )

      return {
        isValid: true,
        isin,
        fundName: data.name,
        assetClass: data.marketSector,
        securityType: data.securityType || data.securityType2,
        eligible_pea,
        confidence: 1.0,
        source: 'OpenFIGI',
      }
    }

    return {
      isValid: false,
      isin,
      confidence: 0.5,
      source: 'OpenFIGI',
      warning: 'No data found in OpenFIGI',
    }
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof Error) {
      if (error.message === 'RATE_LIMIT') {
        throw error
      }
      if (error.name === 'AbortError') {
        return {
          isValid: false,
          isin,
          confidence: 0.5,
          source: 'fallback',
          warning: 'API timeout (5s)',
        }
      }
    }

    return {
      isValid: false,
      isin,
      confidence: 0.5,
      source: 'fallback',
      warning: `API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Validate single ISIN with caching
 */
export async function validateISIN(isin: string): Promise<ISINValidationResult> {
  // Normalize ISIN
  const normalizedISIN = isin.toUpperCase().trim()

  // Check format
  if (!validateISINFormat(normalizedISIN)) {
    return {
      isValid: false,
      isin: normalizedISIN,
      confidence: 0,
      source: 'fallback',
      warning: 'Invalid ISIN format',
    }
  }

  // Check checksum
  if (!validateISINChecksum(normalizedISIN)) {
    return {
      isValid: false,
      isin: normalizedISIN,
      confidence: 0,
      source: 'fallback',
      warning: 'Invalid ISIN checksum',
    }
  }

  // Check cache
  try {
    const cache = await getCache()
    const cached = await cache.get(normalizedISIN)
    if (cached) {
      return { ...cached, source: 'cache' }
    }
  } catch (error) {
    console.warn('Cache error:', error)
  }

  // Call API with retry logic
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await validateWithOpenFIGI(normalizedISIN)

      // Cache successful results
      if (result.isValid || result.fundName) {
        try {
          const cache = await getCache()
          await cache.set(normalizedISIN, result)
        } catch (error) {
          console.warn('Cache write error:', error)
        }
      }

      return result
    } catch (error) {
      if (error instanceof Error && error.message === 'RATE_LIMIT') {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000
        await new Promise((resolve) => setTimeout(resolve, delay))
        continue
      }
      throw error
    }
  }

  // All retries failed
  return {
    isValid: false,
    isin: normalizedISIN,
    confidence: 0.5,
    source: 'fallback',
    warning: 'Rate limit exceeded, please try again later',
  }
}

/**
 * Validate multiple ISINs in batch
 */
export async function validateISINBatch(
  isins: string[]
): Promise<Map<string, ISINValidationResult>> {
  const results = new Map<string, ISINValidationResult>()
  const uniqueISINs = Array.from(new Set(isins))

  // Process in batches to respect rate limits (25 req/sec)
  const batchSize = 5
  const delayBetweenBatches = 250 // ms

  for (let i = 0; i < uniqueISINs.length; i += batchSize) {
    const batch = uniqueISINs.slice(i, i + batchSize)

    // Process batch in parallel
    const batchPromises = batch.map((isin) => validateISIN(isin))
    const batchResults = await Promise.all(batchPromises)

    // Store results
    batchResults.forEach((result, index) => {
      results.set(batch[index], result)
    })

    // Delay before next batch (except for last batch)
    if (i + batchSize < uniqueISINs.length) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches))
    }
  }

  return results
}
