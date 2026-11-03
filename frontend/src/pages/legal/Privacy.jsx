import Footer from '../../components/common/Footer'
import Navbar from '../../components/common/Navbar'

// PLACEHOLDER CONTENT — PENDING LEGAL REVIEW.
// Real privacy policy must be drafted by the client's lawyer (and reviewed for DPDP Act compliance) before publication.
const Privacy = () => {
  return (
    <div className="page-wrap">
      <Navbar />
      <main className="page-main legal-page">
        <h1>Privacy Policy</h1>
        <p>
          PLACEHOLDER CONTENT — PENDING LEGAL REVIEW. This page describes how Taurus Magnus collects, uses,
          and safeguards information you provide when using this website.
        </p>
        <p>
          PLACEHOLDER CONTENT — PENDING LEGAL REVIEW. We collect only the information necessary to respond
          to your enquiries and improve our services. We do not sell or rent your personal information to
          third parties.
        </p>
        <p>
          PLACEHOLDER CONTENT — PENDING LEGAL REVIEW. For any privacy-related requests, including access,
          correction, or deletion of your data, please contact us using the details provided on the Contact page.
        </p>
      </main>
      <Footer />
    </div>
  )
}

export default Privacy