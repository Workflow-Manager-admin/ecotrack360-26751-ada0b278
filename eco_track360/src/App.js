import React, { useState } from 'react';
import './App.css';

// Section components
import CarbonDashboard from './components/CarbonDashboard';
import Rewards from './components/Rewards';
import AiAssistant from './components/AiAssistant';
import Integrations from './components/Integrations';
import GoalTracking from './components/GoalTracking';
import Leaderboard from './components/Leaderboard';
import Navigation from './components/Navigation';
import Profile from './components/Profile';

// Section key -> component map
const SECTION_COMPONENTS = {
  dashboard: CarbonDashboard,
  rewards: Rewards,
  ai: AiAssistant,
  integrations: Integrations,
  goals: GoalTracking,
  leaderboard: Leaderboard,
  profile: Profile,
};

/**
 * PUBLIC_INTERFACE
 * Main App - holds navigation and renders the selected main section/page.
 */
function App() {
  // Top-level section navigation state
  const [section, setSection] = useState('dashboard');

  // Determine which component to render
  const SectionComponent = SECTION_COMPONENTS[section] || CarbonDashboard;

  return (
    <div className="app">
      {/* Fixed top nav */}
      <nav className="navbar">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div className="logo">
              <span className="logo-symbol">*</span> EcoTrack360
            </div>
            <span style={{
              color: '#1976D2', 
              fontWeight: 600, 
              background: '#1b241c',
              borderRadius: 7, 
              padding: '6px 13px', 
              fontSize: '0.99em',
              letterSpacing: '.05em'
            }}>
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </span>
          </div>
        </div>
      </nav>

      {/* Main: section content (margin for navbar spacing) */}
      <main style={{ marginTop: 88, marginBottom: 82, minHeight: '60vh' }}>
        <div className="container">
          {/* Render the selected section */}
          <SectionComponent />
        </div>
      </main>
      {/* Eco/minimal bottom nav */}
      <Navigation currentSection={section} setSection={setSection} />
    </div>
  );
}

export default App;