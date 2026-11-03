import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Blog from './models/Blog.js'

dotenv.config()

export const seedBlogsData = [
  {
    slug: 'swiggy-pre-ipo-valuation-analysis',
    title: 'Swiggy Pre-IPO Valuation Analysis: Quick Commerce Economics & DRHP Takeaways',
    subtitle: 'A granular look into Instamart unit economics, dark store density, revenue multiples, and what Swiggy’s public listing signals for early unlisted equity investors.',
    category: 'Valuation & Analysis',
    readTime: '6 min read',
    publishedDate: new Date('2026-10-14'),
    author: 'RA Research Desk',
    authorRole: 'Equity & Private Markets Analyst',
    featured: true,
    status: 'published',
    coverImage: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80',
    tags: ['Swiggy', 'Pre-IPO', 'Quick Commerce', 'Valuation', 'DRHP'],
    excerpt: 'Instamart’s rapid expansion is reshaping Swiggy’s overall EBITDA profile. Here is our breakdown of order frequency, average order values (AOV), and pre-IPO valuation benchmarks against Zomato and Blinkit.',
    contentHtml: `
      <div class="insight-lead">
        As Swiggy gears up for its highly anticipated public market debut, private market interest has hit historic highs. For unlisted equity investors, understanding the underlying unit economics of quick commerce is critical to determining fair entry valuations.
      </div>

      <div class="insight-callout">
        <h4>Key Takeaways</h4>
        <ul>
          <li><strong>Quick Commerce Pivot:</strong> Instamart now accounts for over 35% of Swiggy’s consolidated revenue run rate, growing at a 55%+ CAGR.</li>
          <li><strong>Margin Trajectory:</strong> Dark store contribution margins turned positive across tier-1 mature clusters in Q1 FY25.</li>
          <li><strong>Valuation Multiples:</strong> At current unlisted market price bands, Swiggy is trading at a notable discount to listed peer enterprise-value-to-sales multiples.</li>
        </ul>
      </div>

      <h2>1. The Shift from Food Delivery to Hyperlocal Quick Commerce</h2>
      <p>While core food delivery continues to generate stable operational cash flow with mature take-rates averaging 23-24%, the primary growth driver that investors are pricing in is <strong>Instamart</strong>. Quick commerce dark stores have transformed from simple grocery delivery hubs into general merchandise and electronics fulfillment centers.</p>
      
      <p>With Average Order Value (AOV) crossing ₹520 and throughput reaching 1,200 orders/day per dark store in prime catchment areas, fixed operational costs are amortizing significantly faster than anticipated in earlier funding rounds.</p>

      <h2>2. Financial Performance & Peer Comparison</h2>
      <p>The table below summarizes key metrics comparing Swiggy's pre-IPO unlisted indicators against listed counterpart Zomato:</p>

      <div class="insight-table-wrap">
        <table class="insight-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Swiggy (Pre-IPO)</th>
              <th>Zomato (Listed)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Consolidated Gross Order Value (GOV)</strong></td>
              <td>₹32,500 Cr+</td>
              <td>₹45,000 Cr+</td>
            </tr>
            <tr>
              <td><strong>Quick Commerce Annualized Run Rate</strong></td>
              <td>₹11,800 Cr</td>
              <td>₹17,200 Cr (Blinkit)</td>
            </tr>
            <tr>
              <td><strong>Dark Store Count</strong></td>
              <td>600+ Operational</td>
              <td>680+ Operational</td>
            </tr>
            <tr>
              <td><strong>Implied EV / Sales Multiple</strong></td>
              <td>~6.8x - 7.5x</td>
              <td>~11.5x - 12.8x</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>3. What Should Pre-IPO Investors Watch Out For?</h2>
      <p>When investing in pre-IPO equity ahead of an impending listing, prospective shareholders must track two critical parameters:</p>
      <ul>
        <li><strong>Lock-in Periods:</strong> Post-IPO, pre-listing shareholders are subject to mandatory regulatory lock-in requirements as prescribed under SEBI (ICDR) Regulations (typically 6 months from the date of allotment).</li>
        <li><strong>Anchor Book Allocation & Price Discovery:</strong> How institutional anchor investors price the primary book will determine initial listing day momentum versus private market purchase prices.</li>
      </ul>

      <blockquote>
        "The valuation arbitrage between private market transactions and public market liquidity offers attractive upside, provided the entry multiple respects conservative margin expansion timelines."
      </blockquote>

      <h2>4. Summary & Investment Perspective</h2>
      <p>Swiggy represents a generational consumer internet franchise in India. For high-net-worth investors and family offices looking to build exposure prior to public subscription, lot sizes and counterparty verification remain the paramount operational steps.</p>
    `,
    relatedSlugs: ['drhp-filed-companies-what-investors-should-track', 'how-unlisted-shares-transferred-demat']
  },
  {
    slug: 'how-unlisted-shares-transferred-demat',
    title: 'How Are Unlisted Shares Actually Transferred? A Complete Demat & Off-Market Guide',
    subtitle: 'Everything an investor needs to know about off-market DIS slips, CDSL easiest, NSDL Speed-e, stamp duty rates, and demat-to-demat settlement safety.',
    category: 'Guides & Education',
    readTime: '5 min read',
    publishedDate: new Date('2026-10-08'),
    author: 'Compliance & Ops',
    authorRole: 'Head of Settlement & Clearing',
    featured: false,
    status: 'published',
    coverImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
    tags: ['Demat', 'Off-Market', 'CDSL', 'NSDL', 'Investor Education'],
    excerpt: 'Buying unlisted shares does not happen on the NSE or BSE terminal. Learn the step-by-step process of off-market delivery instructions, mandatory stamp duty, and verifying ISINs.',
    contentHtml: `
      <div class="insight-lead">
        One of the most common questions new investors ask is: <em>"If unlisted shares aren't on the stock exchange terminal, where do the shares live and how do I receive them?"</em> Here is the complete end-to-end operational roadmap.
      </div>

      <div class="insight-callout">
        <h4>The Golden Rule</h4>
        <p>Unlisted shares are held in the exact same <strong>Demat account (CDSL or NSDL)</strong> where you hold your regular listed shares (such as TCS or Reliance). They carry a unique 12-character ISIN code starting with "INE".</p>
      </div>

      <h2>Step 1: Verification of the ISIN & Company Record</h2>
      <p>Before agreeing to an unlisted share transaction, verify the International Securities Identification Number (ISIN). For example, every unlisted share listed on Taurus Magnus displays its verified ISIN on the detail page. You can verify this ISIN against official CDSL or NSDL depository directories.</p>

      <h2>Step 2: Understanding the Off-Market Transfer Mechanism</h2>
      <p>Since the shares are not cleared through standard clearing corporations (like ICCL or NSE Clearing), the transaction takes place as an <strong>Off-Market Demat-to-Demat Transfer</strong>:</p>
      <ol>
        <li><strong>Buyer provides Client Master Report (CMR):</strong> The buyer submits their digitally signed or broker-stamped CMR showing their 16-digit Demat Account number (DP ID + Client ID) and PAN.</li>
        <li><strong>Seller executes Delivery Instruction Slip (DIS):</strong> The seller enters the buyer's Demat details, the ISIN, the exact quantity of shares, and the agreed consideration value.</li>
        <li><strong>Execution via Depository Portal:</strong> Using <em>CDSL Easiest</em> or <em>NSDL Speed-e</em>, the seller completes OTP / e-sign validation.</li>
      </ol>

      <h2>Step 3: Stamp Duty & Consideration Payment</h2>
      <p>Under the Indian Stamp Act, off-market transfer of unlisted equity shares attracts a stamp duty of <strong>0.015%</strong> of the consideration value, which is remitted directly to the depository platform. Both counterparties receive SMS and email notifications from CDSL/NSDL within minutes of settlement.</p>

      <h2>Safety Checklist for Investors</h2>
      <ul>
        <li>Never initiate a transaction without receiving the seller's verified Demat holding proof or working with an established intermediary.</li>
        <li>Ensure your DP allows incoming off-market transfers without manual pre-authorization (most modern brokers like Zerodha, Groww, Upstox, and ICICI Direct support seamless transfers).</li>
        <li>Maintain all payment transaction proofs for future capital gains tax documentation.</li>
      </ul>
    `,
    relatedSlugs: ['taxation-on-unlisted-shares-in-india', 'swiggy-pre-ipo-valuation-analysis']
  },
  {
    slug: 'tata-capital-ipo-expectations-nbfc-sector',
    title: 'Tata Capital IPO Prospects: Riding the Upper-Layer NBFC Mandate',
    subtitle: 'Evaluating Tata Capital’s balance sheet, loan book diversification, asset quality, and the mandatory RBI listing roadmap.',
    category: 'Pre-IPO News',
    readTime: '4 min read',
    publishedDate: new Date('2026-09-29'),
    author: 'RA Research Desk',
    authorRole: 'Equity & Private Markets Analyst',
    featured: false,
    status: 'published',
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    tags: ['Tata Capital', 'NBFC', 'RBI', 'Pre-IPO', 'Finance'],
    excerpt: 'Under the RBI’s scale-based regulatory framework, upper-layer NBFCs must be listed on public exchanges. Here is why Tata Capital has become a flagship private market darling.',
    contentHtml: `
      <div class="insight-lead">
        The Reserve Bank of India’s Scale-Based Regulation (SBR) framework has mandated that non-banking financial companies categorized in the Upper Layer (NBFC-UL) must list their equity shares within three years of identification. Tata Capital stands front and center in this cohort.
      </div>

      <h2>Robust Balance Sheet & Diverse Credit Verticals</h2>
      <p>Tata Capital has engineered a high-velocity loan portfolio spanning retail consumer loans, SME lending, and commercial vehicle finance. Unlike single-product NBFCs, its risk concentration is well mitigated across salaried and corporate demographics.</p>

      <div class="insight-callout">
        <h4>Key Highlights</h4>
        <ul>
          <li><strong>Assets Under Management (AUM):</strong> Trajectory exceeding ₹1,50,000 Cr with net interest margins (NIMs) sustaining above 4.5%.</li>
          <li><strong>Gross NPA:</strong> Maintained under 1.6%, positioning it among the healthiest balance sheets in the Indian shadow banking system.</li>
          <li><strong>Parentage Advantage:</strong> The Tata brand ensures prime credit ratings (AAA/Stable), unlocking the lowest cost of funds in the commercial paper market.</li>
        </ul>
      </div>

      <h2>Pre-IPO Price Action & Liquidity Trends</h2>
      <p>Throughout the past four quarters, Tata Capital unlisted shares have demonstrated consistent institutional absorption. Long-term wealth management desks frequently utilize this counter to anchor clients’ pre-IPO equity allocations due to minimal downside volatility.</p>
    `,
    relatedSlugs: ['swiggy-pre-ipo-valuation-analysis', 'nse-unlisted-shares-fair-value-case-study']
  },
  {
    slug: 'drhp-filed-companies-what-investors-should-track',
    title: '5 Critical Things to Look for in a Company’s DRHP Before Investing',
    subtitle: 'From Fresh Issue vs Offer for Sale (OFS) to outstanding litigations and auditor remarks: how to decode a Draft Red Herring Prospectus like a pro.',
    category: 'Guides & Education',
    readTime: '7 min read',
    publishedDate: new Date('2026-09-20'),
    author: 'Equity Research',
    authorRole: 'Senior Research Analyst',
    featured: false,
    status: 'published',
    coverImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
    tags: ['DRHP', 'SEBI', 'IPO Analysis', 'Due Diligence'],
    excerpt: 'When a pre-IPO company files its DRHP with SEBI, hundreds of pages of confidential financial disclosures become public. Here are the 5 pages you must read first.',
    contentHtml: `
      <div class="insight-lead">
        A Draft Red Herring Prospectus (DRHP) often exceeds 400 pages of dense legal and regulatory prose. For unlisted equity investors, the DRHP is the ultimate goldmine of audited facts. Here is how to analyze it in under 30 minutes.
      </div>

      <h2>1. The Objects of the Offer: Fresh Issue vs OFS</h2>
      <p>Look at the very first chapter detailing the composition of the capital raise:</p>
      <ul>
        <li><strong>Fresh Issue:</strong> New capital entering the company treasury to retire debt, build factories, or invest in R&D. This expands the book value.</li>
        <li><strong>Offer for Sale (OFS):</strong> Existing promoters or VC/PE investors selling their existing shares to take cash off the table. A 100% OFS implies zero growth capital is entering the business.</li>
      </ul>

      <h2>2. Restated Consolidated Financial Statements</h2>
      <p>Skip the marketing summaries and turn straight to the audited Annexures. Check 3-year revenue trends, EBITDA margins, and cash flows from operating activities. Always watch out for companies showing accounting profitability purely driven by "Other Income" rather than core operational revenue.</p>

      <h2>3. Contingent Liabilities & Outstanding Litigations</h2>
      <p>Check the legal proceedings section. Material tax disputes with GST or Income Tax authorities that exceed 5-10% of the company's net worth can pose serious listing day drag.</p>

      <h2>4. Related Party Transactions (RPTs)</h2>
      <p>Analyze transactions between the company and promoter-owned entities. High consulting fees, royalty payments, or lease agreements with promoter relatives are common corporate governance red flags.</p>

      <h2>5. Pre-IPO Placement Authorization</h2>
      <p>Check if the DRHP reserves a window for a Pre-IPO placement (up to 20% of the fresh issue size). If top tier mutual funds or marquee institutional investors subscribe in this round, it provides a strong validation anchor for private market pricing.</p>
    `,
    relatedSlugs: ['how-unlisted-shares-transferred-demat', 'swiggy-pre-ipo-valuation-analysis']
  },
  {
    slug: 'nse-unlisted-shares-fair-value-case-study',
    title: 'NSE India Unlisted Shares: Operating Margins, Moats, and IPO Timeline',
    subtitle: 'Why the National Stock Exchange of India remains one of the most traded private market equity counters and how regulatory approvals impact sentiment.',
    category: 'Valuation & Analysis',
    readTime: '5 min read',
    publishedDate: new Date('2026-09-12'),
    author: 'RA Research Desk',
    authorRole: 'Equity & Private Markets Analyst',
    featured: false,
    status: 'published',
    coverImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    tags: ['NSE', 'Stock Exchange', 'Monopoly', 'Valuation'],
    excerpt: 'With astronomical operating profit margins and a near-monopoly in equity derivatives trading, National Stock Exchange (NSE) is India’s premier unlisted asset.',
    contentHtml: `
      <div class="insight-lead">
        The National Stock Exchange of India (NSE) is the world’s largest derivative exchange by contract volume and India’s unquestioned leader in cash equity trading. Operating with margins reminiscent of premier global financial infrastructure monopolies, it continues to capture heavy investor allocations.
      </div>

      <h2>Financial Superpower: Unrivaled Operating Margins</h2>
      <p>NSE’s business model possesses high operating leverage. Incremental trading volume incur virtually zero additional marginal cost to the technology infrastructure, allowing operating margins to comfortably top 65-70%.</p>

      <div class="insight-callout">
        <h4>Core Value Engines</h4>
        <ul>
          <li><strong>Transaction Charges:</strong> Massive liquidity pools create a self-reinforcing network effect.</li>
          <li><strong>Colocation & Data Services:</strong> Recurring subscription revenue from algorithmic trading desks and institutional brokerages.</li>
          <li><strong>Index & Licensing Fees:</strong> Global adoption of NIFTY 50 and NIFTY Bank benchmarks.</li>
        </ul>
      </div>

      <h2>Regulatory Considerations</h2>
      <p>The primary overhang that has historically delayed the IPO date revolves around regulatory clearances regarding legacy co-location matters. As resolution milestones progress, investor confidence and private market trading volumes reflect steady upside re-rating.</p>
    `,
    relatedSlugs: ['tata-capital-ipo-expectations-nbfc-sector', 'taxation-on-unlisted-shares-in-india']
  },
  {
    slug: 'taxation-on-unlisted-shares-in-india',
    title: 'Capital Gains Tax on Unlisted Shares in India: STCG vs LTCG Rules Explained',
    subtitle: 'Holding periods, indexation benefits, Section 50CA fair market valuations, and how to stay compliant with IT department requirements.',
    category: 'Tax & Legal',
    readTime: '4 min read',
    publishedDate: new Date('2026-08-28'),
    author: 'Taxation Advisory',
    authorRole: 'Chartered Accountant & Tax Specialist',
    featured: false,
    status: 'published',
    coverImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
    tags: ['Taxation', 'LTCG', 'STCG', 'Income Tax', 'Compliance'],
    excerpt: 'Taxation on unlisted shares differs substantially from regular stock exchange investments. Here is the breakdown of holding periods and tax slabs for FY 2025-26.',
    contentHtml: `
      <div class="insight-lead">
        Investing in unlisted equity is legally compliant and straightforward in India, but tax rates and holding period criteria differ markedly from shares traded on the NSE/BSE. Here is what every retail and HNI investor must know.
      </div>

      <h2>1. Holding Period Threshold: 24 Months</h2>
      <p>Unlike listed equity where the Long-Term Capital Gains (LTCG) holding threshold was 12 months, for <strong>unlisted shares</strong>, the cutoff is <strong>24 months (2 years)</strong> from the date of credit to your Demat account.</p>
      <ul>
        <li><strong>Short-Term Capital Gains (STCG):</strong> Held for 24 months or less. Taxed at your applicable income tax slab rate.</li>
        <li><strong>Long-Term Capital Gains (LTCG):</strong> Held for more than 24 months. Taxed at prescribed capital gains rates (as amended under prevailing Finance Acts).</li>
      </ul>

      <h2>2. Understanding Section 50CA & Fair Market Value (FMV)</h2>
      <p>Under Section 50CA of the Income Tax Act, when an unlisted share is transferred at a price below its certified Fair Market Value (computed by a registered merchant banker or CA via Rule 11UA), the FMV is deemed to be the full value of consideration for calculating capital gains for the seller.</p>

      <h2>3. What Happens When the Company Goes for an IPO?</h2>
      <p>If you purchase unlisted shares and hold them through the public listing, your acquisition date remains the original date of off-market purchase! However, when you sell those shares post-listing through the stock exchange (subject to the post-IPO lock-in expiry), the transaction attracts regular Securities Transaction Tax (STT) and transitions to standard listed share tax treatment.</p>
    `,
    relatedSlugs: ['how-unlisted-shares-transferred-demat', 'drhp-filed-companies-what-investors-should-track']
  }
]

export const seedBlogs = async () => {
  let count = 0
  for (const item of seedBlogsData) {
    const existing = await Blog.findOne({ slug: item.slug })
    if (!existing) {
      await Blog.create(item)
      console.log(`Created blog: "${item.title}"`)
      count++
    } else {
      // Update with latest content
      await Blog.updateOne({ slug: item.slug }, { $set: item })
      console.log(`Updated blog: "${item.title}"`)
      count++
    }
  }
  return count
}

// Allow direct execution: `node seedBlogs.js`
const isDirectExecution = process.argv[1]?.endsWith('seedBlogs.js')
if (isDirectExecution) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(async () => {
      console.log('MongoDB connected for Blog seeding...')
      const count = await seedBlogs()
      console.log(`✅ Successfully seeded/updated ${count} blog articles in MongoDB.`)
      process.exit(0)
    })
    .catch((err) => {
      console.error('Error seeding blogs:', err)
      process.exit(1)
    })
}
