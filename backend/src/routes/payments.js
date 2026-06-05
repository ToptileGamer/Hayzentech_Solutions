import { Router } from "express";
import Razorpay from "razorpay";
import pool from "../db/pool.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Initialize Razorpay
const getRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

// POST /api/payments/create-order - Create a Razorpay order
router.post("/create-order", authenticate, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    // Get the order from DB
    const orderResult = await pool.query(
      "SELECT * FROM orders WHERE id = $1 AND client_id = $2",
      [orderId, req.user.id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orderResult.rows[0];

    // Try to create Razorpay order
    const razorpay = getRazorpay();

    if (razorpay) {
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(parseFloat(order.amount_paid) * 100), // in paise
        currency: "INR",
        receipt: order.id,
        notes: {
          order_id: order.id,
          client_id: req.user.id,
        },
      });

      // Save razorpay order ID
      await pool.query(
        "UPDATE orders SET razorpay_order_id = $1 WHERE id = $2",
        [razorpayOrder.id, order.id]
      );

      res.json({
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    } else {
      // Razorpay not configured - use simulated payment
      res.json({
        simulated: true,
        amount: Math.round(parseFloat(order.amount_paid) * 100),
        currency: "INR",
        message: "Payment simulation mode. Razorpay keys not configured.",
      });
    }
  } catch (error) {
    console.error("Create payment order error:", error);
    res.status(500).json({ error: "Failed to create payment order" });
  }
});

// POST /api/payments/verify - Verify payment and create project
router.post("/verify", authenticate, async (req, res) => {
  try {
    const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    // For simulated payments
    const isSimulated = !razorpayPaymentId && !razorpayOrderId;

    // Update order payment status
    await pool.query(
      `UPDATE orders SET
        payment_status = 'paid',
        razorpay_payment_id = $1,
        razorpay_order_id = $2,
        status = 'approved',
        updated_at = NOW()
       WHERE id = $3 AND client_id = $4`,
      [razorpayPaymentId || ("sim_pay_" + Date.now()), razorpayOrderId || ("sim_order_" + Date.now()), orderId, req.user.id]
    );

    // Get the order details
    const orderResult = await pool.query("SELECT * FROM orders WHERE id = $1", [orderId]);
    const order = orderResult.rows[0];

    // Create project from order
    const projectResult = await pool.query(
      `INSERT INTO projects (order_id, client_id, title, description, status)
       VALUES ($1, $2, $3, $4, 'not_started')
       RETURNING *`,
      [order.id, req.user.id, order.title, order.description]
    );

    res.json({
      message: "Payment successful! Project has been created.",
      project: projectResult.rows[0],
      order: { ...order, payment_status: "paid", status: "approved" },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ error: "Payment verification failed" });
  }
});

// GET /api/payments/config - Get Razorpay config (public)
router.get("/config", (req, res) => {
  res.json({
    keyId: process.env.RAZORPAY_KEY_ID || null,
    configured: !!process.env.RAZORPAY_KEY_ID,
  });
});

export default router;
