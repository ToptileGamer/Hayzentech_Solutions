import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdEmail, MdPhone, MdArrowBack, MdContentCopy, MdCheck } from "react-icons/md";
import "./ContactPage.css";

// Config - Update these with your actual details
const CONTACT_CONFIG = {
  email: "hayzentechsolutions@gmail.com",
  phone: import.meta.env.VITE_CONTACT_PHONE || "+919945891320",
};

const ContactPage = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(null);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="contact-page">
      <button className="contact-back-btn" onClick={() => navigate("/")}>
        <MdArrowBack /> Back to Home
      </button>

      <div className="contact-page-content">
        <h1 className="contact-page-title">Let's Work Together</h1>
        <p className="contact-page-subtitle">
          Have a project in mind? Let's bring your ideas to life.
        </p>

        <div className="contact-options-grid">
          {/* Email Option */}
          <div className="contact-option-card">
            <div className="contact-option-icon email-icon">
              <MdEmail />
            </div>
            <h2>Email Me</h2>
            <p>Send me an email and I'll get back to you within 24 hours.</p>
            <a
              href={`mailto:${CONTACT_CONFIG.email}`}
              className="contact-option-btn"
              data-cursor="disable"
            >
              Send Email
            </a>
            <button
              className="contact-copy-btn"
              onClick={() =>
                copyToClipboard(
                  CONTACT_CONFIG.email,
                  "email"
                )
              }
            >
              {copied === "email" ? (
                <>
                  <MdCheck /> Copied!
                </>
              ) : (
                <>
                  <MdContentCopy /> Copy Email
                </>
              )}
            </button>
          </div>

          {/* Call Option */}
          <div className="contact-option-card">
            <div className="contact-option-icon call-icon">
              <MdPhone />
            </div>
            <h2>Call Me</h2>
            <p>Prefer a direct conversation? Give me a call.</p>
            <a
              href={`tel:${CONTACT_CONFIG.phone}`}
              className="contact-option-btn"
              data-cursor="disable"
            >
              Call Now
            </a>
            <button
              className="contact-copy-btn"
              onClick={() => copyToClipboard(CONTACT_CONFIG.phone, "phone")}
            >
              {copied === "phone" ? (
                <>
                  <MdCheck /> Copied!
                </>
              ) : (
                <>
                  <MdContentCopy /> Copy Number
                </>
              )}
            </button>
          </div>

          {/* Order Option */}
          <div className="contact-option-card order-card">
            <div className="contact-option-icon order-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h2>Place an Order</h2>
            <p>
              Already know what you need? Create an account and place your order
              directly.
            </p>
            <Link to="/login" className="contact-option-btn primary" data-cursor="disable">
              Get Started
            </Link>
          </div>
        </div>

        <div className="contact-page-footer">
          <p>
            Or check out my{" "}
            <Link to="/" className="contact-page-link">
              portfolio
            </Link>{" "}
            to see my previous work.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
