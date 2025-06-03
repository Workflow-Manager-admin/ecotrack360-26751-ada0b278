/**
 * Rewards API Endpoints—demo only for in-memory rewards/credits.
 * All error responses use JSON with status codes for frontend parsing.
 */

const router = require("express").Router();
const { auth, mockUsers } = require("../middleware/authMiddleware");

// Demo rewards config
let availableRewards = [
  {
    id: 1,
    label: "5% off Plant Shop",
    points: 75,
    type: "reward",
  },
  {
    id: 2,
    label: "Reusable Water Bottle",
    points: 120,
    type: "reward",
  },
  {
    id: 3,
    label: "Donation: Tree Planting",
    points: 60,
    type: "donate",
  },
];

// PUBLIC_INTERFACE
// GET: All reward data and user credits/claims
router.get("/", auth, function (req, res) {
  try {
    // Find user's state
    const user = req.user || mockUsers.find(u => u.id === req.userId);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    // Rewards shape: { ecoCredits, available: [], claimed: []}
    const claimed = Array.isArray(user.claimedRewards) ? user.claimedRewards : [];
    res.json({
      ecoCredits: user.ecoCredits || 0,
      available: availableRewards,
      claimed: claimed,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch rewards" });
  }
});

// POST: Claim credits for action (increments ecoCredits, avoids duplicating for same label)
router.post("/claim", auth, function (req, res) {
  try {
    const { label, credits } = req.body || {};
    if (!label || !credits || typeof credits !== "number") {
      return res.status(400).json({ error: "Missing or invalid claim fields" });
    }
    const user = req.user || mockUsers.find(u => u.id === req.userId);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (Array.isArray(user.claimedLabels) && user.claimedLabels.includes(label)) {
      return res.status(409).json({ error: "Already claimed" });
    }
    user.ecoCredits = (user.ecoCredits || 0) + credits;
    user.claimedLabels = Array.isArray(user.claimedLabels) ? user.claimedLabels.concat([label]) : [label];
    return res.status(200).json({ ecoCredits: user.ecoCredits, message: "Credit claimed" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to claim reward" });
  }
});

// POST: Redeem (or donate) reward
router.post("/redeem/:rewardId", auth, function (req, res) {
  try {
    const rewardId = parseInt(req.params.rewardId);
    if (!rewardId) {
      return res.status(400).json({ error: "Invalid rewardId" });
    }
    const user = req.user || mockUsers.find(u => u.id === req.userId);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const reward = availableRewards.find(r => r.id === rewardId);
    if (!reward) {
      return res.status(404).json({ error: "Reward not found" });
    }
    if (Array.isArray(user.claimedRewards) && user.claimedRewards.includes(rewardId)) {
      return res.status(409).json({ error: "Reward already redeemed" });
    }
    if ((user.ecoCredits || 0) < reward.points) {
      return res.status(403).json({ error: "Insufficient credits" });
    }
    // Remove points & add to claimed
    user.ecoCredits = (user.ecoCredits || 0) - reward.points;
    user.claimedRewards = Array.isArray(user.claimedRewards) ? user.claimedRewards.concat([rewardId]) : [rewardId];
    return res.status(200).json({
      ecoCredits: user.ecoCredits,
      claimed: user.claimedRewards,
      reward: reward,
      message:
        reward.type === "donate"
          ? "Thank you for donating!"
          : "Reward redeemed successfully",
    });
  } catch (err) {
    return res.status(500).json({ error: "Redemption failed" });
  }
});

// Catch-all for bad API subroutes (ensure JSON error, not HTML)
router.all("*", function(req, res) {
  // Match only for /api/rewards... but not matched above
  res.status(404).json({ error: "Rewards API endpoint not found" });
});

module.exports = router;
