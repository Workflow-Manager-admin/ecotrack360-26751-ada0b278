import React from 'react';

/**
 * PUBLIC_INTERFACE
 * GoalTracking lets users create and view climate goals, and visually tracks progress.
 */
const GOALS = [
  {
    title: "Reduce carbon output by 20% this month",
    progress: 64,
    icon: "♻️",
    target: "20% less (monthly)",
    status: "Active"
  },
  {
    title: "Walk/bike to work 3x per week",
    progress: 100,
    icon: "🚲",
    target: "9 trips/mo",
    status: "Achieved"
  },
  {
    title: "Eat 100% plant-based 2 days/week",
    progress: 47,
    icon: "🥦",
    target: "8 of 17 days",
    status: "In Progress"
  }
];

function GoalTracking() {
  // All logic is static/mock
  return (
    <div>
      <h2 className="mb-md">Goal Tracking</h2>
      {/* Mock current goals */}
      <div className="mb-md">
        {GOALS.map((goal, i) => (
          <div key={goal.title} className="eco-card" style={{
            display:"flex", alignItems:"center", gap:18, marginBottom:11, background: goal.progress === 100 ? "#d4ff99" : undefined, color: goal.progress === 100 ? "#202924": undefined
          }}>
            <div style={{fontSize:"2.1em", minWidth:40}}>{goal.icon}</div>
            <div style={{flex:1, minWidth:145}}>
              <div style={{fontWeight:700, fontSize:17, color: goal.progress===100 ? "#223224":"var(--primary)"}}>
                {goal.title}
              </div>
              <div style={{fontSize:13, color:"var(--text-faint)"}}>{goal.target} – <em>{goal.status}</em></div>
              {/* Progress ring/bar */}
              <div className="progress-bar-bg" style={{height:15, marginTop:7}}>
                <div className="progress-bar-fg"
                  style={{
                    width: goal.progress + '%',
                    background: goal.progress === 100 ? "#d4ff99":"var(--primary)"
                  }}/>
              </div>
            </div>
            <div className="ml-sm" style={{
              fontWeight:800,
              color: goal.progress === 100 ? "#537620": "var(--secondary)",
              minWidth:44,
              textAlign:"center",
              fontSize:15
            }}>
              {goal.progress}%
            </div>
          </div>
        ))}
      </div>
      {/* Static new-goal action (no real input, MVP) */}
      <div className="eco-highlight text-center">
        <button className="btn" disabled aria-disabled="true" style={{marginTop:3, marginBottom:1}}>
          Add New Goal (coming soon)
        </button>
        <div style={{fontSize:13, color:"var(--text-faint)"}}>
          More climate goal types and tracking will be available!
        </div>
      </div>
      {/* History/example completed list (optional for mock) */}
      <div className="mt-md" style={{fontSize:13, color:"var(--text-faint)",textAlign:"center"}}>
        Recent progress automatically updates (mock data only)
      </div>
    </div>
  );
}

export default GoalTracking;
