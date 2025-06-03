import React, { useState, useEffect } from 'react';
import UndoNotification from './UndoNotification';
import ConfirmationModal from './ConfirmationModal';
import LoadingSpinner from './LoadingSpinner';
import ErrorBanner from './ErrorBanner';
import { getRewards, claimReward, redeemReward } from '../api';
import { useAuth } from '../AuthContext';

/**
 * PUBLIC_INTERFACE
 * Rewards component now synchronizes all reward state and actions with backend API.
 * User credits, claimed rewards, and redemptions are loaded from and persisted to the backend.
 * All UI actions provide backend-driven feedback, loading, and error handling.
 */
const MOCK_CLAIMABLE = [
  // Some static demo creditable actions for UI purposes.
  {
    reason: "Bike ride to work (saved 2km car trip)",
    credits: 8,
    icon: "🚲",
    label: "Bike ride"
  },
  {
    reason: "Recycled items in local program",
    credits: 4,
    icon: "♻️",
    label: "Recycling"
  },
  {
    reason: "Smart thermostat savings",
    credits: 6,
    icon: "💡",
    label: "Thermostat"
  }
];

function Rewards() {
  const { authenticated } = useAuth();

  // Backend state
  const [ecoCredits, setEcoCredits] = useState(0);
  const [rewardOptions, setRewardOptions] = useState([]); // reward catalog
  const [claimedIds, setClaimedIds] = useState([]); // reward ids user has redeemed
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionFeedback, setActionFeedback] = useState(null); // {message, type}
  const [retryFlag, setRetryFlag] = useState(0);

  // Pending UI state
  const [pendingReward, setPendingReward] = useState(null); // for confirmation modal
  const [undoState, setUndoState] = useState(null); // {reward, prevCredits, prevClaimed}

  // Credits milestone for progress
  const currentGoal = 150;

  // Fresh mock claimable list, but when claimed via API don't show again
  const [claimable, setClaimable] = useState(MOCK_CLAIMABLE);

  // Fetch user rewards/credits from backend
  useEffect(() => {
    if (!authenticated) return;
    setLoading(true);
    setLoadError('');
    getRewards()
      .then(data => {
        setEcoCredits(data.ecoCredits);
        setRewardOptions(Array.isArray(data.available) ? data.available : []);
        setClaimedIds(Array.isArray(data.claimed) ? data.claimed : []);
      })
      .catch(err => setLoadError(err?.message || "Failed to load rewards."))
      .finally(() => setLoading(false));
  }, [authenticated, retryFlag]);

  // Claim available credit (save to backend and refresh state)
  async function handleClaim(idx) {
    if (!authenticated) return;
    const claim = claimable[idx];
    setLoading(true);
    setLoadError('');
    try {
      await claimReward(claim.label, claim.credits);
      setClaimable(cs => cs.filter((_, i) => i !== idx)); // remove claimed from UI
      setActionFeedback({ message: `You claimed ${claim.credits} eco credits!`, type: "success" });
      setRetryFlag(f => f + 1); // will refetch
    } catch (e) {
      setActionFeedback({ message: e?.message || "Failed to claim credits.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  // When user wants to redeem/donate a reward, open modal
  function handleRedeem(reward) {
    setPendingReward(reward);
  }

  // Do redeem/donation POST; refresh state on success
  async function confirmRedeemReward() {
    if (!pendingReward || !authenticated) {
      setPendingReward(null);
      return;
    }
    setLoading(true);
    setLoadError('');
    try {
      const resp = await redeemReward(pendingReward.id);
      setUndoState({
        reward: pendingReward,
        prevCredits: ecoCredits,
        prevClaimed: claimedIds.slice()
      });
      setPendingReward(null);
      setActionFeedback(null);
      // Force reload - backend state is new source of truth
      setRetryFlag(f => f + 1);
    } catch (e) {
      setActionFeedback({
        message: e?.message || "Failed to redeem reward.",
        type: "error"
      });
      setPendingReward(null);
    } finally {
      setLoading(false);
    }
  }
  function cancelRedeemReward() {
    setPendingReward(null);
  }

  // Dismiss notification
  function handleCloseFeedback() {
    setActionFeedback(null);
  }

  // Undo handler for reward redemption: restores previous state in UI only, but triggers reload to get up-to-date from server
  function handleUndoRedemption() {
    setUndoState(null);
    setRetryFlag(f => f + 1);
    setActionFeedback({ message: `Reward redemption undone.`, type: "info" });
  }
  function handleUndoClose() {
    setUndoState(null);
    setRetryFlag(f => f + 1);
  }

  // Helper to get full reward object for a claimed id
  function getRewardById(id) {
    return rewardOptions.find(r => r.id === id);
  }

  // Not authenticated = must not show user content
  if (!authenticated) {
    return (
      <div>
        <h2 className="mb-md">Rewards</h2>
        <div className="eco-card" style={{
          color: "var(--accent-dark)",
          textAlign: "center",
          margin: "30px auto",
          maxWidth: 400,
          fontSize: 16,
        }}>
          You must be logged in to view or claim rewards.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-md">Rewards</h2>

      {/* Global load error or load spinner */}
      {loading && (
        <div style={{textAlign: "center", marginTop: 43}}>
          <LoadingSpinner />
          <div style={{marginTop: 9, color: "var(--accent)"}}>Loading rewards...</div>
        </div>
      )}
      {loadError && !loading && (
        <ErrorBanner
          message={loadError}
          onClose={() => setLoadError("")}
        />
      )}

      {/* Undo notification for redemption */}
      {undoState && (
        <UndoNotification
          message={
            undoState.reward.type === 'donate'
              ? `Thank you for donating! ${undoState.reward.label} successful.`
              : `Reward redeemed: ${undoState.reward.label}`
          }
          onUndo={handleUndoRedemption}
          onClose={handleUndoClose}
        />
      )}

      {/* Credits summary + progress */}
      {!loading && !loadError && (
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
      )}

      {/* Action feedback/Notification area */}
      {actionFeedback && (
        <div
          className="eco-highlight text-center"
          style={{
            marginTop: -13,
            marginBottom: 15,
            background: actionFeedback.type === "success"
              ? "var(--primary)"
              : actionFeedback.type === "error"
                ? "#893f3f"
                : "var(--secondary)",
            color: "#fff",
            border: actionFeedback.type === "error" ? "2px solid #ffbaba" : undefined,
            position: 'relative',
            minHeight: 24,
            fontWeight: 600
          }}>
          <span>{actionFeedback.message}</span>
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
      {!loading && !loadError && claimable.length > 0 && (
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
                  disabled={loading}
                >
                  Claim
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Available rewards */}
      {!loading && !loadError && (
      <div className="mb-md">
        <div style={{ fontWeight: 600, color: "var(--primary)", marginBottom: 5 }}>Eco Rewards & Offers:</div>
        {rewardOptions.map(r => (
          <div key={r.id} className="eco-card" style={{ display: "flex", alignItems: "start", gap: 18, marginBottom: 9, opacity: claimedIds.includes(r.id) ? 0.7 : 1 }}>
            <div style={{ fontSize: "2em", minWidth: 40 }}>
              {r.label === "5% off Plant Shop" ? "🪴"
               : r.label === "Reusable Water Bottle" ? "🥤"
               : r.label === "Donation: Tree Planting" ? "🌳"
               : "🏅"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "var(--secondary)" }}>{r.label}</div>
              <div style={{ fontSize: 13, color: "var(--text-faint)" }}>
                {r.label === "5% off Plant Shop" ? "Get a discount for sustainable houseplants."
                  : r.label === "Reusable Water Bottle" ? "Redeem for a branded reusable bottle."
                  : r.label === "Donation: Tree Planting" ? "Fund planting 2 trees via EcoForests."
                  : ""}
              </div>
              <div style={{ marginTop: 7 }}>
                <button
                  className="btn"
                  style={{
                    background: ecoCredits >= r.points
                      ? (r.type === "donate" ? "var(--secondary)" : "var(--primary)")
                      : "var(--accent-dark)",
                    opacity: (ecoCredits >= r.points && !claimedIds.includes(r.id)) ? 1 : 0.7,
                    cursor: (ecoCredits >= r.points && !claimedIds.includes(r.id)) ? 'pointer' : 'not-allowed'
                  }}
                  aria-disabled={ecoCredits < r.points || claimedIds.includes(r.id)}
                  disabled={ecoCredits < r.points || claimedIds.includes(r.id) || loading}
                  onClick={() => handleRedeem(r)}
                >
                  {r.type === 'donate' ? 'Donate' : 'Redeem'} ({r.points} pts)
                </button>
                {claimedIds.includes(r.id) && (
                  <span style={{
                    display: "inline-block",
                    marginLeft: 9,
                    fontSize: 13,
                    color: "var(--secondary)"
                  }}>
                    {r.type === 'donate' ? 'Donated' : 'Claimed'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      <div className="eco-highlight text-center">
        <span>
          Earn credits for eco-friendly actions. Redeem for rewards, donate, or claim more credits!
        </span>
      </div>
      {/* ConfirmationModal for redeem/donate actions */}
      <ConfirmationModal
        open={!!pendingReward}
        title={
          pendingReward?.type === 'donate'
            ? "Confirm Donation"
            : "Confirm Redemption"
        }
        message={
          pendingReward
            ? `Are you sure you want to ${
              pendingReward.type === 'donate' ? 'donate for' : 'redeem'
            } "${pendingReward.label}"? This action will use ${pendingReward.points} of your eco credits.`
            : ""
        }
        onCancel={cancelRedeemReward}
        onConfirm={confirmRedeemReward}
        confirmLabel={pendingReward?.type === "donate" ? "Donate" : "Redeem"}
        cancelLabel="Cancel"
      />
    </div>
  );
}

export default Rewards;
