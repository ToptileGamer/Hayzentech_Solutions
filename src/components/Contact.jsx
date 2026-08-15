import { CONTACT } from '../content.js'
import { SectionHeading, Magnetic } from './ui.jsx'

const CHANNELS = [
  { label: 'LinkedIn', href: CONTACT.linkedin },
  { label: 'GitHub', href: CONTACT.github },
  { label: 'Instagram', href: CONTACT.instagram },
]

function handleSubmit(e) {
  e.preventDefault()
  const form = new FormData(e.currentTarget)
  const name = form.get('name')
  const email = form.get('email')
  const message = form.get('message')
  const body = encodeURIComponent(`${message}\n\n— ${name}${email ? ` (${email})` : ''}`)
  window.open(`${CONTACT.whatsappLink}?text=${body}`, '_blank', 'noopener')
}

export default function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="container">
        <SectionHeading
          index="01"
          label="Contact"
          title="Let's build something."
          lead="Tell me what you're making — a product, a platform, an app. I'll reply within one business day."
          center
        />

        <p className="contact__avail">
          <span className="pulse" aria-hidden="true" />
          Currently booking for this quarter
        </p>

        <div className="contact__actions">
          <Magnetic strength={0.3} className="contact__action-wrap">
            <a className="cta" href={`mailto:${CONTACT.email}`}>
              <span className="cta__label">{CONTACT.email}</span>
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
          <Magnetic strength={0.3} className="contact__action-wrap">
            <a className="cta cta--ghost" href={CONTACT.whatsappLink} target="_blank" rel="noreferrer">
              WhatsApp · {CONTACT.whatsappLabel}
            </a>
          </Magnetic>
        </div>

        <form className="contact__form" onSubmit={handleSubmit}>
          <div className="contact__field">
            <label htmlFor="cf-name">Name</label>
            <input id="cf-name" name="name" type="text" placeholder="Ada Lovelace" required />
          </div>
          <div className="contact__field">
            <label htmlFor="cf-email">Email</label>
            <input id="cf-email" name="email" type="email" placeholder="you@company.com" required />
          </div>
          <div className="contact__field">
            <label htmlFor="cf-message">The idea</label>
            <textarea
              id="cf-message"
              name="message"
              rows="4"
              placeholder="What are you building? Timeline, budget, anything helps."
              required
            />
          </div>
          <button className="cta cta--submit" type="submit">
            <span className="cta__label">Send inquiry</span>
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
          </button>
          <p className="contact__note">Opens WhatsApp with your message pre-filled — nothing is stored anywhere.</p>
        </form>

        <nav className="contact__channels" aria-label="Social">
          {CHANNELS.map((channel) => (
            <a
              key={channel.label}
              className="channel"
              href={channel.href}
              target="_blank"
              rel="noreferrer"
            >
              {channel.label}
            </a>
          ))}
        </nav>
      </div>
    </section>
  )
}
