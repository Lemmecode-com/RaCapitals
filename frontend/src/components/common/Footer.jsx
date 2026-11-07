import logo from '../../assets/logo-taurus-magnus.png'
import { Link } from 'react-router-dom'
import { getWhatsAppUrl } from '../../utils/whatsapp'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo-wrap brand-lockup">
            <img src={logo} alt="Taurus Magnus" className="footer-logo brand-logo-img" />
            <span className="brand-tagline footer-tagline"><span className="brand-tagline-accent">INVEST TODAY.</span> GROW TOMORROW.</span>
          </div>
          <p className="footer-text">
            An independent research, analytics, and price discovery platform for unlisted and pre-IPO shares in India.
          </p>
        </div>

        <div className="footer-col footer-col-platform">
          <h4>Platform</h4>
          <Link to="/catalog">Price List</Link>
          <Link to="/drhp-filed">DRHP Filed Shares</Link>
          <Link to="/events">Corporate Events</Link>
          <Link to="/insights">Market Insights</Link>
          <Link to="/about">About Us</Link>
        </div>

        <div className="footer-col footer-col-legal">
          <h4>Legal & Policies</h4>
          <Link to="/disclaimer">Regulatory Disclaimer</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/contact">Contact Support</Link>
        </div>

        <div className="footer-col footer-col-office">
          <h4>Registered Office</h4>
          <div className="footer-office-details">
            <p className="footer-office-name"><strong>SA CAPITALS</strong></p>
            <p>Shivam Colony, Behat Road</p>
            <p>Saharanpur, Uttar Pradesh - 247001</p>
            <p className="footer-contact-link">
              <span>Email:</span>{' '}
              <a href="mailto:taurusmagnus2026@gmail.com">taurusmagnus2026@gmail.com</a>
            </p>
            <p className="footer-contact-link">
              <span>Support:</span>{' '}
              <a href={getWhatsAppUrl('Hi, I need assistance with unlisted and pre-IPO shares on Taurus Magnus.')} target="_blank" rel="noopener noreferrer" className="footer-wa-link">
                Chat on WhatsApp →
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Issue #8: Official Regulatory Disclaimer Box */}
      <div className="footer-disclaimer-wrap">
        <div className="footer-disclaimer-box">
          <div className="footer-disclaimer-header">
            <span className="footer-disclaimer-badge">STATUTORY REGULATORY DISCLAIMER</span>
          </div>
          <p>
            <strong>Non-Exchange & Non-Broking Status:</strong> Taurus Magnus (operated by SA Capitals) is an independent financial research, analytics, and private-market information platform. Taurus Magnus is NOT a stock exchange recognized by the Securities and Exchange Board of India (SEBI) under the Securities Contracts (Regulation) Act, 1956, nor is it a registered stock broker, depository participant, portfolio manager, or investment adviser under SEBI regulations.
          </p>
          <p>
            <strong>Bilateral Off-Market Transfers:</strong> All unlisted and pre-IPO share transactions discussed or facilitated are private, bilateral arrangements conducted directly between independent accredited buyers and sellers via off-market Delivery Instruction Slips (DIS) through CDSL or NSDL depository accounts. Taurus Magnus does not match public buy/sell orders, operate a secondary trading platform, clear or guarantee trades, hold client securities, or accept custody of investor funds.
          </p>
          <p>
            <strong>Indicative Pricing & Risk Warning:</strong> Indicative share prices, lot sizes, 52-week ranges, and financial metrics displayed across this platform are compiled from secondary off-market trades, official Ministry of Corporate Affairs (MCA) filings, DRHP draft prospectuses, and private placement data. They do not constitute an offer to buy or sell, a public solicitation, or guaranteed exchange quotations. Private equity and unlisted share investments carry substantial capital risk, including illiquidity, extended holding periods, and valuation volatility. Past performance does not guarantee future listing valuations or capital appreciation. Investors must conduct their own independent legal, financial, and tax due diligence before executing any off-market transaction.
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p>© {new Date().getFullYear()} Taurus Magnus (SA Capitals). All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/disclaimer">Disclaimer</Link>
            <span>•</span>
            <Link to="/terms">Terms</Link>
            <span>•</span>
            <Link to="/privacy">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer