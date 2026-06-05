import { Router } from "express";
import pool from "../db/pool.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// GET /api/orders - Get orders for current user
router.get("/", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, sp.name as package_name, sp.price as package_price
       FROM orders o
       LEFT JOIN service_packages sp ON o.package_id = sp.id
       WHERE o.client_id = $1
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json({ orders: result.rows });
  } catch (error) {
    console.error("Fetch orders error:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET /api/orders/:id - Get a single order
router.get("/:id", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, sp.name as package_name, sp.features as package_features
       FROM orders o
       LEFT JOIN service_packages sp ON o.package_id = sp.id
       WHERE o.id = $1 AND o.client_id = $2`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ order: result.rows[0] });
  } catch (error) {
    console.error("Fetch order error:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// POST /api/orders - Create a new order
router.post("/", authenticate, async (req, res) => {
  try {
    const { packageId, title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Project title is required" });
    }

    // Get package price
    let price = 0;
    if (packageId) {
      const pkgResult = await pool.query(
        "SELECT price FROM service_packages WHERE id = $1 AND is_active = true",
        [packageId]
      );
      if (pkgResult.rows.length > 0) {
        price = parseFloat(pkgResult.rows[0].price);
      }
    }

    // Create order
    const result = await pool.query(
      `INSERT INTO orders (client_id, package_id, title, description, amount_paid)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, packageId || null, title, description || "", price]
    );

    res.status(201).json({ order: result.rows[0] });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

export default router;
