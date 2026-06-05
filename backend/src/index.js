import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from "./routes/auth.js";
import packageRoutes from "./routes/packages.js";
import orderRoutes from "./routes/orders.js";
import projectRoutes from "./routes/projects.js";
import todoRoutes from "./routes/todos.js";
import paymentRoutes from "./routes/payments.js";
import adminRoutes from "./routes/admin.js";

// Import middleware
import { authenticate } from "./middleware/auth.js";

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== "production") {
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    }
  });
  next();
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

// Protected user profile route
app.get("/api/auth/me", authenticate, async (req, res) => {
  const { default: pool } = await import("./db/pool.js");
  try {
    const result = await pool.query(
      "SELECT id, email, full_name, phone, role, avatar_url, created_at FROM profiles WHERE id = $1",
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));

  // SPA fallback
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
  });
}

// Catch unhandled promise rejections (prevent crashes from Razorpay API failures, etc.)
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    ...(process.env.NODE_ENV !== "production" && { details: err.message }),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║     HayzenTech Solutions Backend         ║
║━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━║
║  Server:   http://localhost:${PORT}        ║
║  Health:   http://localhost:${PORT}/api/health ║
║  Environment: ${process.env.NODE_ENV || "development"}            ║
╚══════════════════════════════════════════╝
  `);
});

export default app;
