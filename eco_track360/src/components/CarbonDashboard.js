import React from 'react';

/**
 * PUBLIC_INTERFACE
 * CarbonDashboard displays user's real-time carbon footprint data,
 * visually broken down by category (Food, Transportation, Energy, Shopping).
 * Initially uses mock/static data and renders as the landing/primary dashboard.
 */
function CarbonDashboard() {
  return (
    <div>
      <h2>Carbon Dashboard</h2>
      {/* Placeholder for charts/graphs */}
      <div style={{ background: '#222', borderRadius: '10px', padding: '24px', margin: '16px 0' }}>
        <p>Carbon footprint summary by category will appear here.</p>
        {/* TODO: Insert Pie/Bar chart with mock data */}
      </div>
      {/* TODO: Expandable category breakdowns */}
    </div>
  );
}

export default CarbonDashboard;
