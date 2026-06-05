import { Router } from "express";
import pool from "../db/pool.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// GET /api/todos - Get todos for current user
router.get("/", authenticate, async (req, res) => {
  try {
    let query;
    let params;

    if (req.user.role === "admin") {
      // Admin sees all todos with project info
      query = `SELECT t.*, p.title as project_title, pr.full_name as client_name
               FROM todos t
               JOIN projects p ON t.project_id = p.id
               JOIN profiles pr ON t.client_id = pr.id
               ORDER BY t.created_at DESC`;
      params = [];
    } else {
      // Client sees their own todos
      query = `SELECT t.*, p.title as project_title
               FROM todos t
               JOIN projects p ON t.project_id = p.id
               WHERE t.client_id = $1
               ORDER BY t.created_at DESC`;
      params = [req.user.id];
    }

    const result = await pool.query(query, params);
    res.json({ todos: result.rows });
  } catch (error) {
    console.error("Fetch todos error:", error);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

// GET /api/todos/project/:projectId - Get todos for a specific project
router.get("/project/:projectId", authenticate, async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify access
    if (req.user.role !== "admin") {
      const access = await pool.query(
        "SELECT id FROM projects WHERE id = $1 AND client_id = $2",
        [projectId, req.user.id]
      );
      if (access.rows.length === 0) {
        return res.status(403).json({ error: "Access denied" });
      }
    }

    const result = await pool.query(
      `SELECT t.*, pr.full_name as created_by_name
       FROM todos t
       LEFT JOIN profiles pr ON t.created_by = pr.id
       WHERE t.project_id = $1
       ORDER BY t.created_at DESC`,
      [projectId]
    );

    res.json({ todos: result.rows });
  } catch (error) {
    console.error("Fetch project todos error:", error);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

// POST /api/todos - Create a new todo
router.post("/", authenticate, async (req, res) => {
  try {
    const { projectId, title, description } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ error: "Title and project ID are required" });
    }

    // Verify project access
    if (req.user.role !== "admin") {
      const access = await pool.query(
        "SELECT id, client_id FROM projects WHERE id = $1",
        [projectId]
      );
      if (access.rows.length === 0 || access.rows[0].client_id !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
    }

    // Get the client_id from the project
    const project = await pool.query("SELECT client_id FROM projects WHERE id = $1", [projectId]);
    const clientId = project.rows[0]?.client_id;

    const result = await pool.query(
      `INSERT INTO todos (project_id, client_id, title, description, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [projectId, clientId || req.user.id, title, description || "", req.user.id]
    );

    res.status(201).json({ todo: result.rows[0] });
  } catch (error) {
    console.error("Create todo error:", error);
    res.status(500).json({ error: "Failed to create todo" });
  }
});

// PUT /api/todos/:id - Update a todo
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { title, description, status } = req.body;

    const result = await pool.query(
      `UPDATE todos SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [title, description, status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json({ todo: result.rows[0] });
  } catch (error) {
    console.error("Update todo error:", error);
    res.status(500).json({ error: "Failed to update todo" });
  }
});

// PATCH /api/todos/:id/toggle - Toggle todo status
router.patch("/:id/toggle", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE todos SET
        status = CASE WHEN status = 'completed' THEN 'pending' ELSE 'completed' END,
        updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json({ todo: result.rows[0] });
  } catch (error) {
    console.error("Toggle todo error:", error);
    res.status(500).json({ error: "Failed to toggle todo" });
  }
});

// DELETE /api/todos/:id - Delete a todo
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM todos WHERE id = $1 RETURNING id",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    console.error("Delete todo error:", error);
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

export default router;
