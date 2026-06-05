import { useEffect, useRef } from "react";
import "./styles/WhatIDo.css";
import { MdCode, MdGamepad, MdWeb, MdPalette } from "react-icons/md";

const services = [
  {
    icon: <MdWeb />,
    title: "Web Development",
    description:
      "Custom web applications built with modern frameworks. From single-page apps to complex full-stack platforms.",
    tools: ["React.js", "Next.js", "Node.js", "PostgreSQL"],
  },
  {
    icon: <MdGamepad />,
    title: "Game Development",
    description:
      "Interactive games and simulations using Unity and modern game engines. From concept to playable builds.",
    tools: ["Unity", "C#", "3D Modeling", "Physics"],
  },
  {
    icon: <MdCode />,
    title: "Full Stack Solutions",
    description:
      "End-to-end development including APIs, databases, authentication, and payment integration.",
    tools: ["REST APIs", "Authentication", "Database Design", "Razorpay"],
  },
  {
    icon: <MdPalette />,
    title: "UI/UX & 3D Experiences",
    description:
      "Immersive user interfaces with modern animations, 3D visualizations, and interactive elements.",
    tools: ["Three.js", "GSAP", "Framer Motion", "CSS3"],
  },
];

const WhatIDo = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("service-visible");
          }
        });
      },
      { threshold: 0.15 }
    );

    const cards = sectionRef.current?.querySelectorAll(".service-card");
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="services-section" id="services" ref={sectionRef}>
      <div className="services-container section-container">
        <div className="services-header">
          <h2>
            Our <span>Services</span>
          </h2>
          <p className="services-subtitle">
            End-to-end development solutions tailored to your business needs
          </p>
        </div>
        <div className="services-grid">
          {services.map((service, index) => (
            <div className="service-card" key={index}>
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <div className="service-tools">
                {service.tools.map((tool, i) => (
                  <span className="service-tag" key={i}>
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WhatIDo;
