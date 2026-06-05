import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HoverLinks from "./HoverLinks.jsx";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { isMobileExperience } from "./utils/initialFX.js";
import "./styles/Navbar.css";

gsap.registerPlugin(ScrollSmoother, ScrollTrigger);
export let smoother;

function resetSmoothScrollLayout() {
  const wrapper = document.getElementById("smooth-wrapper");
  const content = document.getElementById("smooth-content");
  if (wrapper) {
    wrapper.removeAttribute("style");
  }
  if (content) {
    content.removeAttribute("style");
  }
  document.body.style.overflowY = "auto";
}

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { user, profile, isAdmin } = useAuth();

  useEffect(() => {
    if (!isHome) return;

    resetSmoothScrollLayout();

    if (isMobileExperience()) {
      smoother = null;
      return;
    }

    smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.7,
      speed: 1.7,
      effects: true,
      autoResize: true,
      ignoreMobileResize: true,
    });

    smoother.scrollTop(0);
    smoother.paused(true);

    const links = document.querySelectorAll(".header ul a[data-href]");
    const handlers = [];

    links.forEach((elem) => {
      const handler = (e) => {
        if (window.innerWidth > 1024 && smoother) {
          e.preventDefault();
          const section = e.currentTarget.getAttribute("data-href");
          smoother.scrollTo(section, true, "top top");
        }
      };
      elem.addEventListener("click", handler);
      handlers.push({ elem, handler });
    });

    const onResize = () => {
      if (isMobileExperience()) {
        if (smoother) {
          smoother.revert();
          smoother = null;
          resetSmoothScrollLayout();
        }
        return;
      }
      if (smoother) {
        ScrollSmoother.refresh(true);
      }
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      handlers.forEach(({ elem, handler }) =>
        elem.removeEventListener("click", handler)
      );
      if (smoother) {
        smoother.revert();
        smoother = null;
      }
      resetSmoothScrollLayout();
    };
  }, [isHome]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleSmoothScroll = (e, href) => {
    e.preventDefault();
    if (window.innerWidth > 1024 && smoother && isHome) {
      smoother.scrollTo(href, true, "top top");
    } else if (isHome) {
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    setMenuOpen(false);
  };

  return (
    <>
      <div className="header">
        <a href="#" className="navbar-title" data-cursor="disable">
          HTS
        </a>
        <a
          href="mailto:hayzentechsolutions@gmail.com"
          className="navbar-connect"
          data-cursor="disable"
        >
          HayzenTech Solutions
        </a>

        <ul className="desktop-nav">
          <li>
            <a data-href="#about" href="#about">
              <HoverLinks text="ABOUT" />
            </a>
          </li>
          <li>
            <a data-href="#services" href="#services">
              <HoverLinks text="SERVICES" />
            </a>
          </li>
          <li>
            <a data-href="#work" href="#work">
              <HoverLinks text="WORK" />
            </a>
          </li>
          <li>
            <a data-href="#contact" href="#contact">
              <HoverLinks text="CONTACT" />
            </a>
          </li>
          {!user ? (
            <li>
              <Link to="/login" className="navbar-contact-btn" data-cursor="disable">
                GET STARTED
              </Link>
            </li>
          ) : (
            <>
              <li>
                <Link to="/dashboard" className="navbar-contact-btn" data-cursor="disable">
                  DASHBOARD
                </Link>
              </li>
              {isAdmin && (
                <li>
                  <Link to="/admin" className="navbar-auth-link admin" data-cursor="disable">
                    ADMIN
                  </Link>
                </li>
              )}
            </>
          )}
        </ul>

        <button
          type="button"
          className={`hamburger-btn ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          data-cursor="disable"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div className={`mobile-nav-overlay ${menuOpen ? "open" : ""}`}>
        <ul>
          <li>
            <a
              href="#about"
              onClick={(e) => {
                handleSmoothScroll(e, "#about");
                if (!isHome) setMenuOpen(false);
              }}
            >
              ABOUT
            </a>
          </li>
          <li>
            <a
              href="#services"
              onClick={(e) => {
                handleSmoothScroll(e, "#services");
                if (!isHome) setMenuOpen(false);
              }}
            >
              SERVICES
            </a>
          </li>
          <li>
            <a
              href="#work"
              onClick={(e) => {
                handleSmoothScroll(e, "#work");
                if (!isHome) setMenuOpen(false);
              }}
            >
              WORK
            </a>
          </li>
          <li>
            <a
              href="#contact"
              onClick={(e) => {
                handleSmoothScroll(e, "#contact");
                if (!isHome) setMenuOpen(false);
              }}
            >
              CONTACT
            </a>
          </li>
          {!user && (
            <li>
              <Link
                to="/login"
                className="navbar-contact-btn"
                onClick={() => setMenuOpen(false)}
              >
                GET STARTED
              </Link>
            </li>
          )}
          {user ? (
            <>
              <li>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
                  DASHBOARD
                </Link>
              </li>
              {isAdmin && (
                <li>
                  <Link to="/admin" onClick={() => setMenuOpen(false)}>
                    ADMIN
                  </Link>
                </li>
              )}
            </>
          ) : (
            <li>
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                LOGIN
              </Link>
            </li>
          )}
        </ul>
      </div>

      <div className="landing-circle1"></div>
      <div className="landing-circle2"></div>
      <div className="nav-fade"></div>
    </>
  );
};

export default Navbar;
