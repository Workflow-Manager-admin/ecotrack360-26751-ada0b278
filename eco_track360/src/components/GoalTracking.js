import React from 'react';

/**
 * PUBLIC_INTERFACE
 * GoalTracking lets users create and view climate goals, and visually tracks progress.
 */
function GoalTracking() {
  return (
    <div>
      <h2>Goal Tracking</h2>
      {/* Placeholder: goal progress bar/ring */}
      <div style={{ background: "#254d32", color: "#fff", borderRadius: "10px", padding: "20px", margin: "16px 0"}}>
        <p>Next Goal: <strong>Reduce carbon output by 20% this month</strong></p>
        {/* TODO: Progress visualization, add/view goals */}
        <div style={{ width: 220, background: "#022", borderRadius: 10, height: 18, margin: "12px 0" }}>
          <div style={{ width: "64%", background: "#2E7D32", height: "100%", borderRadius: 10 }}></div>
        </div>
        <span>Progress: <strong>64%</strong></span>
      </div>
      {/* TODO: Add goal creation, history, etc. */}
    </div>
  );
}

export default GoalTracking;
