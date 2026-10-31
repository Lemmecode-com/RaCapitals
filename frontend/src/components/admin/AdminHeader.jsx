import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import ConfirmDialog from '../common/ConfirmDialog'
import logo from '../../assets/logo-taurus-magnus.png'

const AdminHeader = ({ onToggleSidebar, isSidebarOpen }) => {
  const { username, isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get('/contact/unread-count')
        setUnread(res.data.count || 0)
      } catch {
        // ignore
      }
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    window.addEventListener('contactRead', fetchUnread)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('contactRead', fetchUnread)
    }
  }, [])

  const openLogoutConfirm = () => setShowLogoutConfirm(true)
  const closeLogoutConfirm = () => setShowLogoutConfirm(false)

  const handleLogoutConfirm = () => {
    logout()
    setShowLogoutConfirm(false)
    navigate('/', { replace: true })
  }

  if (!isAuthenticated) return null

  return (
    <header className="admin-header-bar">
      <div className="admin-header-bar-inner">
        <div className="admin-header-bar-left">
          <button
            type="button"
            className={`admin-hamburger ${isSidebarOpen ? 'open' : ''}`}
            onClick={onToggleSidebar}
            aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={Boolean(isSidebarOpen)}
            aria-controls="admin-sidebar"
          >
            <span className="admin-hamburger-bar" />
            <span className="admin-hamburger-bar" />
            <span className="admin-hamburger-bar" />
          </button>
          <Link to="/admin" className="admin-header-bar-brand brand-lockup">
            <img src={logo} alt="Taurus Magnus" className="brand-logo-img" />
            <span className="brand-tagline">INVEST TODAY. GROW TOMORROW.</span>
          </Link>
        </div>
        <div className="admin-header-bar-right">
          <Link to="/admin/contacts" className="admin-header-bar-notif" aria-label="Contact submissions">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0v5a3 3 0 0 0 3 3v1H3v-1a3 3 0 0 0 3-3V8z" />
              <path d="M10 21a2 2 0 0 0 4 0" />
            </svg>
            {unread > 0 && <span className="admin-header-bar-badge">{unread}</span>}
          </Link>
          <span className="admin-header-bar-user">
            <span className="admin-header-bar-user-label">Signed in as </span>
            <span className="mono">{username}</span>
          </span>
          <button
            type="button"
            className="admin-logout-btn"
            onClick={openLogoutConfirm}
            aria-label="Log out"
          >
            Logout
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Log out?"
        message="You will need to sign in again to access the admin panel."
        confirmLabel="Log out"
        cancelLabel="Stay signed in"
        variant="neutral"
        onConfirm={handleLogoutConfirm}
        onCancel={closeLogoutConfirm}
      />
      {location.pathname === '/admin' && null}
    </header>
  )
}

export default AdminHeader
