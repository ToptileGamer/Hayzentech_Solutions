import { useEffect, useRef } from "react";
import "./styles/About.css";

const About = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("about-visible");
          }
        });
      },
      { threshold: 0.2 }
    );

    const elements = sectionRef.current?.querySelectorAll(".about-animate");
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-section" id="about" ref={sectionRef}>
      <div className="about-container section-container">
        <div className="about-header about-animate">
          <h3 className="title">About Us</h3>
          <div className="about-line" />
        </div>
        <div className="about-grid">
          <div className="about-text about-animate">
            <p>
              HayzenTech Solutions is a full-stack development studio specializing in
              modern web applications, interactive 3D experiences, and game development.
              We combine technical expertise with creative design to build products that
              stand out in the market.
            </p>
            <p>
              Founded by J Gautham, we believe in crafting performant, scalable solutions
              that solve real business problems. Whether it's a dynamic web platform, an
              immersive game, or a custom enterprise tool — we deliver excellence from
              concept to deployment.
            </p>
          </div>
          <div className="about-values about-animate">
            <div className="about-value-card">
              <div className="about-value-icon">⚡</div>
              <h4>Performance First</h4>
              <p>Every project is built with speed, scalability, and reliability at its core.</p>
            </div>
            <div className="about-value-card">
              <div className="about-value-icon">🎨</div>
              <h4>Design Driven</h4>
              <p>Clean, intuitive interfaces that users love and businesses trust.</p>
            </div>
            <div className="about-value-card">
              <div className="about-value-icon">🚀</div>
              <h4>End to End</h4>
              <p>From initial concept through development to deployment and support.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
