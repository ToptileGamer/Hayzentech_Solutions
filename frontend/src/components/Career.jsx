import { motion } from "framer-motion";
import "./styles/Career.css";

const steps = [
  {
    step: "01",
    title: "Discovery & Planning",
    description:
      "We start by understanding your business goals, target audience, and project requirements. A detailed roadmap is created with clear milestones.",
  },
  {
    step: "02",
    title: "Design & Architecture",
    description:
      "Our team designs the system architecture and creates wireframes/mockups. We ensure scalability, performance, and clean user experience from the start.",
  },
  {
    step: "03",
    title: "Development & Testing",
    description:
      "Iterative development with regular updates. Every feature is thoroughly tested for performance, security, and cross-platform compatibility.",
  },
  {
    step: "04",
    title: "Deployment & Support",
    description:
      "We handle the full deployment process and provide ongoing support, updates, and maintenance to keep your project running flawlessly.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
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

const Career = () => {
  return (
    <motion.div
      className="process-section section-container"
      id="process"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={containerVariants}
    >
      <div className="process-container">
        <motion.div className="process-header" variants={fadeUp}>
          <h2>
            How We <span>Work</span>
          </h2>
          <p className="process-subtitle">
            A proven process that delivers results — from first conversation to final launch
          </p>
        </motion.div>
        <motion.div className="process-grid" variants={containerVariants}>
          {steps.map((item, index) => (
            <motion.div
              className="process-card"
              key={index}
              variants={cardVariants}
              whileHover={{ y: -6, boxShadow: "0 12px 32px rgba(0, 0, 0, 0.25)" }}
            >
              <motion.div
                className="process-step-number"
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 + index * 0.12, ease: [0.16, 1, 0.3, 1] }}
              >
                {item.step}
              </motion.div>
              <div className="process-card-content">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Career;
