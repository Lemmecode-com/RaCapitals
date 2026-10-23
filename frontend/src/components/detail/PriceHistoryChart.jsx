import { useEffect, useMemo, useRef, useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import Chart from 'react-apexcharts'
import { formatINR } from '../../utils/format'

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
  const [resetKey, setResetKey] = useState(0)
  const wrapRef = useRef(null)

  useEffect(() => {
    setBrass(getComputedStyle(document.documentElement).getPropertyValue('--brass').trim() || '#B08D57')
    setMuted(getComputedStyle(document.documentElement).getPropertyValue('--muted').trim() || '#6B7280')
    setPaper2(getComputedStyle(document.documentElement).getPropertyValue('--paper-2').trim() || '#E5E7EB')
  }, [theme])

  useEffect(() => {
    const node = wrapRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setResetKey((k) => k + 1)
          }
        })
      },
      { threshold: 0.2 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const points = Array.isArray(priceHistory) ? priceHistory : []

  const sorted = useMemo(() =>
    [...points].sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt)),
    [points]
  )

  const series = useMemo(() => [{
    name: 'Price',
    data: sorted.map((p) => Number(p.price)).filter((n) => !Number.isNaN(n))
  }], [sorted])

  const categories = useMemo(() => sorted.map((p) => {
    const d = new Date(p.recordedAt)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }), [sorted])

  const options = useMemo(() => ({
    chart: {
      type: 'area',
      height: 320,
      toolbar: { show: false },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 1600,
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
        style: { colors: [muted] }
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
      <Chart
        key={resetKey}
        options={options}
        series={series}
        type="area"
        height={320}
      />
    </div>
  )
}

export default PriceHistoryChart
