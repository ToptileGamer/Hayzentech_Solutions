import { motion } from 'framer-motion'
import { SERVICES } from '../content.js'
import { fadeUp, viewport, SectionHeading } from './ui.jsx'

function Arrow({ className = '' }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M4.5 11.5L11.5 4.5M11.5 4.5H6M11.5 4.5V10"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function trackSpotlight(e) {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
  e.currentTarget.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
}

export default function Services() {
  return (
    <section className="services" id="services">
      <div className="container">
        <SectionHeading
          index="01"
          label="Services"
          title="What I build."
          lead="Five ways I help teams ship — from first commit to production, and every fix in between."
        />

        <div className="services__grid">
          {SERVICES.map((s) => (
            <motion.article
              key={s.num}
              className="service"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              onMouseMove={trackSpotlight}
            >
              <span className="service__num">{s.num}</span>
              <Arrow className="service__arrow" />
              <h3 className="service__title">{s.title}</h3>
              <p className="service__copy">{s.copy}</p>
            </motion.article>
          ))}

          <motion.a
            className="service service--cta"
            href="#contact"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            onMouseMove={trackSpotlight}
          >
            <span className="service__cta-title">Something else in mind?</span>
            <span className="service__cta-link">
              Let's talk
              <Arrow className="service__cta-arrow" />
            </span>
          </motion.a>
        </div>
      </div>
    </section>
  )
}
