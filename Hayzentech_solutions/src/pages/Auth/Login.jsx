import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MdArrowBack, MdEmail, MdLock, MdPerson, MdPhone } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      // Browser will redirect to Google OAuth
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        const data = await signUp(email, password, fullName, phone);
        // If user session exists immediately (auto-confirm enabled), go to dashboard
        if (data?.user?.aud === "authenticated") {
          navigate("/dashboard");
        } else {
          // Email confirmation required
          setSignupSuccess(true);
        }
      } else {
        const signInResult = await signIn(email, password);
        const destination =
          signInResult?.profile?.role === "admin" ? "/admin" : "/dashboard";
        navigate(destination);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <button className="auth-back-btn" onClick={() => navigate("/")}>
        <MdArrowBack /> Home
      </button>

      <div className="auth-container">
        {signupSuccess ? (
          <div className="auth-success">
            <div className="auth-success-icon">✓</div>
            <h2>Account Created!</h2>
            <p>
              We've sent a confirmation link to <strong>{email}</strong>.
              Please check your email and click the link to verify your account.
            </p>
            <button
              className="auth-submit-btn"
              onClick={() => {
                setSignupSuccess(false);
                setIsSignUp(false);
              }}
            >
              Go to Sign In
            </button>
          </div>
        ) : (
          <>
        <div className="auth-header">
          <h1>{isSignUp ? "Create Account" : "Welcome Back"}</h1>
          <p>
            {isSignUp
              ? "Sign up to place orders and manage your projects"
              : "Sign in to your account to continue"}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          {isSignUp && (
            <>
              <div className="auth-input-group">
                <MdPerson className="auth-input-icon" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="auth-input-group">
                <MdPhone className="auth-input-icon" />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div className="auth-input-group">
            <MdEmail className="auth-input-icon" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-input-group">
            <MdLock className="auth-input-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : isSignUp
              ? "Create Account"
              : "Sign In"}
          </button>
        </form>

        <div className="auth-toggle">
          <p>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              className="auth-toggle-btn"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button
          type="button"
          className="auth-google-btn"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <FcGoogle className="auth-google-icon" />
          Continue with Google
        </button>

        <div className="auth-contact-link">
          <p>
            Just want to say hi?{" "}
            <Link to="/contact">Contact me here</Link>
          </p>
        </div>
      </>
      )}
      </div>
    </div>
  );
};

export default Login;
