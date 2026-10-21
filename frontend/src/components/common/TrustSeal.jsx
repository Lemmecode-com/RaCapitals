import { useTheme } from '../../context/ThemeContext'

const TrustSeal = ({ size = 280, showSubText = true, showRingText = false, className = '' }) => {
  const isSpinning = false
  const numberFontSize = size <= 48 ? Math.round(size * 0.42) : 64
  const subFontSize = size <= 48 ? Math.round(size * 0.09) : 10
  const numberYOffset = size <= 48 ? Math.round(size * 0.30) : 0
  const subYOffset = size <= 48 ? Math.round(size * 0.30) : 44
  const cx = 150
  const cy = 150
  const outerR = 118
  const innerR = 95
  const textR = 108
  const arcStartX = cx - textR
  const arcEndX = cx + textR
  const arcPathId = `trust-seal-top-arc-${size}`
  const ringFontSize = size <= 48 ? Math.max(Math.round(size * 0.085), 6) : 10
  return (
    <svg
      className={className}
      viewBox="0 0 300 300"
      width={size}
      height={size}
      role="img"
      aria-label="Taurus Magnus trust seal"
    >
      <defs>
        <path
          id={arcPathId}
          d={`M ${arcStartX},${cy} A ${textR},${textR} 0 0,1 ${arcEndX},${cy}`}
          fill="none"
        />
      </defs>
      {showRingText && (
        <g className={`trust-seal-ring ${isSpinning ? 'trust-seal-ring-spin' : ''}`}>
          <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="var(--brass)" strokeWidth="1" />
          <text className="trust-seal-ring-text" fontSize={ringFontSize}>
            <textPath href={`#${arcPathId}`} startOffset="50%" textAnchor="middle">
              TAURUS MAGNUS • OFFLINE TRACK RECORD • SINCE 2021
            </textPath>
          </text>
        </g>
      )}
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="var(--brass)" strokeWidth="1" />
      <text x="150" y={150 + numberYOffset} textAnchor="middle" className="trust-seal-number">
        5+
      </text>
      {showSubText && (
        <text x="150" y={150 + subYOffset} textAnchor="middle" className="trust-seal-sub">
          YEARS TRADING
        </text>
      )}
    </svg>
  )
}

export default TrustSeal