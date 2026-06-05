import { Router } from "express";
import pool from "../db/pool.js";
import { authenticate } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// GET /api/admin/stats - Get dashboard stats
router.get("/stats", async (req, res) => {
  try {
    const [projectsRes, ordersRes, clientsRes, revenueRes] = await Promise.all([
      pool.query("SELECT COUNT(*)::int as total, COUNT(*) FILTER (WHERE status = 'in_progress')::int as in_progress, COUNT(*) FILTER (WHERE status = 'completed')::int as completed FROM projects"),
      pool.query("SELECT COUNT(*)::int as total, COUNT(*) FILTER (WHERE status = 'pending')::int as pending FROM orders"),
      pool.query("SELECT COUNT(*)::int as total FROM profiles WHERE role = 'client'"),
      pool.query("SELECT COALESCE(SUM(amount_paid), 0)::float as total FROM orders WHERE payment_status = 'paid'"),
    ]);

    res.json({
      stats: {
        totalProjects: projectsRes.rows[0].total,
        inProgressProjects: projectsRes.rows[0].in_progress,
        completedProjects: projectsRes.rows[0].completed,
        pendingOrders: ordersRes.rows[0].pending,
        totalOrders: ordersRes.rows[0].total,
        totalClients: clientsRes.rows[0].total,
        totalRevenue: revenueRes.rows[0].total,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// GET /api/admin/clients - Get all clients
router.get("/clients", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.full_name, p.email, p.phone, p.role, p.created_at,
              (SELECT COUNT(*)::int FROM projects WHERE client_id = p.id) as project_count,
              (SELECT COUNT(*)::int FROM orders WHERE client_id = p.id) as order_count
       FROM profiles p
       WHERE p.role = 'client'
       ORDER BY p.created_at DESC`
    );
    res.json({ clients: result.rows });
  } catch (error) {
    console.error("Admin clients error:", error);
    res.status(500).json({ error: "Failed to fetch clients" });
  }
});

// GET /api/admin/orders - Get all orders with client info
router.get("/orders", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, pr.full_name as client_name, pr.email as client_email,
              sp.name as package_name
       FROM orders o
       JOIN profiles pr ON o.client_id = pr.id
       LEFT JOIN service_packages sp ON o.package_id = sp.id
       ORDER BY o.created_at DESC`
    );
    res.json({ orders: result.rows });
  } catch (error) {
    console.error("Admin orders error:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// PUT /api/admin/orders/:id/status - Update order status
router.put("/orders/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "approved", "in_progress", "completed", "cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const result = await pool.query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ order: result.rows[0] });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// POST /api/admin/projects - Create a project manually (admin)
router.post("/projects", async (req, res) => {
  try {
    const { clientId, title, description, status } = req.body;

    if (!clientId || !title) {
      return res.status(400).json({ error: "Client ID and title are required" });
    }

    const result = await pool.query(
      `INSERT INTO projects (client_id, title, description, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [clientId, title, description || "", status || "not_started"]
    );

    res.status(201).json({ project: result.rows[0] });
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// POST /api/admin/messages - Send a message as admin
router.post("/messages", async (req, res) => {
  try {
    const { projectId, content } = req.body;

    if (!projectId || !content) {
      return res.status(400).json({ error: "Project ID and content are required" });
    }

    const result = await pool.query(
      `INSERT INTO messages (project_id, sender_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [projectId, req.user.id, content]
    );

    // Get the full message with sender info
    const message = await pool.query(
      `SELECT m.*, pr.full_name as sender_name, pr.role as sender_role
       FROM messages m
       JOIN profiles pr ON m.sender_id = pr.id
       WHERE m.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json({ message: message.rows[0] });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// DELETE /api/admin/orders/:id - Delete an order and its linked projects
router.delete("/orders/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Find projects linked to this order
    const linkedProjects = await client.query(
      `SELECT id FROM projects WHERE order_id = $1`,
      [req.params.id]
    );

    // Delete messages, todos, and projects linked to this order
    for (const project of linkedProjects.rows) {
      await client.query(`DELETE FROM messages WHERE project_id = $1`, [project.id]);
      await client.query(`DELETE FROM todos WHERE project_id = $1`, [project.id]);
      await client.query(`DELETE FROM projects WHERE id = $1`, [project.id]);
    }

    // Delete the order itself
    const result = await client.query(
      `DELETE FROM orders WHERE id = $1 RETURNING *`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Order not found" });
    }

    await client.query("COMMIT");
    res.json({ message: "Order deleted successfully", order: result.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Delete order error:", error);
    res.status(500).json({ error: "Failed to delete order" });
  } finally {
    client.release();
  }
});

// GET /api/admin/recent-activity - Get recent activity feed
router.get("/recent-activity", async (req, res) => {
  try {
    const [orders, projects] = await Promise.all([
      pool.query(
        `SELECT o.id, o.title, o.status, o.created_at as date, 'order' as type,
                pr.full_name as client_name
         FROM orders o
         JOIN profiles pr ON o.client_id = pr.id
         ORDER BY o.created_at DESC LIMIT 10`
      ),
      pool.query(
        `SELECT p.id, p.title, p.status, p.created_at as date, 'project' as type,
                pr.full_name as client_name
         FROM projects p
         JOIN profiles pr ON p.client_id = pr.id
         ORDER BY p.created_at DESC LIMIT 10`
      ),
    ]);

    const activity = [...orders.rows, ...projects.rows]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 15);

    res.json({ activity });
  } catch (error) {
    console.error("Recent activity error:", error);
    res.status(500).json({ error: "Failed to fetch recent activity" });
  }
});

export default router;
