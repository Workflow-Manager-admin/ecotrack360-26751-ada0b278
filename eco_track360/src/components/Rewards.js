import React, { useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * Rewards component displays user's carbon credits, progress,
 * and allows claiming, redeeming, and donating credits with mock state.
 */
const ECO_REWARDS = [
  {
    label: '5% off Plant Shop',
    points: 80,
    icon: "🪴",
    desc: 'Get a discount for sustainable houseplants.',
    action: 'redeem'
  },
  {
    label: 'Donation: Tree Planting',
    points: 100,
    icon: '🌳',
    desc: 'Fund planting 2 trees via EcoForests.',
    action: 'donate'
  },
  {
    label: 'Reusable Water Bottle',
    points: 120,
    icon: '🥤',
    desc: 'Redeem for a branded reusable bottle (mock).',
    action: 'redeem'
  }
];

// Some mock recently claimable credits for demo purposes
const MOCK_CLAIMABLE = [
  {
    reason: "Bike ride to work (saved 2km car trip)",
    credits: 8,
    icon: "🚲"
  },
  {
    reason: "Recycled items in local program",
    credits: 4,
    icon: "♻️"
  },
  {
    reason: "Smart thermostat savings",
    credits: 6,
    icon: "💡"
  }
];

function Rewards() {
  // Stateful eco credits (mock starting value for demo)
  const [ecoCredits, setEcoCredits] = useState(120);
  const currentGoal = 150;

  // Track claimed credits (so they can't claim repeatedly)
  const [claimable, setClaimable] = useState(MOCK_CLAIMABLE);
  // Track notifications/feedback for post-action messages
  const [feedback, setFeedback] = useState(null);
  // Track already redeemed/donated reward labels
  const [rewardHistory, setRewardHistory] = useState([]);

  // Claim individual action credits
  // PUBLIC_INTERFACE
  function handleClaim(idx) {
    const claim = claimable[idx];
    setEcoCredits(c => c + claim.credits);
    setClaimable(cs => cs.filter((c, i) => i !== idx));
    setFeedback({
      message: `You claimed ${claim.credits} eco credits!`,
      type: "success"
    });
  }

  // Redeem/donate reward (if enough credits)
  // PUBLIC_INTERFACE
  function handleRedeem(reward) {
    if (ecoCredits >= reward.points && !rewardHistory.includes(reward.label)) {
      setEcoCredits(c => c - reward.points);
      setFeedback({
        message: reward.action === 'donate'
          ? `Thank you for donating! ${reward.label} successful.`
          : `Reward redeemed: ${reward.label}`,
        type: "success"
      });
      setRewardHistory(h => [...h, reward.label]);
    } else if (rewardHistory.includes(reward.label)) {
      setFeedback({
        message: "You have already claimed this reward.",
        type: "info"
      });
    } else {
      setFeedback({
        message: "Not enough credits for this reward.",
        type: "error"
      });
    }
  }

  // Close the feedback notification
  function handleCloseFeedback() {
    setFeedback(null);
  }

  return (
    <div>
      <h2 className="mb-md">Rewards</h2>
      {/* Credits summary + progress */}
      <div className="eco-card mb-md" style={{ textAlign: "center", maxWidth: 420, margin: "auto" }}>
        <div style={{ fontSize: 18, color: "var(--text-faint)" }}>Your Eco Credits</div>
        <div style={{ margin: "16px auto 10px", display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <span style={{ fontSize: "2.5em", color: "var(--primary)", fontWeight: 800 }}>
            {ecoCredits}
          </span>
          <span style={{ fontSize: 18, color: "var(--accent)" }}>pts</span>
        </div>
        {/* Progress toward next milestone */}
        <div className="progress-bar-bg" style={{ height: 15, width: "80%", margin: "auto" }}>
          <div className="progress-bar-fg" style={{
            width: (100 * ecoCredits / currentGoal).toFixed(0) + '%',
            background: "linear-gradient(90deg,var(--primary), var(--secondary))"
          }}></div>
        </div>
        <div style={{ fontSize: 13, color: "var(--accent-dark)", marginTop: 6 }}>
          {ecoCredits}/{currentGoal} credits to next eco reward
        </div>
      </div>

      {/* Feedback/Notification area */}
      {feedback && (
        <div
          className="eco-highlight text-center"
          style={{
            marginTop: -13,
            marginBottom: 15,
            background: feedback.type === "success"
              ? "var(--primary)"
              : feedback.type === "error"
                ? "#893f3f"
                : "var(--secondary)",
            color: feedback.type === "error" ? "#fff" : "#fff",
            border: feedback.type === "error" ? "2px solid #ffbaba" : undefined,
            position: 'relative',
            minHeight: 24,
            fontWeight: 600
          }}>
          <span>{feedback.message}</span>
          <button
            style={{
              position: "absolute",
              right: 14,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              color: "#fff",
              fontWeight: 900,
              fontSize: 18,
              marginLeft: 13,
              cursor: "pointer"
            }}
            title="Dismiss"
            aria-label="Dismiss notification"
            onClick={handleCloseFeedback}
            tabIndex={0}
          >×</button>
        </div>
      )}

      {/* Claimable credits for eco actions */}
      {claimable.length > 0 && (
        <div className="eco-card mb-md" style={{ maxWidth: 470, margin: "18px auto 0", textAlign: "left" }}>
          <div style={{ fontWeight: 600, color: "var(--secondary)", marginBottom: 5 }}>Claim New Credits:</div>
          <ul style={{ padding: "0 0 0 7px", marginBottom: 0 }}>
            {claimable.map((c, i) => (
              <li key={c.reason} style={{ marginBottom: 7, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.26em", minWidth: 31 }}>{c.icon}</span>
                <span style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600 }}>{c.credits} pts</span>
                  {" "}-{" "}
                  <span style={{ fontSize: 14, color: "var(--text-faint)" }}>{c.reason}</span>
                </span>
                <button
                  className="btn"
                  aria-label={`Claim ${c.credits} eco credits`}
                  style={{ padding: "4px 12px", fontSize: 13 }}
                  onClick={() => handleClaim(i)}
                >
                  Claim
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Available/mock rewards */}
      <div className="mb-md">
        <div style={{ fontWeight: 600, color: "var(--primary)", marginBottom: 5 }}>Eco Rewards & Offers:</div>
        {ECO_REWARDS.map(r => (
          <div key={r.label} className="eco-card" style={{ display: "flex", alignItems: "start", gap: 18, marginBottom: 9, opacity: rewardHistory.includes(r.label) ? 0.7 : 1 }}>
            <div style={{ fontSize: "2em", minWidth: 40 }}>{r.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "var(--secondary)" }}>{r.label}</div>
              <div style={{ fontSize: 13, color: "var(--text-faint)" }}>{r.desc}</div>
              <div style={{ marginTop: 7 }}>
                <button
                  className="btn"
                  style={{
                    background: ecoCredits >= r.points
                      ? (r.action === "donate" ? "var(--secondary)" : "var(--primary)")
                      : "var(--accent-dark)",
                    opacity: (ecoCredits >= r.points && !rewardHistory.includes(r.label)) ? 1 : 0.7,
                    cursor: (ecoCredits >= r.points && !rewardHistory.includes(r.label)) ? 'pointer' : 'not-allowed'
                  }}
                  aria-disabled={ecoCredits < r.points || rewardHistory.includes(r.label)}
                  disabled={ecoCredits < r.points || rewardHistory.includes(r.label)}
                  onClick={() => handleRedeem(r)}
                >
                  {r.action === 'donate' ? 'Donate' : 'Redeem'} ({r.points} pts)
                </button>
                {rewardHistory.includes(r.label) && (
                  <span style={{
                    display: "inline-block",
                    marginLeft: 9,
                    fontSize: 13,
                    color: "var(--secondary)"
                  }}>
                    {r.action === 'donate' ? 'Donated' : 'Claimed'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="eco-highlight text-center">
        <span>
          Earn credits for eco-friendly actions. Redeem for rewards, donate, or claim more credits!
        </span>
      </div>
    </div>
  );
}

export default Rewards;
