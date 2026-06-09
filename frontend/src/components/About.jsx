import { motion } from "framer-motion";
import "./styles/About.css";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
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

const fadeUpDelayed = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
};

const cardVariants = {
  hidden: { opacity: 0, x: -20, scale: 0.97 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      delay: 0.25 + i * 0.12,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

const About = () => {
  return (
    <motion.div
      className="about-section"
      id="about"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={containerVariants}
    >
      <div className="about-container section-container">
        <motion.div className="about-header" variants={fadeUp}>
          <h3>About Us</h3>
          <motion.div
            className="about-line"
            initial={{ width: 0 }}
            whileInView={{ width: 60 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          />
        </motion.div>
        <div className="about-grid">
          <motion.div className="about-text" variants={fadeUpDelayed}>
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
          </motion.div>
          <motion.div className="about-values" variants={fadeUpDelayed}>
            {[
              { icon: "⚡", title: "Performance First", desc: "Every project is built with speed, scalability, and reliability at its core." },
              { icon: "🎨", title: "Design Driven", desc: "Clean, intuitive interfaces that users love and businesses trust." },
              { icon: "🚀", title: "End to End", desc: "From initial concept through development to deployment and support." },
            ].map((item, i) => (
              <motion.div
                className="about-value-card"
                key={item.title}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0, 0, 0, 0.25)" }}
              >
                <span className="about-value-icon">{item.icon}</span>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default About;
