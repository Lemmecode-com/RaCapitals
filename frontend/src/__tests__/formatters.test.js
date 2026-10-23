import { describe, it, expect } from 'vitest'
import { formatINR, formatPriceRange, formatCurrency, formatShortDate } from '../utils/format.js'

describe('formatINR', () => {
  it('formats a number with ₹ symbol', () => {
    expect(formatINR(1000)).toBe('₹1,000')
  })
  it('returns — for null', () => {
    expect(formatINR(null)).toBe('—')
  })
  it('returns — for NaN', () => {
    expect(formatINR('abc')).toBe('—')
  })
})

describe('formatPriceRange', () => {
  it('returns range string', () => {
    expect(formatPriceRange(100, 200)).toBe('₹100 – ₹200')
  })
  it('returns — when values missing', () => {
    expect(formatPriceRange(null, 200)).toBe('—')
  })
})

describe('formatCurrency', () => {
  it('returns — for undefined', () => {
    expect(formatCurrency(undefined)).toBe('—')
  })
  it('formats large number without decimals', () => {
    expect(formatCurrency(1000)).toBe('₹1,000')
  })
})

describe('formatShortDate', () => {
  it('returns — for empty value', () => {
    expect(formatShortDate('')).toBe('—')
  })
  it('returns — for invalid date', () => {
    expect(formatShortDate('not-a-date')).toBe('—')
  })
  it('formats a valid date', () => {
    const result = formatShortDate('2024-01-15')
    expect(result).toMatch(/Jan/)
  })
})
