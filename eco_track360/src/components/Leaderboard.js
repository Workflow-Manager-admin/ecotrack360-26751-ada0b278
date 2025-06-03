import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Leaderboard displays mock list of participant rankings and highlights the current user.
 */
const MOCK_PARTICIPANTS = [
  {
    name: "SustainableSam",
    score: 880,
    place: 1,
    icon: "🏆",
    isSelf: false
  },
  {
    name: "You",
    score: 820,
    place: 2,
    icon: "🍃",
    isSelf: true
  },
  {
    name: "EcoElla",
    score: 780,
    place: 3,
    icon: "🌱",
    isSelf: false
  },
  {
    name: "ClimateChris",
    score: 700,
    place: 4,
    icon: "💧",
    isSelf: false
  },
  {
    name: "GreenGina",
    score: 670,
    place: 5,
    icon: "🌵",
    isSelf: false
  }
];

function Leaderboard() {
  return (
    <div>
      <h2 className="mb-md">Leaderboard</h2>
      <div className="eco-card mb-md" style={{maxWidth:480, margin:"auto"}}>
        <div style={{fontWeight:600, color:"var(--secondary)", marginBottom:7}}>Community Standings (Mock)</div>
        <ol style={{
          background: "var(--surface)",
          borderRadius: 9,
          padding: "0.5em 10px 0.5em 32px",
          margin:0,
          color: "#fff",
          fontSize: "1.04em"
        }}>
          {MOCK_PARTICIPANTS.map(p => (
            <li key={p.name}
                style={{
                  fontWeight: p.isSelf ? 850 : 600,
                  color: p.isSelf ? "var(--primary)" : "#fff",
                  fontSize: p.isSelf ? "1.16em" : "1em",
                  background: p.isSelf ? "#192c14" : "none",
                  borderRadius: p.isSelf ? "7px" : "0",
                  marginBottom: 7,
                  padding: "4px 0 4px 6px"
                }}>
              <span style={{marginRight:7}}>{p.icon}</span>
              <span>{p.name}</span>
              <span style={{marginLeft:13, color:"var(--secondary)", fontWeight:800}}>{p.score} pts</span>
              <span style={{marginLeft:12, fontSize:13, color:"#BCD4C2"}}>#{p.place}</span>
              {p.isSelf && <span style={{
                background:"var(--primary)",
                color:"#fff",
                fontSize:11,
                marginLeft:10,
                borderRadius:6,
                padding:"1px 8px",
                fontWeight:700
              }}>YOU</span>}
            </li>
          ))}
        </ol>
      </div>
      <div className="eco-highlight text-center">
        <span>Rank up by completing eco actions! Your stats auto-update. (Mock only)</span>
      </div>
    </div>
  );
}

export default Leaderboard;
