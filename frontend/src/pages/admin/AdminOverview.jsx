import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { formatINR } from '../../utils/format'

const AdminOverview = () => {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const res = await api.get('/companies/admin/all')
        setCompanies(res.data || [])
      } catch {
        setCompanies([])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const total = companies.length
  const live = companies.filter((c) => c.isActive).length
  const deactivated = total - live

  const recent = [...companies]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
    .slice(0, 4)

  return (
    <div className="dashboard-wrap">
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--page-text)', marginBottom: '2rem', marginTop: 0 }}>Dashboard</h1>

      {loading ? (
        <p className="muted">Loading overview…</p>
      ) : (
        <>
          <div className="dashboard-metrics-grid">
            <div className="metric-card metric-primary">
              <div className="metric-header">
                <span>Total Companies</span>
              </div>
              <div className="metric-value">{total}</div>
            </div>
            <div className="metric-card">
              <div className="metric-header">
                <span>Live</span>
              </div>
              <div className="metric-value">{live}</div>
            </div>
            <div className="metric-card">
              <div className="metric-header">
                <span>Deactivated</span>
              </div>
              <div className="metric-value">{deactivated}</div>
            </div>
          </div>

          <div className="dashboard-content-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="dashboard-content-card">
              <div className="card-header">
                <h3>Recently Updated</h3>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                {recent.length === 0 ? (
                  <p className="muted" style={{ padding: '1rem', margin: 0, fontSize: '0.85rem' }}>No companies yet.</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', margin: 0, textAlign: 'left' }}>
                    <thead style={{ background: 'var(--surface-2)' }}>
                      <tr>
                        <th style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                        <th style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Latest Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map((c) => (
                        <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '0.6rem 1rem' }}>
                            <Link to={`/admin/companies/${c._id}`} style={{ fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}>{c.name}</Link>
                          </td>
                          <td className="mono" style={{ padding: '0.6rem 1rem', fontSize: '0.9rem', fontWeight: 600 }}>{c.latestPrice == null ? '—' : formatINR(c.latestPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminOverview
