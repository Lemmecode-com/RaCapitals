import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const EyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <div style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Link to="/" style={{ 
          alignSelf: 'flex-start',
          backgroundColor: '#ffffff',
          color: '#2563eb', 
          border: '1px solid #dbe4fd',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          textDecoration: 'none', 
          fontWeight: '600', 
          fontSize: '0.9rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.4rem',
          boxShadow: '0 2px 10px rgba(37, 99, 235, 0.1)'
        }}>
          <span style={{ fontSize: '1.1rem', lineHeight: '1', display: 'flex', alignItems: 'center' }}>←</span> Back to Home
        </Link>
        <div className="admin-login-card" style={{ width: '100%', maxWidth: '100%' }}>
        <h1 className="admin-login-title">Taurus Magnus Admin</h1>
        <p className="muted">Sign in to manage the price list.</p>
        <form onSubmit={handleSubmit} className="admin-form" noValidate>
          <label className="form-label">
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="form-input"
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
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="primary-btn" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  </div>
  )
}

export default AdminLogin
