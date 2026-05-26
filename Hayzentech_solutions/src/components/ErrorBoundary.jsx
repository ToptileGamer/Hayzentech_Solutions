import { Component } from "react";
import { Link } from "react-router-dom";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // In production, send to monitoring service
    if (import.meta.env.DEV) {
      console.error("[ErrorBoundary]", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0e17",
          color: "#eae5ec",
          padding: "20px",
          fontFamily: "'Geist', sans-serif",
          textAlign: "center",
        }}>
          <div style={{
            fontSize: "72px",
            marginBottom: "16px",
            color: "#5eead4",
          }}>!</div>
          <h1 style={{ fontSize: "28px", fontWeight: 600, margin: "0 0 12px" }}>
            Something went wrong
          </h1>
          <p style={{ color: "rgba(234,229,236,0.6)", maxWidth: "400px", marginBottom: "32px" }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <Link
            to="/"
            style={{
              padding: "12px 28px",
              background: "#5eead4",
              color: "#0a0e17",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "15px",
            }}
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Back to Home
          </Link>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
