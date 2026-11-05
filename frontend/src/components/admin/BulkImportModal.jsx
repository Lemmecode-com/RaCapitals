import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { parseCsv, downloadListingSampleTemplate } from '../../utils/exportUtils'
import api from '../../services/api'

const VALID_SECTORS = ['Fintech', 'Energy', 'Logistics', 'Consumer', 'Healthcare', 'Technology', 'Automobile', 'Manufacturing']

export default function BulkImportModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState('')
  const [parsedRows, setParsedRows] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [parsingError, setParsingError] = useState('')
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importResult, setImportResult] = useState(null)
  const fileInputRef = useRef(null)

  const handleReset = () => {
    setFile(null)
    setFileName('')
    setParsedRows([])
    setParsingError('')
    setImporting(false)
    setImportProgress(0)
    setImportResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Automatically reset every time modal is opened
  useEffect(() => {
    if (isOpen) {
      handleReset()
    }
  }, [isOpen])

  const handleClose = () => {
    handleReset()
    onClose()
  }

  if (!isOpen) return null

  const validateRow = (row, index) => {
    const errors = []
    const name = row.companyname || row.name || ''
    const sector = row.sector || ''
    const priceStr = row.indicativeprice || row.price || ''
    const cin = row.cin || ''
    const isin = row.isin || ''
    const lotSizeStr = row.lotsize || ''
    const faceValueStr = row.facevalue || ''

    if (!name.trim()) {
      errors.push('Company Name is required.')
    }

    if (!sector.trim()) {
      errors.push('Sector is required.')
    }

    const price = Number(priceStr)
    if (!priceStr || Number.isNaN(price) || price <= 0) {
      errors.push('Valid positive Indicative Price is required.')
    }

    const lotSize = Number(lotSizeStr)
    if (!lotSizeStr || Number.isNaN(lotSize) || lotSize <= 0) {
      errors.push('Valid positive Lot Size is required (e.g. 50, 100).')
    }

    let faceValue = undefined
    if (faceValueStr) {
      const fv = Number(faceValueStr)
      if (Number.isNaN(fv) || fv <= 0) {
        errors.push('Face Value must be a positive number if provided.')
      } else {
        faceValue = fv
      }
    }

    if (cin && cin.length < 15) {
      errors.push('CIN format looks incomplete (typical CIN is 21 characters).')
    }

    if (isin && isin.length !== 12) {
      errors.push('ISIN must be exactly 12 characters (e.g. INE123A01010).')
    }

    const cleanRecord = {
      rowNumber: index + 1,
      name: name.trim(),
      sector: sector.trim(),
      industry: (row.industry || '').trim(),
      price: price > 0 ? price : 0,
      lotSize: lotSize > 0 ? lotSize : undefined,
      faceValue: faceValue,
      cin: cin.trim(),
      isin: isin.trim(),
      marketCap: row.marketcapcr ? Number(row.marketcapcr) : undefined,
      peRatio: row.peratio ? Number(row.peratio) : undefined,
      pbRatio: row.pbratio ? Number(row.pbratio) : undefined,
      bookValue: row.bookvalue ? Number(row.bookvalue) : undefined,
      roe: row.roepercent ? Number(row.roepercent) : undefined,
      outstandingShares: (row.outstandingshares || row.sharesoutstanding) ? Number(row.outstandingshares || row.sharesoutstanding) : undefined,
      foundedYear: row.foundedyear ? Number(row.foundedyear) : undefined,
      registeredOffice: (row.registeredoffice || '').trim(),
      description: (row.description || '').trim(),
      drhpFiled: String(row.drhpfiled || '').toLowerCase() === 'true',
      isValid: errors.length === 0,
      errors
    }

    return cleanRecord
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
        if (rawObjects.length === 0) {
          setParsingError('The uploaded file contains no data or could not be read.')
          return
        }

        const validated = rawObjects.map((row, idx) => validateRow(row, idx))
        setParsedRows(validated)
      } catch (err) {
        setParsingError('Failed to parse CSV file: ' + (err.message || 'Check file formatting.'))
      }
    }
    reader.readAsText(selectedFile)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files && files[0]) {
      processFile(files[0])
    }
  }

  const validRows = parsedRows.filter((r) => r.isValid)
  const errorRows = parsedRows.filter((r) => !r.isValid)

  const handleImport = async () => {
    if (validRows.length === 0) return
    setImporting(true)
    setImportProgress(0)

    let createdCount = 0
    let failedCount = 0
    const failureReasons = []

    try {
      // First try unified bulk ingestion endpoint
      try {
        const res = await api.post('/companies/admin/bulk-import', {
          companies: validRows
        })
        if (res.data) {
          setImportResult({
            success: true,
            created: res.data.createdCount || validRows.length,
            failed: res.data.failedCount || 0,
            failures: res.data.failures || []
          })
          if (onSuccess) onSuccess(res.data.createdCount || validRows.length)
          setImporting(false)
          return
        }
      } catch (bulkErr) {
        // Fallback: Ingest records sequentially through existing company create API
        for (let i = 0; i < validRows.length; i++) {
          const item = validRows[i]
          try {
            const compRes = await api.post('/companies', {
              name: item.name,
              sector: item.sector,
              industry: item.industry,
              cin: item.cin,
              isin: item.isin,
              lotSize: item.lotSize,
              faceValue: item.faceValue,
              marketCap: item.marketCap,
              peRatio: item.peRatio,
              pbRatio: item.pbRatio,
              bookValue: item.bookValue,
              roe: item.roe,
              outstandingShares: item.outstandingShares,
              foundedYear: item.foundedYear,
              registeredOffice: item.registeredOffice,
              description: item.description,
              drhpFiled: item.drhpFiled,
            })
            if (item.price > 0 && compRes?.data?._id) {
              try {
                await api.post(`/prices/${compRes.data._id}`, { price: item.price })
              } catch (pErr) {
                // Price recording warning
              }
            }
            createdCount++
          } catch (rowErr) {
            failedCount++
            failureReasons.push(`${item.name}: ${rowErr?.response?.data?.message || 'Failed to save'}`)
          }
          setImportProgress(Math.round(((i + 1) / validRows.length) * 100))
        }

        setImportResult({
          success: createdCount > 0,
          created: createdCount,
          failed: failedCount,
          failures: failureReasons
        })
        if (createdCount > 0 && onSuccess) {
          onSuccess(createdCount)
        }
      }
    } finally {
      setImporting(false)
    }
  }

  return createPortal(
    <div className="admin-modal-portal modal-backdrop event-modal-backdrop" onClick={handleClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '800px', width: '94%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700 }}>Bulk Import Shares</h2>
            <p className="muted" style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem' }}>
              Upload pre-IPO listings and financial fundamentals via CSV template.
            </p>
          </div>
          <button className="modal-close-btn" type="button" onClick={handleClose}>&times;</button>
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
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📂</div>
                <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.05rem', fontWeight: 600 }}>
                  Drag & drop your CSV file here
                </h3>
                <p className="muted" style={{ margin: '0 0 1rem 0', fontSize: '0.85rem' }}>
                  or click to browse from your computer
                </p>
                <button type="button" className="secondary-btn" style={{ fontSize: '0.85rem' }}>
                  Choose CSV File
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
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Need the correct format?</div>
                  <div className="muted" style={{ fontSize: '0.82rem' }}>Download our pre-structured template with example rows.</div>
                </div>
                <button
                  type="button"
                  className="secondary-btn"
                  style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  onClick={downloadListingSampleTemplate}
                >
                  <span>⬇️</span> Download Sample CSV Template
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Validation Preview */}
          {parsedRows.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <strong style={{ fontSize: '0.95rem' }}>File: {fileName}</strong>
                </div>
                <button
                  type="button"
                  className="btn-link"
                  style={{ fontSize: '0.85rem', color: 'var(--brass)' }}
                  onClick={handleReset}
                >
                  Upload different file
                </button>
              </div>

              {/* Summary Badges */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div className="metric-card" style={{ padding: '0.65rem 1rem' }}>
                  <div className="metric-header" style={{ fontSize: '0.72rem' }}>Total Rows</div>
                  <div className="metric-value" style={{ fontSize: '1.3rem' }}>{parsedRows.length}</div>
                </div>
                <div className="metric-card" style={{ padding: '0.65rem 1rem', background: 'rgba(34, 197, 94, 0.08)', borderColor: 'rgba(34, 197, 94, 0.3)' }}>
                  <div className="metric-header" style={{ fontSize: '0.72rem', color: '#16a34a' }}>Valid (Ready)</div>
                  <div className="metric-value" style={{ fontSize: '1.3rem', color: '#16a34a' }}>{validRows.length}</div>
                </div>
                <div className="metric-card" style={{ padding: '0.65rem 1rem', background: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                  <div className="metric-header" style={{ fontSize: '0.72rem', color: '#dc2626' }}>Errors (Skipped)</div>
                  <div className="metric-value" style={{ fontSize: '1.3rem', color: '#dc2626' }}>{errorRows.length}</div>
                </div>
              </div>

              {/* Import Result Notification */}
              {importResult && (
                <div
                  className="flash"
                  style={{
                    marginBottom: '1rem',
                    borderColor: importResult.success ? '#16a34a' : 'var(--rust)',
                    background: importResult.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: importResult.success ? '#15803d' : '#b91c1c'
                  }}
                >
                  <strong>{importResult.created} record(s) imported successfully!</strong>
                  {importResult.failed > 0 && ` (${importResult.failed} failed)`}
                </div>
              )}

              {/* Row-by-row Preview Table */}
              <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', maxHeight: '280px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead style={{ background: 'var(--surface-2)', position: 'sticky', top: 0, zIndex: 1 }}>
                    <tr>
                      <th style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border)' }}>Row</th>
                      <th style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border)' }}>Status</th>
                      <th style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border)' }}>Company Name</th>
                      <th style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border)' }}>Sector</th>
                      <th style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border)' }}>Price</th>
                      <th style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border)' }}>Lot Size</th>
                      <th style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border)' }}>Validation Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.map((r) => (
                      <tr
                        key={r.rowNumber}
                        style={{
                          borderBottom: '1px solid var(--border)',
                          background: r.isValid ? 'transparent' : 'rgba(239, 68, 68, 0.04)'
                        }}
                      >
                        <td style={{ padding: '0.5rem 0.75rem', color: 'var(--muted)' }}>#{r.rowNumber}</td>
                        <td style={{ padding: '0.5rem 0.75rem' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '9999px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              background: r.isValid ? '#dcfce7' : '#fee2e2',
                              color: r.isValid ? '#15803d' : '#b91c1c'
                            }}
                          >
                            {r.isValid ? 'READY' : 'ERROR'}
                          </span>
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>{r.name || '—'}</td>
                        <td style={{ padding: '0.5rem 0.75rem' }}>{r.sector || '—'}</td>
                        <td style={{ padding: '0.5rem 0.75rem' }}>{r.price > 0 ? `₹${r.price}` : '—'}</td>
                        <td style={{ padding: '0.5rem 0.75rem' }}>{r.lotSize ? `${r.lotSize} shs` : '—'}</td>
                        <td style={{ padding: '0.5rem 0.75rem', color: r.isValid ? 'var(--muted)' : '#b91c1c' }}>
                          {r.isValid ? 'All required fields valid' : r.errors.join('; ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Progress bar during import */}
              {importing && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                    <span>Ingesting records...</span>
                    <span>{importProgress}%</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--surface-2)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${importProgress}%`,
                        height: '100%',
                        background: 'var(--brass, #2563EB)',
                        transition: 'width 0.2s ease'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          {importResult?.success ? (
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button
                type="button"
                className="secondary-btn"
                onClick={handleReset}
              >
                Upload Another File
              </button>
              <button
                type="button"
                className="primary-btn"
                onClick={handleClose}
              >
                Done
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button
                type="button"
                className="secondary-btn"
                onClick={handleClose}
                disabled={importing}
              >
                Cancel
              </button>
              {parsedRows.length > 0 && (
                <button
                  type="button"
                  className="primary-btn"
                  disabled={validRows.length === 0 || importing}
                  onClick={handleImport}
                >
                  {importing ? 'Importing…' : `Import ${validRows.length} Valid Record${validRows.length === 1 ? '' : 's'}`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

