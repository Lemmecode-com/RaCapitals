import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import FloatingParticles from '../../components/common/FloatingParticles'
import logo from '../../assets/logo-taurus-magnus.png'

const EyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

const AdminLogin = () => {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) {
    navigate('/admin', { replace: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    let uError = ''
    let pError = ''

    if (!username.trim()) {
      uError = 'Username is required'
    } else if (username.trim().includes(' ')) {
      uError = 'Username cannot contain spaces'
    }

    if (!password) {
      pError = 'Password is required'
    } else if (password.length < 6) {
      pError = 'Password must be at least 6 characters'
    } else if (!/[A-Z]/.test(password)) {
      pError = 'Password must contain at least one capital letter'
    } else if (!/\d/.test(password)) {
      pError = 'Password must contain at least one number'
    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password)) {
      pError = 'Password must contain at least one special character'
    }

    setUsernameError(uError)
    setPasswordError(pError)

    if (uError || pError) return

    setSubmitting(true)
    const result = await login(username, password)
    setSubmitting(false)
    if (result.ok) {
      navigate('/admin', { replace: true })
    } else {
      setError(result.message || 'Invalid credentials')
    }
  }

  return (
    <div className="admin-login-wrap">
      <div className="particles-container">
        <FloatingParticles />
      </div>

      <div className="admin-login-container">
        <Link to="/" className="admin-login-back-btn" title="Back to Taurus Magnus Home">
          <span className="arrow-icon" aria-hidden="true">←</span>
          <span>Back to Home</span>
        </Link>

        <div className="admin-login-card">
          <div className="admin-secure-badge">
            <span className="admin-secure-dot" aria-hidden="true"></span>
            <span>SECURE ADMIN PORTAL</span>
          </div>

          <div>
            <Link to="/" title="Taurus Magnus Home" className="admin-login-logo-link brand-lockup">
              <img 
                src={logo} 
                alt="Taurus Magnus" 
                className="admin-login-logo-img brand-logo-img"
              />
              <span className="brand-tagline">INVEST TODAY. GROW TOMORROW.</span>
            </Link>
          </div>

          <h1 className="admin-login-title">Taurus Magnus Admin</h1>
          <p className="admin-login-subtitle">Sign in to manage the price list, events, and insights.</p>

          <form onSubmit={handleSubmit} className="admin-form" noValidate>
            <label className="form-label">
              Username
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className="form-input"
                placeholder="Enter admin username"
              />
              {usernameError && <span className="form-error">{usernameError}</span>}
            </label>

            <label className="form-label">
              Password
              <div className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="form-input"
                  placeholder="Enter admin password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff /> : <EyeOpen />}
                </button>
              </div>
              {passwordError && <span className="form-error">{passwordError}</span>}
            </label>

            {error && (
              <div className="admin-login-error-alert" role="alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="admin-spinner" aria-hidden="true" />
                  <span>Signing in…</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
