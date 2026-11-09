import { useState } from 'react'
import { apiBaseWithoutApi } from '../../utils/format'

export const buildLogoSrc = (logoUrl) => {
  if (!logoUrl) return null
  if (logoUrl.startsWith('http')) return logoUrl
  return `${apiBaseWithoutApi()}${logoUrl}`
}

const CompanyLogo = ({ logoUrl, name, size = 36, className = '' }) => {
  const [imageError, setImageError] = useState(false)
  const logoSrc = buildLogoSrc(logoUrl)
  const initial = name ? name.trim().charAt(0).toUpperCase() : '?'

  const hasValidImage = Boolean(logoSrc && !imageError)

  return (
    <div
      className={`company-logo-avatar ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`
      }}
      aria-hidden="true"
    >
      {hasValidImage ? (
        <img
          src={logoSrc}
          alt={`${name || 'Company'} logo`}
          className="company-logo-img"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      ) : (
        <span className="company-logo-fallback">{initial}</span>
      )}
    </div>
  )
}

export default CompanyLogo

