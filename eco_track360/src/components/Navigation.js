import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Navigation renders main navigation bar (desktop vertical or mobile bottom nav).
 * Links to Dashboard, Rewards, AI Assistant, Integrations, Goals, Leaderboard.
 */
function Navigation({ currentSection, setSection }) {
  // Navigation items: label, icon (emoji as icon placeholder), section key
  const navItems = [
    { label: 'Dashboard', icon: '🌎', section: 'dashboard' },
    { label: 'Rewards', icon: '🏅', section: 'rewards' },
    { label: 'AI Assistant', icon: '🤖', section: 'ai' },
    { label: 'Integrations', icon: '🔗', section: 'integrations' },
    { label: 'Goals', icon: '🎯', section: 'goals' },
    { label: 'Leaderboard', icon: '📈', section: 'leaderboard' },
  ];

  return (
    <nav className="eco-nav" style={{
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-around",
      padding: "16px 0",
      background: "#181E19",
      borderTop: "1px solid #222",
      position: "sticky",
      bottom: 0,
      zIndex: 101,
    }}>
      {navItems.map(item => (
        <button
          key={item.section}
          className="btn"
          style={{
            background: currentSection === item.section ? "#2E7D32" : "#222",
            color: "#fff",
            minWidth: 80,
            margin: "0 8px",
            border: "none",
            borderRadius: 8,
            outline: currentSection === item.section ? "2px solid #2E7D32" : "none"
          }}
          aria-label={item.label}
          onClick={() => setSection(item.section)}
        >
          <span aria-hidden="true" style={{ marginRight: 7 }}>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}

export default Navigation;
