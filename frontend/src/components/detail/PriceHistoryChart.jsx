import { useEffect, useMemo, useRef, useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import Chart from 'react-apexcharts'
import { formatINR } from '../../utils/format'

const TIMEFRAMES = ['1M', '3M', '6M', '1Y', 'ALL']

const PriceHistoryChart = ({ priceHistory }) => {
  const { theme } = useTheme()
  const [brass, setBrass] = useState(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--brass').trim() || '#B08D57'
  )
  const [muted, setMuted] = useState(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--muted').trim() || '#6B7280'
  )
  const [paper2, setPaper2] = useState(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--paper-2').trim() || '#E5E7EB'
  )
  const [activeTf, setActiveTf] = useState('ALL')
  const wrapRef = useRef(null)

  useEffect(() => {
    setBrass(getComputedStyle(document.documentElement).getPropertyValue('--brass').trim() || '#B08D57')
    setMuted(getComputedStyle(document.documentElement).getPropertyValue('--muted').trim() || '#6B7280')
    setPaper2(getComputedStyle(document.documentElement).getPropertyValue('--paper-2').trim() || '#E5E7EB')
  }, [theme])

  const points = Array.isArray(priceHistory) ? priceHistory : []

  const sorted = useMemo(() =>
    [...points].sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt)),
    [points]
  )

  const filteredPoints = useMemo(() => {
    if (!sorted.length || activeTf === 'ALL') return sorted

    const latestTimestamp = new Date(sorted[sorted.length - 1].recordedAt).getTime()
    const referenceTime = Math.max(Date.now(), latestTimestamp)

    let days = 0
    if (activeTf === '1M') days = 30
    else if (activeTf === '3M') days = 90
    else if (activeTf === '6M') days = 180
    else if (activeTf === '1Y') days = 365

    const cutoff = referenceTime - days * 24 * 60 * 60 * 1000
    const filtered = sorted.filter(p => new Date(p.recordedAt).getTime() >= cutoff)

    if (filtered.length >= 2) return filtered
    if (filtered.length === 1) {
      const priorPoints = sorted.filter(p => new Date(p.recordedAt).getTime() < cutoff)
      if (priorPoints.length > 0) {
        return [priorPoints[priorPoints.length - 1], ...filtered]
      }
    }
    return sorted
  }, [sorted, activeTf])

  const tfPerformance = useMemo(() => {
    if (filteredPoints.length < 2) return null
    const first = Number(filteredPoints[0].price)
    const last = Number(filteredPoints[filteredPoints.length - 1].price)
    if (isNaN(first) || isNaN(last)) return null
    const change = last - first
    const pct = first > 0 ? (change / first) * 100 : 0
    return {
      change,
      pct,
      isPositive: change >= 0
    }
  }, [filteredPoints])

  const series = useMemo(() => [{
    name: 'Price',
    data: filteredPoints.map((p) => Number(p.price)).filter((n) => !Number.isNaN(n))
  }], [filteredPoints])

  const categories = useMemo(() => filteredPoints.map((p) => {
    const d = new Date(p.recordedAt)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
  }), [filteredPoints])

  const options = useMemo(() => ({
    chart: {
      type: 'area',
      height: 320,
      toolbar: { show: false },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        dynamicAnimation: { enabled: true }
      },
      background: 'transparent',
      fontFamily: 'inherit'
    },
    stroke: {
      curve: 'smooth',
      width: 3,
      colors: [brass]
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        colorStops: [
          { offset: 0, color: brass, opacity: 0.4 },
          { offset: 100, color: brass, opacity: 0.05 }
        ]
      }
    },
    markers: {
      size: 4,
      colors: [brass],
      strokeColors: '#ffffff',
      strokeWidth: 2,
      hover: { size: 6 }
    },
    xaxis: {
      categories,
      labels: {
        style: { colors: [muted] },
        rotate: -30,
        rotateAlways: false,
        hideOverlappingLabels: true
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false }
    },
    yaxis: {
      labels: {
        formatter: (val) => formatINR(val),
        style: { colors: [muted] }
      }
    },
    grid: {
      borderColor: paper2,
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { top: 0, right: 0, bottom: 0, left: 10 }
    },
    tooltip: {
      y: {
        formatter: (val) => formatINR(val)
      }
    },
    dataLabels: { enabled: false }
  }), [brass, muted, paper2, categories])

  if (points.length < 2) {
    return (
      <div className="chart-empty">
        <p>Not enough price history to draw a chart yet.</p>
      </div>
    )
  }

  return (
    <div className="chart-wrap" ref={wrapRef}>
      <div className="chart-tf-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div className="chart-tf-stat">
          {tfPerformance ? (
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: tfPerformance.isPositive ? '#16a34a' : '#dc2626' }}>
              {tfPerformance.isPositive ? '▲ +' : '▼ '}
              {formatINR(Math.abs(tfPerformance.change))} ({tfPerformance.pct >= 0 ? '+' : ''}{tfPerformance.pct.toFixed(2)}%)
              <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '0.4rem', fontSize: '0.8rem' }}>
                in {activeTf === 'ALL' ? 'all time' : activeTf}
              </span>
            </span>
          ) : (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Historical movement</span>
          )}
        </div>
        <div className="detail-tf-group" role="group" aria-label="Chart timeframe options">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              type="button"
              className={`detail-tf-btn ${activeTf === tf ? 'active' : ''}`}
              onClick={() => setActiveTf(tf)}
              aria-pressed={activeTf === tf}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      <Chart
        options={options}
        series={series}
        type="area"
        height={320}
      />
    </div>
  )
}

export default PriceHistoryChart
