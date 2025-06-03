import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Leaderboard displays mock list of participant rankings and highlights the current user.
 */
function Leaderboard() {
  return (
    <div>
      <h2>Leaderboard</h2>
      {/* Placeholder: mock leaderboard list */}
      <ol style={{ background: "#223388", color: "#fff", borderRadius: "10px", padding: "20px", margin: "16px 0" }}>
        <li><strong>You</strong> - 2nd place 🍃</li>
        <li>SustainableSam - 1st place 🏆</li>
        <li>EcoElla - 3rd place 🌱</li>
        {/* TODO: More participants, stats, visual highlight for self */}
      </ol>
      {/* TODO: Expand details, personal stats, etc. */}
    </div>
  );
}

export default Leaderboard;
