import { useEffect, useState, useMemo, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../supabase/client";
import { useToast } from "../../context/ToastContext";
import AdminLayout from "../../components/AdminLayout";
import {
  MdFolder,
  MdPeople,
  MdCheckCircle,
  MdSchedule,
  MdReceipt,
  MdOpenInNew,
  MdSearch,
  MdDownload,
  MdTimeline,
  MdRefresh,
} from "react-icons/md";
import logger from "../../utils/logger";
import "../Dashboard/Dashboard.css";
import "./Admin.css";

const ORDER_STATUSES = ["pending", "approved", "in_progress", "completed", "cancelled"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAdmin } = useAuth();
  const { addToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectFilter, setProjectFilter] = useState("all");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);

  const activeView = searchParams.get("view") || "overview";

  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard");
      return;
    }
    fetchAllData();
  }, [isAdmin, navigate]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const { data: projectsData } = await supabase
        .from("projects")
        .select("*, profiles(full_name, email)")
        .order("created_at", { ascending: false });

      if (projectsData) setProjects(projectsData);

      const { data: ordersData } = await supabase
        .from("orders")
        .select("*, profiles(full_name, email)")
        .order("created_at", { ascending: false });

      if (ordersData) setOrders(ordersData);

      const { data: clientsData } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "client")
        .order("created_at", { ascending: false });

      if (clientsData) setClients(clientsData);
    } catch (err) {
      logger.error("AdminDashboard", err);
      addToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  const setView = (view) => {
    if (view === "overview") {
      setSearchParams({});
    } else {
      setSearchParams({ view });
    }
    setSearchQuery("");
  };

  const updateOrderStatus = async (orderId, status) => {
    setUpdatingOrderId(orderId);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (error) throw error;
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
      addToast(`Order status updated to ${status.replace("_", " ")}`, "success");
    } catch (err) {
      logger.error("AdminDashboard.updateOrder", err);
      addToast("Failed to update order: " + err.message, "error");
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
          p.profiles?.full_name?.toLowerCase().includes(q)
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
        o.profiles?.full_name?.toLowerCase().includes(q)
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

  // Recent activity: merge recent orders and projects
  const recentActivity = useMemo(() => {
    const items = [];
    orders.slice(0, 5).forEach((o) =>
      items.push({
        id: o.id,
        type: "order",
        title: o.title,
        status: o.status,
        client: o.profiles?.full_name || "Unknown",
        date: o.created_at,
      })
    );
    projects.slice(0, 5).forEach((p) =>
      items.push({
        id: p.id,
        type: "project",
        title: p.title,
        status: p.status,
        client: p.profiles?.full_name || "Unknown",
        date: p.created_at,
      })
    );
    items.sort((a, b) => new Date(b.date) - new Date(a.date));
    return items.slice(0, 8);
  }, [orders, projects]);

  // CSV Export
  const exportCSV = (type) => {
    let rows, headers, filename;
    const toCSV = (data, cols) => {
      const header = cols.map((c) => `"${c.label}"`).join(",");
      const body = data
        .map((row) =>
          cols.map((c) => `"${String(c.getValue(row)).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");
      return `${header}\n${body}`;
    };

    if (type === "orders") {
      headers = [
        { label: "Client", getValue: (r) => r.profiles?.full_name || "Unknown" },
        { label: "Title", getValue: (r) => r.title },
        { label: "Status", getValue: (r) => r.status },
        { label: "Payment", getValue: (r) => r.payment_status },
        { label: "Amount", getValue: (r) => r.amount_paid || 0 },
        { label: "Date", getValue: (r) => new Date(r.created_at).toLocaleDateString() },
      ];
      rows = orders;
      filename = "orders-export.csv";
    } else if (type === "clients") {
      headers = [
        { label: "Name", getValue: (r) => r.full_name || "Unnamed" },
        { label: "Email", getValue: (r) => r.email || "" },
        { label: "Phone", getValue: (r) => r.phone || "" },
        { label: "Projects", getValue: (r) => projects.filter((p) => p.client_id === r.id).length },
        { label: "Joined", getValue: (r) => new Date(r.created_at).toLocaleDateString() },
      ];
      rows = clients;
      filename = "clients-export.csv";
    } else {
      return;
    }

    const csv = toCSV(rows, headers);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    addToast(`${type === "orders" ? "Orders" : "Clients"} exported as CSV`, "success");
  };

  const stats = {
    total: projects.length,
    inProgress: projects.filter((p) => p.status === "in_progress").length,
    completed: projects.filter((p) => p.status === "completed").length,
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    totalClients: clients.length,
    totalRevenue: orders
      .filter((o) => o.payment_status === "paid")
      .reduce((sum, o) => sum + (Number(o.amount_paid) || 0), 0),
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
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="admin-empty-row">
                {searchQuery ? "No orders match your search." : "No orders yet."}
              </td>
            </tr>
          ) : (
            rows.map((order) => (
              <tr key={order.id}>
                <td data-label="Client">
                  {order.profiles?.full_name || "Unknown"}
                </td>
                <td data-label="Project">{order.title}</td>
                <td data-label="Amount">
                  {order.amount_paid
                    ? `₹${Number(order.amount_paid).toLocaleString()}`
                    : "—"}
                </td>
                <td data-label="Payment">
                  <span
                    className={`dash-status ${getStatusClass(
                      order.payment_status
                    )}`}
                  >
                    {order.payment_status}
                  </span>
                </td>
                <td data-label="Status" className="actions-cell">
                  <select
                    className="inline-select"
                    value={order.status}
                    disabled={updatingOrderId === order.id}
                    onChange={(e) =>
                      updateOrderStatus(order.id, e.target.value)
                    }
                    aria-label={`Update status for ${order.title}`}
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
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <AdminLayout>
      {/* Search bar */}
      <div className="admin-search-bar">
        <MdSearch className="admin-search-icon" />
        <input
          ref={searchInputRef}
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
              searchInputRef.current?.focus();
            }}
          >
            ✕
          </button>
        )}
        <button
          type="button"
          className="admin-refresh-btn"
          onClick={fetchAllData}
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
          {activeView === "overview" && (
            <>
              <div className="admin-stats">
                <div className="admin-stat-card">
                  <MdFolder />
                  <div>
                    <h3>{stats.total}</h3>
                    <p>Total Projects</p>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <MdSchedule />
                  <div>
                    <h3>{stats.inProgress}</h3>
                    <p>In Progress</p>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <MdCheckCircle />
                  <div>
                    <h3>{stats.completed}</h3>
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
                    <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
                    <p>Total Revenue</p>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <section className="admin-section">
                <div className="admin-section-header">
                  <h2>
                    <MdTimeline style={{ marginRight: 8, verticalAlign: "middle" }} />
                    Recent Activity
                  </h2>
                </div>
                <div className="admin-activity-list">
                  {recentActivity.length === 0 ? (
                    <div className="dash-empty">
                      <p>No recent activity.</p>
                    </div>
                  ) : (
                    recentActivity.map((item) => (
                      <div key={`${item.type}-${item.id}`} className="admin-activity-item">
                        <div className={`admin-activity-dot ${item.type}`} />
                        <div className="admin-activity-content">
                          <div className="admin-activity-top">
                            <strong>
                              {item.type === "order" ? "📦 Order" : "📁 Project"}
                              : {item.title}
                            </strong>
                            <span className={`dash-status ${getStatusClass(item.status)}`}>
                              {item.status.replace("_", " ")}
                            </span>
                          </div>
                          <div className="admin-activity-meta">
                            <span>by {item.client}</span>
                            <span>{new Date(item.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </>
          )}

          <section className="admin-section">
            <div className="admin-section-header">
              <h2>{activeView === "orders" ? "All Orders" : "Recent Orders"}</h2>
              {activeView === "orders" && orders.length > 0 && (
                <button
                  type="button"
                  className="admin-export-btn"
                  onClick={() => exportCSV("orders")}
                >
                  <MdDownload /> Export CSV
                </button>
              )}
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
              {["all", "not_started", "in_progress", "review", "completed"].map(
                (f) => (
                  <button
                    key={f}
                    type="button"
                    className={`admin-filter-btn ${
                      projectFilter === f ? "active" : ""
                    }`}
                    onClick={() => setProjectFilter(f)}
                  >
                    {f.replace("_", " ")}
                  </button>
                )
              )}
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
                    <span
                      className={`dash-status ${getStatusClass(
                        project.status
                      )}`}
                    >
                      {project.status?.replace("_", " ")}
                    </span>
                  </div>
                  <p className="admin-project-client">
                    Client: {project.profiles?.full_name || "Unknown"}
                  </p>
                  <p className="admin-project-desc">
                    {project.description
                      ? `${project.description.slice(0, 120)}${project.description.length > 120 ? "…" : ""}`
                      : "No description"}
                  </p>
                  <div className="admin-project-footer">
                    <small>
                      {new Date(project.created_at).toLocaleDateString()}
                    </small>
                    <span className="admin-view-link">
                      Manage <MdOpenInNew />
                    </span>
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
            {clients.length > 0 && (
              <button
                type="button"
                className="admin-export-btn"
                onClick={() => exportCSV("clients")}
              >
                <MdDownload /> Export CSV
              </button>
            )}
          </div>
          <div className="admin-clients-grid">
            {filteredClients.length === 0 ? (
              <div className="dash-empty">
                <p>{searchQuery ? "No clients match your search." : "No clients registered yet."}</p>
              </div>
            ) : (
              filteredClients.map((client) => {
                const clientProjects = projects.filter(
                  (p) => p.client_id === client.id
                );
                const clientOrders = orders.filter(
                  (o) => o.client_id === client.id
                );
                return (
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
                      <span>{clientProjects.length} projects</span>
                      <span>{clientOrders.length} orders</span>
                    </div>
                    {clientProjects.length > 0 && (
                      <div className="admin-client-projects">
                        {clientProjects.slice(0, 3).map((p) => (
                          <Link
                            key={p.id}
                            to={`/admin/projects/${p.id}`}
                            className="admin-client-project-link"
                          >
                            {p.title} →
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
