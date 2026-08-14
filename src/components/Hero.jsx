import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { HERO } from '../content.js'
import { EASE, Magnetic } from './ui.jsx'

const WORDMARK = HERO.wordmark.split('')

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.3 } },
}

const letter = {
  hidden: { opacity: 0, y: 34, filter: 'blur(14px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, ease: EASE },
  },
}

export default function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 130])
  const fade = useTransform(scrollYProgress, [0, 0.65], [1, 0])

  return (
    <section className="hero" id="top" ref={ref}>
      <motion.div className="hero__inner" style={{ y: parallaxY, opacity: fade }}>
        <motion.h1
          className="wordmark"
          variants={container}
          initial="hidden"
          animate="visible"
          aria-label={HERO.wordmark}
        >
          {WORDMARK.map((ch, i) => (
            <motion.span key={i} className="wordmark__letter" variants={letter} aria-hidden="true">
              {ch}
            </motion.span>
          ))}
          <motion.sup
            className="wordmark__sup"
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.3 + WORDMARK.length * 0.04 + 0.15 }}
          >
            *
          </motion.sup>
        </motion.h1>

        <motion.div
          className="hero__side"
          initial={{ opacity: 0, y: 26, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.55 }}
        >
          <p className="hero__eyebrow">{HERO.eyebrow}</p>
          <p className="hero__sub">{HERO.sub}</p>

          <p className="hero__meta">
            <span className="pulse" aria-hidden="true" />
            {HERO.availability}
          </p>

          <div className="hero__ctas">
            <Magnetic strength={0.3} className="hero__cta-wrap">
              <a className="cta" href="#contact">
                <span className="cta__label">{HERO.ctaPrimary}</span>
                <span className="cta__circle" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M4.5 11.5L11.5 4.5M11.5 4.5H6M11.5 4.5V10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </a>
            </Magnetic>
            <a className="cta cta--ghost" href="#services">
              {HERO.ctaGhost} ↓
            </a>
          </div>
        </motion.div>
      </motion.div>

      <div className="hero__scroll" aria-hidden="true">
        <span />
      </div>
    </section>
  )
}
