import { motion } from "framer-motion";
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

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

const WhatIDo = () => {
  return (
    <motion.div
      className="services-section"
      id="services"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={containerVariants}
    >
      <div className="services-container section-container">
        <motion.div className="services-header" variants={fadeUp}>
          <h2>
            Our <span>Services</span>
          </h2>
          <p className="services-subtitle">
            End-to-end development solutions tailored to your business needs
          </p>
        </motion.div>
        <motion.div className="services-grid" variants={containerVariants}>
          {services.map((service, index) => (
            <motion.div
              className="service-card"
              key={index}
              variants={cardVariants}
              whileHover={{ y: -6, boxShadow: "0 16px 40px rgba(0, 0, 0, 0.3)" }}
            >
              <motion.div
                className="service-icon"
                initial={{ rotate: -10, scale: 0.8 }}
                whileInView={{ rotate: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.1, ease: "easeOut" }}
              >
                {service.icon}
              </motion.div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <div className="service-tools">
                {service.tools.map((tool, i) => (
                  <motion.span
                    className="service-tag"
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.3 + i * 0.06 + index * 0.05 }}
                  >
                    {tool}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WhatIDo;
