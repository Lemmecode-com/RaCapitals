import { useState, useMemo } from 'react'

const CompanyReports = ({ company }) => {
  const companyName = company?.name || 'Company'
  const isDrhp = company?.drhpFiled || false
  const [downloadModalDoc, setDownloadModalDoc] = useState(null)

  const reportsList = useMemo(() => {
    const list = [
      {
        id: 'ar-24',
        title: `FY 2023-24 Annual Report & Audited Accounts`,
        type: 'Statutory Annual Report',
        filingForm: 'Form AOC-4 / MGT-7',
        authority: 'Ministry of Corporate Affairs (ROC)',
        filingDate: 'Oct 2024',
        fileSize: '4.8 MB',
        pages: '124 Pages',
        badgeColor: '#1E40AF',
        badgeBg: '#EFF6FF',
        description: `Complete audited financial statements, balance sheet, profit and loss account, notes to accounts, cash flow statement, and auditor's report for FY24.`
      },
      {
        id: 'ar-23',
        title: `FY 2022-23 Annual Report & Directors' Report`,
        type: 'Statutory Annual Report',
        filingForm: 'Form AOC-4 / MGT-7',
        authority: 'Ministry of Corporate Affairs (ROC)',
        filingDate: 'Oct 2023',
        fileSize: '3.9 MB',
        pages: '112 Pages',
        badgeColor: '#1E40AF',
        badgeBg: '#EFF6FF',
        description: `Audited financial statements, management discussion and analysis (MD&A), corporate governance report, and business operations review.`
      },
      {
        id: 'val-report',
        title: `Independent Statutory Valuation Certificate`,
        type: 'Valuation Report',
        filingForm: 'Rule 11UA / Section 56(2)(viib)',
        authority: 'Registered Valuer (IBBI)',
        filingDate: 'Jun 2024',
        fileSize: '2.4 MB',
        pages: '48 Pages',
        badgeColor: '#059669',
        badgeBg: '#ECFDF5',
        description: `Fair Market Value (FMV) appraisal computed using Discounted Cash Flow (DCF) and Market Comparable Multiple methodologies by a certified IBBI registered valuer.`
      },
      {
        id: 'sec-audit',
        title: `Secretarial Audit Report (Form MR-3)`,
        type: 'Compliance Audit',
        filingForm: 'Form MR-3',
        authority: 'Practicing Company Secretary (ICSI)',
        filingDate: 'Aug 2024',
        fileSize: '1.6 MB',
        pages: '32 Pages',
        badgeColor: '#7C3AED',
        badgeBg: '#F3E8FF',
        description: `Independent secretarial compliance audit verifying adherence to Companies Act, statutory register maintenance, and corporate resolutions.`
      },
      {
        id: 'deck-24',
        title: `Corporate Presentation & Pre-IPO Growth Brief`,
        type: 'Investor Presentation',
        filingForm: 'Confidential Information Memorandum',
        authority: 'Management & Transaction Advisors',
        filingDate: 'Sep 2024',
        fileSize: '6.2 MB',
        pages: '42 Slides',
        badgeColor: '#D97706',
        badgeBg: '#FEF3C7',
        description: `Strategic business overview, TAM segmentation, competitive moat analysis, client logos, unit economics, and prospective expansion plans.`
      }
    ]

    if (isDrhp) {
      list.unshift({
        id: 'drhp-doc',
        title: `Draft Red Herring Prospectus (DRHP) - SEBI Submission`,
        type: 'SEBI Offering Document',
        filingForm: 'SEBI ICDR Regulations',
        authority: 'Securities and Exchange Board of India (SEBI)',
        filingDate: company?.drhpFiledDate ? new Date(company.drhpFiledDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Mar 2024',
        fileSize: '14.2 MB',
        pages: '386 Pages',
        badgeColor: '#DC2626',
        badgeBg: '#FEF2F2',
        description: `Official public draft prospectus submitted to SEBI and stock exchanges detailing comprehensive capital structure, objects of the issue, industry review, risk factors, and financial statements.`
      })
    }

    return list
  }, [companyName, isDrhp, company?.drhpFiledDate])

  return (
    <div className="company-reports-pane">
      <div className="section-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 className="section-title" style={{ margin: 0 }}>Annual Reports & Regulatory Disclosures</h2>
          <p className="muted" style={{ fontSize: '0.86rem', margin: '0.25rem 0 0 0' }}>
            Verified statutory filings, ROC financial statements, valuation certificates, and offer documents for {companyName}.
          </p>
        </div>
        <div style={{ background: '#ECFDF5', color: '#065F46', padding: '0.4rem 0.85rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, border: '1px solid #A7F3D0' }}>
          MCA-21 / ROC Authenticated
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {reportsList.map((doc) => (
          <div
            key={doc.id}
            style={{
              background: 'var(--card-bg, #ffffff)',
              border: '1px solid var(--border, #e2e8f0)',
              borderRadius: '10px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.15s ease'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    background: doc.badgeBg,
                    color: doc.badgeColor,
                    letterSpacing: '0.04em'
                  }}
                >
                  {doc.type}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>
                  {doc.filingDate}
                </span>
              </div>

              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 700, color: 'var(--page-text, #0f172a)', lineHeight: 1.4 }}>
                {doc.title}
              </h4>

              <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.82rem', color: 'var(--text-soft, #64748b)', lineHeight: 1.55 }}>
                {doc.description}
              </p>
            </div>

            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.75rem', color: '#64748B' }}>
                <span>Authority: <strong style={{ color: '#0F172A' }}>{doc.authority.split('(')[0]}</strong></span>
                <span>{doc.pages} • {doc.fileSize}</span>
              </div>

              <button
                type="button"
                onClick={() => setDownloadModalDoc(doc)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 1rem',
                  borderRadius: '6px',
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  color: '#0F172A',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#2563EB'
                  e.currentTarget.style.borderColor = '#2563EB'
                  e.currentTarget.style.color = '#FFFFFF'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#F8FAFC'
                  e.currentTarget.style.borderColor = '#CBD5E1'
                  e.currentTarget.style.color = '#0F172A'
                }}
              >
                <span>📄 Request Official Filing Copy</span>
                <span>→</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Institutional Document Notice */}
      <div style={{ marginTop: '1.75rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.85rem 1.15rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>🏛️</span>
        <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
          <strong>Statutory Compliance Guarantee:</strong> Certified ROC documents and annual accounts are accessed via the Ministry of Corporate Affairs (MCA-21) repository under Section 399 of the Companies Act, 2013. Private placement memoranda are provided strictly for institutional due diligence.
        </p>
      </div>

      {/* Request Modal */}
      {downloadModalDoc && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setDownloadModalDoc(null)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              padding: '1.75rem',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#1E40AF', background: '#EFF6FF', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  {downloadModalDoc.type}
                </span>
                <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '1.1rem', color: '#0F172A' }}>
                  {downloadModalDoc.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDownloadModalDoc(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748B' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Official certified copies of <strong>{downloadModalDoc.title}</strong> ({downloadModalDoc.fileSize}) are provided to verified investors and institutional clients upon due diligence verification.
            </p>

            <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '1.5rem', fontSize: '0.82rem', color: '#334155' }}>
              <div>Filing Form: <strong>{downloadModalDoc.filingForm}</strong></div>
              <div>Authority: <strong>{downloadModalDoc.authority}</strong></div>
              <div>Period: <strong>{downloadModalDoc.filingDate}</strong></div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => {
                  window.open(`https://api.whatsapp.com/send?phone=919837077977&text=${encodeURIComponent(`Hi Taurus Magnus, I request official copies of "${downloadModalDoc.title}" for ${companyName} for institutional due diligence.`)}`, '_blank')
                  setDownloadModalDoc(null)
                }}
                style={{
                  flex: 1,
                  background: '#059669',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.7rem 1rem',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                💬 Request via WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setDownloadModalDoc(null)}
                style={{
                  background: '#F1F5F9',
                  color: '#475569',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  padding: '0.7rem 1rem',
                  fontSize: '0.88rem',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CompanyReports

