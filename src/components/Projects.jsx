import { motion } from 'framer-motion'
import { PROJECTS } from '../content.js'
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

export default function Projects() {
  return (
    <section className="projects" id="projects">
      <div className="container">
        <SectionHeading
          index="01"
          label="Projects"
          title="Selected work."
          lead="A few recent builds — from first commit to production, and every fix in between."
        />

        <div className="projects__grid">
          {PROJECTS.map((p) => {
            const inner = (
              <>
                <span className="project__meta">
                  <span className="project__category">{p.category}</span>
                  <span className="project__year">{p.year}</span>
                </span>
                {p.link && <Arrow className="project__arrow" />}
                <h3 className="project__title">{p.title}</h3>
                <p className="project__copy">{p.copy}</p>
                <span className="project__tags">
                  {p.tags.map((tag) => (
                    <span key={tag} className="project__tag">
                      {tag}
                    </span>
                  ))}
                </span>
              </>
            )

            const props = {
              className: 'project',
              variants: fadeUp,
              initial: 'hidden',
              whileInView: 'visible',
              viewport,
              onMouseMove: trackSpotlight,
            }

            return p.link ? (
              <motion.a key={p.title} href={p.link} target="_blank" rel="noreferrer" {...props}>
                {inner}
              </motion.a>
            ) : (
              <motion.article key={p.title} {...props}>
                {inner}
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
