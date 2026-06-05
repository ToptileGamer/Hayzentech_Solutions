import { Router } from "express";
import pool from "../db/pool.js";
import { authenticate } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

const router = Router();

// GET /api/packages - Get all active packages
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM service_packages WHERE is_active = true ORDER BY sort_order ASC"
    );
    res.json({ packages: result.rows });
  } catch (error) {
    console.error("Fetch packages error:", error);
    res.status(500).json({ error: "Failed to fetch packages" });
  }
});

// GET /api/packages/admin - Get all packages (including inactive) - Admin only
router.get("/admin", authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM service_packages ORDER BY sort_order ASC"
    );
    res.json({ packages: result.rows });
  } catch (error) {
    console.error("Fetch admin packages error:", error);
    res.status(500).json({ error: "Failed to fetch packages" });
  }
});

// POST /api/packages - Create a new package - Admin only
router.post("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, slug, price, description, features, isPopular, sortOrder } = req.body;

    if (!name || !slug || !price) {
      return res.status(400).json({ error: "Name, slug, and price are required" });
    }

    const result = await pool.query(
      `INSERT INTO service_packages (name, slug, price, description, features, is_popular, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, slug, price, description || "", JSON.stringify(features || []), isPopular || false, sortOrder || 0]
    );

    res.status(201).json({ package: result.rows[0] });
  } catch (error) {
    console.error("Create package error:", error);
    res.status(500).json({ error: "Failed to create package" });
  }
});

// PUT /api/packages/:id - Update a package - Admin only
router.put("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, slug, price, description, features, isPopular, isActive, sortOrder } = req.body;
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE service_packages SET
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        price = COALESCE($3, price),
        description = COALESCE($4, description),
        features = COALESCE($5, features),
        is_popular = COALESCE($6, is_popular),
        is_active = COALESCE($7, is_active),
        sort_order = COALESCE($8, sort_order),
        updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [name, slug, price, description, features ? JSON.stringify(features) : null, isPopular, isActive, sortOrder, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Package not found" });
    }

    res.json({ package: result.rows[0] });
  } catch (error) {
    console.error("Update package error:", error);
    res.status(500).json({ error: "Failed to update package" });
  }
});

// DELETE /api/packages/:id - Delete a package - Admin only
router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM service_packages WHERE id = $1 RETURNING id",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Package not found" });
    }

    res.json({ message: "Package deleted successfully" });
  } catch (error) {
    console.error("Delete package error:", error);
    res.status(500).json({ error: "Failed to delete package" });
  }
});

export default router;
