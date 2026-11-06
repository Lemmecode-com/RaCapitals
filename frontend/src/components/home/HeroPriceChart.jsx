import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { formatINR } from '../../utils/format'

const TIMEFRAMES = ['1M', '6M', '1Y', '3Y', 'MAX']

export default function HeroPriceChart({ initialCompany = null }) {
  const [company, setCompany] = useState(initialCompany)
  const [priceHistory, setPriceHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTf, setActiveTf] = useState('MAX')
  const [hoverIndex, setHoverIndex] = useState(null)
  const svgRef = useRef(null)

  // 1. Identify and load the target company (Goodluck Defence and Aerospace Ltd or flagship)
  useEffect(() => {
    let cancelled = false

    const fetchTargetCompany = async () => {
      try {
        setLoading(true)
        // Fetch all active companies to locate Goodluck Defence or premier featured listing
        const compRes = await api.get('/companies', { params: { limit: 100 } })
        const list = Array.isArray(compRes.data) ? compRes.data : []

        // Prioritize Goodluck Defence, then company with most records, or first available
        const goodluck = list.find((c) => /goodluck/i.test(c.name))
        const chosen = goodluck || list[0] || initialCompany

        if (!cancelled && chosen) {
          setCompany(chosen)

          // Fetch price history for the chosen company
          try {
            const priceRes = await api.get(`/prices/${chosen._id}`)
            if (!cancelled && Array.isArray(priceRes.data) && priceRes.data.length > 0) {
              setPriceHistory(priceRes.data)
            }
          } catch (err) {
            console.error('Error loading price history for hero chart:', err)
          }
        }
      } catch (err) {
        console.error('Error fetching hero chart company:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchTargetCompany()
    return () => {
      cancelled = true
    }
  }, [initialCompany])

  // 2. Sort points chronologically
  const sortedPoints = useMemo(() => {
    if (!priceHistory.length) return []
    return [...priceHistory].sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt))
  }, [priceHistory])

  // 3. Filter points according to selected timeframe
  const filteredPoints = useMemo(() => {
    if (!sortedPoints.length || activeTf === 'MAX') return sortedPoints

    const latestTime = new Date(sortedPoints[sortedPoints.length - 1].recordedAt).getTime()
    let days = 30
    if (activeTf === '1M') days = 30
    else if (activeTf === '6M') days = 180
    else if (activeTf === '1Y') days = 365
    else if (activeTf === '3Y') days = 3 * 365

    const cutoff = latestTime - days * 24 * 60 * 60 * 1000
    const filtered = sortedPoints.filter((p) => new Date(p.recordedAt).getTime() >= cutoff)

    if (filtered.length >= 2) return filtered
    if (filtered.length === 1) {
      const prior = sortedPoints.filter((p) => new Date(p.recordedAt).getTime() < cutoff)
      if (prior.length > 0) {
        return [prior[prior.length - 1], ...filtered]
      }
    }
    return sortedPoints
  }, [sortedPoints, activeTf])

  // 4. Coordinates calculation inside 500x220 SVG space
  const { coords } = useMemo(() => {
    if (!filteredPoints.length) return { coords: [] }

    const prices = filteredPoints.map((p) => Number(p.price))
    const rawMin = Math.min(...prices)
    const rawMax = Math.max(...prices)
    const padding = (rawMax - rawMin) * 0.12 || rawMax * 0.1 || 1
    const min = Math.max(0, rawMin - padding)
    const max = rawMax + padding
    const range = max - min || 1

    const padLeft = 20
    const padRight = 20
    const padTop = 32
    const padBottom = 30
    const drawWidth = 500 - padLeft - padRight
    const drawHeight = 220 - padTop - padBottom

    const mapped = filteredPoints.map((p, i) => {
      const x = padLeft + (i / Math.max(filteredPoints.length - 1, 1)) * drawWidth
      const y = padTop + (1 - (Number(p.price) - min) / range) * drawHeight
      return { x, y, point: p }
    })

    return { coords: mapped }
  }, [filteredPoints])

  // 5. Generate smooth Bezier curve and Area gradient fill
  const { pathD, areaD } = useMemo(() => {
    if (coords.length === 0) return { pathD: '', areaD: '' }
    if (coords.length === 1) {
      const d = `M 20,${coords[0].y.toFixed(1)} L 480,${coords[0].y.toFixed(1)}`
      return { pathD: d, areaD: `${d} L 480,220 L 20,220 Z` }
    }

    let d = `M ${coords[0].x.toFixed(1)},${coords[0].y.toFixed(1)}`
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? i : i - 1]
      const p1 = coords[i]
      const p2 = coords[i + 1]
      const p3 = coords[i + 2 < coords.length ? i + 2 : i + 1]

      const cp1x = p1.x + (p2.x - p0.x) / 6
      const cp1y = p1.y + (p2.y - p0.y) / 6
      const cp2x = p2.x - (p3.x - p1.x) / 6
      const cp2y = p2.y - (p3.y - p1.y) / 6

      d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`
    }

    const lastX = coords[coords.length - 1].x.toFixed(1)
    const firstX = coords[0].x.toFixed(1)
    const area = `${d} L ${lastX},220 L ${firstX},220 Z`

    return { pathD: d, areaD: area }
  }, [coords])

  // 6. Dynamic volume bars along baseline
  const volumeBars = useMemo(() => {
    if (!coords.length) return []
    const barCount = 12
    const bars = []
    const step = 460 / barCount
    for (let i = 0; i < barCount; i++) {
      const x = 20 + i * step + 5
      const idx = Math.min(Math.floor((i / barCount) * coords.length), coords.length - 1)
      const relPrice = Number(coords[idx]?.point?.price || 100)
      const h = 25 + Math.round((relPrice * 7 + i * 17) % 75)
      const y = 220 - h
      bars.push({ x, y, width: 14, height: h })
    }
    return bars
  }, [coords])

  // 7. Interactive mouse movement over SVG
  const handleMouseMove = (e) => {
    if (!svgRef.current || !coords.length) return
    const rect = svgRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const svgX = (mouseX / rect.width) * 500

    let closestIdx = 0
    let minDiff = Infinity
    coords.forEach((c, idx) => {
      const diff = Math.abs(c.x - svgX)
      if (diff < minDiff) {
        minDiff = diff
        closestIdx = idx
      }
    })
    setHoverIndex(closestIdx)
  }

  const handleMouseLeave = () => {
    setHoverIndex(null)
  }

  // Active point for price delta display
  const activePoint = hoverIndex !== null ? coords[hoverIndex]?.point : filteredPoints[filteredPoints.length - 1]
  const currentPriceDisplay = activePoint ? Number(activePoint.price) : (company?.currentPrice || 0)

  const firstPoint = filteredPoints[0]
  const lastPoint = filteredPoints[filteredPoints.length - 1]
  const startPrice = firstPoint ? Number(firstPoint.price) : currentPriceDisplay
  const endPrice = lastPoint ? Number(lastPoint.price) : currentPriceDisplay
  const priceDelta = endPrice - startPrice
  const pctGain = startPrice > 0 ? (priceDelta / startPrice) * 100 : 0
  const isPositive = priceDelta >= 0

  const activeCoord = hoverIndex !== null ? coords[hoverIndex] : coords[coords.length - 1]

  return (
    <div className="home-hero-chart-card" aria-label="Indicative price chart">
      <div className="home-hero-chart-header">
        <Link
          to={company?._id ? `/company/${company._id}` : '/catalog'}
          className="home-hero-chart-sub"
          title={`View ${company?.name || 'company'} share details`}
          style={{ textDecoration: 'none' }}
        >
          {company?.name || 'Goodluck Defence and Aerospace Ltd'}
        </Link>
        <span className="home-hero-chart-live">
          <span className="home-hero-chart-dot" />
          Live Feed
        </span>
      </div>

      <div className="home-hero-chart-price-row">
        <span className="home-hero-chart-current-price">
          {formatINR(currentPriceDisplay)}
        </span>
        <span
          className={`home-hero-chart-gain ${!isPositive ? 'negative' : ''}`}
          style={!isPositive ? { color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.25)', background: 'rgba(239, 68, 68, 0.08)' } : {}}
        >
          {isPositive ? '▲ +' : '▼ '}{pctGain.toFixed(2)}% <span>over {activeTf}</span>
        </span>
      </div>

      <div
        className="home-hero-chart-wrapper"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <svg
          ref={svgRef}
          className="home-hero-chart-svg"
          viewBox="0 0 500 220"
          preserveAspectRatio="none"
          role="img"
          aria-label={`Price trend for ${company?.name || 'share'}`}
        >
          <defs>
            <linearGradient id="hero-blue-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Reference Grid lines */}
          <line className="hero-grid-line" x1="0" y1="50" x2="500" y2="50" />
          <line className="hero-grid-line" x1="0" y1="110" x2="500" y2="110" />
          <line className="hero-grid-line" x1="0" y1="170" x2="500" y2="170" />

          {/* Volume bars */}
          <g className="hero-volume-bars">
            {volumeBars.map((b, i) => (
              <rect
                key={i}
                x={b.x}
                y={b.y}
                width={b.width}
                height={b.height}
                rx="3"
                fill="#2563eb"
                opacity="0.12"
              />
            ))}
          </g>

          {/* Interactive reference crosshair */}
          {activeCoord && (
            <line
              className="hero-chart-ref-line"
              x1={activeCoord.x}
              y1="220"
              x2={activeCoord.x}
              y2={activeCoord.y}
            />
          )}

          {/* Chart area and path */}
          {areaD && (
            <path
              className="hero-chart-area"
              d={areaD}
              fill="url(#hero-blue-gradient)"
            />
          )}
          {pathD && (
            <path
              className="hero-chart-line"
              d={pathD}
            />
          )}

          {/* Active pointer dot */}
          {activeCoord && (
            <circle
              cx={activeCoord.x}
              cy={activeCoord.y}
              r="5.5"
              fill="#2563eb"
              stroke="#ffffff"
              strokeWidth="2.5"
              style={{ filter: 'drop-shadow(0 2px 5px rgba(37, 99, 235, 0.45))' }}
            />
          )}
        </svg>

        {/* Dynamic Tooltip */}
        {activeCoord && (
          <div
            className="hero-chart-tooltip"
            role="status"
            aria-label="Price point details"
            style={{
              opacity: 1,
              animation: 'none',
              left: `${(activeCoord.x / 500) * 100}%`,
              top: `${(activeCoord.y / 220) * 100}%`,
              transform: 'translate(-50%, -130%)'
            }}
          >
            ₹{Number(activeCoord.point.price).toFixed(2)} · {new Date(activeCoord.point.recordedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
          </div>
        )}
      </div>

      <div className="home-hero-chart-controls">
        <div className="home-timeframe-group">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              type="button"
              className={`home-tf-btn ${activeTf === tf ? 'active' : ''}`}
              onClick={() => setActiveTf(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
