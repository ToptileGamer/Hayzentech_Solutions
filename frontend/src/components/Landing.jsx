import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import CharacterModel from "./Character/index.jsx";
import "./styles/Landing.css";

// ── Staggered container for children ──
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

// ── Fade up + blur entrance for each child ──
const fadeUp = {
  hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};



// ── Gentle float + rotate animation for decorative circles ──
const floatCircle = {
  animate: {
    opacity: 0.7,
    y: [0, -12, 0],
    rotate: [0, 360],
    transition: {
      opacity: { duration: 1.5, ease: "easeOut" },
      y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
      rotate: { duration: 5, repeat: Infinity, ease: "linear" },
    },
  },
};

// ── Scroll indicator animation ──
const scrollIndicatorVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 2, ease: "easeOut" },
  },
};

// ── Stats container ──
const statsContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.7 },
  },
};

const statItem = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

// ── Button tap ──
const btnTap = { scale: 0.97 };

const Landing = () => {
  return (
    <>
      <div className="landing-section" id="landingDiv">
        <CharacterModel />

        {/* ── Ambient floating glow ── */}
        <motion.div
          className="landing-circle1"
          variants={floatCircle}
          animate="animate"
          aria-hidden="true"
        />

        <div className="landing-container">
          <motion.div
            className="landing-content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div className="landing-badge" variants={fadeUp}>
              Full Stack Web & Game Development
            </motion.div>

            {/* Headline */}
            <motion.h1 className="landing-headline" variants={fadeUp}>
              Building Digital
              <br />
              Experiences That <motion.span
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                style={{ backgroundSize: "200% 200%" }}
              >
                Deliver
              </motion.span>
            </motion.h1>

            {/* Subtext */}
            <motion.p className="landing-subtext" variants={fadeUp}>
              From concept to deployment — we craft high-performance web applications,
              interactive experiences, and game solutions that help businesses grow.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div className="landing-cta-group" variants={containerVariants}>
              <motion.a
                href="#services"
                className="landing-cta-primary"
                variants={fadeUp}
                whileHover={{ y: -3, scale: 1.03, boxShadow: "0 12px 32px rgba(94, 234, 212, 0.35)" }}
                whileTap={btnTap}
              >
                Our Services
              </motion.a>
              <motion.div variants={fadeUp}>
                <motion.div
                  whileHover={{ y: -3, scale: 1.03 }}
                  whileTap={btnTap}
                  style={{ display: "inline-block", borderRadius: "10px" }}
                >
                  <Link to="/login" className="landing-cta-secondary">
                    Get Started
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="landing-stats"
              variants={statsContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.div className="landing-stat" variants={statItem}>
                <motion.h3
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1, ease: [0.16, 1, 0.3, 1] }}
                >
                  50+
                </motion.h3>
                <p>Projects Delivered</p>
              </motion.div>

              <motion.div className="landing-stat-divider" variants={statItem} />

              <motion.div className="landing-stat" variants={statItem}>
                <motion.h3
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.15, ease: [0.16, 1, 0.3, 1] }}
                >
                  100%
                </motion.h3>
                <p>Client Satisfaction</p>
              </motion.div>

              <motion.div className="landing-stat-divider" variants={statItem} />

              <motion.div className="landing-stat" variants={statItem}>
                <motion.h3
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  24/7
                </motion.h3>
                <p>Support & Delivery</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Down Indicator */}
        <motion.div
          className="scroll-down"
          variants={scrollIndicatorVariants}
          initial="hidden"
          animate="visible"
          aria-hidden="true"
        >
          <span className="scroll-down-text">Scroll</span>
          <motion.div
            className="scroll-down-line"
            animate={{ opacity: [0.3, 0.8, 0.3], scaleY: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </>
  );
};

export default Landing;
