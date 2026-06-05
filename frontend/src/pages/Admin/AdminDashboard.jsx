import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import api from "../../services/api";
import AdminLayout from "../../components/AdminLayout";
import {
  MdFolder,
  MdPeople,
  MdCheckCircle,
  MdSchedule,
  MdReceipt,
  MdSearch,
  MdRefresh,
  MdDelete,
} from "react-icons/md";
import "../Dashboard/Dashboard.css";
import "./Admin.css";

const ORDER_STATUSES = ["pending", "approved", "in_progress", "completed", "cancelled"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAdmin } = useAuth();
  const { addToast } = useToast();

  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectFilter, setProjectFilter] = useState("all");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [deletingOrder, setDeletingOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const activeView = searchParams.get("view") || "overview";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, projectsData, ordersData, clientsData, activityData] = await Promise.all([
        api.getAdminStats(),
        api.getProjects(),
        api.getAdminOrders(),
        api.getAdminClients(),
        api.getRecentActivity(),
      ]);
      setStats(statsData.stats);
      setProjects(projectsData.projects || []);
      setOrders(ordersData.orders || []);
      setClients(clientsData.clients || []);
      setActivity(activityData.activity || []);
    } catch (err) {
      addToast("Failed to load admin data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!deletingOrder) return;
    try {
      await api.deleteOrder(deletingOrder.id);
      // Remove the order from state
      setOrders((prev) => prev.filter((o) => o.id !== deletingOrder.id));
      // Also remove any projects linked to this order (backend deletes them)
      setProjects((prev) => prev.filter((p) => p.order_id !== deletingOrder.id));
      addToast("Order and linked project deleted successfully", "success");
    } catch (err) {
      addToast(err.message || "Failed to delete order", "error");
    } finally {
      setDeletingOrder(null);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    setUpdatingOrderId(orderId);
    try {
      await api.updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
      addToast(`Order status updated to ${status.replace("_", " ")}`, "success");
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setUpdatingOrderId(null);
    }
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
      paid: "status-completed",
      unpaid: "status-pending",
    };
    return map[status] || "status-pending";
  };

  const filteredProjects = useMemo(() => {
    let result =
      projectFilter === "all"
        ? projects
        : projects.filter((p) => p.status === projectFilter);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.client_name?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [projects, projectFilter, searchQuery]);

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase();
    return orders.filter(
      (o) =>
        o.title?.toLowerCase().includes(q) ||
        o.client_name?.toLowerCase().includes(q)
    );
  }, [orders, searchQuery]);

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const q = searchQuery.toLowerCase();
    return clients.filter(
      (c) =>
        c.full_name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
    );
  }, [clients, searchQuery]);

  const setView = (view) => {
    if (view === "overview") {
      setSearchParams({});
    } else {
      setSearchParams({ view });
    }
    setSearchQuery("");
  };

  if (loading) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner"></div>
      </div>
    );
  }

  const renderOrdersTable = (rows) => (
    <div className="responsive-table-wrap admin-table-wrapper">
      <table className="responsive-table admin-table">
        <thead>
          <tr>
            <th>Client</th>
            <th>Project</th>
            <th>Amount</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={7} className="admin-empty-row">
                {searchQuery ? "No orders match your search." : "No orders yet."}
              </td>
            </tr>
          ) : (
            rows.map((order) => (
              <tr key={order.id}>
                <td data-label="Client">{order.client_name || "Unknown"}</td>
                <td data-label="Project">{order.title}</td>
                <td data-label="Amount">
                  {order.amount_paid
                    ? `₹${Number(order.amount_paid).toLocaleString()}`
                    : "—"}
                </td>
                <td data-label="Payment">
                  <span className={`dash-status ${getStatusClass(order.payment_status)}`}>
                    {order.payment_status}
                  </span>
                </td>
                <td data-label="Status" className="actions-cell">
                  <select
                    className="inline-select"
                    value={order.status}
                    disabled={updatingOrderId === order.id}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </td>
                <td data-label="Date">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td data-label="Actions">
                  <button
                    type="button"
                    className="admin-order-delete-btn"
                    onClick={() => setDeletingOrder(order)}
                    title="Delete order"
                  >
                    <MdDelete />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <AdminLayout>
      <div className="admin-search-bar">
        <MdSearch className="admin-search-icon" />
        <input
          type="text"
          className="admin-search-input"
          placeholder={`Search ${activeView === "clients" ? "clients" : activeView === "orders" ? "orders" : "projects & orders"}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className="admin-search-clear"
            onClick={() => {
              setSearchQuery("");
            }}
          >
            ✕
          </button>
        )}
        <button
          type="button"
          className="admin-refresh-btn"
          onClick={loadData}
          title="Refresh data"
        >
          <MdRefresh />
        </button>
      </div>

      <div className="portal-view-tabs">
        {[
          { id: "overview", label: "Overview" },
          { id: "orders", label: `Orders (${orders.length})` },
          { id: "projects", label: `Projects (${projects.length})` },
          { id: "clients", label: `Clients (${clients.length})` },
        ].map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`portal-view-tab ${activeView === id ? "active" : ""}`}
            onClick={() => setView(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {(activeView === "overview" || activeView === "orders") && (
        <>
          {activeView === "overview" && stats && (
            <>
              <div className="admin-stats">
                <div className="admin-stat-card">
                  <MdFolder />
                  <div>
                    <h3>{stats.totalProjects}</h3>
                    <p>Total Projects</p>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <MdSchedule />
                  <div>
                    <h3>{stats.inProgressProjects}</h3>
                    <p>In Progress</p>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <MdCheckCircle />
                  <div>
                    <h3>{stats.completedProjects}</h3>
                    <p>Completed</p>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <MdReceipt />
                  <div>
                    <h3>{stats.pendingOrders}</h3>
                    <p>Pending Orders</p>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <MdPeople />
                  <div>
                    <h3>{stats.totalClients}</h3>
                    <p>Clients</p>
                  </div>
                </div>
                <div className="admin-stat-card revenue">
                  <div>
                    <h3>₹{Number(stats.totalRevenue).toLocaleString()}</h3>
                    <p>Total Revenue</p>
                  </div>
                </div>
              </div>

              {activity.length > 0 && (
                <section className="admin-section">
                  <div className="admin-section-header">
                    <h2>Recent Activity</h2>
                  </div>
                  <div className="admin-activity-list">
                    {activity.slice(0, 10).map((item, i) => (
                      <div key={`${item.type}-${item.id}-${i}`} className="admin-activity-item">
                        <div className={`admin-activity-dot ${item.type}`} />
                        <div className="admin-activity-content">
                          <div className="admin-activity-top">
                            <strong>
                              {item.type === "order" ? "📦 Order" : "📁 Project"}
                              : {item.title}
                            </strong>
                            <span className={`dash-status ${getStatusClass(item.status)}`}>
                              {item.status?.replace("_", " ")}
                            </span>
                          </div>
                          <div className="admin-activity-meta">
                            <span>by {item.client_name}</span>
                            <span>{new Date(item.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          <section className="admin-section">
            <div className="admin-section-header">
              <h2>{activeView === "orders" ? "All Orders" : "Recent Orders"}</h2>
            </div>
            {renderOrdersTable(
              activeView === "orders" ? filteredOrders : orders.slice(0, 10)
            )}
          </section>
        </>
      )}

      {(activeView === "overview" || activeView === "projects") && (
        <section className="admin-section">
          <div className="admin-section-header">
            <h2>All Projects</h2>
            <div className="admin-filters">
              {["all", "not_started", "in_progress", "review", "completed"].map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`admin-filter-btn ${projectFilter === f ? "active" : ""}`}
                  onClick={() => setProjectFilter(f)}
                >
                  {f.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
          {filteredProjects.length === 0 ? (
            <div className="dash-empty">
              <p>{searchQuery ? "No projects match your search." : "No projects match this filter."}</p>
            </div>
          ) : (
            <div className="admin-projects-grid">
              {filteredProjects.map((project) => (
                <Link
                  to={`/admin/projects/${project.id}`}
                  key={project.id}
                  className="admin-project-card"
                >
                  <div className="admin-project-header">
                    <h3>{project.title}</h3>
                    <span className={`dash-status ${getStatusClass(project.status)}`}>
                      {project.status?.replace("_", " ")}
                    </span>
                  </div>
                  <p className="admin-project-client">
                    Client: {project.client_name || "Unknown"}
                  </p>
                  <p className="admin-project-desc">
                    {project.description
                      ? `${project.description.slice(0, 120)}${project.description.length > 120 ? "…" : ""}`
                      : "No description"}
                  </p>
                  <div className="admin-project-footer">
                    <small>{new Date(project.created_at).toLocaleDateString()}</small>
                    <span className="admin-view-link">Manage →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {activeView === "clients" && (
        <section className="admin-section">
          <div className="admin-section-header">
            <h2>All Clients</h2>
          </div>
          <div className="admin-clients-grid">
            {filteredClients.length === 0 ? (
              <div className="dash-empty">
                <p>{searchQuery ? "No clients match your search." : "No clients registered yet."}</p>
              </div>
            ) : (
              filteredClients.map((client) => (
                <div key={client.id} className="admin-client-card">
                  <div className="admin-client-card-header">
                    <MdPeople />
                    <div>
                      <strong>{client.full_name || "Unnamed"}</strong>
                      <span>{client.email || "—"}</span>
                      {client.phone && <span>{client.phone}</span>}
                    </div>
                  </div>
                  <div className="admin-client-meta">
                    <span>{client.project_count || 0} projects</span>
                    <span>{client.order_count || 0} orders</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}
      {deletingOrder && (
        <div className="admin-modal-overlay" onClick={() => setDeletingOrder(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Order?</h3>
            <p>
              Are you sure you want to delete the order <strong>"{deletingOrder.title}"</strong>?
              This action cannot be undone.
            </p>
            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-modal-cancel"
                onClick={() => setDeletingOrder(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-modal-confirm"
                onClick={handleDeleteOrder}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
