import { useState, useEffect, useRef } from 'react'
import { motion, animate, useInView, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'

export const EASE = [0.2, 0.7, 0.2, 1]

export const viewport = { once: true, amount: 0.2, margin: '0px 0px -8% 0px' }

export const fadeUp = {
  hidden: { opacity: 0, y: 26, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.85, ease: EASE },
  },
}

export function SectionHeading({ index, label, title, lead, center = false }) {
  return (
    <motion.div
      className={`section-heading${center ? ' section-heading--center' : ''}`}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
    >
      <p className="eyebrow">
        {index} · {label}
      </p>
      <h2 className="section-title">{title}</h2>
      {lead && <p className="section-lead">{lead}</p>}
    </motion.div>
  )
}

/** Wrapper that gently pulls its child toward the cursor. */
export function Magnetic({ children, strength = 0.3, className = '' }) {
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.3 })
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.3 })

  const handlers = reduce
    ? {}
    : {
        onMouseMove: (e) => {
          const r = ref.current.getBoundingClientRect()
          x.set((e.clientX - r.left - r.width / 2) * strength)
          y.set((e.clientY - r.top - r.height / 2) * strength)
        },
        onMouseLeave: () => {
          x.set(0)
          y.set(0)
        },
      }

  return (
    <motion.div
      ref={ref}
      className={`magnetic${className ? ` ${className}` : ''}`}
      style={reduce ? undefined : { x: sx, y: sy }}
      {...handlers}
    >
      {children}
    </motion.div>
  )
}

/** Counts up from 0 when scrolled into view. */
export function Counter({ to, suffix = '', className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView) return undefined
    const controls = animate(0, to, {
      duration: 1.8,
      ease: EASE,
      onUpdate: (v) => setVal(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, to])

  return (
    <span ref={ref} className={className}>
      {val}
      {suffix}
    </span>
  )
}
