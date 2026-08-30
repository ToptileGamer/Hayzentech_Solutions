import { Link } from 'react-router-dom'
import Hero from '../components/Hero.jsx'
import Marquee from '../components/Marquee.jsx'
import { SectionHeading, Magnetic, usePageMeta } from '../components/ui.jsx'

export default function Home() {
  usePageMeta(
    '',
    'HayzenTech Solutions builds full-stack web platforms, Flutter apps, e-commerce and APIs — engineered to scale, designed to feel effortless. Contact us for custom React, Node.js, Flutter and cloud development.',
    '/',
  )

  return (
    <>
      <Hero />
      <Marquee />

      <section className="home-cta">
        <div className="container">
          <SectionHeading
            index="01"
            label="Next step"
            title="Let's build something."
            lead="Tell me about your project — a product, a platform, an app. I'll reply within one business day."
            center
          />

          <div className="contact__actions">
            <Magnetic strength={0.3} className="contact__action-wrap">
              <Link className="cta" to="/contact">
                <span className="cta__label">Start a project</span>
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
          </div>
        </div>
      </section>
    </>
  )
}
