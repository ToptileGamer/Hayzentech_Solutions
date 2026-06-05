import { Router } from "express";
import bcrypt from "bcrypt";
import pool from "../db/pool.js";
import { generateToken, authenticate } from "../middleware/auth.js";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: "Email, password, and full name are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Check if user exists
    const existing = await pool.query("SELECT id FROM profiles WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      `INSERT INTO profiles (email, password_hash, full_name, phone, role)
       VALUES ($1, $2, $3, $4, 'client')
       RETURNING id, email, full_name, phone, role, created_at`,
      [email, passwordHash, fullName, phone || null]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    res.status(201).json({
      message: "Account created successfully",
      user,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const result = await pool.query(
      "SELECT id, email, password_hash, full_name, phone, role, avatar_url FROM profiles WHERE email = $1 AND is_active = true",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken(user);

    // Don't send password hash back
    delete user.password_hash;

    res.json({
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// POST /api/auth/google
router.post("/google", async (req, res) => {
  try {
    const { email, googleId, fullName, avatarUrl } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({ error: "Google authentication data is required" });
    }

    // Check if user exists by google_id or email
    let result = await pool.query(
      "SELECT id, email, full_name, phone, role, avatar_url FROM profiles WHERE google_id = $1 OR email = $2",
      [googleId, email]
    );

    let user;

    if (result.rows.length === 0) {
      // Create new user
      result = await pool.query(
        `INSERT INTO profiles (email, google_id, full_name, avatar_url, role)
         VALUES ($1, $2, $3, $4, 'client')
         RETURNING id, email, full_name, phone, role, avatar_url`,
        [email, googleId, fullName || email.split("@")[0], avatarUrl || null]
      );
      user = result.rows[0];
    } else {
      user = result.rows[0];
      // Update google_id if it was created with email first
      if (!user.google_id) {
        await pool.query("UPDATE profiles SET google_id = $1, avatar_url = COALESCE($2, avatar_url) WHERE id = $3",
          [googleId, avatarUrl, user.id]
        );
      }
    }

    const token = generateToken(user);

    res.json({
      message: "Google login successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ error: "Google authentication failed. Please try again." });
  }
});

export default router;
