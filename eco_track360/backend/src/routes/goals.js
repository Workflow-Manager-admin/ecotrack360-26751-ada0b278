import express from "express";
import { mockDB } from "../db/mockdb.js";
const router = express.Router();

// PUBLIC_INTERFACE
// GET /api/goals
router.get("/", (req, res) => {
  const user = mockDB.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user.goals);
});

// PUBLIC_INTERFACE
// POST /api/goals
router.post("/", (req, res) => {
  const user = mockDB.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  // Accept title, target, icon fields (logic matches frontend)
  const { title, target, icon } = req.body;
  if (!title || !target) return res.status(400).json({ error: "Title and target required" });
  const newGoal = { id: Date.now(), title, target, icon: icon || "", progress: 0, status: "Active" };
  user.goals.push(newGoal);
  res.status(201).json(newGoal);
});

// PUBLIC_INTERFACE
// PUT /api/goals/:id
router.put("/:id", (req, res) => {
  const user = mockDB.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  const goal = user.goals.find(g => g.id == req.params.id);
  if (!goal) return res.status(404).json({ error: "Goal not found" });
  const { title, target, icon, progress, status } = req.body;
  if (typeof title === "string") goal.title = title;
  if (typeof target === "string") goal.target = target;
  if (typeof icon === "string") goal.icon = icon;
  if (typeof progress === "number") goal.progress = progress;
  if (typeof status === "string") goal.status = status;
  res.json(goal);
});

// PUBLIC_INTERFACE
// DELETE /api/goals/:id
router.delete("/:id", (req, res) => {
  const user = mockDB.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  const idx = user.goals.findIndex(g => g.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Goal not found" });
  user.goals.splice(idx, 1);
  res.json({ success: true });
});

export default router;
