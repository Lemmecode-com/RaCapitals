const Sparkline = ({ history = [] }) => {
  const points = history.filter((p) => p && p.price != null && !Number.isNaN(Number(p.price)))
  if (points.length < 2) {
    return <div className="sparkline sparkline-empty" aria-hidden="true" />
  }
  const prices = points.map((p) => Number(p.price))
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1
  const w = 120
  const h = 36
  const padX = 2
  const padY = 4
  const stepX = (w - padX * 2) / Math.max(prices.length - 1, 1)
  const coords = prices.map((price, i) => {
    const x = padX + i * stepX
    const y = padY + (h - padY * 2) * (1 - (price - min) / range)
    return { x, y }
  })
  const d = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(2)},${c.y.toFixed(2)}`).join(' ')
  return (
    <svg className="sparkline" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={d} fill="none" stroke="var(--brass)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default Sparkline