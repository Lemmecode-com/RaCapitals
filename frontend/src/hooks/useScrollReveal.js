import { useEffect, useRef } from 'react'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function useScrollReveal(options = {}) {
  const { threshold = 0.08, rootMargin = '0px 0px -20px' } = options
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (prefersReducedMotion()) {
      node.classList.add('reveal-visible')
      return
    }

    // Immediately reveal if already within or above the viewport on mount to eliminate flash/flicker
    if (typeof window !== 'undefined') {
      const rect = node.getBoundingClientRect()
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        node.classList.add('reveal-visible')
        return
      }
    }

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      node.classList.add('reveal-visible')
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold, rootMargin }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return ref
}
