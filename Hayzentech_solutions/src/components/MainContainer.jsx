import { lazy, Suspense, useEffect, useState } from "react";
import About from "./About.jsx";
import Career from "./Career.jsx";
import Contact from "./Contact.jsx";
import Cursor from "./Cursor.jsx";
import Landing from "./Landing.jsx";
import Navbar from "./Navbar.jsx";
import SocialIcons from "./SocialIcons.jsx";
import WhatIDo from "./WhatIDo.jsx";
import Work from "./Work.jsx";
import setSplitText from "./utils/splitText.js";

const TechStack = lazy(() => import("./TechStack.jsx"));

const MainContainer = ({ children }) => {
  const [isDesktopView, setIsDesktopView] = useState(
    window.innerWidth > 1024
  );

  useEffect(() => {
    const resizeHandler = () => {
      setSplitText();
      setIsDesktopView(window.innerWidth > 1024);
    };
    resizeHandler();
    window.addEventListener("resize", resizeHandler);
    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  }, [isDesktopView]);

  return (
    <div className="container-main">
      <Cursor />
      <Navbar />
      <SocialIcons />
      {isDesktopView && children}
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <div className="container-main">
            <Landing>{!isDesktopView && children}</Landing>
            <About />
            <WhatIDo />
            <Career />
            <Work />
            {isDesktopView && (
              <Suspense fallback={<div>Loading....</div>}>
                <TechStack />
              </Suspense>
            )}
            <Contact />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContainer;
