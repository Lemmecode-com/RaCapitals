import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const TOOLTIP_GAP = 8

const computePosition = (anchorRect) => {
  const bubbleWidth = 240
  const bubbleHeightEstimate = 56
  const viewportW = window.innerWidth
  const viewportH = window.innerHeight
  const scrollX = window.scrollX || window.pageXOffset
  const scrollY = window.scrollY || window.pageYOffset

  let top = anchorRect.top + scrollY - bubbleHeightEstimate - TOOLTIP_GAP
  let placement = 'top'

  if (top < scrollY + 4) {
    top = anchorRect.bottom + scrollY + TOOLTIP_GAP
    placement = 'bottom'
  }

  let left = anchorRect.left + scrollX + anchorRect.width / 2 - bubbleWidth / 2
  left = Math.max(scrollX + 8, Math.min(left, scrollX + viewportW - bubbleWidth - 8))

  return { top, left, placement }
}

const InfoIcon = () => (
  <svg
    className="info-tooltip-icon"
    viewBox="0 0 24 24"
    width="16"
    height="16"
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="2" />
    <line x1="12" y1="10.5" x2="12" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="7.5" r="1.2" fill="currentColor" />
  </svg>
)

/**
 * InfoTooltip — wrapper component.
 *
 * Wrap your label text + the info icon together, and hovering/focusing
 * anywhere in the wrapper (label OR icon) triggers the tooltip.
 *
 * Usage:
 *   <InfoTooltip text="…">
 *     Sector
 *   </InfoTooltip>
 *
 * Renders: <span class="info-tooltip"><label/><icon/></span>
 * The whole wrapper is the hover/focus target.
 */
const InfoTooltip = ({ text, label = 'More information', children }) => {
  const wrapperRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0, placement: 'top' })

  const updatePosition = () => {
    const rect = wrapperRef.current?.getBoundingClientRect()
    if (!rect) return
    setPos(computePosition(rect))
  }

  const show = () => {
    updatePosition()
    setIsVisible(true)
  }

  const hide = () => setIsVisible(false)

  useEffect(() => {
    if (!isVisible) return undefined
    const onScrollOrResize = () => updatePosition()
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') hide()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isVisible])

  const tooltipNode = isVisible ? (
    <span
      className={`info-tooltip-bubble info-tooltip-bubble-portal placement-${pos.placement}`}
      role="tooltip"
      style={{ top: `${pos.top}px`, left: `${pos.left}px` }}
    >
      {text}
    </span>
  ) : null

  return (
    <span
      ref={wrapperRef}
      className="info-tooltip"
      tabIndex={0}
      role="button"
      aria-label={label}
      aria-describedby={isVisible ? 'info-tooltip-bubble-active' : undefined}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onClick={show}
    >
      <span className="info-tooltip-label">{children}</span>
      <InfoIcon />
      {typeof document !== 'undefined' && createPortal(tooltipNode, document.body)}
    </span>
  )
}

export default InfoTooltip