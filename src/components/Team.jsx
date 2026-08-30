import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { TEAM } from '../content.js'
import { fadeUp, viewport, SectionHeading } from './ui.jsx'

const MotionLink = motion.create(Link)

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

function GitHubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5A11.5 11.5 0 0 0 8.36 22.9c.57.1.78-.25.78-.55v-1.93c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.5 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.78 1.05.78 2.12v3.14c0 .3.2.66.79.55A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.95 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35ZM12.04 21.5h-.01a9.44 9.44 0 0 1-4.8-1.32l-.35-.2-3.57.94.95-3.48-.22-.36a9.42 9.42 0 0 1-1.44-5.02c0-5.2 4.24-9.44 9.45-9.44a9.4 9.4 0 0 1 6.68 2.77 9.38 9.38 0 0 1 2.77 6.68c0 5.2-4.24 9.45-9.44 9.45ZM20.5 3.49A11.78 11.78 0 0 0 12.04 0C5.5 0 .2 5.3.2 11.82c0 2.08.54 4.11 1.58 5.9L.1 24l6.42-1.68a11.8 11.8 0 0 0 5.51 1.4h.01c6.53 0 11.84-5.3 11.84-11.82 0-3.16-1.23-6.13-3.47-8.37Z" />
    </svg>
  )
}

function CalendlyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
      <path d="M3 9.5h18M8 3v3M16 3v3" />
      <circle cx="12" cy="14.5" r="2.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

function trackSpotlight(e) {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
  e.currentTarget.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
}

export default function Team() {
  return (
    <section className="services" id="team">
      <div className="container">
        <SectionHeading
          index="01"
          label="Team"
          title="The people behind the code."
        />

        <div className="services__grid">
          {TEAM.map((member) => (
            <motion.article
              key={member.github}
              className="service member"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              onMouseMove={trackSpotlight}
            >
              <img
                className="member__photo"
                src={member.photo}
                alt=""
                width="112"
                height="112"
                loading="lazy"
              />
              <div className="member__links">
                <a
                  className="member__link"
                  href={member.github}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub profile"
                >
                  <GitHubIcon />
                </a>
                <a
                  className="member__link"
                  href={member.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn profile"
                >
                  <LinkedInIcon />
                </a>
                <a
                  className="member__link"
                  href={member.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Chat on WhatsApp"
                >
                  <WhatsAppIcon />
                </a>
                {member.calendly && (
                  <a
                    className="member__link"
                    href={member.calendly}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Book a call on Calendly"
                  >
                    <CalendlyIcon />
                  </a>
                )}
              </div>
            </motion.article>
          ))}

          <MotionLink
            className="service service--cta"
            to="/contact"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            onMouseMove={trackSpotlight}
          >
            <span className="service__cta-title">Want to work with us?</span>
            <span className="service__cta-link">
              Start a project
              <Arrow className="service__cta-arrow" />
            </span>
          </MotionLink>
        </div>
      </div>
    </section>
  )
}
