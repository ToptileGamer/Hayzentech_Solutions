import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  MdArrowBack,
  MdLogout,
  MdMenu,
  MdClose,
  MdPeople,
  MdReceipt,
  MdDashboard,
} from "react-icons/md";
import { useAuth } from "../context/AuthContext";
import "../pages/Dashboard/Dashboard.css";
import "../pages/Admin/Admin.css";
import "../styles/responsive.css";

const AdminLayout = ({ children, title, subtitle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, profile } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="admin-page portal-layout admin-theme">
      <div
        className={`portal-sidebar-overlay ${menuOpen ? "open" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <div className="portal-mobile-bar">
        <button
          type="button"
          className="portal-menu-btn touch-target"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <MdClose /> : <MdMenu />}
        </button>
        <span className="admin-mobile-title">Admin Panel</span>
        <span className="admin-mobile-user">
          {profile?.full_name?.split(" ")[0] || "Admin"}
        </span>
      </div>

      <aside className={`admin-sidebar portal-sidebar ${menuOpen ? "open" : ""}`}>
        <div className="admin-sidebar-header">
          <h2>HTS</h2>
          <span>Admin Panel</span>
        </div>

        <nav className="admin-nav" onClick={closeMenu}>
          <Link
            to="/admin"
            className={`admin-nav-item ${
              location.pathname === "/admin" &&
              !location.search.includes("view=")
                ? "active"
                : ""
            }`}
          >
            <MdDashboard /> Dashboard
          </Link>
          <Link
            to="/admin?view=orders"
            className={`admin-nav-item ${
              location.search.includes("view=orders") ? "active" : ""
            }`}
          >
            <MdReceipt /> Orders
          </Link>
          <Link
            to="/admin?view=clients"
            className={`admin-nav-item ${
              location.search.includes("view=clients") ? "active" : ""
            }`}
          >
            <MdPeople /> Clients
          </Link>
          <Link to="/dashboard" className="admin-nav-item">
            <MdArrowBack /> Client View
          </Link>
        </nav>

        <div className="admin-sidebar-footer">
          <button type="button" className="admin-logout-btn touch-target" onClick={handleSignOut}>
            <MdLogout /> Sign Out
          </button>
        </div>
      </aside>

      <main className="admin-main portal-main">
        <header className="admin-header">
          <div>
            <h1>{title || "Admin Dashboard"}</h1>
            <p>{subtitle || "Manage projects, orders, and clients"}</p>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
