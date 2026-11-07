import Footer from '../../components/common/Footer'
import Navbar from '../../components/common/Navbar'
import ComplianceRibbon from '../../components/common/ComplianceRibbon'

const Disclaimer = () => {
  return (
    <div className="page-wrap">
      <Navbar />
      <ComplianceRibbon />
      <main className="page-main legal-page legal-doc" style={{ maxWidth: '900px', margin: '2rem auto 4rem auto', padding: '0 1.5rem' }}>
        <header className="legal-header" style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Statutory Regulatory Disclaimer</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Last updated: October 2026 | Taurus Magnus (operated by SA Capitals)</p>
        </header>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', lineHeight: '1.7', color: '#334155', fontSize: '0.95rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>1. Platform Status & Non-SEBI Recognition</h2>
            <p>
              Taurus Magnus (accessible via taurusmagnus.in and managed by SA Capitals) is strictly an independent financial research, market analytics, and private-market information discovery portal. Taurus Magnus is <strong>NOT</strong> a stock exchange recognized by the Securities and Exchange Board of India (SEBI) under the Securities Contracts (Regulation) Act, 1956, nor does it hold registration as a stock broker, sub-broker, depository participant, portfolio manager, or registered investment adviser (RIA) under any SEBI regulations.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>2. Nature of Unlisted Shares & Bilateral Transactions</h2>
            <p>
              Unlisted shares and pre-IPO securities referred to on this platform are equity shares of public unlisted companies that are not admitted to trading on any recognized public stock exchange (such as the National Stock Exchange of India or BSE Limited). All transactions facilitated, discussed, or coordinated are strictly private, bilateral off-market transfers conducted directly between independent accredited buyers and sellers in dematerialised form through recognized depositories (CDSL and NSDL) pursuant to the provisions of the Companies Act, 2013 and applicable SEBI depository guidelines.
            </p>
            <p>
              Taurus Magnus does not operate an order matching book, automated trade clearing system, escrow depository, or counterparty settlement guarantee. The platform does not take custody of investor funds, execute stock trades on behalf of clients, or handle client securities.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>3. Indicative Pricing & Information Accuracy</h2>
            <p>
              All prices, lot sizes, 52-week price ranges, and historical movement indicators published on this platform are strictly <strong>indicative</strong>. They are derived from recent secondary off-market transactions, institutional block trades, employee stock option scheme (ESOP) buybacks, and official regulatory filings with the Ministry of Corporate Affairs (MCA).
            </p>
            <p>
              These indicative figures do not represent live public order book quotes and are subject to immediate change based on counterparty availability, lot size, market liquidity, and prevailing economic conditions. Taurus Magnus makes reasonable efforts to verify corporate information against statutory filings and audited reports; however, it makes no representations, warranties, or commitments regarding the timeliness, completeness, or absolute accuracy of any information.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>4. No Investment Advice or Solicitation</h2>
            <p>
              Nothing contained on this website, including research reports, corporate milestone events, sector analyses, or indicative price lists, constitutes financial advice, tax guidance, legal counsel, or a personal investment recommendation. The content is published exclusively for general educational, analytical, and informational purposes. No material on this website shall be construed as an offer to sell, or a solicitation of an offer to buy, any security in any jurisdiction.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>5. Inherent Risks in Pre-IPO & Unlisted Investments</h2>
            <p>
              Investing in unlisted and pre-IPO equities carries significant investment risk, including but not limited to:
            </p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li><strong>Illiquidity Risk:</strong> Unlike exchange-traded shares, unlisted shares lack a public secondary market. Liquidity is dependent on finding a willing counterparty.</li>
              <li><strong>IPO Uncertainty:</strong> Filing a Draft Red Herring Prospectus (DRHP) or announcing IPO plans does not guarantee that a company will list. Public offerings may be delayed, downsized, or cancelled due to market conditions or regulatory interventions.</li>
              <li><strong>Mandatory Statutory Lock-in:</strong> Under SEBI (ICDR) Regulations, pre-IPO shares held by non-promoters are subject to a mandatory 6-month lock-in period from the date of commercial listing on a recognized stock exchange.</li>
              <li><strong>Information Asymmetry:</strong> Unlisted companies are not subject to quarterly public disclosure mandates applicable to listed companies, which may limit ongoing operational visibility.</li>
              <li><strong>Capital Loss:</strong> Unlisted investments may experience substantial valuation drawdowns, and investors may lose a portion or the entirety of their invested capital.</li>
            </ul>
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>6. Independent Due Diligence & Investor Responsibility</h2>
            <p>
              Investors are strongly advised to consult with an independent SEBI-registered investment adviser, qualified tax consultant, and legal counsel before entering into any off-market share transaction. By accessing and using this website, you acknowledge that you bear sole responsibility for evaluating the merits and risks associated with any unlisted investment and that Taurus Magnus and its affiliates shall not be liable for any direct, indirect, incidental, or consequential losses arising from the use of or reliance on this platform.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default Disclaimer