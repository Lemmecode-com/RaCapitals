import React from 'react'

const Pagination = ({ currentPage, totalPages, onPageChange, alwaysShow = false }) => {
  if (totalPages < 1 || (totalPages <= 1 && !alwaysShow)) return null

  // Determine page numbers to show
  const pages = []
  const safeTotalPages = Math.max(1, totalPages || 1)
  
  if (safeTotalPages <= 5) {
    for (let i = 1; i <= safeTotalPages; i++) {
      pages.push(i)
    }
  } else {
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', safeTotalPages)
    } else if (currentPage >= safeTotalPages - 2) {
      pages.push(1, '...', safeTotalPages - 3, safeTotalPages - 2, safeTotalPages - 1, safeTotalPages)
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', safeTotalPages)
    }
  }

  return (
    <div className="pagination" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem', marginBottom: '1rem' }}>
      <button
        type="button"
        className="secondary-btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
      >
        Prev
      </button>

      {pages.map((p, idx) => (
        <button
          key={idx}
          type="button"
          disabled={p === '...'}
          className={p === currentPage ? 'primary-btn' : (p === '...' ? 'btn-dots' : 'secondary-btn')}
          onClick={() => { if (p !== '...') onPageChange(p) }}
          style={{ 
            padding: '0.4rem 0.8rem', 
            fontSize: '0.85rem',
            background: p === '...' ? 'transparent' : undefined,
            border: p === '...' ? 'none' : undefined,
            boxShadow: p === '...' ? 'none' : undefined,
            cursor: p === '...' ? 'default' : 'pointer',
            color: p === '...' ? 'var(--page-text)' : undefined
          }}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        className="secondary-btn"
        disabled={currentPage >= safeTotalPages}
        onClick={() => onPageChange(currentPage + 1)}
        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
      >
        Next
      </button>
    </div>
  )
}

export default Pagination
