import { MdArrowOutward, MdCopyright, MdEmail, MdLocationOn, MdPhone } from "react-icons/md";
import "./styles/Contact.css";

const Contact = () => {
  return (
    <div className="contact-section section-container" id="contact">
      <div className="contact-container">
        <div className="contact-header">
          <h3>Get In Touch</h3>
          <p className="contact-subtitle">
            Ready to start your project? Let's build something great together.
          </p>
        </div>
        <div className="contact-grid">
          <div className="contact-info-card">
            <div className="contact-info-item">
              <MdEmail className="contact-info-icon" />
              <div>
                <h4>Email Us</h4>
                <a href="mailto:hayzentechsolutions@gmail.com">
                  hayzentechsolutions@gmail.com
                </a>
              </div>
            </div>
            <div className="contact-info-item">
              <MdPhone className="contact-info-icon" />
              <div>
                <h4>Call Us</h4>
                <p>+91 99458 91320</p>
              </div>
            </div>
            <div className="contact-info-item">
              <MdLocationOn className="contact-info-icon" />
              <div>
                <h4>Based In</h4>
                <p>India — Working Globally</p>
              </div>
            </div>
          </div>
          <div className="contact-services-card">
            <h4>Our Expertise</h4>
            <ul className="contact-service-list">
              <li>Custom Web Applications</li>
              <li>E-Commerce Platforms</li>
              <li>Game Development</li>
              <li>3D Interactive Experiences</li>
              <li>API & Backend Systems</li>
              <li>UI/UX Design</li>
            </ul>
          </div>
          <div className="contact-cta-card">
            <h4>Ready to Begin?</h4>
            <p>
              Sign up for a client account to place orders, track projects,
              and collaborate with our team in real time.
            </p>
            <a href="/#/login" className="contact-cta-btn">
              Get Started <MdArrowOutward />
            </a>
            <div className="contact-social-links">
              <a href="https://github.com/ToptileGamer" target="_blank" rel="noopener noreferrer">
                GitHub <MdArrowOutward />
              </a>
              <a href="https://www.instagram.com/hayzentech_solutions/" target="_blank" rel="noopener noreferrer">
                Instagram <MdArrowOutward />
              </a>
            </div>
          </div>
        </div>
        <div className="contact-footer">
          <p>
            Designed & Developed by <span>J Gautham</span>
          </p>
          <h5>
            <MdCopyright /> 2025 HayzenTech Solutions. All rights reserved.
          </h5>
        </div>
      </div>
    </div>
  );
};

export default Contact;
