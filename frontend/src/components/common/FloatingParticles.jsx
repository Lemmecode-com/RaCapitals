import { useEffect, useState } from 'react'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const particles = [
  { size: 160, top: '10%', left: '8%', delay: 0, duration: 16 },
  { size: 200, top: '25%', left: '85%', delay: 1.5, duration: 18 },
  { size: 120, top: '55%', left: '15%', delay: 2.2, duration: 14 },
  { size: 180, top: '70%', left: '80%', delay: 0.8, duration: 20 },
  { size: 100, top: '40%', left: '50%', delay: 3, duration: 15 },
  { size: 140, top: '15%', left: '45%', delay: 1.2, duration: 17 },
  { size: 160, top: '80%', left: '30%', delay: 2.8, duration: 19 },
]

const FloatingParticles = () => {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    setReduced(prefersReducedMotion())
  }, [])

  if (reduced) return null

  return (
    <>
      {particles.map((p, i) => (
        <div
          key={i}
          className="floating-particle"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            top: p.top,
            left: p.left,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
          aria-hidden="true"
        />
      ))}
    </>
  )
}

export default FloatingParticles
