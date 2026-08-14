import { motion } from 'framer-motion'
import { STATS, STACK } from '../content.js'
import { Counter, fadeUp, viewport, SectionHeading } from './ui.jsx'

export default function About() {
  return (
    <section className="about" id="about">
      <div className="container">
        <div className="about__grid">
          <div>
            <SectionHeading
              index="02"
              label="About"
              title="The person behind the code."
              lead="One team, one point of contact, zero handoffs lost."
            />
            <motion.p
              className="about__copy"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
            >
              HayzenTech Solutions is a full-stack development practice for products that need to
              ship — from architecture to pixels. Web or mobile, MVP or scale-up, every project gets
              the same care: a clear plan, clean code and communication you can set a watch by.
            </motion.p>
          </div>

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

        <motion.div
          className="stack"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <p className="stack__label">Day-to-day tools</p>
          <div className="stack__chips">
            {STACK.map((tool) => (
              <span key={tool} className="chip">
                {tool}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
