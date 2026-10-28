import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../../components/common/Footer'
import Navbar from '../../components/common/Navbar'
import ComplianceRibbon from '../../components/common/ComplianceRibbon'

const Terms = () => {
  const [showTopBtn, setShowTopBtn] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="page-wrap">
      <Navbar />
      <ComplianceRibbon />

      <main className="page-main legal-page legal-doc">
        <header className="legal-header">
          <h1>Terms of Use</h1>
          <div className="legal-meta">
            <span className="legal-badge">Version 1.0</span>
            <span className="legal-badge">Effective: 27 October 2026</span>
          </div>
        </header>

        <div className="legal-draft-banner" role="note">
          <strong>Draft: pending legal review.</strong> This document is a working draft and has not yet been approved by our legal counsel. Highlighted fields are still to be completed.
        </div>

        <div className="legal-intro">
          <p>
            Please read these Terms of Use carefully before using this website. They explain what Taurus Magnus is, what it is not, and the rules that apply when you browse our price list, read our insights or send us an enquiry about an unlisted or pre-IPO share.
          </p>
        </div>

        <nav id="toc" className="legal-toc" aria-label="Contents">
          <h2>Contents</h2>
          <ol>
            <li><a href="#section-1">About these Terms and the Platform</a></li>
            <li><a href="#section-2">Nature of the Platform</a></li>
            <li><a href="#section-3">Indicative Prices and Information</a></li>
            <li><a href="#section-4">Enquiries and Transactions</a></li>
            <li><a href="#section-5">Eligibility and Your Responsibilities</a></li>
            <li><a href="#section-6">Acceptable Use</a></li>
            <li><a href="#section-7">Insights and Research Content</a></li>
            <li><a href="#section-8">Intellectual Property</a></li>
            <li><a href="#section-9">Third-Party Services and Links</a></li>
            <li><a href="#section-10">Disclaimers</a></li>
            <li><a href="#section-11">Limitation of Liability</a></li>
            <li><a href="#section-12">Indemnity</a></li>
            <li><a href="#section-13">Changes to the Platform and Access</a></li>
            <li><a href="#section-14">Governing Law and Disputes</a></li>
            <li><a href="#section-15">Changes to these Terms</a></li>
            <li><a href="#section-16">General</a></li>
            <li><a href="#section-17">Contact Us</a></li>
          </ol>
        </nav>

        <section id="section-1" className="legal-section">
          <h2><span className="legal-num">1.</span> About these Terms and the Platform</h2>
          <p>
            These Terms of Use (the &quot;Terms&quot;) govern your access to and use of the website operated under the name Taurus Magnus (the &quot;Platform&quot;). The Platform is owned and operated by Taurus Magnus (registration no. <mark className="legal-ph">[CIN / LLPIN / registration number]</mark>), whose registered office is at SA CAPITALS, Shivam Colony, Behat Road, Saharanpur, Uttar Pradesh (&quot;Taurus Magnus&quot;, &quot;we&quot;, &quot;us&quot; or &quot;our&quot;).
          </p>
          <p>
            Taurus Magnus is an information and research platform for unlisted and pre-IPO shares in India. On the Platform you can browse indicative prices, lot sizes, corporate events, DRHP filing information and market insight articles, and you can send us an enquiry about a company you are interested in.
          </p>
          <p>
            By accessing or using the Platform you confirm that you have read, understood and agreed to these Terms, together with our <Link to="/privacy">Privacy Policy</Link>, <Link to="/disclaimer">Declaration of Risk</Link> and <Link to="/disclaimer">Disclaimer</Link>, which form part of these Terms. If you do not agree, please stop using the Platform.
          </p>
        </section>

        <section id="section-2" className="legal-section">
          <h2><span className="legal-num">2.</span> Nature of the Platform</h2>
          <p>Please understand clearly what the Platform does and does not do:</p>
          <ul>
            <li>Taurus Magnus is not a stock exchange, stock broker, investment adviser or depository participant, and does not offer regulated investment services.</li>
            <li>We do not run a trading terminal, match buy and sell orders, execute trades on your behalf, or hold client funds or securities.</li>
            <li>Unlisted and pre-IPO shares are not traded on any recognised stock exchange order book.</li>
            <li>Nothing on the Platform is an offer, invitation, solicitation, recommendation or advice to buy, sell or hold any security.</li>
          </ul>
        </section>

        <section id="section-3" className="legal-section">
          <h2><span className="legal-num">3.</span> Indicative Prices and Information</h2>
          <p>
            Prices shown on the Platform are indicative only. They are estimates based on our own research, are entered manually by our team and are updated from time to time. They are not taken from a live exchange, broker feed or any other real-time source.
          </p>
          <p>
            Price history and charts show the indicative prices we have recorded in the past. They are provided for information and research purposes only. They are not market quotes, and past prices do not indicate future prices.
          </p>
          <p>
            The price at which any transaction may actually take place can differ materially from the indicative price, depending on availability, lot size, timing and the terms agreed between the buyer and the seller.
          </p>
          <p>
            Other information on the Platform (such as DRHP filing details, corporate events and company data) is compiled from public filings, company disclosures and our own research. It may be incomplete, delayed or out of date. Please verify anything important against official sources such as the company, SEBI, the stock exchanges and the Ministry of Corporate Affairs before relying on it.
          </p>
        </section>

        <section id="section-4" className="legal-section">
          <h2><span className="legal-num">4.</span> Enquiries and Transactions</h2>
          <p>
            You can contact us through the &quot;Enquire&quot; buttons (which open WhatsApp), by email or through the contact form. An enquiry is only a request for information. It is not an order, an offer or a commitment by you or by us, and no sale or purchase exists until the buyer and the seller have agreed and signed the relevant transaction documents.
          </p>
          <p>
            We may reply with current availability, lot size and next steps. Availability and prices can change at any time without notice, and we may decline or stop dealing with any enquiry without giving a reason.
          </p>
          <p>
            Any purchase or sale of shares is a private, bilateral arrangement between a buyer and a seller. It takes place off the exchange, by demat-to-demat transfer, on the terms they agree. Taurus Magnus may help coordinate between interested parties, but we are not a party to or a counterparty in that transaction, and we do not act as a clearing or settlement body. We do not guarantee that any transaction will be completed, or the title, delivery, payment or settlement of any shares.
          </p>
          <p>
            You are responsible for your own due diligence and for complying with all laws that apply to you, including KYC and anti-money-laundering requirements, foreign exchange rules, stamp duty and tax.
          </p>
          <div className="legal-callout">
            <p>We will never ask for your demat login, password, OTP or card details. Please do not send such details in an enquiry.</p>
          </div>
        </section>

        <section id="section-5" className="legal-section">
          <h2><span className="legal-num">5.</span> Eligibility and Your Responsibilities</h2>
          <ul>
            <li>You must be at least 18 years old and capable of entering into a binding contract under the Indian Contract Act, 1872. If you use the Platform for a company or other entity, you confirm you have authority to do so.</li>
            <li>If you are resident outside India (including a non-resident Indian or a foreign entity), you are responsible for checking that you may invest in unlisted shares under the foreign exchange laws and other rules that apply to you.</li>
            <li>The information you give us must be true, accurate and complete.</li>
            <li>You must make your own investment decisions, after reading the <Link to="/disclaimer">Declaration of Risk</Link> and taking independent financial, legal and tax advice where appropriate.</li>
          </ul>
        </section>

        <section id="section-6" className="legal-section">
          <h2><span className="legal-num">6.</span> Acceptable Use</h2>
          <p>When using the Platform you agree not to:</p>
          <ul>
            <li>break any law or the rights of any person, or submit false, misleading or abusive information;</li>
            <li>copy, scrape, harvest or republish our prices, price history, articles or other content in bulk, or use them to build a competing product or service, without our written permission;</li>
            <li>attempt to gain unauthorised access to the Platform, its servers, databases or administrator areas, or probe, test or interfere with its security;</li>
            <li>introduce viruses or other harmful code, or overload or disrupt the Platform;</li>
            <li>impersonate another person or misrepresent your identity or your connection with any person;</li>
            <li>use the Platform for spam, or to send us unlawful or unwanted material through the contact form or any other channel.</li>
          </ul>
        </section>

        <section id="section-7" className="legal-section">
          <h2><span className="legal-num">7.</span> Insights and Research Content</h2>
          <p>
            Articles, insights and research published on the Platform are for education and information only. They express views and analysis as at the date of publication, may be updated or withdrawn, and are not investment advice or a recommendation. If you need advice, please consult a suitably registered investment adviser.
          </p>
          <p>
            Where content refers to third-party information or opinions, we do not endorse it and are not responsible for its accuracy.
          </p>
        </section>

        <section id="section-8" className="legal-section">
          <h2><span className="legal-num">8.</span> Intellectual Property</h2>
          <p>
            The Platform, including its text, articles, graphics, logo, design, software, compiled price data and price history, belongs to Taurus Magnus or its licensors and is protected by Indian and international intellectual property laws. Third-party names, logos and marks belong to their respective owners.
          </p>
          <p>
            We give you a limited, personal, non-exclusive, non-transferable permission to view the Platform and to print or save content for your own personal, non-commercial use, provided you keep all copyright and other notices. Any other use, including copying, reproducing, distributing or creating derivative works, needs our prior written consent.
          </p>
        </section>

        <section id="section-9" className="legal-section">
          <h2><span className="legal-num">9.</span> Third-Party Services and Links</h2>
          <p>
            The Platform relies on or links to services run by others, for example WhatsApp (when you tap an Enquire button), Google Fonts (to display fonts) and external websites. We do not control these services or sites and are not responsible for their content, availability or privacy practices. Your use of them is governed by their own terms and policies. A link is not an endorsement.
          </p>
        </section>

        <section id="section-10" className="legal-section">
          <h2><span className="legal-num">10.</span> Disclaimers</h2>
          <p>
            To the fullest extent permitted by law, the Platform and all information on it are provided &quot;as is&quot; and &quot;as available&quot;, without warranties of any kind, whether express or implied. We do not promise that the Platform will be uninterrupted, secure or error-free, or that any information on it is accurate, complete or current.
          </p>
          <p>
            Investing in unlisted and pre-IPO shares is high risk and you can lose all of the money you invest. Please read the <Link to="/disclaimer">Declaration of Risk</Link> and the <Link to="/disclaimer">Disclaimer</Link>.
          </p>
        </section>

        <section id="section-11" className="legal-section">
          <h2><span className="legal-num">11.</span> Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, Taurus Magnus and its directors, partners, employees and representatives will not be liable for any indirect, incidental, special or consequential loss, or for any loss of profit, revenue, opportunity or goodwill, or for any investment loss, arising out of or in connection with your use of, or reliance on, the Platform or its content, or any transaction you enter into with a third party.
          </p>
          <p>
            Where liability cannot be excluded by law, our total liability to you in connection with the Platform will not exceed <mark className="legal-ph">[AMOUNT, e.g. Rs. 1,00,000]</mark> in aggregate. Nothing in these Terms excludes liability that cannot lawfully be excluded, including liability for fraud.
          </p>
        </section>

        <section id="section-12" className="legal-section">
          <h2><span className="legal-num">12.</span> Indemnity</h2>
          <p>
            You agree to indemnify and keep Taurus Magnus harmless against any claim, loss, liability or reasonable expense arising from your breach of these Terms, your misuse of the Platform, or your violation of any law or any third party&apos;s rights.
          </p>
        </section>

        <section id="section-13" className="legal-section">
          <h2><span className="legal-num">13.</span> Changes to the Platform and Access</h2>
          <p>
            We may change, suspend or discontinue any part of the Platform, and restrict or block access for any person, at any time, including where we believe these Terms have been breached or where the law requires it. We will not be liable for any such action taken in good faith.
          </p>
        </section>

        <section id="section-14" className="legal-section">
          <h2><span className="legal-num">14.</span> Governing Law and Disputes</h2>
          <p>
            These Terms are governed by the laws of India. If a dispute arises, the parties will first try to resolve it in good faith through discussion for 30 days after one party gives the other written notice of the dispute. If it is not resolved in that time, the courts at Saharanpur, Uttar Pradesh will have exclusive jurisdiction.
          </p>
        </section>

        <section id="section-15" className="legal-section">
          <h2><span className="legal-num">15.</span> Changes to these Terms</h2>
          <p>
            We may update these Terms from time to time. The current version and its effective date are shown at the top of this page, and changes take effect when they are posted. Your continued use of the Platform after a change means you accept the updated Terms, so please check this page periodically.
          </p>
        </section>

        <section id="section-16" className="legal-section">
          <h2><span className="legal-num">16.</span> General</h2>
          <ul>
            <li>Entire agreement: these Terms, with the Privacy Policy, Declaration of Risk and Disclaimer, are the whole agreement between you and us about the Platform.</li>
            <li>Severability: if any part of these Terms is found invalid or unenforceable, the rest remains in effect.</li>
            <li>No waiver: a delay or failure to enforce a right is not a waiver of that right.</li>
            <li>No partnership: nothing in these Terms makes you and us partners, joint venturers, agents or employer and employee.</li>
            <li>Electronic record: these Terms are an electronic record under the Information Technology Act, 2000 and do not need any physical or digital signature.</li>
          </ul>
        </section>

        <section id="section-17" className="legal-section">
          <h2><span className="legal-num">17.</span> Contact Us</h2>
          <p>
            <strong>Taurus Magnus</strong><br/>
            SA CAPITALS, Shivam Colony, Behat Road, Saharanpur, Uttar Pradesh, India<br/>
            Email: <a href="mailto:taurusmagnus2026@gmail.com">taurusmagnus2026@gmail.com</a><br/>
            Phone / WhatsApp: <a href="https://wa.me/919149169733" target="_blank" rel="noopener noreferrer">+91 91491 69733</a>
          </p>
          <p>
            For privacy-related requests and complaints, please see the Grievance Officer details in our <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </section>

        <nav className="legal-related" aria-label="Related legal documents">
          <span className="legal-related-label">Related documents:</span>
          <Link to="/terms">Terms of Use</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/disclaimer">Declaration of Risk &amp; Disclaimer</Link>
        </nav>
      </main>

      {showTopBtn && (
        <button
          type="button"
          className="legal-back-to-top"
          onClick={scrollToTop}
          aria-label="Back to top"
          title="Back to top"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 15l-6-6-6 6" />
          </svg>
          <span>Top</span>
        </button>
      )}

      <Footer />
    </div>
  )
}

export default Terms