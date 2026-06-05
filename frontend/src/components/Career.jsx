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

const Career = () => {
  return (
    <div className="process-section section-container" id="process">
      <div className="process-container">
        <div className="process-header">
          <h2>
            How We <span>Work</span>
          </h2>
          <p className="process-subtitle">
            A proven process that delivers results — from first conversation to final launch
          </p>
        </div>
        <div className="process-grid">
          {steps.map((item, index) => (
            <div className="process-card" key={index}>
              <div className="process-step-number">{item.step}</div>
              <div className="process-card-content">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Career;
