import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { mockDB, incrementUserId } from "../db/mockdb.js";
const router = express.Router();
const jwtSecret = process.env.JWT_SECRET || "changeme-eco-track360";

// PUBLIC_INTERFACE
// POST /api/auth/register {email, password}
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });
  if (mockDB.users.find(u => u.email === email))
    return res.status(409).json({ error: "Email already registered" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: incrementUserId(),
    email,
    passwordHash,
    // Initialize empty profile and other fields
    profile: { name: "", ecoPreferences: [], avatarUrl: "" },
    goals: [],
    rewards: [],
    integrations: {},
    carbonData: [],
  };
  mockDB.users.push(user);
  const token = jwt.sign({ id: user.id, email }, jwtSecret, { expiresIn: "7d" });
  res.status(201).json({ token, user: { id: user.id, email } });
});

// PUBLIC_INTERFACE
// POST /api/auth/login {email, password}
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = mockDB.users.find(u => u.email === email);
  if (!user)
    return res.status(401).json({ error: "Invalid email or password" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok)
    return res.status(401).json({ error: "Invalid email or password" });
  const token = jwt.sign({ id: user.id, email }, jwtSecret, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, email } });
});

// PUBLIC_INTERFACE
// POST /api/auth/logout (dummy for JWT stateless)
router.post("/logout", (req, res) => {
  // No server-side session for JWT, so just succeed
  res.json({ message: "Logged out" });
});

export default router;
