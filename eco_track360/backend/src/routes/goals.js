const router = require("express").Router();
const { auth, mockUsers } = require("../middleware/authMiddleware");

// Return all user goals
router.get("/", auth, function (req, res) {
  const user = req.user || mockUsers.find(u => u.id === req.userId);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  return res.json(user.goals || []);
});

// Add new goal
router.post("/", auth, function (req, res) {
  const user = req.user || mockUsers.find(u => u.id === req.userId);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { title, target, icon, progress, status } = req.body || {};
  if (!title || !target) return res.status(400).json({ error: "Goal title and target required" });
  // IDs are just incremented for demo
  user.goals = Array.isArray(user.goals) ? user.goals : [];
  const newGoal = {
    id: (user.goals.length ? user.goals[user.goals.length - 1].id + 1 : 1),
    title: title,
    target: target,
    icon: icon || "🌱",
    progress: typeof progress === "number" ? progress : 0,
    status: status || "Active"
  };
  user.goals.push(newGoal);
  res.json(newGoal);
});

// Edit/update goal (by ID)
router.put("/:id", auth, function (req, res) {
  const user = req.user || mockUsers.find(u => u.id === req.userId);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const id = parseInt(req.params.id);
  let goal = Array.isArray(user.goals) ? user.goals.find(g => g.id === id) : null;
  if (!goal) return res.status(404).json({ error: "Goal not found" });
  Object.assign(goal, req.body || {});
  res.json(goal);
});

// Delete goal
router.delete("/:id", auth, function (req, res) {
  const user = req.user || mockUsers.find(u => u.id === req.userId);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const id = parseInt(req.params.id);
  if (!Array.isArray(user.goals)) user.goals = [];
  const idx = user.goals.findIndex(g => g.id === id);
  if (idx === -1) return res.status(404).json({ error: "Goal not found" });
  const removed = user.goals.splice(idx, 1)[0];
  res.json(removed);
});

// Catch-all for non-matched /api/goals/* routes. Responds with JSON error and 404.
router.all("*", (req, res) => {
  res.status(404).json({ error: "Goals API endpoint not found" });
});

module.exports = router;
