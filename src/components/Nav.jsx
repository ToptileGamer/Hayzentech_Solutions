import { useEffect, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { CONTACT, NAV_LINKS } from '../content.js'
import { EASE, Magnetic } from './ui.jsx'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 24))

  // Lock body scroll while the mobile menu is open, close on Escape.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <motion.nav
        className={`nav${scrolled ? ' nav--scrolled' : ''}`}
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
      >
        <div className="nav__inner">
          <Link className="nav__brand" to="/">
            HayzenTech <span className="nav__brand-sup">Solutions</span>
          </Link>

          <ul className="nav__links">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  className={({ isActive }) => `nav__link${isActive ? ' nav__link--active' : ''}`}
                  to={link.to}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="nav__actions">
            <Magnetic strength={0.25} className="nav__cta-wrap">
              <Link className="cta cta--sm" to="/contact">
                <span className="cta__label">Start a project</span>
              </Link>
            </Magnetic>
            <button
              className={`nav__toggle${open ? ' nav__toggle--open' : ''}`}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            className="menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <motion.ul
              className="menu__list"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
                hidden: {},
              }}
            >
              {NAV_LINKS.map((link) => (
                <motion.li
                  key={link.to}
                  variants={{
                    hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
                    visible: {
                      opacity: 1,
                      y: 0,
                      filter: 'blur(0px)',
                      transition: { duration: 0.6, ease: EASE },
                    },
                  }}
                >
                  <NavLink
                    className={({ isActive }) =>
                      `menu__link${isActive ? ' menu__link--active' : ''}`
                    }
                    to={link.to}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </NavLink>
                </motion.li>
              ))}
            </motion.ul>

            <div className="menu__foot">
              <a className="menu__contact" href={`mailto:${CONTACT.email}`}>
                {CONTACT.email}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
