import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Navigation renders main navigation bar (bottom tab for mobile/minimal design).
 * Handles section selection and highlights the active section per eco UI plan.
 */
function Navigation({ currentSection, setSection }) {
  // Navigation structure: label, eco icon (emoji), section-key
  const navItems = [
    { label: 'Dashboard', icon: '🌎', section: 'dashboard' },
    { label: 'Rewards', icon: '🏅', section: 'rewards' },
    { label: 'AI Assistant', icon: '🤖', section: 'ai' },
    { label: 'Integrations', icon: '🔗', section: 'integrations' },
    { label: 'Goals', icon: '🎯', section: 'goals' },
    { label: 'Leaderboard', icon: '📈', section: 'leaderboard' },
    { label: 'Profile', icon: '🪴', section: 'profile' }, // Profile nav item with eco icon
  ];

  return (
    <nav className="eco-nav">
      {navItems.map((item) => (
        <button
          key={item.section}
          className={
            'nav-btn' +
            (currentSection === item.section ? ' selected' : '')
          }
          aria-current={currentSection === item.section ? 'page' : undefined}
          aria-label={item.label}
          tabIndex={0}
          style={{
            background: currentSection === item.section ? 'var(--primary)' : 'transparent',
            color: currentSection === item.section ? '#fff' : 'var(--text-faint)',
            minWidth: 76,
            margin: '0 3px',
            fontWeight: currentSection === item.section ? 700 : 500,
          }}
          onClick={() => setSection(item.section)}
        >
          <span aria-hidden="true" style={{ marginRight: 7 }}>
            {item.icon}
          </span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default Navigation;
