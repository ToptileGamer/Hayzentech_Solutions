import { Link, useNavigate } from "react-router-dom";
import { MdArrowBack, MdHome } from "react-icons/md";
import "./NotFound.css";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-code">404</div>
        <h1 className="not-found-title">Page Not Found</h1>
        <p className="not-found-desc">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="not-found-actions">
          <button
            className="not-found-btn secondary"
            onClick={() => navigate(-1)}
          >
            <MdArrowBack /> Go Back
          </button>
          <Link to="/" className="not-found-btn primary">
            <MdHome /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
