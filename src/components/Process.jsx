import { motion } from 'framer-motion'
import { PROCESS } from '../content.js'
import { fadeUp, viewport, SectionHeading } from './ui.jsx'

export default function Process() {
  return (
    <section className="process" id="process">
      <div className="container">
        <SectionHeading
          index="03"
          label="Process"
          title="How it works."
          lead="A process built for momentum — you always know what's happening and what's next."
        />

        <div className="process__rows">
          {PROCESS.map((step) => (
            <motion.div
              key={step.num}
              className="process__row"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
            >
              <span className="process__num">{step.num}</span>
              <h3 className="process__title">{step.title}</h3>
              <p className="process__copy">{step.copy}</p>
              <svg
                className="process__arrow"
                width="20"
                height="20"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M4.5 11.5L11.5 4.5M11.5 4.5H6M11.5 4.5V10"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
