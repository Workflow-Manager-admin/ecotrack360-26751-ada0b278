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

import Login from './components/Login';
import Register from './components/Register';
import { useAuth } from './AuthContext';

/**
 * Core map of allowed/protected sections (requires login)
 */
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
 * Main App - shows login/register if not authenticated or protected app sections if authenticated.
 * Restricts navigation and cleans up session state on logout.
 */
function App() {
  const { authenticated, user, sessionExpired, errorMessage, resetSessionError } = useAuth();
  const [section, setSection] = useState('dashboard');
  const [authScreen, setAuthScreen] = useState('login'); // 'login' | 'register'

  // Redirect or error banner UI for session timeout/expire
  React.useEffect(() => {
    if (sessionExpired) {
      setSection('dashboard');
      setAuthScreen('login');
    }
  }, [sessionExpired]);

  // For main content: show login/register if not authenticated, else protected sections
  let mainContent;
  if (!authenticated) {
    mainContent = (
      <div>
        {sessionExpired &&
          <div className="eco-highlight text-center" style={{
            background: '#893f3f', color: '#fff',
            fontWeight: 700, margin: '22px auto 20px', padding: '14px', maxWidth: 400
          }}>
            Session expired or signed out. Please log in again.
            <button
              style={{
                marginLeft: 18, background: "none", color: "#fff", border: "none", fontWeight: 900,
                fontSize: 18, cursor: "pointer"
              }}
              aria-label="Dismiss"
              onClick={resetSessionError}
            >×</button>
          </div>
        }
        {errorMessage &&
          <div className="eco-highlight text-center" style={{
            background: '#893f3f', color: '#fff',
            fontWeight: 700, margin: '17px auto 18px', padding: '10px', maxWidth: 400
          }}>
            {errorMessage}
            <button
              style={{
                marginLeft: 18, background: "none", color: "#fff", border: "none", fontWeight: 900,
                fontSize: 18, cursor: "pointer"
              }}
              aria-label="Dismiss"
              onClick={resetSessionError}
            >×</button>
          </div>
        }
        {authScreen === 'login'
          ? <>
            <Login onSwitchToRegister={() => setAuthScreen('register')} />
            <div style={{ marginTop: 24, textAlign: "center" }}>
              <span style={{ color: "var(--text-faint)" }}>No account?</span>
              <button
                style={{ marginLeft: 9, background: "none", border: "none", color: "var(--primary)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                aria-label="Register"
                onClick={() => setAuthScreen('register')}
              >Register</button>
            </div>
          </>
          : <>
            <Register onSwitchToLogin={() => setAuthScreen('login')} />
            <div style={{ marginTop: 24, textAlign: "center" }}>
              <span style={{ color: "var(--text-faint)" }}>Already have an account?</span>
              <button
                style={{ marginLeft: 9, background: "none", border: "none", color: "var(--primary)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                aria-label="Log in"
                onClick={() => setAuthScreen('login')}
              >Log in</button>
            </div>
          </>
        }
      </div>
    );
  } else {
    // Section must exist in map, fallback to dashboard
    let SectionComponent = SECTION_COMPONENTS[section] || CarbonDashboard;
    mainContent = <SectionComponent />;
  }

  const showNav = authenticated;

  return (
    <div className="app">
      {/* Fixed top nav */}
      <nav className="navbar">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div className="logo">
              <span className="logo-symbol">*</span> EcoTrack360
            </div>
            {authenticated &&
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
            }
          </div>
        </div>
      </nav>

      {/* Main: Section content (margin for navbar spacing) */}
      <main style={{ marginTop: 88, marginBottom: showNav ? 82 : 0, minHeight: '60vh' }}>
        <div className="container">
          {mainContent}
        </div>
      </main>
      {/* Eco/minimal bottom nav, only show when signed in */}
      {showNav && <Navigation currentSection={section} setSection={setSection} />}
    </div>
  );
}

export default App;