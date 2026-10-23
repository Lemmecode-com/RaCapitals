import logo from '../../assets/logo-taurus-magnus.png'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <img src={logo} alt="Taurus Magnus" className="footer-logo" />
          <div>
            <p className="footer-brand-name">TAURUS MAGNUS</p>
            <p className="footer-text">
              Taurus Magnus is an information platform for unlisted & pre-IPO shares — not a stock exchange or broker.
            </p>
          </div>
        </div>
        <div className="footer-col">
          <h3>Platform</h3>
          <Link to="/catalog">Price List</Link>
          <Link to="/insights">Market Insights</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div className="footer-col">
          <h3>Legal</h3>
          <Link to="/disclaimer">Disclaimer</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
        </div>
        <div className="footer-col">
          <h3>Connect</h3>
          <a href="mailto:contact@taurusmagnus.example">Email Us</a>
          <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer">WhatsApp</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Taurus Magnus. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer