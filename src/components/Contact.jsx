import { useState } from 'react'
import { CONTACT } from '../content.js'
import { SectionHeading, Magnetic } from './ui.jsx'

const FORM_ENDPOINT = 'https://api.web3forms.com/submit'

export default function Contact() {
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const ready = Boolean(CONTACT.web3formsKey)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!ready || status === 'sending') return

    const form = e.currentTarget
    const data = new FormData(form)
    data.set('access_key', CONTACT.web3formsKey)
    data.set('from_name', 'HayzenTech Solutions — Website')
    data.set('subject', `New inquiry from ${data.get('name') || 'the website'}`)

    setStatus('sending')
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data,
      })
      const json = await res.json()
      if (json.success) {
        setStatus('sent')
        form.reset()
      } else {
        setStatus('error')
        // eslint-disable-next-line no-console
        console.error('Web3Forms error:', json)
      }
    } catch (err) {
      setStatus('error')
      // eslint-disable-next-line no-console
      console.error('Web3Forms request failed:', err)
    }
  }

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
        </div>

        <form className="contact__form" onSubmit={handleSubmit}>
          {/* Honeypot — hidden from real users, catches bots */}
          <input
            type="checkbox"
            name="botcheck"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ display: 'none' }}
          />
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
          <button className="cta cta--submit" type="submit" disabled={!ready || status === 'sending'}>
            <span className="cta__label">
              {status === 'sending' ? 'Sending…' : status === 'sent' ? 'Sent' : 'Send inquiry'}
            </span>
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
          {status === 'sent' && (
            <p className="contact__note" role="status">Thanks — your message is on its way. I'll reply within one business day.</p>
          )}
          {status === 'error' && (
            <p className="contact__note" role="alert">Something went wrong. Please email {CONTACT.email} directly.</p>
          )}
        </form>
      </div>
    </section>
  )
}
