import "./styles/Career.css";

const Career = () => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          My career <span>&</span>
          <br /> experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Beginner game Developer</h4>
                <h5>Tetris & Endless runner games</h5>
              </div>
              <h3>2020</h3>
            </div>
            <p>
              Built basic gaming in Unity, learning C# and game development fundamentals. 
              Created a Tetris clone and an endless runner game, gaining hands-on experience with game mechanics, 
              physics, and user input handling. This early exploration sparked a passion for software development and problem-solving. 

            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>beginner Frontend Developer & intermediate game developer</h4>
                <h5>portfolio websites & 1 level games  </h5>
              </div>
              <h3>2022</h3>
            </div>
            <p>
              Transitioned to frontend development, building portfolio websites using HTML, CSS, and JavaScript.
              Developed responsive designs and interactive features, showcasing projects and skills. 
              This phase marked the beginning of a journey into web development, laying the foundation for future growth in the field.

            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>complete Frontend Developer & pro Game Developer</h4>
                <h5>Full Stack websites & small Indie AAA games</h5>
              </div>
              <h3>NOW</h3>
            </div>
            <p>
              Building scalable web applications using React.js, HTMl 5, CSS and javascript. Skilled in microservices architecture,
               CMS development, and low-code platforms. Passionate about creating high-performance, production-ready solutions from concept to deployment. 
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Career;
