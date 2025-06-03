import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Rewards component displays user's carbon credits, progress,
 * available reward options, and redemption (all with mock data).
 */
const ECO_REWARDS = [
  {
    label: '5% off Plant Shop',
    points: 80,
    icon: "🪴",
    desc: 'Get a discount for sustainable houseplants.'
  },
  {
    label: 'Donation: Tree Planting',
    points: 100,
    icon: '🌳',
    desc: 'Fund planting 2 trees via EcoForests.'
  },
  {
    label: 'Reusable Water Bottle',
    points: 120,
    icon: '🥤',
    desc: 'Redeem for a branded reusable bottle (mock).'
  }
];

function Rewards() {
  const ecoCredits = 120;
  const currentGoal = 150;

  return (
    <div>
      <h2 className="mb-md">Rewards</h2>
      {/* Credits summary + progress */}
      <div className="eco-card mb-md" style={{textAlign:"center", maxWidth:420, margin:"auto"}}>
        <div style={{fontSize:18, color:"var(--text-faint)"}}>Your Eco Credits</div>
        <div style={{margin: "16px auto 10px", display: "flex", alignItems: "center", justifyContent: "center", gap: 14}}>
          <span style={{fontSize:"2.5em", color:"var(--primary)", fontWeight:800}}>
            {ecoCredits}
          </span>
          <span style={{fontSize:18, color:"var(--accent)"}}>pts</span>
        </div>
        {/* Progress toward next milestone */}
        <div className="progress-bar-bg" style={{height:15, width:"80%", margin:"auto"}}>
          <div className="progress-bar-fg" style={{
            width: (100*ecoCredits/currentGoal).toFixed(0) + '%',
            background: "linear-gradient(90deg,var(--primary), var(--secondary))"
          }}></div>
        </div>
        <div style={{fontSize:13, color:"var(--accent-dark)", marginTop:6}}>
          {ecoCredits}/{currentGoal} credits to next eco reward
        </div>
      </div>

      {/* Available/mock rewards */}
      <div className="mb-md">
        <div style={{fontWeight:600, color:"var(--primary)", marginBottom:5}}>Eco Rewards & Offers (Mock):</div>
        {ECO_REWARDS.map(r => (
          <div key={r.label} className="eco-card" style={{display:"flex", alignItems:"start", gap:18, marginBottom:9}}>
            <div style={{fontSize:"2em", minWidth:40}}>{r.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700, color:"var(--secondary)"}}>{r.label}</div>
              <div style={{fontSize:13, color:"var(--text-faint)"}}>{r.desc}</div>
              <div style={{marginTop:7}}>
                <button
                  className="btn"
                  disabled
                  style={{
                    background: "var(--secondary)",
                    opacity: ecoCredits >= r.points ? 1 : 0.8,
                    cursor: "not-allowed"
                  }}
                  aria-disabled="true"
                >
                  Redeem ({r.points} pts)
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="eco-highlight text-center">
        <span>Earn credits for eco-friendly actions. Redeem for real-life perks—coming soon!</span>
      </div>
    </div>
  );
}

export default Rewards;
