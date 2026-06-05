import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  MdLogout,
  MdAdd,
  MdFolder,
  MdCheckCircle,
  MdSchedule,
  MdHome,
  MdMenu,
  MdClose,
} from "react-icons/md";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [projects, setProjects] = useState([]);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const pollingRef = useRef(null);
  const [userName] = useState(profile?.full_name || user?.email?.split("@")[0] || "Client");

  const loadData = useCallback(async (isInitial = false) => {
    try {
      const [ordersData, projectsData, todosData] = await Promise.all([
        api.getOrders(),
        api.getProjects(),
        api.getTodos(),
      ]);
      if (isInitial) setLoading(false);
      setOrders(ordersData.orders || []);
      setProjects(projectsData.projects || []);
      setTodos(todosData.todos || []);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      if (isInitial) setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Poll every 30s to reflect admin changes (deletions, status updates)
  useEffect(() => {
    pollingRef.current = setInterval(() => loadData(), 30000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [loadData]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getStatusClass = (status) => {
    const map = {
      pending: "status-pending",
      approved: "status-approved",
      in_progress: "status-progress",
      completed: "status-completed",
      cancelled: "status-cancelled",
      not_started: "status-pending",
      review: "status-review",
    };
    return map[status] || "status-pending";
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dash-loading">
          <div className="dash-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page portal-layout">
      <div
        className={`portal-sidebar-overlay ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      <div className="portal-mobile-bar dash-mobile-bar">
        <button
          type="button"
          className="portal-menu-btn touch-target"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <MdClose /> : <MdMenu />}
        </button>
        <span className="dash-mobile-title">Client Portal</span>
        <span className="dash-mobile-user">{userName}</span>
      </div>

      <aside className={`dash-sidebar portal-sidebar ${menuOpen ? "open" : ""}`}>
        <div className="dash-sidebar-header">
          <h2>HTS</h2>
          <span>Client Portal</span>
        </div>

        <nav className="dash-nav portal-nav-scroll" onClick={() => setMenuOpen(false)}>
          <Link to="/" className="dash-nav-item">
            <MdHome /> Home
          </Link>
          <Link to="/dashboard" className="dash-nav-item active">
            <MdFolder /> Dashboard
          </Link>
          <Link to="/dashboard/order" className="dash-nav-item">
            <MdAdd /> New Order
          </Link>
          {projects.slice(0, 5).map((p) => (
            <Link
              key={p.id}
              to={`/dashboard/projects/${p.id}`}
              className="dash-nav-item"
            >
              <MdFolder /> {p.title?.slice(0, 18)}
              {p.title?.length > 18 ? "…" : ""}
            </Link>
          ))}
        </nav>

        <div className="dash-sidebar-footer">
          {isAdmin && (
            <Link to="/admin" className="dash-nav-item admin-link">
              Admin Panel
            </Link>
          )}
          <button className="dash-logout-btn" onClick={handleSignOut}>
            <MdLogout /> Sign Out
          </button>
        </div>
      </aside>

      <main className="dash-main portal-main">
        <header className="dash-header">
          <div>
            <h1>Welcome back, {userName}</h1>
            <p>Here's an overview of your projects and orders</p>
          </div>
          <Link to="/dashboard/order" className="dash-new-order-btn">
            <MdAdd /> New Order
          </Link>
        </header>

        <div className="dash-stats">
          <div className="dash-stat-card">
            <MdFolder className="stat-icon" />
            <div>
              <h3>{projects.length}</h3>
              <p>Active Projects</p>
            </div>
          </div>
          <div className="dash-stat-card">
            <MdSchedule className="stat-icon" />
            <div>
              <h3>{orders.length}</h3>
              <p>Total Orders</p>
            </div>
          </div>
          <div className="dash-stat-card">
            <MdCheckCircle className="stat-icon" />
            <div>
              <h3>{orders.filter((o) => o.status === "completed").length}</h3>
              <p>Completed</p>
            </div>
          </div>
        </div>

        <section className="dash-section">
          <div className="dash-section-header">
            <h2>Recent Orders</h2>
            <Link to="/dashboard/order">Place New Order</Link>
          </div>
          {orders.length === 0 ? (
            <div className="dash-empty">
              <p>No orders yet. Place your first order!</p>
              <Link to="/dashboard/order" className="dash-empty-btn">
                Place Order
              </Link>
            </div>
          ) : (
            <div className="dash-table responsive-table-wrap">
              <table className="responsive-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id}>
                      <td data-label="Order">{order.title}</td>
                      <td data-label="Status">
                        <span className={`dash-status ${getStatusClass(order.status)}`}>
                          {order.status?.replace("_", " ")}
                        </span>
                      </td>
                      <td data-label="Payment">
                        <span className={`dash-status ${order.payment_status === "paid" ? "status-completed" : "status-pending"}`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td data-label="Date">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="dash-section">
          <div className="dash-section-header">
            <h2>Your Projects</h2>
          </div>
          {projects.length === 0 ? (
            <div className="dash-empty">
              <p>No active projects. Once you place an order and payment is confirmed, your project will appear here.</p>
            </div>
          ) : (
            <div className="dash-projects-grid">
              {projects.map((project) => (
                <Link
                  to={`/dashboard/projects/${project.id}`}
                  key={project.id}
                  className="dash-project-card"
                >
                  <div className="dash-project-header">
                    <h3>{project.title}</h3>
                    <span className={`dash-status ${getStatusClass(project.status)}`}>
                      {project.status?.replace("_", " ")}
                    </span>
                  </div>
                  <p>{project.description?.slice(0, 100)}...</p>
                  <div className="dash-project-footer">
                    <small>
                      Created: {new Date(project.created_at).toLocaleDateString()}
                    </small>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {todos.length > 0 && (
          <section className="dash-section">
            <div className="dash-section-header">
              <h2>Recent Tasks</h2>
            </div>
            <div className="project-tasks-list">
              {todos.slice(0, 5).map((todo) => (
                <div key={todo.id} className="project-task-item">
                  <div className="task-info">
                    <span className={todo.status === "completed" ? "task-done" : ""}>
                      {todo.title}
                    </span>
                    {todo.project_title && (
                      <small>Project: {todo.project_title}</small>
                    )}
                  </div>
                  <span className={`dash-status ${getStatusClass(todo.status)}`}>
                    {todo.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
