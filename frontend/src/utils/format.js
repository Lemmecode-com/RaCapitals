export const formatINR = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  const num = Number(value)
  return '₹' + num.toLocaleString('en-IN', { maximumFractionDigits: 2 })
}

export const formatPriceRange = (low, high) => {
  if (low === null || high === null || low === undefined || high === undefined) return '—'
  return `${formatINR(low)} – ${formatINR(high)}`
}

export const apiBaseWithoutApi = () => {
  const base = import.meta.env.VITE_API_BASE_URL || ''
  return base.replace(/\/api\/?$/, '')
}

export const formatCurrency = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  const num = Number(value)
  if (Math.abs(num) >= 100) {
    return '₹' + num.toLocaleString('en-IN', { maximumFractionDigits: 0 })
  }
  return '₹' + num.toLocaleString('en-IN', { maximumFractionDigits: 2 })
}

export const formatShortDate = (value) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}