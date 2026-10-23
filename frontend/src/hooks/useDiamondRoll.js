import { useEffect, useRef } from 'react'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const clamp = (v, min, max) => Math.max(min, Math.min(max, v))

export default function useDiamondRoll(arenaRef) {
  const mediaQueryListener = useRef(null)

  useEffect(() => {
    const arena = arenaRef.current
    if (!arena) return
    let diamonds = []

    const apply = () => {
      if (prefersReducedMotion()) {
        reset()
        return
      }
      diamonds = Array.from(arena.querySelectorAll('.ff-diamond'))
      if (diamonds.length === 0) return
      run()
    }

    const MARGIN = 100
    const RANGE = 1400
    const TURN = 360

    const getTravel = (diamond) => {
      const r = diamond.getBoundingClientRect()
      return Math.min(60, (r.right - r.left) * 0.4)
    }

    const reset = () => {
      if (!diamonds.length) return
      diamonds.forEach((d) => {
        d.style.removeProperty('--ff-roll-r')
        d.style.removeProperty('--ff-roll-x')
        d.style.removeProperty('transition')
        const inner = d.querySelector('.ff-diamond-inner')
        if (inner) {
          inner.style.removeProperty('transform')
          inner.style.removeProperty('transition')
        }
      })
    }

    let scheduled = false
    const run = () => {
      const rect = arena.getBoundingClientRect()
      if (rect.height === 0 || rect.width === 0) {
        reset()
        return
      }
      const vh = window.innerHeight
      let p = (vh + MARGIN - rect.top) / RANGE
      p = clamp(p, 0, 1)

      if (p === 0) {
        reset()
        return
      }

      const rot = p * TURN
      const travelX = Math.min(60, 40 * p)

      diamonds.forEach((d, i) => {
        if (d.classList.contains('ff-diamond--active')) {
          d.style.removeProperty('--ff-roll-r')
          d.style.removeProperty('--ff-roll-x')
          d.style.removeProperty('transition')
          const inner = d.querySelector('.ff-diamond-inner')
          if (inner) {
            inner.style.removeProperty('transform')
            inner.style.removeProperty('transition')
          }
          return
        }

        if (p === 0) {
          d.style.removeProperty('--ff-roll-r')
          d.style.removeProperty('--ff-roll-x')
          d.style.removeProperty('transition')
          const inner = d.querySelector('.ff-diamond-inner')
          if (inner) {
            inner.style.removeProperty('transform')
            inner.style.removeProperty('transition')
          }
          return
        }

        const travel = getTravel(d)
        const tx = travel * Math.sin(p * Math.PI)

        d.style.transition = 'none'
        d.style.setProperty('--ff-roll-r', `${rot}deg`)
        d.style.setProperty('--ff-roll-x', `${tx}px`)

        const inner = d.querySelector('.ff-diamond-inner')
        if (inner) {
          inner.style.transition = 'none'
          inner.style.transform = `rotate(${-45 - rot}deg)`
        }
      })
    }

    const onScroll = () => {
      if (scheduled) return
      scheduled = true
      requestAnimationFrame(() => {
        run()
        scheduled = false
      })
    }

    const onChange = (e) => {
      if (e.matches) {
        reset()
      } else {
        run()
      }
    }

    apply()

    mediaQueryListener.current =
      window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQueryListener.current.addEventListener('change', onChange)

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (mediaQueryListener.current) {
        mediaQueryListener.current.removeEventListener('change', onChange)
      }
      reset()
    }
  }, [arenaRef])
}
