import { Router } from "express";
import pool from "../db/pool.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// POST /api/projects/:id/messages - Send a message (clients & admins)
router.post("/:id/messages", authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    const { id } = req.params;

    if (!content) {
      return res.status(400).json({ error: "Message content is required" });
    }

    // Verify project access
    if (req.user.role !== "admin") {
      const access = await pool.query(
        "SELECT id FROM projects WHERE id = $1 AND client_id = $2",
        [id, req.user.id]
      );
      if (access.rows.length === 0) {
        return res.status(403).json({ error: "Access denied" });
      }
    }

    const result = await pool.query(
      `INSERT INTO messages (project_id, sender_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, req.user.id, content]
    );

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



// GET /api/projects - Get projects for current user
router.get("/", authenticate, async (req, res) => {
  try {
    let query;
    let params;

    if (req.user.role === "admin") {
      // Admin sees all projects with client info
      query = `SELECT p.*, pr.full_name as client_name, pr.email as client_email
               FROM projects p
               JOIN profiles pr ON p.client_id = pr.id
               ORDER BY p.created_at DESC`;
      params = [];
    } else {
      // Client sees only their projects
      query = `SELECT p.*, sp.name as package_name
               FROM projects p
               LEFT JOIN orders o ON p.order_id = o.id
               LEFT JOIN service_packages sp ON o.package_id = sp.id
               WHERE p.client_id = $1
               ORDER BY p.created_at DESC`;
      params = [req.user.id];
    }

    const result = await pool.query(query, params);
    res.json({ projects: result.rows });
  } catch (error) {
    console.error("Fetch projects error:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// GET /api/projects/:id - Get a single project
router.get("/:id", authenticate, async (req, res) => {
  try {
    let query;
    let params;

    if (req.user.role === "admin") {
      query = `SELECT p.*, pr.full_name as client_name, pr.email as client_email, pr.phone as client_phone
               FROM projects p
               JOIN profiles pr ON p.client_id = pr.id
               WHERE p.id = $1`;
      params = [req.params.id];
    } else {
      query = `SELECT p.* FROM projects p WHERE p.id = $1 AND p.client_id = $2`;
      params = [req.params.id, req.user.id];
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    const project = result.rows[0];

    // Get todos for this project
    const todos = await pool.query(
      `SELECT * FROM todos WHERE project_id = $1 ORDER BY created_at DESC`,
      [project.id]
    );

    // Get messages for this project
    const messages = await pool.query(
      `SELECT m.*, pr.full_name as sender_name, pr.role as sender_role
       FROM messages m
       JOIN profiles pr ON m.sender_id = pr.id
       WHERE m.project_id = $1
       ORDER BY m.created_at ASC`,
      [project.id]
    );

    res.json({
      project,
      todos: todos.rows,
      messages: messages.rows,
    });
  } catch (error) {
    console.error("Fetch project error:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

// PUT /api/projects/:id/status - Update project status
router.put("/:id/status", authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["not_started", "in_progress", "review", "completed"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Only admin can update project status
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can update project status" });
    }

    const result = await pool.query(
      `UPDATE projects SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ project: result.rows[0] });
  } catch (error) {
    console.error("Update project status error:", error);
    res.status(500).json({ error: "Failed to update project status" });
  }
});

export default router;
