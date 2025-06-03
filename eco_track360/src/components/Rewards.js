import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Rewards component displays user's carbon credits, progress,
 * available reward options, and redemption (all with mock data).
 */
function Rewards() {
  return (
    <div>
      <h2>Rewards</h2>
      {/* Placeholder: Carbon credits and eco-rewards progress */}
      <div style={{ padding: '18px', background: "#193", borderRadius: '10px', color: 'white', margin: '16px 0' }}>
        <p>Eco credits earned: <strong>120</strong></p>
        {/* TODO: Progress bar, reward list, mock redemption */}
        <div style={{ marginTop: 8 }}>
          <button className="btn" disabled>Redeem Credits (coming soon)</button>
        </div>
      </div>
      {/* TODO: Link eco-actions with credits */}
    </div>
  );
}

export default Rewards;
