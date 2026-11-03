const LINES_INDIGO = [
  { text: "Own tomorrow's", delay: '0.1s' },
  { text: 'listed companies,', delay: '0.3s', accent: true },
  { text: 'today.', delay: '0.5s' },
]

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const AnimatedHeadline = ({ text }) => {
  const reduced = prefersReducedMotion()

  if (!reduced) {
    return (
      <>
        {LINES_INDIGO.map((line, i) => (
          <div
            key={i}
            className={`shimmer-line s${i + 1}`}
            style={{ color: line.accent ? 'var(--brass)' : 'var(--page-text)' }}
          >
            {line.text}
          </div>
        ))}
      </>
    )
  }

  return <>{text}</>
}

export default AnimatedHeadline
