import { motion } from 'framer-motion'
import Projects from '../components/Projects.jsx'
import { STATS } from '../content.js'
import { Counter, fadeUp, viewport, usePageMeta } from '../components/ui.jsx'

export default function ProjectsPage() {
  usePageMeta(
    'Projects',
    'Selected work — SaaS platforms, Flutter apps, e-commerce and API builds shipped by HayzenTech Solutions.',
  )

  return (
    <>
      <Projects />

      <section className="projects__stats">
        <div className="container">
          <motion.div
            className="projects__stats-head"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
          >
            <p className="eyebrow">By the numbers</p>
            <h2 className="projects__stats-title">Work that ships.</h2>
          </motion.div>

          <motion.div
            className="stats"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
          >
            {STATS.map((stat) => (
              <div key={stat.label} className="stat">
                <p className="stat__value">
                  <Counter to={stat.value} suffix={stat.suffix} />
                </p>
                <p className="stat__label">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  )
}
