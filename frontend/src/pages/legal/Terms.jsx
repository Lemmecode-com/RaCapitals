import Footer from '../../components/common/Footer'
import Navbar from '../../components/common/Navbar'

// PLACEHOLDER CONTENT — PENDING LEGAL REVIEW.
// Real terms of service must be drafted by the client's lawyer before publication.
const Terms = () => {
  return (
    <div className="page-wrap">
      <Navbar />
      <main className="page-main legal-page">
        <h1>Terms of Use</h1>
        <p>
          PLACEHOLDER CONTENT — PENDING LEGAL REVIEW. By accessing this website you agree to be bound by
          these terms of use. If you do not agree, please discontinue use of the site immediately.
        </p>
        <p>
          PLACEHOLDER CONTENT — PENDING LEGAL REVIEW. Content on this site, including text, graphics, and
          indicative pricing data, is the property of Taurus Magnus and is protected by applicable intellectual
          property laws. You may not reproduce or redistribute content without prior written consent.
        </p>
        <p>
          PLACEHOLDER CONTENT — PENDING LEGAL REVIEW. Taurus Magnus reserves the right to modify these terms
          at any time. Continued use of the site following any changes constitutes acceptance of the new terms.
        </p>
      </main>
      <Footer />
    </div>
  )
}

export default Terms