import { useEffect, useState } from "react";
import About from "./About.jsx";
import Career from "./Career.jsx";
import Contact from "./Contact.jsx";
import Landing from "./Landing.jsx";
import Navbar from "./Navbar.jsx";
import SocialIcons from "./SocialIcons.jsx";
import WhatIDo from "./WhatIDo.jsx";
import Work from "./Work.jsx";
import setSplitText from "./utils/splitText.js";

const MainContainer = () => {
  const [isDesktopView, setIsDesktopView] = useState(window.innerWidth > 1024);

  useEffect(() => {
    const resizeHandler = () => {
      setSplitText();
      setIsDesktopView(window.innerWidth > 1024);
    };
    resizeHandler();
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, []);

  return (
    <div className="container-main">
      <Navbar />
      <SocialIcons />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <div className="container-main">
            <Landing />
            <About />
            <WhatIDo />
            <Career />
            <Work />
            <Contact />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContainer;
