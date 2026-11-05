import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/logo-taurus-magnus.png'

const Navbar = () => {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const onAdmin = location.pathname.startsWith('/admin')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = () => setIsMenuOpen((v) => !v)
  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className={`navbar ${isScrolled ? 'is-scrolled' : ''}`}>
      <div className="navbar-inner">
        <Link to="/" className="wordmark brand-lockup" onClick={closeMenu}>
          <img src={logo} alt="Taurus Magnus" className="brand-logo-img" />
          <span className="brand-tagline"><span className="brand-tagline-accent">INVEST TODAY.</span> GROW TOMORROW.</span>
        </Link>

        <button
          type="button"
          className={`nav-hamburger ${isMenuOpen ? 'open' : ''}`}
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          aria-controls="primary-nav"
        >
          <span className="nav-hamburger-bar" />
          <span className="nav-hamburger-bar" />
          <span className="nav-hamburger-bar" />
        </button>

        <nav
          id="primary-nav"
          className={`nav-links ${isMenuOpen ? 'open' : ''}`}
        >
          <NavLink to="/" end onClick={closeMenu}>Home</NavLink>
          <NavLink to="/catalog" onClick={closeMenu}>Price List</NavLink>
          <NavLink to="/drhp-filed" onClick={closeMenu}>DRHP Filed</NavLink>
          <NavLink to="/events" onClick={closeMenu}>Events</NavLink>
          <NavLink to="/insights" onClick={closeMenu}>Insights</NavLink>
          <NavLink to="/about" onClick={closeMenu}>About us</NavLink>
          <NavLink to="/contact" onClick={closeMenu}>Contact us</NavLink>
          {onAdmin && (
            <NavLink to="/admin" onClick={closeMenu}>
              {isAuthenticated ? 'Dashboard' : 'Login'}
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
