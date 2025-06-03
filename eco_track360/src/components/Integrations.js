import React, { useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * Integrations simulates connecting/disconnecting mock banking, maps, and energy integrations.
 * Users can toggle integration status for each and view/retract imported demo data.
 * All logic is managed purely via local React state; no backend or real API.
 */

// The available mock integrations
const MOCK_INTEGRATIONS = [
  {
    key: 'banking',
    label: 'Banking',
    icon: '🏦',
    description: 'Connects to import grocery and spending data for carbon tracking.'
  },
  {
    key: 'maps',
    label: 'Maps',
    icon: '🗺️',
    description: 'Imports trip mileage data from maps/navigation apps.'
  },
  {
    key: 'energy',
    label: 'Energy',
    icon: '💡',
    description: 'Shows household energy usage based on mock utilities.'
  }
];

// Mock imported records for each integration
const MOCK_IMPORT_DATA = {
  banking: [
    {
      item: "SuperMart groceries",
      detail: "Food",
      co2: "0.11 tCO₂",
      date: "2024-06-03",
      icon: "🏦"
    }
  ],
  maps: [
    {
      item: "Car trip (12mi)",
      detail: "Transportation",
      co2: "0.02 tCO₂",
      date: "2024-06-07",
      icon: "🗺️"
    }
  ],
  energy: [
    {
      item: "Electric bill (kWh)",
      detail: "Home Energy",
      co2: "0.17 tCO₂",
      date: "2024-05-21",
      icon: "💡"
    }
  ]
};

function Integrations() {
  // Track which integrations are "connected"
  const [connections, setConnections] = useState({
    banking: true,
    maps: true,
    energy: true
  });
  // Undo state: {key, prevState: bool, label}
  const [undoState, setUndoState] = useState(null);

  // PUBLIC_INTERFACE
  // Toggle a single integration (connect/disconnect)
  function handleToggle(key) {
    setUndoState({
      key,
      prevState: connections[key],
      label: MOCK_INTEGRATIONS.find(i => i.key === key)?.label || key
    });
    setConnections(conns => ({
      ...conns,
      [key]: !conns[key]
    }));
  }

  // Undo handler
  function handleUndo() {
    if (undoState) {
      setConnections(conns => ({
        ...conns,
        [undoState.key]: undoState.prevState
      }));
      setUndoState(null);
    }
  }
  function handleDismiss() {
    setUndoState(null);
  }

  // Collect the data for currently connected integrations
  const connectedData = Object.entries(connections)
    .filter(([key, value]) => value)
    .flatMap(([key]) => MOCK_IMPORT_DATA[key] || []);

  return (
    <div>
      {/* Undo notification for integration toggle */}
      {undoState && (
        <UndoNotification
          message={
            connections[undoState.key]
              ? `${undoState.label} connected.`
              : `${undoState.label} disconnected.`
          }
          onUndo={handleUndo}
          onClose={handleDismiss}
        />
      )}

      <h2 className="mb-md">Integrations</h2>
      <div className="eco-card mb-md" style={{ maxWidth: 520, margin: "auto" }}>
        <div style={{ color: "var(--secondary)", fontWeight: 600, fontSize: 17, marginBottom: 7 }}>
          Connect Data Sources
        </div>
        <p style={{color: "var(--text-faint)", marginTop: 0, marginBottom: 7, fontSize: 14}}>
          Demo connecting banking, maps, and energy to view imported mock records.
        </p>
        <div style={{ margin: "10px 0 10px 0", display: "flex", flexDirection: "column", gap: 10 }}>
          {MOCK_INTEGRATIONS.map(integration => (
            <div key={integration.key}
              className="eco-card"
              style={{
                boxShadow: "none",
                background: "var(--surface)",
                margin: "0",
                padding: "9px 12px",
                display: "flex",
                alignItems: "center",
                gap: 14
              }}>
              <span style={{ fontSize: "1.34em" }}>{integration.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: "var(--primary)" }}>{integration.label}</div>
                <div style={{ fontSize: 13, color: "var(--text-faint)" }}>{integration.description}</div>
              </div>
              <button
                className="btn"
                aria-label={connections[integration.key] ? `Disconnect ${integration.label}` : `Connect ${integration.label}`}
                aria-pressed={!!connections[integration.key]}
                style={{
                  background: connections[integration.key] ? "var(--secondary)" : "var(--accent-dark)",
                  color: connections[integration.key] ? "#fff" : "#202924",
                  fontWeight: 700,
                  padding: "7px 18px",
                  fontSize: 14,
                  boxShadow: connections[integration.key] ? "0 0 2px var(--secondary)" : "none",
                  minWidth: 88
                }}
                onClick={() => handleToggle(integration.key)}
              >
                {connections[integration.key] ? "Disconnect" : "Connect"}
              </button>
            </div>
          ))}
        </div>
        {/* Show mock imported data if any integration is connected */}
        <div style={{marginTop:20}}>
          {connectedData.length === 0 ? (
            <div style={{ color: "var(--accent-dark)", textAlign: "center", fontSize: 15, padding: "17px 7px 13px" }}>
              No integrations connected.<br />
              Connect banking, maps, or energy above to see mock data!
            </div>
          ) : (
            connectedData.map((rec, i) => (
              <div key={rec.item + i}
                className="eco-card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  background: "var(--surface)",
                  margin: "8px 0",
                  boxShadow: "none",
                  padding: "13px 9px"
                }}>
                <div style={{ fontSize:"1.3em" }}>{rec.icon}</div>
                <div style={{ flex: 1, minWidth: 100 }}>
                  <div style={{ fontWeight: 600, color: "var(--primary)" }}>{rec.item}</div>
                  <div style={{ fontSize: 13, color: "var(--text-faint)" }}>{rec.detail} – {rec.date}</div>
                </div>
                <div style={{ minWidth:65, fontWeight:700, textAlign:"right", color:"var(--secondary)" }}>
                  {rec.co2}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="eco-highlight text-center mt-md sm-text">
        (All logic and data are local demo only. No accounts, API, or real data involved.)
      </div>
    </div>
  );
}

export default Integrations;
