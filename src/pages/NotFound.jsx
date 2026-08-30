import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { NAV_LINKS } from '../content.js'
import { EASE, Magnetic, usePageMeta } from '../components/ui.jsx'

const DIGITS = ['4', '0', '4']

const wrap = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 28, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: EASE },
  },
}

export default function NotFound() {
  usePageMeta(
    'Page not found',
    'The page you are looking for does not exist. Head back to the HayzenTech Solutions homepage.',
    '/404',
  )

  return (
    <section className="not-found">
      <motion.div className="container" variants={wrap} initial="hidden" animate="visible">
        <motion.p className="eyebrow" variants={item}>
          404 · Lost in the film
        </motion.p>

        <motion.p className="not-found__code" variants={item} aria-hidden="true">
          {DIGITS.map((d, i) => (
            <span key={i} className="not-found__digit">
              {d}
            </span>
          ))}
        </motion.p>

        <motion.h1 className="not-found__title" variants={item}>
          This page doesn&apos;t exist.
        </motion.h1>

        <motion.p className="not-found__lead" variants={item}>
          The link may be old, or the page moved. Here&apos;s the way back.
        </motion.p>

        <motion.div className="not-found__actions" variants={item}>
          <Magnetic strength={0.3} className="not-found__cta-wrap">
            <Link className="cta" to="/">
              <span className="cta__label">Back home</span>
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
            </Link>
          </Magnetic>
        </motion.div>

        <motion.nav className="not-found__links" aria-label="Site sections" variants={item}>
          {NAV_LINKS.map((link) => (
            <Link key={link.to} className="not-found__link" to={link.to}>
              {link.label}
            </Link>
          ))}
        </motion.nav>
      </motion.div>
    </section>
  )
}
