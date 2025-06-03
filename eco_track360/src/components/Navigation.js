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
    // Profile as main peer section
    { label: 'Profile', icon: '🪴', section: 'profile' }, // eco styled potted plant (minimal/eco)
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
            border: 'none',
            borderRadius: 8,
            transition: 'background 0.1s, color 0.1s',
            outline: currentSection === item.section ? '2px solid var(--primary)' : 'none',
            boxShadow: currentSection === item.section ? '0 0 0 2px #22322444' : 'none'
          }}
          onClick={() => setSection(item.section)}
        >
          <span aria-hidden="true" style={{ marginRight: 7, fontSize: item.section === 'profile' ? '1.19em' : undefined }}>
            {item.icon}
          </span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default Navigation;
