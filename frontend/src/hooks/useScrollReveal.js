import { useEffect, useRef } from 'react'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function useScrollReveal(options = {}) {
  const { threshold = 0.15, rootMargin = '0px 0px -50px' } = options
  const ref = useRef(null)

  useEffect(() => {
    if (prefersReducedMotion()) {
      const node = ref.current
      if (node) node.classList.add('reveal-visible')
      return
    }

    const node = ref.current
    if (!node) return

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
  }, [ref, threshold, rootMargin])

  return ref
}
