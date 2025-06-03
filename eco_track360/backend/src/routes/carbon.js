import express from "express";
import { mockDB } from "../db/mockdb.js";
const router = express.Router();

// PUBLIC_INTERFACE
// GET /api/carbon - get all carbon data for this user
router.get("/", (req, res) => {
  const user = mockDB.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  // Array of { category, amount, details, timespan }
  res.json(user.carbonData || []);
});

// PUBLIC_INTERFACE
// POST /api/carbon - create new carbon record
router.post("/", (req, res) => {
  const user = mockDB.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  const { category, amount, details, timespan } = req.body;
  if (!category || typeof amount !== "number") return res.status(400).json({ error: "Missing data" });
  const entry = { id: Date.now(), category, amount, details, timespan };
  user.carbonData = user.carbonData || [];
  user.carbonData.push(entry);
  res.status(201).json(entry);
});

// PUBLIC_INTERFACE
// DELETE /api/carbon/:id - remove a record
router.delete("/:id", (req, res) => {
  const user = mockDB.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  user.carbonData = user.carbonData || [];
  user.carbonData = user.carbonData.filter(e => e.id != req.params.id);
  res.json({ success: true });
});

export default router;
