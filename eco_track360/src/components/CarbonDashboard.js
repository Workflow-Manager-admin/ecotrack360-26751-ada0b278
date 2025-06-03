import React from 'react';

/**
 * PUBLIC_INTERFACE
 * CarbonDashboard displays user's real-time carbon footprint data,
 * visually broken down by category (Food, Transportation, Energy, Shopping).
 * Initially uses mock/static data and renders as the landing/primary dashboard.
 */
/**
 * INTERNAL: Static mock data for carbon categories.
 */
const CATEGORIES = [
  {
    key: 'food',
    label: 'Food',
    color: 'var(--primary)',
    co2: 1.9, // tons/year (mock)
    icon: '🥗'
  },
  {
    key: 'transport',
    label: 'Transportation',
    color: 'var(--secondary)',
    co2: 3.1,
    icon: '🚙'
  },
  {
    key: 'energy',
    label: 'Home Energy',
    color: '#BDBDBD',
    co2: 2.3,
    icon: '💡'
  },
  {
    key: 'shopping',
    label: 'Shopping',
    color: '#8a8a8a',
    co2: 1.4,
    icon: '🛍️'
  }
];

function CarbonDashboard() {
  // For mock, keep all breakdowns always expanded
  const totalCO2 = CATEGORIES.reduce((t, c) => t + c.co2, 0);

  return (
    <div>
      <h2 className="mb-md">Carbon Dashboard</h2>
      <div className="eco-card mb-md" style={{textAlign: "center", maxWidth: 510, margin: "auto"}}>
        <div style={{ fontSize: 18, color: "var(--text-secondary)", marginBottom: 8}}>
          This month’s estimated carbon output:
        </div>
        {/* Donut/Pie chart placeholder */}
        <div style={{display: "flex", justifyContent: "center", gap:24, alignItems:"center"}}>
          <span className="progress-ring-placeholder" style={{
            background:
              "conic-gradient(var(--primary) 0% 23%, var(--secondary) 23% 61%, #BDBDBD 61% 90%, #8a8a8a 90% 100%)"
          }}></span>
          <div>
            <div style={{fontSize:"2.3em", fontWeight:700, color:"var(--primary)"}}>{totalCO2.toFixed(1)} t</div>
            <span style={{fontSize:"1em", color:"var(--text-faint)"}}>CO₂-eq estimated</span>
          </div>
        </div>
        <div style={{marginTop:18, fontSize:13, color:"var(--text-faint)"}}>
          <span>by emission category</span>
        </div>
      </div>

      {/* Category breakdowns (mock, always expanded) */}
      <div className="mb-md">
        {CATEGORIES.map(cat => (
          <div key={cat.key} className="eco-card" style={{display:"flex", alignItems:"center", gap:16}}>
            <span style={{
              fontSize: '1.35em',
              minWidth:36,
              display: "inline-flex",
              justifyContent:"center"
            }}>{cat.icon}</span>
            <div style={{flex:1}}>
              <div style={{ fontWeight: 600, color: cat.color }}>{cat.label}</div>
              <div className="progress-bar-bg" style={{margin:"7px 0"}}>
                <div
                  className="progress-bar-fg"
                  style={{
                    width: (100 * cat.co2 / totalCO2).toFixed(0) + '%',
                    background: cat.color
                  }}
                ></div>
              </div>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                {cat.co2.toFixed(1)} tCO₂-eq / mo
              </span>
            </div>
            {/* Details mock */}
            <div style={{
              fontSize: 12,
              color: "var(--text-faint)",
              minWidth:36,
              textAlign:"right"
            }}>
              {(100 * cat.co2 / totalCO2).toFixed(0)}%
            </div>
          </div>
        ))}
      </div>
      <div className="eco-highlight text-center">
        <span>Tip: Click a category (in full version) to see detailed actions and historical trends.</span>
      </div>
    </div>
  );
}

export default CarbonDashboard;
