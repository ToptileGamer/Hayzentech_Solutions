import { motion } from 'framer-motion'
import { usePageMeta, SectionHeading, viewport, fadeUp } from '../components/ui.jsx'

export default function PrivacyPage() {
  usePageMeta(
    'Privacy Policy',
    'Privacy Policy for HayzenTech Solutions — how we collect, use, disclose, and safeguard your information.',
    '/privacy',
  )

  return (
    <section className="services" style={{ background: 'rgba(13,11,9,0.55)' }}>
      <div className="container" style={{ maxWidth: 800, marginInline: 'auto' }}>
        <SectionHeading
          index="01"
          label="Legal"
          title="Privacy Policy"
          lead="Effective Date: August 29, 2026 — Last Updated: August 29, 2026"
          center
        />

        <motion.div
          style={{ marginTop: 'clamp(40px, 6vw, 72px)' }}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <PrivacyContent />
        </motion.div>
      </div>
    </section>
  )
}

function PrivacyContent() {
  return (
    <div className="privacy">
      <style>{`
        .privacy h2 {
          margin: 36px 0 14px;
          font-family: var(--font-display);
          font-weight: 500;
          font-size: 22px;
          letter-spacing: -0.01em;
          color: var(--cream);
        }
        .privacy h3 {
          margin: 24px 0 10px;
          font-family: var(--font-display);
          font-weight: 500;
          font-size: 17px;
          color: var(--cream);
        }
        .privacy p {
          font-size: 15px;
          line-height: 1.7;
          color: var(--cream-70);
          margin-bottom: 14px;
        }
        .privacy ul {
          padding-left: 22px;
          margin-bottom: 18px;
        }
        .privacy li {
          font-size: 15px;
          line-height: 1.7;
          color: var(--cream-70);
          margin-bottom: 10px;
        }
        .privacy strong {
          color: var(--cream);
          font-weight: 500;
        }
        .privacy a {
          color: var(--cream);
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.3s ease;
        }
        .privacy a:hover {
          color: var(--cream-70);
        }
        .privacy__highlight {
          background: rgba(243,239,230,0.04);
          border: 1px solid var(--hairline);
          border-radius: 16px;
          padding: 20px 24px;
          margin: 18px 0;
        }
        .privacy__footer {
          margin-top: 48px;
          padding-top: 24px;
          border-top: 1px solid var(--hairline);
          text-align: center;
          color: var(--cream-46);
          font-size: 13px;
        }
      `}</style>

      <h2>1. Introduction</h2>
      <p>
        HayzenTech Solutions ("we," "our," or "us") operates the HayzenTech Solutions mobile
        application (the "App"). This Privacy Policy explains how we collect, use, disclose, and
        safeguard your information when you use our App.
      </p>
      <p>
        By using the App, you agree to the collection and use of information in accordance with this
        policy. If you do not agree, please do not use the App.
      </p>

      <h2>2. Information We Collect</h2>

      <h3>2.1 Personal Information</h3>
      <p>We collect the following personal information when you create an account or use our services:</p>
      <ul>
        <li><strong>Full name</strong></li>
        <li><strong>Email address</strong></li>
        <li><strong>Phone number</strong> (optional)</li>
        <li><strong>Account role</strong> (client or admin)</li>
      </ul>

      <h3>2.2 Usage and Service Data</h3>
      <p>As you use the App, we collect:</p>
      <ul>
        <li><strong>Orders</strong> — Project details, service type, status, and descriptions you submit</li>
        <li><strong>Tasks</strong> — Task assignments, status updates, and related notes</li>
        <li><strong>Messages</strong> — Communications between you and our team within the App</li>
        <li><strong>Media files</strong> — Photos, documents, and other files you upload</li>
      </ul>

      <h3>2.3 Automatically Collected Information</h3>
      <ul>
        <li>Device type and operating system version</li>
        <li>App usage analytics (pages viewed, features used)</li>
        <li>Crash logs and error reports</li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <div className="privacy__highlight">
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, operate, and maintain the App and our services</li>
          <li>Process your orders and manage your projects</li>
          <li>Communicate with you about your orders, tasks, and account</li>
          <li>Send transactional emails (order updates, password resets, account confirmations)</li>
          <li>Improve and personalize your experience</li>
          <li>Ensure the security and integrity of our platform</li>
          <li>Comply with legal obligations</li>
        </ul>
      </div>

      <h2>4. Data Sharing and Disclosure</h2>
      <p>
        We do <strong>not</strong> sell your personal information. We may share your data only in the
        following circumstances:
      </p>
      <ul>
        <li>
          <strong>Service Providers</strong> — We use third-party services (e.g., Supabase for hosting
          and authentication) that process data on our behalf under strict confidentiality agreements.
        </li>
        <li>
          <strong>Legal Requirements</strong> — We may disclose your information if required by law,
          regulation, or legal process.
        </li>
        <li>
          <strong>Business Transfers</strong> — In the event of a merger, acquisition, or sale of
          assets, your data may be transferred as part of that transaction.
        </li>
      </ul>

      <h2>5. Data Security</h2>
      <p>We implement industry-standard security measures to protect your data, including:</p>
      <ul>
        <li>Encryption of data in transit (TLS/HTTPS)</li>
        <li>Encrypted data at rest</li>
        <li>Role-based access controls</li>
        <li>Regular security audits</li>
      </ul>
      <p>
        However, no method of transmission over the Internet is 100% secure, and we cannot guarantee
        absolute security.
      </p>

      <h2>6. Data Retention</h2>
      <p>
        We retain your personal data only as long as necessary to provide our services and fulfill the
        purposes described in this policy:
      </p>
      <ul>
        <li><strong>Account data</strong> — Retained while your account is active</li>
        <li><strong>Transaction/billing records</strong> — Up to 7 years (as required by law)</li>
        <li><strong>Fraud prevention logs</strong> — Up to 2 years</li>
        <li><strong>Analytics data</strong> — Aggregated and anonymized</li>
      </ul>

      <h2>7. Your Rights</h2>
      <p>You have the following rights regarding your personal data:</p>
      <ul>
        <li><strong>Access</strong> — Request a copy of the data we hold about you</li>
        <li><strong>Correction</strong> — Request correction of inaccurate data</li>
        <li><strong>Deletion</strong> — Request deletion of your account and personal data</li>
        <li><strong>Data Portability</strong> — Request your data in a structured, machine-readable format</li>
        <li><strong>Withdraw Consent</strong> — Withdraw consent for data processing at any time</li>
      </ul>
      <p>
        To exercise any of these rights, contact us at{' '}
        <a href="mailto:hayzentechsolutions@gmail.com">hayzentechsolutions@gmail.com</a>.
      </p>

      <h2>8. Children's Privacy</h2>
      <p>
        The App is not intended for use by children under the age of 13. We do not knowingly collect
        personal information from children under 13. If we become aware that we have collected such
        data, we will take steps to delete it promptly.
      </p>

      <h2>9. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of any material
        changes by posting the new policy on this page and updating the "Last Updated" date. We
        encourage you to review this policy periodically.
      </p>

      <h2>10. Contact Us</h2>
      <div className="privacy__highlight">
        <p>If you have any questions about this Privacy Policy, please contact us:</p>
        <p>
          <strong>HayzenTech Solutions</strong>
          <br />
          Email: <a href="mailto:hayzentechsolutions@gmail.com">hayzentechsolutions@gmail.com</a>
          <br />
          Website: <a href="https://www.hayzentech.in">www.hayzentech.in</a>
        </p>
      </div>

      <div className="privacy__footer">
        <p>© 2026 HayzenTech Solutions. All rights reserved.</p>
      </div>
    </div>
  )
}
