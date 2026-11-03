import Footer from '../../components/common/Footer'
import Navbar from '../../components/common/Navbar'

// PLACEHOLDER CONTENT — PENDING LEGAL REVIEW.
// Real disclaimer copy must be drafted by the client's lawyer before publication.
const Disclaimer = () => {
  return (
    <div className="page-wrap">
      <Navbar />
      <main className="page-main legal-page">
        <h1>Disclaimer</h1>
        <p>
          PLACEHOLDER CONTENT — PENDING LEGAL REVIEW. The information published on this website is provided
          for general informational purposes only and does not constitute investment advice, an offer to sell,
          or a solicitation of an offer to buy any security.
        </p>
        <p>
          PLACEHOLDER CONTENT — PENDING LEGAL REVIEW. Prices shown are indicative and derived from internal
          research; they are not sourced from any recognised stock exchange. Actual transaction prices may
          differ materially based on availability, lot size, and counterparty terms.
        </p>
        <p>
          PLACEHOLDER CONTENT — PENDING LEGAL REVIEW. Taurus Magnus does not guarantee the accuracy, completeness,
          or timeliness of any information on this site, and shall not be liable for any losses arising from
          reliance on it.
        </p>
      </main>
      <Footer />
    </div>
  )
}

export default Disclaimer