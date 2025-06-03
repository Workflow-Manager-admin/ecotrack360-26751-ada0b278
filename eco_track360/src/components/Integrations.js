import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Integrations simulates banking/maps/energy imports and displays mock emissions data.
 */
const MOCK_IMPORTS = [
  {
    source: "Banking",
    icon: "🏦",
    item: "SuperMart groceries",
    detail: "Food",
    co2: "0.11 tCO₂",
    date: "2024-06-03"
  },
  {
    source: "Maps",
    icon: "🗺️",
    item: "Car trip (12mi)",
    detail: "Transportation",
    co2: "0.02 tCO₂",
    date: "2024-06-07"
  },
  {
    source: "Energy",
    icon: "💡",
    item: "Electric bill (kWh)",
    detail: "Home Energy",
    co2: "0.17 tCO₂",
    date: "2024-05-21"
  }
];

function Integrations() {
  return (
    <div>
      <h2 className="mb-md">Integrations</h2>
      <div className="eco-card mb-md" style={{ maxWidth: 520, margin: "auto" }}>
        <div style={{ color: "var(--secondary)", fontWeight: 600, fontSize: 17, marginBottom: 7 }}>
          Connect Data Sources
        </div>
        <p style={{color:"var(--text-faint)", marginTop:0, marginBottom:7, fontSize:14}}>
          Preview imported banking, map, and energy records.
        </p>
        <button
          className="btn"
          disabled
          aria-disabled="true"
          style={{ marginBottom: 13, marginTop: 4, opacity: 0.7 }}
        >
          Connect Data Source (mock)
        </button>
        {/* Static imported data list */}
        <div style={{marginTop:10}}>
          {MOCK_IMPORTS.map((rec,i)=>(
            <div key={i} className="eco-card" style={{
              display:"flex",
              alignItems:"center",
              gap:14,
              background:"var(--surface)",
              margin:"8px 0",
              boxShadow:"none",
              padding:"13px 9px"
            }}>
              <div style={{ fontSize:"1.3em" }}>{rec.icon}</div>
              <div style={{flex:1, minWidth: 100}}>
                <div style={{ fontWeight:600, color:"var(--primary)" }}>{rec.item}</div>
                <div style={{fontSize:13, color:"var(--text-faint)"}}>{rec.detail} – {rec.date}</div>
              </div>
              <div style={{ minWidth:65, fontWeight:700, textAlign:"right", color:"var(--secondary)" }}>
                {rec.co2}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="eco-highlight text-center mt-md sm-text">
        (Mock only) Real data sync coming soon!
      </div>
    </div>
  );
}

export default Integrations;
