import React, { useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * Leaderboard displays a sortable, toggleable, and self-highlighting leaderboard
 * using mock local data – allows sorting by name or score and toggling datasets.
 */
const MOCK_PARTICIPANTS_GLOBAL = [
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

const MOCK_PARTICIPANTS_COMMUNITY = [
  {
    name: "You",
    score: 120,
    place: 1,
    icon: "🍃",
    isSelf: true
  },
  {
    name: "GreenLeafGroup",
    score: 110,
    place: 2,
    icon: "🌿",
    isSelf: false
  },
  {
    name: "EcoElla",
    score: 105,
    place: 3,
    icon: "🌱",
    isSelf: false
  },
  {
    name: "LocalLuke",
    score: 100,
    place: 4,
    icon: "🚲",
    isSelf: false
  },
  {
    name: "WasteWarrior",
    score: 98,
    place: 5,
    icon: "♻️",
    isSelf: false
  }
];

// "global" = overall standings; "community" = group/local
const DATASETS = [
  {
    key: "global",
    label: "Global Standings",
    sublabel: "EcoTrack360 (Global)",
    data: MOCK_PARTICIPANTS_GLOBAL
  },
  {
    key: "community",
    label: "Community Board",
    sublabel: "Local Eco Group",
    data: MOCK_PARTICIPANTS_COMMUNITY
  }
];

const SORT_OPTIONS = [
  { key: "score", label: "Score (desc)" },
  { key: "name", label: "Name (A-Z)" }
];

function Leaderboard() {
  // local state for which dataset, and how to sort
  const [board, setBoard] = useState("global");
  const [sort, setSort] = useState("score");

  // get current dataset object
  const dataset = DATASETS.find(b => b.key === board);

  // sorting logic
  function getSorted(data) {
    let arr = [...data];
    if (sort === "name") {
      arr.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "score") {
      arr.sort((a, b) => b.score - a.score);
    }
    // Recalculate place indices after sort (and for highlight "#")
    arr.forEach((entry, idx) => {
      entry.place = idx + 1;
    });
    return arr;
  }

  const sortedEntries = getSorted(dataset.data);

  // styling for toggle/sort buttons
  function tabBtnProps(selected) {
    return {
      className: "btn" + (selected ? " selected" : ""),
      style: {
        background: selected ? "var(--primary)" : "var(--card-border)",
        color: selected ? "#fff" : "var(--text-faint)",
        fontWeight: selected ? 700 : 500,
        fontSize: '0.97em',
        padding: '5px 19px',
        marginRight: 7,
        marginBottom: 3
      },
      tabIndex: 0
    };
  }

  return (
    <div>
      <h2 className="mb-md">Leaderboard</h2>
      <div className="eco-card mb-md" style={{maxWidth:480, margin:"auto"}}>

        {/* Dataset toggle controls */}
        <div style={{display: "flex", justifyContent: "space-between", alignItems:"center", marginBottom: 10}}>
          <div>
            {DATASETS.map(d => (
              <button
                key={d.key}
                {...tabBtnProps(board === d.key)}
                aria-pressed={board === d.key}
                onClick={() => setBoard(d.key)}
              >
                {d.label}
              </button>
            ))}
          </div>
          <div>
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.key}
                {...tabBtnProps(sort === opt.key)}
                aria-pressed={sort === opt.key}
                onClick={() => setSort(opt.key)}
              >
                Sort: {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{fontWeight:600, color:"var(--secondary)", marginBottom:7, fontSize:15}}>
          {dataset.sublabel}
        </div>
        {/* List */}
        <ol style={{
          background: "var(--surface)",
          borderRadius: 9,
          padding: "0.5em 10px 0.5em 32px",
          margin:0,
          color: "#fff",
          fontSize: "1.04em",
          minHeight:140
        }}>
          {sortedEntries.map(p => (
            <li key={p.name}
                style={{
                  fontWeight: p.isSelf ? 850 : 600,
                  color: p.isSelf ? "var(--primary)" : "#fff",
                  fontSize: p.isSelf ? "1.16em" : "1em",
                  background: p.isSelf ? "#192c14" : "none",
                  borderRadius: p.isSelf ? "7px" : "0",
                  marginBottom: 7,
                  padding: "4px 0 4px 6px",
                  outline: p.isSelf ? "1.5px solid var(--primary)" : undefined,
                  boxShadow: p.isSelf ? "0 0 6px #2E7D321D" : undefined
                }}>
              <span style={{marginRight:7}}>{p.icon}</span>
              <span>{p.isSelf ? <b>{p.name}</b> : p.name}</span>
              <span style={{marginLeft:13, color:"var(--secondary)", fontWeight:800}}>{p.score} pts</span>
              <span style={{marginLeft:12, fontSize:13, color:"#BCD4C2"}}>#{p.place}</span>
              {p.isSelf && <span style={{
                background:"var(--primary)",
                color:"#fff",
                fontSize:11,
                marginLeft:10,
                borderRadius:6,
                padding:"1px 8px",
                fontWeight:700,
                boxShadow: "0 0 2px var(--primary)"
              }}>YOU</span>}
            </li>
          ))}
          {sortedEntries.length === 0 && (
            <li style={{
              color: "var(--text-faint)",
              textAlign: "center",
              padding: "19px 0"
            }}>
              No leaderboard entries yet.
            </li>
          )}
        </ol>
      </div>
      <div className="eco-highlight text-center">
        <span>
          Rank up by completing eco actions! Your stats auto-update.<br />
          Toggle between global and community boards. Sort to compare.
        </span>
      </div>
    </div>
  );
}

export default Leaderboard;
