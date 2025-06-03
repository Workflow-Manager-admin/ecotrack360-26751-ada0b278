import React, { useState } from 'react';
import UndoNotification from './UndoNotification';
import ConfirmationModal from './ConfirmationModal';

/**
 * PUBLIC_INTERFACE
 * GoalTracking lets users create and view climate goals, and visually tracks progress.
 * Enhanced: uses React state for full CRUD demo (add, complete, remove) with mock/demo logic only.
 */

// Demo icons the user can select for their goal
const GOAL_ICONS = [
  "♻️","🌱","🚲","🥦","🏠","💡","🌲","🦶","🛍️","🥕"
];

// Initial demo goals for app boot
const INITIAL_GOALS = [
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

// PUBLIC_INTERFACE
function GoalTracking() {
  // Goal state (array of goal objects)
  const [goals, setGoals] = useState(INITIAL_GOALS);
  // Track for new goal input UI
  const [showAdd, setShowAdd] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: "", target: "", icon: GOAL_ICONS[0] });
  // Undo state: {type: 'remove'|'complete', goal, index, prevStatus, prevProgress}
  const [undoState, setUndoState] = useState(null);

  // PUBLIC_INTERFACE
  // Add a new goal to the list
  function handleAddGoal(e) {
    e.preventDefault();
    if (!newGoal.title.trim() || !newGoal.target.trim()) return;
    setGoals(oldGoals => [
      {
        title: newGoal.title,
        progress: 0,
        icon: newGoal.icon,
        target: newGoal.target,
        status: "Active"
      },
      ...oldGoals
    ]);
    // Reset/close input
    setNewGoal({ title: "", target: "", icon: GOAL_ICONS[0] });
    setShowAdd(false);
  }

  // PUBLIC_INTERFACE
  // Mark a goal as completed, updating its state
  function handleComplete(idx) {
    const goal = goals[idx];
    if (!goal || goal.progress === 100) return;
    setUndoState({
      type: 'complete',
      goal: { ...goal },
      index: idx,
      prevStatus: goal.status,
      prevProgress: goal.progress
    });
    setGoals(gs =>
      gs.map((g, i) =>
        i === idx && g.progress < 100
          ? { ...g, progress: 100, status: "Achieved" }
          : g
      )
    );
  }

  // PUBLIC_INTERFACE
  // Remove a goal (used only for completed goals, UI allows only removal of 100% ones)
  const [removeConfirm, setRemoveConfirm] = useState(null); // { goalIdx, goalTitle }

  function handleRemove(idx) {
    const goal = goals[idx];
    setRemoveConfirm({ idx, title: goal.title });
  }

  function confirmRemoveGoal() {
    if (removeConfirm) {
      const idx = removeConfirm.idx;
      const goal = goals[idx];
      setUndoState({
        type: 'remove',
        goal: { ...goal },
        index: idx
      });
      setGoals(goals => goals.filter((g, i) => i !== idx));
    }
    setRemoveConfirm(null);
  }

  function cancelRemoveGoal() {
    setRemoveConfirm(null);
  }

  // PUBLIC_INTERFACE
  // Demo: Incrementally track progress (simulate with +10% per click)
  function handleIncrement(idx) {
    setGoals(goals =>
      goals.map((g, i) =>
        i === idx && g.progress < 100
          ? {
              ...g,
              progress: Math.min(100, g.progress + 10),
              status:
                Math.min(100, g.progress + 10) === 100
                  ? "Achieved"
                  : "In Progress"
            }
          : g
      )
    );
  }

  // Undo for removal or completion
  function handleUndo() {
    if (!undoState) return;
    if (undoState.type === 'remove') {
      setGoals(prev =>
        [
          ...prev.slice(0, undoState.index),
          undoState.goal,
          ...prev.slice(undoState.index)
        ]
      );
    } else if (undoState.type === 'complete') {
      setGoals(prev =>
        prev.map((g, i) =>
          i === undoState.index
            ? { ...g, progress: undoState.prevProgress, status: undoState.prevStatus }
            : g
        )
      );
    }
    setUndoState(null);
  }
  function handleDismiss() {
    setUndoState(null);
  }

  // Break into active/in-progress and completed for display
  const activeGoals = goals.filter(g => g.progress < 100);
  const completedGoals = goals.filter(g => g.progress === 100);

  return (
    <div>
      {/* Undo notification */}
      {undoState && (
        <UndoNotification
          message={
            undoState.type === 'remove'
              ? `Goal "${undoState.goal.title}" removed.`
              : `Marked "${undoState.goal.title}" as complete.`
          }
          onUndo={handleUndo}
          onClose={handleDismiss}
        />
      )}
      <h2 className="mb-md">Goal Tracking</h2>
      <div className="mb-md">
        {/* Add new goal form */}
        {showAdd ? (
          <form
            className="eco-card"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 13,
              marginBottom: 11,
              flexWrap: "wrap"
            }}
            onSubmit={handleAddGoal}
          >
            <span style={{ fontSize: "1.6em", minWidth: 40 }}>
              <select
                value={newGoal.icon}
                aria-label="Goal icon"
                style={{
                  fontSize: "1.2em",
                  border: "none",
                  background: "transparent",
                  color: "var(--primary)"
                }}
                onChange={e =>
                  setNewGoal(ng => ({ ...ng, icon: e.target.value }))
                }
              >
                {GOAL_ICONS.map(icn => (
                  <option key={icn} value={icn}>
                    {icn}
                  </option>
                ))}
              </select>
            </span>
            <input
              type="text"
              required
              value={newGoal.title}
              placeholder="New goal e.g. Car-free days"
              aria-label="Goal title"
              style={{
                flex: "3",
                background: "var(--surface)",
                border: "1.1px solid var(--card-border)",
                borderRadius: 7,
                padding: "5px 11px",
                color: "var(--text-color)"
              }}
              onChange={e =>
                setNewGoal(ng => ({ ...ng, title: e.target.value }))
              }
            />
            <input
              type="text"
              required
              value={newGoal.target}
              placeholder="Goal target (e.g. 4 days/week)"
              aria-label="Goal target"
              style={{
                flex: "2",
                background: "var(--surface)",
                border: "1.1px solid var(--card-border)",
                borderRadius: 7,
                padding: "5px 11px",
                color: "var(--text-color)"
              }}
              onChange={e =>
                setNewGoal(ng => ({ ...ng, target: e.target.value }))
              }
            />
            <button
              className="btn"
              type="submit"
              style={{ fontWeight: 650, fontSize: 15, padding: "7px 16px" }}
            >
              Add
            </button>
            <button
              className="btn"
              type="button"
              style={{
                background: "var(--accent-dark)",
                color: "#202924",
                padding: "7px 12px",
                fontSize: 13,
                marginLeft: 8
              }}
              onClick={() => {
                setNewGoal({ title: "", target: "", icon: GOAL_ICONS[0] });
                setShowAdd(false);
              }}
            >
              Cancel
            </button>
          </form>
        ) : (
          <div style={{ marginBottom: 14 }}>
            <button
              className="btn"
              style={{ marginTop: 3, marginBottom: 2, padding: "10px 30px", fontWeight: 700, fontSize: 17 }}
              onClick={() => setShowAdd(true)}
              aria-label="Add new goal"
            >
              + Add New Goal
            </button>
          </div>
        )}

        {/* Active/In-progress goals */}
        {activeGoals.length === 0 && (
          <div className="eco-card" style={{ color: "var(--text-faint)", textAlign: "center" }}>
            No active goals! Add a new goal above.
          </div>
        )}
        {activeGoals.map((goal, i) => (
          <div key={goal.title + '-active'} className="eco-card" style={{
            display: "flex", alignItems: "center", gap: 17, marginBottom: 11
          }}>
            <div style={{ fontSize: "2em", minWidth: 39 }}>{goal.icon}</div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div style={{ fontWeight: 700, fontSize: 17, color: "var(--primary)" }}>
                {goal.title}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-faint)" }}>
                {goal.target} – <em>{goal.status || "Active"}</em>
              </div>
              {/* Progress ring/bar */}
              <div className="progress-bar-bg" style={{ height: 15, marginTop: 7 }}>
                <div
                  className="progress-bar-fg"
                  style={{
                    width: goal.progress + '%',
                    background: "var(--primary)"
                  }}
                />
              </div>
            </div>
            <div className="ml-sm" style={{
              fontWeight: 800,
              color: "var(--secondary)",
              minWidth: 46,
              textAlign: "center",
              fontSize: 15
            }}>
              {goal.progress}%
            </div>
            <div>
              <button
                className="btn"
                title="Increment progress"
                style={{
                  padding: "2px 10px",
                  fontSize: 14,
                  background: "var(--secondary)",
                  marginRight: 6
                }}
                aria-label="Increment progress"
                onClick={() => handleIncrement(goals.findIndex(g => g === goal))}
                disabled={goal.progress >= 100}
              >
                +10%
              </button>
              <button
                className="btn"
                title="Mark as complete"
                style={{
                  padding: " 2px 9px",
                  fontSize: 14,
                  background: goal.progress >= 100 ? "#d4ff99" : "var(--primary)",
                  color: goal.progress >= 100 ? "#537620" : "#fff"
                }}
                aria-label="Mark as complete"
                onClick={() => handleComplete(goals.findIndex(g => g === goal))}
                disabled={goal.progress >= 100}
              >
                {goal.progress >= 100 ? "Complete" : "Mark Complete"}
              </button>
            </div>
          </div>
        ))}

        {/* Completed goals */}
        {completedGoals.length > 0 && (
          <>
            <div style={{ fontWeight: 700, color: "var(--accent)", fontSize: 14, marginTop: 16, marginBottom: 5 }}>
              Completed Goals
            </div>
            {completedGoals.map((goal, i) => (
              <div key={goal.title + '-done'} className="eco-card" style={{
                display: "flex", alignItems: "center", gap: 17, marginBottom: 11, background: "#d4ff99", color: "#202924"
              }}>
                <div style={{ fontSize: "2em", minWidth: 39 }}>{goal.icon}</div>
                <div style={{ flex: 1, minWidth: 130 }}>
                  <div style={{ fontWeight: 700, fontSize: 17, color: "#223224" }}>
                    {goal.title}
                  </div>
                  <div style={{ fontSize: 13, color: "#537620" }}>
                    {goal.target} – <em>Achieved</em>
                  </div>
                  <div className="progress-bar-bg" style={{ height: 15, marginTop: 7 }}>
                    <div
                      className="progress-bar-fg"
                      style={{
                        width: "100%",
                        background: "#d4ff99"
                      }}
                    />
                  </div>
                </div>
                <div className="ml-sm" style={{
                  fontWeight: 800,
                  color: "#537620",
                  minWidth: 46,
                  textAlign: "center",
                  fontSize: 15
                }}>
                  100%
                </div>
                <button
                  className="btn"
                  style={{
                    background: "var(--accent-dark)",
                    color: "#202924",
                    fontWeight: 600,
                    fontSize: 13
                  }}
                  title="Remove goal"
                  aria-label="Remove goal"
                  onClick={() => handleRemove(goals.findIndex(g => g === goal))}
                >
                  Remove
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Tip/highlight area for feature explanation */}
      <div className="eco-highlight text-center">
        <div style={{fontWeight: 600, fontSize: 16}}>
          Set, update, and complete your climate action goals!
        </div>
        <div style={{fontSize:13, color:"var(--text-faint)"}}>
          Track your progress, mark achievements, and remove completed goals. All data is demo/mock and saved only in your session.
        </div>
      </div>

      <div className="mt-md" style={{fontSize:13, color:"var(--text-faint)", textAlign:"center"}}>
        Tip: Try adding a new goal, updating progress, or removing one after completion!
      </div>
    </div>
  );
}

export default GoalTracking;
