import express from "express";
import { mockDB } from "../db/mockdb.js";
const router = express.Router();

// PUBLIC_INTERFACE
// GET /api/profile
router.get("/", (req, res) => {
  const user = mockDB.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user.profile);
});

// PUBLIC_INTERFACE
// PUT /api/profile
router.put("/", (req, res) => {
  const user = mockDB.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  // Accept name, ecoPreferences, avatarUrl fields
  const { name, ecoPreferences, avatarUrl } = req.body;
  if (typeof name === "string") user.profile.name = name;
  if (Array.isArray(ecoPreferences)) user.profile.ecoPreferences = ecoPreferences;
  if (typeof avatarUrl === "string") user.profile.avatarUrl = avatarUrl;
  res.json(user.profile);
});

export default router;
