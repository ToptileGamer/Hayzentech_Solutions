import { Link } from "react-router-dom";
import CharacterModel from "./Character/index.jsx";
import "./styles/Landing.css";

const Landing = () => {
  return (
    <>
      <div className="landing-section" id="landingDiv">
        <CharacterModel />
        <div className="landing-container">
          <div className="landing-content">
            <div className="landing-badge">Full Stack Web & Game Development</div>
            <h1 className="landing-headline">
              Building Digital
              <br />
              Experiences That <span>Deliver</span>
            </h1>
            <p className="landing-subtext">
              From concept to deployment — we craft high-performance web applications,
              interactive experiences, and game solutions that help businesses grow.
            </p>
            <div className="landing-cta-group">
              <a href="#services" className="landing-cta-primary">
                Our Services
              </a>
              <Link to="/login" className="landing-cta-secondary">
                Get Started
              </Link>
            </div>
            <div className="landing-stats">
              <div className="landing-stat">
                <h3>50+</h3>
                <p>Projects Delivered</p>
              </div>
              <div className="landing-stat-divider" />
              <div className="landing-stat">
                <h3>100%</h3>
                <p>Client Satisfaction</p>
              </div>
              <div className="landing-stat-divider" />
              <div className="landing-stat">
                <h3>24/7</h3>
                <p>Support & Delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="scroll-down" aria-hidden="true">
        <span className="scroll-down-text">Scroll</span>
        <div className="scroll-down-line"></div>
      </div>
    </>
  );
};

export default Landing;
