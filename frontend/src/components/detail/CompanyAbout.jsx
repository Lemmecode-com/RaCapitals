import React from 'react'

/**
 * Sanitizes currency encoding bugs where the Rupee sign (₹) was corrupted to '?',
 * and separates words that were run together without spaces (e.g. crGross -> cr Gross).
 */
function sanitizeCurrency(text) {
  if (!text) return ''
  let cleaned = text
    // Replace (? cr) or (?cr) with (₹ cr)
    .replace(/\(\?\s*(cr|crore|lakh|inr)\)/gi, '(₹ $1)')
    .replace(/\(\?\s*([^)]+)\)/g, '(₹ $1)')
    // Replace ~? or ? followed immediately by digits or currency numbers with ₹
    .replace(/(~?)\?(\s*\d[\d,.]*)/g, (match, prefix, digits) => {
      return `${prefix || ''}₹${digits.trim()}`
    })
    // Replace standalone number ? cr with number ₹ cr
    .replace(/(\d+)\s*\?\s*cr/gi, '$1 ₹ cr')

  // Separate concatenated words where lowercase/digit meets capitalized word
  cleaned = cleaned.replace(/([a-z\d])([A-Z][a-z])/g, (match, p1, p2) => `${p1} ${p2}`)

  return cleaned
}

/**
 * Extracts structured table rows from flattened revenue stream text if present.
 */
function parseFinancialTable(text) {
  if (!text || !text.includes('Interest income')) return null

  // Separate numbers that touched during copy/paste (e.g. 7,505.407,930.28)
  const unglued = text.replace(/([\d,]+\.\d{2})([\d,]+\.\d{2})/g, (m, p1, p2) => `${p1} ${p2}`)

  const metricPattern = /(Interest income|Other charges \(fees\)|Insurance commission|Gain on derecognition \(assignment\/securitisation\)|Profit on sale of investments|Total revenue from operations|Total income)\s*([\d,]+\.\d{2})\s*([\d,]+\.\d{2})/gi

  const rows = []
  let match
  while ((match = metricPattern.exec(unglued)) !== null) {
    rows.push({
      metric: match[1].trim(),
      fy26: match[2].trim(),
      fy25: match[3].trim()
    })
  }

  if (rows.length < 2) return null

  // Capture trailing commentary after table numbers
  let commentary = ''
  const lastMatch = unglued.match(/Total income\s*[\d,]+\.\d{2}\s*[\d,]+\.\d{2}\s*(.+)$/i)
  if (lastMatch) {
    commentary = lastMatch[1].trim()
  }

  return { rows, commentary }
}

/**
 * Parses raw company text into structured, logical sections.
 */
function parseCompanyText(rawText) {
  if (!rawText) return []
  const text = sanitizeCurrency(rawText.trim())

  // Check if text already has multiple paragraphs or explicit line breaks
  if (text.includes('\n')) {
    const rawParagraphs = text.split(/\n\s*\n+/).map(p => p.trim()).filter(Boolean)
    return rawParagraphs.map((para, idx) => {
      const headerMatch = para.match(/^(?:###|##|\*\*)\s*(.+?)(?:\*\*|:)?(?:\n|$)/)
      if (headerMatch) {
        return {
          id: `para-${idx}`,
          title: headerMatch[1].trim(),
          body: para.substring(headerMatch[0].length).trim() || null
        }
      }
      return {
        id: `para-${idx}`,
        title: null,
        body: para
      }
    })
  }

  // Common corporate headings found in scraped or pasted company DRHP summaries
  const headings = [
    { title: 'Business Model & Overview', regex: /(?:^|[\.\s]|(?<=[a-z]))(Business Model)(?:\s*(?=[A-Z]))/ },
    { title: 'Revenue Model', regex: /(?:^|[\.\s]|(?<=[a-z]))(Revenue Model)(?:\s*(?=[A-Z]))/ },
    { title: 'Revenue Streams & Performance', regex: /(?:^|[\.\s]|(?<=[a-z]))(Revenue stream)(?:\s*(?=[A-Z0-9]))/ },
    { title: 'Business Highlights', regex: /(?:^|[\.\s]|(?<=[a-z]))((?:FY\s*[\d-]+\s*)?Business Highlights)(?:\s*(?=[A-Z]))/ },
    { title: 'Financial Scale & Assets', regex: /(?:^|[\.\s]|(?<=[a-z]))(Scale\s*(?:\([^)]*\))?)(?:\s*(?=[A-Z]))/ },
    { title: 'Disbursements', regex: /(?:^|[\.\s]|(?<=[a-z]))(Disbursements)(?:\s*(?=[A-Z₹\d]))/ },
    { title: 'Profitability Analysis', regex: /(?:^|[\.\s]|(?<=[a-z]))(Profitability)(?:\s*(?=[A-Z]))/ },
    { title: 'Asset Quality & Risk Metrics', regex: /(?:^|[\.\s]|(?<=[a-z]))(Asset quality(?:[ \-—a-z]*))(?:\s*(?=[A-Z]))/ },
    { title: 'Balance Sheet & Capital Adequacy', regex: /(?:^|[\.\s]|(?<=[a-z\d]))(Balance sheet)(?:\s*(?=[A-Z]))/ },
    { title: 'Digital & Technology Capabilities', regex: /(?:^|[\.\s]|(?<=[a-z\d%]))(Technology\s+GenAI|Technology)(?:\s*(?=[A-Z]))/ },
    { title: 'Investment Thesis & Outlook', regex: /(?:^|[\.\s]|(?<=[a-z\d]))(The investment question this raises:?)/ }
  ]

  let segmented = text
  for (const h of headings) {
    segmented = segmented.replace(h.regex, () => `\n\n__SECTION__:${h.title}\n\n`)
  }

  if (segmented.includes('__SECTION__:')) {
    const parts = segmented.split('__SECTION__:').filter(Boolean)
    const sections = []

    for (const part of parts) {
      const newlineIdx = part.indexOf('\n\n')
      if (newlineIdx !== -1) {
        const title = part.substring(0, newlineIdx).trim()
        const body = part.substring(newlineIdx).trim()
        if (body) {
          sections.push({ title, body })
        }
      } else {
        const trimmed = part.trim()
        if (trimmed) {
          sections.push({ title: null, body: trimmed })
        }
      }
    }
    if (sections.length > 0) return sections
  }

  // Fallback: split by sentences if single giant paragraph exceeds 350 chars
  if (text.length > 350) {
    const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text]
    const grouped = []
    let currentGroup = []
    let currentLen = 0

    for (const s of sentences) {
      currentGroup.push(s.trim())
      currentLen += s.length
      if (currentLen > 250) {
        grouped.push({ title: null, body: currentGroup.join(' ') })
        currentGroup = []
        currentLen = 0
      }
    }
    if (currentGroup.length > 0) {
      grouped.push({ title: null, body: currentGroup.join(' ') })
    }
    return grouped
  }

  return [{ title: null, body: text }]
}

/**
 * Formats a block of text, detecting bullet points, tables, sub-items with dashes (—) or colons (:).
 */
function renderParagraphContent(bodyText, sectionTitle) {
  if (!bodyText) return null

  // Check if this block contains a financial table
  const tableData = parseFinancialTable(bodyText)
  if (tableData) {
    return (
      <div className="about-financial-table-block">
        <div className="about-table-wrap">
          <table className="about-financial-table">
            <thead>
              <tr>
                <th>Revenue Stream</th>
                <th className="num-col">FY26 (₹ Cr)</th>
                <th className="num-col">FY25 (₹ Cr)</th>
              </tr>
            </thead>
            <tbody>
              {tableData.rows.map((row, rIdx) => {
                const isTotal = row.metric.toLowerCase().includes('total')
                return (
                  <tr key={rIdx} className={isTotal ? 'about-row-total' : ''}>
                    <td className="about-metric-name">{row.metric}</td>
                    <td className="num-col mono">₹{row.fy26}</td>
                    <td className="num-col mono">₹{row.fy25}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {tableData.commentary && (
          <p className="about-paragraph about-commentary">{tableData.commentary}</p>
        )}
      </div>
    )
  }

  // If text has bullet list markers
  if (bodyText.includes('•') || bodyText.includes('\n- ') || bodyText.includes('\n* ')) {
    const lines = bodyText.split('\n').map(l => l.trim()).filter(Boolean)
    return (
      <div className="about-lines-group">
        {lines.map((line, idx) => {
          const cleanLine = line.replace(/^[•\-\*]\s*/, '')
          return (
            <p key={idx} className="about-paragraph about-bullet-item">
              {cleanLine}
            </p>
          )
        })}
      </div>
    )
  }

  // If text contains sub-items with short labels before em-dash (e.g. "Distribution — 2,000+ locations")
  const hasEmDashes = (bodyText.match(/—/g) || []).length >= 2
  if (hasEmDashes) {
    const points = bodyText.split(/(?<=[.!?])\s+(?=[A-Z][^—]+—)/)
    if (points.length > 1) {
      return (
        <div className="about-points-container">
          {points.map((pt, pIdx) => {
            const dashIdx = pt.indexOf('—')
            if (dashIdx !== -1 && dashIdx <= 45) {
              const label = pt.substring(0, dashIdx).trim()
              const desc = pt.substring(dashIdx + 1).trim()
              return (
                <div key={pIdx} className="about-point-item">
                  <span className="about-point-label">{label} —</span>
                  <span className="about-point-desc">{desc}</span>
                </div>
              )
            }
            return (
              <p key={pIdx} className="about-paragraph">
                {pt.trim()}
              </p>
            )
          })}
        </div>
      )
    }
  }

  return <p className="about-paragraph">{bodyText}</p>
}

const CompanyAbout = ({ description, companyName, sector }) => {
  const sections = parseCompanyText(description)

  if (!description || sections.length === 0) {
    return (
      <div className="about-card about-card-empty">
        <div className="about-empty-content">
          <p className="about-empty-title">Business & Operational Profile</p>
          <p className="about-paragraph">
            <strong>{companyName || 'This company'}</strong> operates within the{' '}
            <span className="about-sector-tag">{sector || 'unlisted equities'}</span> sector.
            Detailed operational models, financial statements, and DRHP filings are currently
            being curated by our research desk.
          </p>
          <p className="about-empty-hint">
            To receive the complete institutional research deck or latest transaction report for{' '}
            {companyName}, please get in touch with our private equity desk.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="about-card">
      {sections.map((section, idx) => (
        <div key={idx} className="about-section-block">
          {section.title && (
            <h3 className="about-block-title">
              <span className="about-title-indicator" />
              {section.title}
            </h3>
          )}
          {section.body && renderParagraphContent(section.body, section.title)}
        </div>
      ))}
    </div>
  )
}

export default CompanyAbout
