import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { parseCsv, downloadFaqSampleTemplate } from '../../utils/exportUtils'
import api from '../../services/api'

export default function BulkImportFaqModal({ isOpen, onClose, onSuccess, companies = [] }) {
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState('')
  const [parsedRows, setParsedRows] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [parsingError, setParsingError] = useState('')
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const fileInputRef = useRef(null)

  if (!isOpen) return null

  const handleReset = () => {
    setFile(null)
    setFileName('')
    setParsedRows([])
    setParsingError('')
    setImporting(false)
    setImportResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const validateRow = (row, index) => {
    const errors = []
    const companyInput = (row.companyname || row.company || '').trim()
    const question = (row.question || '').trim()
    const answer = (row.answer || '').trim()
    const orderNum = Number(row.order) || (index + 1)

    let matchedCompany = null
    if (!companyInput) {
      errors.push('Company Name is required.')
    } else {
      matchedCompany = companies.find(
        (c) => c.name.trim().toLowerCase() === companyInput.toLowerCase()
      )
      if (!matchedCompany) {
        errors.push(`Company "${companyInput}" not found in database. Create this listing first.`)
      }
    }

    if (!question) {
      errors.push('Question is required.')
    }

    if (!answer) {
      errors.push('Answer is required.')
    }

    return {
      rowNumber: index + 1,
      companyInput,
      companyId: matchedCompany ? matchedCompany._id : null,
      companyName: matchedCompany ? matchedCompany.name : companyInput,
      question,
      answer,
      order: orderNum,
      isPublished: true,
      isValid: errors.length === 0,
      errors
    }
  }

  const processFile = (selectedFile) => {
    setParsingError('')
    setImportResult(null)
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.csv')) {
      setParsingError('Please upload a valid .csv file. (Tip: You can export Excel sheets as CSV).')
      return
    }

    setFileName(selectedFile.name)
    setFile(selectedFile)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target.result
        const rawObjects = parseCsv(text)

        if (!rawObjects || rawObjects.length === 0) {
          setParsingError('CSV file appears to be empty or missing data rows.')
          return
        }

        const validated = rawObjects.map((row, idx) => validateRow(row, idx))
        setParsedRows(validated)
      } catch (err) {
        console.error('CSV Parsing Error:', err)
        setParsingError('Failed to parse CSV file. Please verify format and quotes.')
      }
    }
    reader.onerror = () => setParsingError('Failed to read file.')
    reader.readAsText(selectedFile)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const validRows = parsedRows.filter((r) => r.isValid)
  const errorRows = parsedRows.filter((r) => !r.isValid)

  const handleExecuteImport = async () => {
    if (validRows.length === 0) return
    setImporting(true)
    setImportResult(null)

    try {
      const payload = {
        faqs: validRows.map((r) => ({
          company: r.companyId,
          question: r.question,
          answer: r.answer,
          order: r.order,
          isPublished: true
        }))
      }

      const res = await api.post('/admin/faqs/bulk-import', payload)
      setImportResult({
        success: true,
        message: res.data?.message || `Successfully imported ${validRows.length} FAQ(s).`,
        count: res.data?.importedCount || validRows.length
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setImportResult({
        success: false,
        message: err?.response?.data?.message || 'Import failed. Please review errors and try again.'
      })
    } finally {
      setImporting(false)
    }
  }

  return createPortal(
    <div
      className="admin-modal-portal modal-backdrop event-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '920px',
          width: '94%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700 }}>Bulk Import Share FAQs</h2>
            <p className="muted" style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem' }}>
              Upload company investor due diligence questions and answers in bulk via CSV.
            </p>
          </div>
          <button className="modal-close-btn" type="button" onClick={onClose}>&times;</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.25rem' }}>
          {/* Step 1: Upload or Download Template */}
          {parsedRows.length === 0 && (
            <div>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  border: isDragging ? '2px dashed var(--brass, #2563EB)' : '2px dashed var(--border, #D1D5DB)',
                  background: isDragging ? 'rgba(var(--brass-rgb, 37, 99, 235), 0.05)' : 'var(--surface-2, #F9FAFB)',
                  borderRadius: '10px',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      processFile(e.target.files[0])
                    }
                  }}
                />
                <div style={{ marginBottom: '0.75rem', color: 'var(--brass)' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto', display: 'block' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.05rem', fontWeight: 600 }}>
                  Drag & drop your FAQ CSV file here
                </h3>
                <p className="muted" style={{ margin: '0 0 1rem 0', fontSize: '0.85rem' }}>
                  or click to browse from your computer (.csv format)
                </p>
                <button type="button" className="secondary-btn">
                  Choose FAQ CSV File
                </button>
              </div>

              {parsingError && (
                <div className="flash" style={{ marginTop: '1rem', borderColor: 'var(--rust)', color: 'var(--error-fg)' }}>
                  {parsingError}
                </div>
              )}

              {/* Template Download Section */}
              <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', background: 'var(--surface-2)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Need the pre-formatted CSV template?</div>
                  <div className="muted" style={{ fontSize: '0.82rem' }}>Download our structured sample with example company questions and answers.</div>
                </div>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={downloadFaqSampleTemplate}
                >
                  Download Sample CSV Template
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Validation Preview */}
          {parsedRows.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.92rem', color: 'var(--page-text)' }}>
                  <strong>File:</strong> <span className="muted" style={{ marginLeft: '0.35rem' }}>{fileName}</span>
                </div>
              </div>

              {/* Import Result Notification */}
              {importResult && (
                <div
                  className="flash"
                  style={{
                    marginBottom: '1rem',
                    borderColor: importResult.success ? '#16a34a' : 'var(--rust)',
                    color: importResult.success ? '#16a34a' : 'var(--error-fg)',
                    background: importResult.success ? 'rgba(34, 197, 94, 0.05)' : undefined
                  }}
                >
                  {importResult.message}
                </div>
              )}

              {/* Preview Table */}
              <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem' }}>
                <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left', margin: 0 }}>
                    <thead style={{ background: 'var(--surface-2)', position: 'sticky', top: 0, zIndex: 1 }}>
                      <tr>
                        <th style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid var(--border)', width: '45px' }}>#</th>
                        <th style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid var(--border)', width: '95px' }}>Status</th>
                        <th style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid var(--border)', width: '160px' }}>Company</th>
                        <th style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid var(--border)' }}>Question & Answer</th>
                        <th style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid var(--border)', width: '60px' }}>Order</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedRows.map((r) => (
                        <tr
                          key={r.rowNumber}
                          style={{
                            borderBottom: '1px solid var(--border)',
                            background: !r.isValid ? 'rgba(239, 68, 68, 0.03)' : undefined
                          }}
                        >
                          <td style={{ padding: '0.6rem 0.75rem', color: 'var(--muted)' }}>{r.rowNumber}</td>
                          <td style={{ padding: '0.6rem 0.75rem' }}>
                            {r.isValid ? (
                              <span style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.78rem' }}>✅ Ready</span>
                            ) : (
                              <span
                                style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.78rem', cursor: 'help' }}
                                title={r.errors.join(' | ')}
                              >
                                ⚠️ Invalid
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem', fontWeight: 500 }}>
                            {r.companyName || '—'}
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem' }}>
                            <div style={{ fontWeight: 600, color: 'var(--page-text)', marginBottom: '0.2rem' }}>{r.question}</div>
                            <div className="muted" style={{ fontSize: '0.78rem', lineHeight: '1.4', maxWidth: '440px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                              {r.answer}
                            </div>
                            {!r.isValid && (
                              <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                ↳ {r.errors.join(' • ')}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem', color: 'var(--muted)' }}>{r.order}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', alignItems: 'center' }}>
          <button type="button" className="secondary-btn" onClick={onClose} disabled={importing}>
            {importResult?.success ? 'Close' : 'Cancel'}
          </button>
          {parsedRows.length > 0 && !importResult?.success && (
            <button
              type="button"
              className="primary-btn"
              disabled={importing || validRows.length === 0}
              onClick={handleExecuteImport}
            >
              {importing ? 'Importing FAQs…' : `Import FAQs (${validRows.length})`}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

