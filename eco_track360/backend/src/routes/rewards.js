import express from "express";
import { mockDB } from "../db/mockdb.js";
const router = express.Router();

const REWARD_OPTIONS = [
  { id: 1, label: "5% off Plant Shop", points: 80, type: "redeem" },
  { id: 2, label: "Donation: Tree Planting", points: 100, type: "donate" },
  { id: 3, label: "Reusable Water Bottle", points: 120, type: "redeem" },
];
// PUBLIC_INTERFACE
// GET /api/rewards - show available rewards and user's claimed/redemptions
router.get("/", (req, res) => {
  const user = mockDB.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json({
    ecoCredits: user.ecoCredits || 120, // fallback default for demo
    claimed: user.rewards || [],
    available: REWARD_OPTIONS
  });
});

// PUBLIC_INTERFACE
// POST /api/rewards/claim (for mock claimable actions)
router.post("/claim", (req, res) => {
  const user = mockDB.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  // Accept { label, credits }, add to ecoCredits tally
  const { label, credits } = req.body;
  user.ecoCredits = (user.ecoCredits || 120) + (credits || 0);
  res.json({ success: true, ecoCredits: user.ecoCredits });
});

// PUBLIC_INTERFACE
// POST /api/rewards/redeem/:id (redeem or donate a reward)
router.post("/redeem/:id", (req, res) => {
  const user = mockDB.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  const reward = REWARD_OPTIONS.find(r => r.id == req.params.id);
  if (!reward) return res.status(404).json({ error: "Reward not found" });
  user.ecoCredits = (user.ecoCredits || 120);
  if (user.ecoCredits < reward.points)
    return res.status(400).json({ error: "Not enough credits" });
  if ((user.rewards || []).includes(reward.id))
    return res.status(400).json({ error: "Already redeemed" });
  user.rewards = user.rewards || [];
  user.rewards.push(reward.id);
  user.ecoCredits -= reward.points;
  res.json({ success: true, ecoCredits: user.ecoCredits, claimed: user.rewards });
});

export default router;
