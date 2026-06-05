import { Link, useNavigate } from "react-router-dom";
import { MdArrowBack, MdEmail, MdPhone, MdArrowOutward } from "react-icons/md";
import "./ContactPage.css";

const ContactPage = () => {
  const navigate = useNavigate();

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("hayzentechsolutions@gmail.com")
      .catch(() => {});
  };

  return (
    <div className="contact-page">
      <button className="contact-back-btn" onClick={() => navigate("/")}>
        <MdArrowBack /> Home
      </button>

      <div className="contact-page-content">
        <h1 className="contact-page-title">Get in Touch</h1>
        <p className="contact-page-subtitle">
          Have a project in mind? Let's talk about it.
        </p>

        <div className="contact-options-grid">
          <div className="contact-option-card">
            <div className="contact-option-icon email-icon">
              <MdEmail />
            </div>
            <h2>Email Me</h2>
            <p>Send me an email and I'll get back to you within 24 hours.</p>
            <a
              href="mailto:hayzentechsolutions@gmail.com"
              className="contact-option-btn primary"
              data-cursor="disable"
            >
              <MdEmail /> Send Email
            </a>
            <button
              type="button"
              className="contact-copy-btn"
              onClick={handleCopyEmail}
            >
              Copy email address
            </button>
          </div>

          <div className="contact-option-card">
            <div className="contact-option-icon call-icon">
              <MdPhone />
            </div>
            <h2>Let's Talk</h2>
            <p>Have a quick question or want to discuss a project? Reach out!</p>
            <a
              href="tel:+919945891320"
              className="contact-option-btn"
              data-cursor="disable"
            >
              <MdPhone /> Call
            </a>
          </div>

          <div className="contact-option-card">
            <div className="contact-option-icon order-icon">
              <MdArrowOutward />
            </div>
            <h2>Place an Order</h2>
            <p>
              Ready to start? Create an account and place your first order.
            </p>
            <Link
              to="/login"
              className="contact-option-btn primary"
            >
              <MdArrowOutward /> Get Started
            </Link>
          </div>
        </div>

        <div className="contact-page-footer">
          <p>
            Prefer a quick chat?{" "}
            <Link to="/" className="contact-page-link">
              Back to homepage
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
