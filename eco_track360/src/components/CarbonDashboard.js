import React, { useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * CarbonDashboard displays user's real-time carbon footprint data with interactive mock features.
 * Users can now add their own carbon entries to the dashboard via a controlled input form. Allows per-session demo data entry for charts.
 * All data is kept in local component state.
 */

// MOCK CO2 data by categories and for different time spans
const INITIAL_MOCK_DATA = {
  month: [
    { key: 'food', label: 'Food', color: 'var(--primary)', co2: 1.9, icon: '🥗', details: 'Plant-based: 70% / Animal: 30%' },
    { key: 'transport', label: 'Transportation', color: 'var(--secondary)', co2: 3.1, icon: '🚙', details: 'Car: 220mi, Flights: 0' },
    { key: 'energy', label: 'Home Energy', color: '#BDBDBD', co2: 2.3, icon: '💡', details: 'Electric: 98%, Gas: 2%' },
    { key: 'shopping', label: 'Shopping', color: '#8a8a8a', co2: 1.4, icon: '🛍️', details: 'Essentials: 60%, Discretionary: 40%' },
  ],
  year: [
    { key: 'food', label: 'Food', color: 'var(--primary)', co2: 23.1, icon: '🥗', details: 'Annual groceries, meals out' },
    { key: 'transport', label: 'Transportation', color: 'var(--secondary)', co2: 41.3, icon: '🚙', details: 'All trips/flights' },
    { key: 'energy', label: 'Home Energy', color: '#BDBDBD', co2: 28.9, icon: '💡', details: 'Household energy' },
    { key: 'shopping', label: 'Shopping', color: '#8a8a8a', co2: 16.7, icon: '🛍️', details: 'Online/in-person spend' },
  ],
  week: [
    { key: 'food', label: 'Food', color: 'var(--primary)', co2: 0.5, icon: '🥗', details: 'Grocery 68%, Eating out 32%' },
    { key: 'transport', label: 'Transportation', color: 'var(--secondary)', co2: 0.83, icon: '🚙', details: 'Ride: 60mi' },
    { key: 'energy', label: 'Home Energy', color: '#BDBDBD', co2: 0.67, icon: '💡', details: 'Normal household use' },
    { key: 'shopping', label: 'Shopping', color: '#8a8a8a', co2: 0.32, icon: '🛍️', details: 'Essentials only' },
  ],
};

// Timespans we'll allow user to filter on
const TIMESPANS = [
  { key: 'week', label: 'Past week' },
  { key: 'month', label: 'This month' },
  { key: 'year', label: 'This year' }
];

const CATEGORY_ICONS = [
  { key: 'food', label: 'Food', icon: '🥗', color: 'var(--primary)' },
  { key: 'transport', label: 'Transportation', icon: '🚙', color:'var(--secondary)' },
  { key: 'energy', label: 'Home Energy', icon: '💡', color:'#BDBDBD' },
  { key: 'shopping', label: 'Shopping', icon: '🛍️', color:'#8a8a8a' },
];

function getPieChartConic(categories) {
  let total = categories.reduce((sum, c) => sum + c.co2, 0);
  let acc = 0;
  return (
    "conic-gradient(" +
      categories.map(cat => {
        const start = acc / total * 100;
        acc += cat.co2;
        const end = acc / total * 100;
        return `${cat.color} ${start.toFixed(0)}% ${end.toFixed(0)}%`;
      }).join(', ') +
    ")"
  );
}

// PUBLIC_INTERFACE
function CarbonDashboard() {
  // Toggle between 'pie' and 'bar' chart views
  const [chartType, setChartType] = useState('pie'); // 'pie' or 'bar'
  // Expand/collapse for categories
  const [expanded, setExpanded] = useState(() => {
    let o = {};
    INITIAL_MOCK_DATA['month'].forEach(c => o[c.key] = true);
    return o;
  });
  // Timespan selection
  const [timespan, setTimespan] = useState('month');
  // Local state for custom data per timespan
  const [userData, setUserData] = useState({
    week: [],
    month: [],
    year: []
  });
  // Entry form state
  const [newEntry, setNewEntry] = useState({
    value: "",
    label: "",
    catKey: "food",
    details: ""
  });

  // Merge mock and user data
  function getCategories() {
    let builtins = INITIAL_MOCK_DATA[timespan];
    let custom = userData[timespan] || [];
    // Merge with distinct keys (anon user entries get 'user-' prefix+idx key)
    return [...builtins, ...custom.map((entry, idx) => ({
      key: `user-${idx}`,
      label: entry.label || entry.catKey,
      color: CATEGORY_ICONS.find(c=>c.key===entry.catKey)?.color || 'var(--accent)',
      co2: Number(entry.value) || 0,
      icon: CATEGORY_ICONS.find(c=>c.key===entry.catKey)?.icon || '🌍',
      details: entry.details || "User entry"
    }))];
  }
  // Remove user entry by idx
  function removeUserEntry(idx) {
    setUserData(prev => ({
      ...prev,
      [timespan]: prev[timespan].filter((_, i) => i !== idx)
    }));
  }

  // Add entry
  function handleAddEntry(e) {
    e.preventDefault();
    if (!newEntry.value.trim() || isNaN(Number(newEntry.value))) return;
    setUserData(prev => ({
      ...prev,
      [timespan]: [
        ...prev[timespan],
        {
          value: newEntry.value,
          label: newEntry.label,
          catKey: newEntry.catKey,
          details: newEntry.details
        }
      ]
    }));
    setNewEntry({
      value: "",
      label: "",
      catKey: "food",
      details: ""
    });
  }

  // Handler to toggle one category expanded/collapsed
  function handleExpandToggle(key) {
    setExpanded(exp => ({
      ...exp,
      [key]: !exp[key]
    }));
  }

  // Handler to toggle chart type
  function handleChartType(type) {
    setChartType(type);
  }

  // Handler to change timespan
  function handleChangeTimespan(key) {
    setTimespan(key);
    setExpanded(() => {
      let o = {};
      (INITIAL_MOCK_DATA[key] || []).forEach(c => o[c.key] = true);
      // Also expand any user categories by default
      if (userData[key]) {
        userData[key].forEach((_, idx) => (o[`user-${idx}`] = true));
      }
      return o;
    });
  }

  const categories = getCategories();
  const totalCO2 = categories.reduce((t, c) => t + c.co2, 0);

  return (
    <div>
      <h2 className="mb-md">Carbon Dashboard</h2>
      <div className="eco-card mb-md" style={{textAlign: "center", maxWidth: 510, margin: "auto", position: "relative"}}>
        <div style={{ fontSize: 18, color: "var(--text-secondary)", marginBottom: 8}}>
          {TIMESPANS.find(t=>t.key===timespan)?.label || "This month"}’s estimated carbon output:
        </div>

        <form
          onSubmit={handleAddEntry}
          style={{
            margin: "12px auto 21px",
            background: "var(--surface)",
            borderRadius: 10,
            padding: "13px 11px",
            display: "flex",
            flexWrap: "wrap",
            gap: "9px",
            alignItems: "center",
            maxWidth: 430,
            justifyContent: "center"
          }}
          aria-label="Add carbon entry"
        >
          <span style={{ fontSize: 15, color: "var(--text-faint)", minWidth: 78 }}>Add your entry:</span>
          <select
            style={{ fontSize: 15, borderRadius: 6, padding: "4px 8px", border: "1px solid var(--card-border)", color: "var(--text-color)", background: "var(--background)" }}
            value={newEntry.catKey}
            onChange={e => setNewEntry(ne => ({ ...ne, catKey: e.target.value }))}
            aria-label="Category"
          >
            {CATEGORY_ICONS.map(opt =>
              <option value={opt.key} key={opt.key}>{opt.icon + " " + opt.label}</option>
            )}
          </select>
          <input
            type="text"
            required
            value={newEntry.label}
            onChange={e => setNewEntry(ne => ({ ...ne, label: e.target.value }))}
            placeholder="Description (e.g. Big trip)"
            aria-label="Entry label"
            style={{
              background: "var(--surface)",
              color: "var(--text-color)",
              borderRadius: 6,
              border: "1px solid var(--card-border)",
              padding: "3px 9px",
              minWidth: 99
            }}
          />
          <input
            type="number"
            required
            value={newEntry.value}
            onChange={e => setNewEntry(ne => ({ ...ne, value: e.target.value }))}
            placeholder="CO₂ t"
            aria-label="CO₂ (tons)"
            step="any"
            style={{
              width: 66,
              background: "var(--surface)",
              color: "var(--text-color)",
              borderRadius: 6,
              border: "1px solid var(--card-border)",
              padding: "3px 9px"
            }}
            min="0"
          />
          <input
            type="text"
            value={newEntry.details}
            onChange={e => setNewEntry(ne => ({ ...ne, details: e.target.value }))}
            placeholder="Details (optional)"
            aria-label="Details"
            style={{
              background: "var(--surface)",
              color: "var(--text-faint)",
              borderRadius: 6,
              border: "1px solid var(--card-border)",
              padding: "3px 9px",
              minWidth: 93
            }}
          />
          <button className="btn" type="submit" style={{fontWeight: 700, fontSize: 15, padding: "5px 15px"}}>
            Add
          </button>
        </form>

        {/* Timespan selector */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 13 }}>
          {TIMESPANS.map(t => (
            <button
              key={t.key}
              className="btn"
              onClick={() => handleChangeTimespan(t.key)}
              aria-pressed={timespan===t.key}
              style={{
                background: timespan === t.key ? "var(--secondary)" : "var(--card-border)",
                color: timespan === t.key ? "#fff" : "var(--text-faint)",
                fontWeight: timespan === t.key ? 700 : 500,
                fontSize: '0.98em',
                padding: '6px 18px'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Chart type toggle */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10, marginRight:4 }}>
          <span style={{ fontSize: 13, color: "var(--text-secondary)", marginRight: 6 }}>Chart:</span>
          <button
            className={"btn" + (chartType==='pie'?" selected":"")}
            style={{marginRight:4, background: chartType==='pie' ? "var(--primary)" : "var(--card-border)", color: chartType==='pie' ? "#fff":"var(--text-faint)", fontWeight:600, fontSize:13, padding:'4px 12px'}}
            onClick={()=>handleChartType('pie')}
            aria-pressed={chartType==='pie'}
          >Pie</button>
          <button
            className={"btn" + (chartType==='bar'?" selected":"")}
            style={{background: chartType==='bar' ? "var(--primary)" : "var(--card-border)", color: chartType==='bar' ? "#fff":"var(--text-faint)", fontWeight:600, fontSize:13, padding:'4px 12px'}}
            onClick={()=>handleChartType('bar')}
            aria-pressed={chartType==='bar'}
          >Bar</button>
        </div>

        {/* Main chart area - pie or bar */}
        <div style={{display: "flex", justifyContent: "center", gap:24, alignItems:"center"}}>
          {chartType === 'pie' ? (
            <span className="progress-ring-placeholder"
              style={{
                background: getPieChartConic(categories)
              }}>
            </span>
          ) : (
            <div style={{ display: "flex", alignItems: "flex-end", height: 90, gap: "13px", width:120, marginLeft:4}}>
              {categories.map(cat=> (
                <div key={cat.key} style={{
                  width: 14,
                  height: (cat.co2/totalCO2*80 + 16) + "px",
                  background: cat.color,
                  borderRadius: "6px 6px 3.5px 3.5px",
                  transition: 'height .3s cubic-bezier(.42,1.22,.41,1.05)',
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  position: 'relative'
                }} title={cat.label}>
                  <span style={{
                    position: 'absolute', 
                    bottom: -20, 
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: 19
                  }}>{cat.icon}</span>
                </div>
              ))}
            </div>
          )}
          <div>
            <div style={{fontSize:"2.3em", fontWeight:700, color:"var(--primary)"}}>{totalCO2.toFixed(1)} t</div>
            <span style={{fontSize:"1em", color:"var(--text-faint)"}}>CO₂-eq estimated</span>
          </div>
        </div>
        <div style={{marginTop:18, fontSize:13, color:"var(--text-faint)"}}>
          <span>by emission category</span>
        </div>
      </div>

      {/* Categories — breakdown, can remove custom categories */}
      <div className="mb-md">
        {categories.map((cat, idx) => (
          <div key={cat.key} className="eco-card" style={{marginBottom: 13, paddingBottom:8}}>
            <button
              style={{
                background: "none",
                border: "none",
                width: "100%",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: 16,
                cursor: "pointer",
                color: "inherit"
              }}
              aria-expanded={!!expanded[cat.key]}
              aria-controls={`catdetails-${cat.key}`}
              tabIndex={0}
              onClick={() => handleExpandToggle(cat.key)}
              id={`catheader-${cat.key}`}
              title={expanded[cat.key] ? "Collapse details" : "Expand details"}
            >
              <span style={{
                fontSize: '1.35em',
                minWidth:36,
                display: "inline-flex",
                justifyContent:"center"
              }}>{cat.icon}</span>
              <div style={{flex:1}}>
                <div style={{ fontWeight: 600, color: cat.color, fontSize: "1.08em" }}>{cat.label}</div>
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
                  {cat.co2.toFixed(2)} tCO₂-eq / {timespan}
                </span>
              </div>
              {/* Total percent as side col */}
              <div style={{
                fontSize: 12,
                color: "var(--text-faint)",
                minWidth:36,
                textAlign:"right"
              }}>
                {(100 * cat.co2 / totalCO2).toFixed(0)}%
              </div>
              <span
                aria-hidden="true"
                style={{
                  marginLeft: 11,
                  fontSize: 19,
                  lineHeight: '1',
                  color:"var(--secondary)",
                  rotate: expanded[cat.key] ? "90deg":"0deg",
                  transition: "transform .17s"
                }}
              >▶</span>
            </button>
            <div
              id={`catdetails-${cat.key}`}
              role="region"
              aria-labelledby={`catheader-${cat.key}`}
              style={{
                maxHeight: expanded[cat.key] ? 120 : 0,
                overflow: "hidden",
                transition: "max-height .23s cubic-bezier(.51,1.13,.39,.99)",
                opacity: expanded[cat.key] ? 1 : 0,
                padding: expanded[cat.key] ? "5px 2px 3px 53px" : "0 2px",
                fontSize: 13,
                color: "var(--text-faint)"
              }}
            >
              {expanded[cat.key] &&
                <div>
                  <b>Breakdown:</b> {cat.details} <br/>
                  <span style={{color:cat.color, fontWeight:700}}>
                    {cat.co2.toFixed(2)} tCO₂-eq ({(100*cat.co2/totalCO2).toFixed(0)}% of total)
                  </span>
                  {(cat.key.startsWith('user-')) && (
                    <div>
                      <button
                        onClick={() => removeUserEntry(Number(cat.key.split('user-')[1]))}
                        className="btn"
                        style={{
                          background:"var(--accent-dark)",
                          color:"#202924",
                          marginTop:7,
                          fontSize:13,
                          padding:"3px 17px"
                        }}
                        aria-label="Remove custom entry"
                      >
                        Remove Entry
                      </button>
                    </div>
                  )}
                  <div style={{marginTop:5, fontSize:12}}>
                    <em>
                      <span>See <a href="#" style={{color:"var(--secondary)"}} tabIndex={-1}>detailed actions & trends</a> (future)</span>
                    </em>
                  </div>
                </div>
              }
            </div>
          </div>
        ))}
      </div>
      <div className="eco-highlight text-center">
        <span>
          Tip: You can now add your own carbon entries! Toggle charts, expand categories, change time range. <br />
          Click a category for detailed actions and trends.
        </span>
      </div>
    </div>
  );
}

export default CarbonDashboard;
