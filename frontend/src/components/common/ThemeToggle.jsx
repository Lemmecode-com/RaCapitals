import { useEffect, useRef, useState } from 'react'
import { useTheme } from '../../context/ThemeContext'

const THEME_COLORS = {
  'indigo-light': { pageBg: '#F5F5FA', brass: '#4F46E5' },
}

const THEME_OPTIONS = [
  { name: 'indigo-light', label: 'Indigo' },
]

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()
  const buttonRef = useRef(null)
  const panelRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [pulseKey, setPulseKey] = useState(0)

  const togglePanel = () => setOpen((v) => !v)
  const closePanel = () => setOpen(false)

  const handleSelect = (name) => {
    setTheme(name)
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPulseKey((k) => k + 1)
      setTimeout(() => setPulseKey(0), 500)
    }
    closePanel()
  }

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        closePanel()
      }
    }
    const handleEsc = (e) => {
      if (e.key === 'Escape') closePanel()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [open])

  return (
    <div className="theme-toggle">
      <button
        type="button"
        ref={buttonRef}
        className="theme-toggle-btn"
        onClick={togglePanel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change theme"
      >
        <span
          className={`theme-swatch ${pulseKey ? 'theme-pulse' : ''}`}
          style={{ background: THEME_COLORS[theme]?.brass || '#B08D57' }}
        />
        <svg
          className="theme-chevron"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div
        ref={panelRef}
        className={`theme-toggle-panel ${open ? 'open' : ''}`}
      >
        {THEME_OPTIONS.map((t) => {
          const colors = THEME_COLORS[t.name]
          return (
            <button
              key={t.name}
              type="button"
              className={`theme-option ${theme === t.name ? 'active' : ''}`}
              onClick={() => handleSelect(t.name)}
            >
              <span
                className="theme-option-swatch"
                style={{
                  background: `linear-gradient(135deg, ${colors.pageBg} 50%, ${colors.brass} 50%)`,
                }}
              />
              {theme === t.name && <span className="theme-check" aria-label="current">✓</span>}
              {t.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ThemeToggle
