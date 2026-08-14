import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { TESTIMONIALS } from '../content.js'
import { EASE, SectionHeading } from './ui.jsx'

const ROTATE_MS = 6000

export default function Testimonials() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce || paused) return undefined
    const id = setInterval(() => setIndex((i) => (i + 1) % TESTIMONIALS.length), ROTATE_MS)
    return () => clearInterval(id)
  }, [reduce, paused])

  const current = TESTIMONIALS[index]

  return (
    <section
      className="testimonials"
      id="testimonials"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="container">
        <SectionHeading index="04" label="Testimonials" title="What clients say." center />

        <div className="testimonials__stage">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={index}
              className="quote"
              initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -14, filter: 'blur(6px)' }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <p className="quote__text">“{current.quote}”</p>
              <footer className="quote__attr">— {current.author}</footer>
            </motion.blockquote>
          </AnimatePresence>

          {!reduce && (
            <div className="dots" aria-label="Choose a testimonial">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  aria-pressed={i === index}
                  aria-label={`Show testimonial ${i + 1}`}
                  className={`dot${i === index ? ' dot--active' : ''}`}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
