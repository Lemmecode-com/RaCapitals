import Footer from '../../components/common/Footer'
import Navbar from '../../components/common/Navbar'
import ComplianceRibbon from '../../components/common/ComplianceRibbon'

const Privacy = () => {
  return (
    <div className="page-wrap">
      <Navbar />
      <ComplianceRibbon />
      <main className="page-main legal-page legal-doc" style={{ maxWidth: '900px', margin: '2rem auto 4rem auto', padding: '0 1.5rem' }}>
        <header className="legal-header" style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Privacy & Data Protection Policy</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            In compliance with the Digital Personal Data Protection (DPDP) Act, 2023 | Taurus Magnus (SA Capitals)
          </p>
        </header>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', lineHeight: '1.7', color: '#334155', fontSize: '0.95rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>1. Introduction & Scope</h2>
            <p>
              Taurus Magnus, operated by SA Capitals ("we", "our", or "us"), is committed to safeguarding your personal data and upholding your digital privacy rights. This Privacy Policy governs the collection, processing, storage, and protection of personal and financial identifiers collected when you visit our website (taurusmagnus.in), submit an enquiry for unlisted shares, or communicate with our research desk.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>2. Information We Collect</h2>
            <p>
              Depending on your interaction with the platform, we collect the following categories of information:
            </p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li><strong>Contact & Identity Data:</strong> Full name, verified mobile phone number, email address, and communication preferences provided through enquiry or contact forms.</li>
              <li><strong>Transaction & Demat Identifiers:</strong> Client Master Report (CMR) documents, CDSL/NSDL Demat Account Number, DP ID, and PAN (Permanent Account Number) required exclusively to facilitate authorized off-market share transfers.</li>
              <li><strong>Technical & Analytical Data:</strong> IP address, browser type, device identifiers, and page browsing patterns collected through cookies to enhance platform performance and security.</li>
            </ul>
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>3. Lawful Purpose of Data Processing</h2>
            <p>
              We process your personal data solely for explicit, lawful, and reasonable purposes, including:
            </p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>Responding directly to your requests for indicative share availability, pricing, and minimum lot sizes.</li>
              <li>Assisting you in executing bilateral off-market transfers with authorized counterparty documentation.</li>
              <li>Complying with statutory reporting requirements under the Prevention of Money Laundering Act (PMLA) and Income Tax Act.</li>
              <li>Preventing fraudulent activities, unauthorized access, and maintaining system integrity.</li>
            </ul>
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>4. Absolute Prohibition on Selling or Renting Data</h2>
            <p>
              <strong>We do not sell, rent, monetize, or trade your personal or financial data to third-party marketing companies under any circumstances.</strong> Your data is accessed strictly by authorized relationship managers and legal compliance personnel on a strict need-to-know basis.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>5. Data Security & Storage Architecture</h2>
            <p>
              We implement industry-grade technical and organizational security controls:
            </p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>All web transmission is encrypted using modern Transport Layer Security (TLS 1.3 / SSL 256-bit).</li>
              <li>Sensitive customer documents (such as CMRs and PAN records) are stored in encrypted, isolated environments with strict access logs.</li>
              <li>Regular security audits and automated vulnerability scans are conducted to protect against unauthorized breaches.</li>
            </ul>
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>6. Your Rights Under the DPDP Act</h2>
            <p>
              Under India's Digital Personal Data Protection Act, 2023, you hold the right to:
            </p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>Access a summary of the personal data processed by us and the processing activities undertaken.</li>
              <li>Request correction, updating, or completion of inaccurate or outdated personal data.</li>
              <li>Request erasure of your personal data where continued retention is no longer necessary for transaction or statutory audit purposes.</li>
              <li>Withdraw consent for optional communications at any time.</li>
            </ul>
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>7. Grievance Officer & Contact Information</h2>
            <p>
              For any questions, data modification requests, or privacy concerns, please contact our designated Data Protection & Grievance Officer:
            </p>
            <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
              <p style={{ margin: '0 0 0.25rem 0', fontWeight: 600 }}>Grievance Officer, Taurus Magnus (SA Capitals)</p>
              <p style={{ margin: '0 0 0.25rem 0' }}>Address: Shivam Colony, Behat Road, Saharanpur, Uttar Pradesh - 247001, India</p>
              <p style={{ margin: 0 }}>Email: <a href="mailto:taurusmagnus2026@gmail.com" style={{ color: '#2563eb' }}>taurusmagnus2026@gmail.com</a></p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default Privacy