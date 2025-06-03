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

/**
 * PUBLIC_INTERFACE
 * GoalTracking lets users create and view climate goals, and visually tracks progress.
 * Now enhanced: supports full CRUD (add, edit, delete) with robust controlled forms, validation, and immediate state/UI updates.
 */
function GoalTracking() {
  // Goal state
  const [goals, setGoals] = useState(INITIAL_GOALS);

  // Add form
  const [showAdd, setShowAdd] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: "", target: "", icon: GOAL_ICONS[0] });
  const [addError, setAddError] = useState(""); // error message for add

  // Edit state
  const [editIdx, setEditIdx] = useState(null); // index of goal being edited
  const [editGoal, setEditGoal] = useState(null);
  const [editError, setEditError] = useState("");

  // Undo/Confirm
  const [undoState, setUndoState] = useState(null); // for remove/complete
  const [removeConfirm, setRemoveConfirm] = useState(null); // { idx, title }

  // PUBLIC_INTERFACE
  // Add Goal with inline validation
  function handleAddGoal(e) {
    e.preventDefault();
    if (!newGoal.title.trim() || !newGoal.target.trim()) {
      setAddError("Goal title and target required.");
      return;
    }
    if (newGoal.title.length > 120) {
      setAddError("Title too long, must be under 120 characters.");
      return;
    }
    if (newGoal.target.length > 60) {
      setAddError("Target too long, must be under 60 characters.");
      return;
    }
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
    setAddError("");
    setNewGoal({ title: "", target: "", icon: GOAL_ICONS[0] });
    setShowAdd(false);
  }

  // PUBLIC_INTERFACE
  // Edit Goal: Show form for editIdx, allow editing title, target, icon with validation
  function handleEditGoal(idx) {
    setEditIdx(idx);
    setEditGoal({ ...goals[idx] });
    setEditError("");
  }
  function handleEditSubmit(e) {
    e.preventDefault();
    if (!editGoal.title.trim() || !editGoal.target.trim()) {
      setEditError("Goal title and target required.");
      return;
    }
    if (editGoal.title.length > 120) {
      setEditError("Title too long, must be under 120 characters.");
      return;
    }
    if (editGoal.target.length > 60) {
      setEditError("Target too long, must be under 60 characters.");
      return;
    }
    setGoals(goals =>
      goals.map((g, i) =>
        i === editIdx
          ? { ...g, title: editGoal.title, target: editGoal.target, icon: editGoal.icon }
          : g
      )
    );
    setEditIdx(null);
    setEditGoal(null);
    setEditError("");
  }
  function handleEditCancel() {
    setEditGoal(null);
    setEditIdx(null);
    setEditError("");
  }

  // PUBLIC_INTERFACE
  // Mark as complete
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
  // Increment progress
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

  // REMOVE/DELETE (works for both active and completed)
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

  // For rendering, split into active/in-progress and achieved goals
  const activeGoals = goals.filter((g, i) => g.progress < 100);
  const completedGoals = goals.filter((g, i) => g.progress === 100);

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
              maxLength={120}
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
              maxLength={60}
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
                setAddError("");
              }}
            >
              Cancel
            </button>
            {addError && (
              <div style={{ color: "#c0392b", fontSize: 13, flexBasis: "100%", marginTop: 3 }}>
                {addError}
              </div>
            )}
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
        {goals.map((goal, i) => {
          const isCompleted = goal.progress === 100;
          if (editIdx === i) {
            // Edit form UI
            return (
              <form key={goal.title + (isCompleted ? "-done" : "-active") + "-edit"}
                className="eco-card"
                style={{
                  display: "flex", alignItems: "center", gap: 13, marginBottom: 10, flexWrap: "wrap",
                  background: isCompleted ? "#f3ffec" : undefined, color: isCompleted ? "#202924" : undefined
                }}
                onSubmit={handleEditSubmit}
              >
                <span style={{ fontSize: "1.6em", minWidth: 40 }}>
                  <select
                    value={editGoal.icon}
                    aria-label="Goal icon"
                    style={{ fontSize: "1.2em", border: "none", background: "transparent", color: "var(--primary)" }}
                    onChange={e => setEditGoal(g => ({ ...g, icon: e.target.value }))}
                  >
                    {GOAL_ICONS.map(icn => (
                      <option key={icn} value={icn}>{icn}</option>
                    ))}
                  </select>
                </span>
                <input
                  type="text"
                  required
                  value={editGoal.title}
                  aria-label="Edit goal title"
                  style={{
                    flex: "3",
                    background: "var(--surface)",
                    border: "1.1px solid var(--card-border)",
                    borderRadius: 7,
                    padding: "5px 11px",
                    color: "var(--text-color)"
                  }}
                  onChange={e => setEditGoal(g => ({ ...g, title: e.target.value }))}
                  maxLength={120}
                />
                <input
                  type="text"
                  required
                  value={editGoal.target}
                  aria-label="Edit goal target"
                  style={{
                    flex: "2",
                    background: "var(--surface)",
                    border: "1.1px solid var(--card-border)",
                    borderRadius: 7,
                    padding: "5px 11px",
                    color: "var(--text-color)"
                  }}
                  onChange={e => setEditGoal(g => ({ ...g, target: e.target.value }))}
                  maxLength={60}
                />
                <button
                  className="btn"
                  type="submit"
                  style={{ fontWeight: 650, fontSize: 15, padding: "7px 15px" }}
                >
                  Save
                </button>
                <button
                  className="btn"
                  type="button"
                  style={{
                    background: "var(--accent-dark)",
                    color: "#202924",
                    padding: "7px 11px",
                    fontSize: 13,
                    marginLeft: 6
                  }}
                  onClick={handleEditCancel}
                >
                  Cancel
                </button>
                {editError && (
                  <div style={{ color: "#c0392b", fontSize: 13, flexBasis: "100%", marginTop: 3 }}>
                    {editError}
                  </div>
                )}
              </form>
            );
          }
          // Regular goal card
          if (!isCompleted) {
            // Active/in-progress
            return (
              <div key={goal.title + '-active'} className="eco-card" style={{
                display: "flex", alignItems: "center", gap: 17, marginBottom: 10
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
                      marginRight: 5
                    }}
                    aria-label="Increment progress"
                    onClick={() => handleIncrement(i)}
                    disabled={goal.progress >= 100}
                  >
                    +10%
                  </button>
                  <button
                    className="btn"
                    title="Mark as complete"
                    style={{
                      padding: "2px 9px",
                      fontSize: 14,
                      background: goal.progress >= 100 ? "#d4ff99" : "var(--primary)",
                      color: goal.progress >= 100 ? "#537620" : "#fff"
                    }}
                    aria-label="Mark as complete"
                    onClick={() => handleComplete(i)}
                    disabled={goal.progress >= 100}
                  >
                    {goal.progress >= 100 ? "Complete" : "Mark Complete"}
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <button
                    className="btn"
                    style={{
                      background: "var(--accent-dark)",
                      color: "#202924",
                      fontWeight: 600,
                      fontSize: 13,
                      marginTop: 2,
                      padding: "3px 12px"
                    }}
                    title="Edit goal"
                    aria-label="Edit goal"
                    onClick={() => handleEditGoal(i)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn"
                    style={{
                      background: "#fff0e0",
                      color: "#633220",
                      fontWeight: 600,
                      fontSize: 13,
                      marginTop: 2,
                      padding: "3px 12px",
                      border: "1.1px solid var(--accent-dark)"
                    }}
                    title="Delete goal"
                    aria-label="Delete goal"
                    onClick={() => handleRemove(i)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          } else {
            // Completed/achieved
            return (
              <div key={goal.title + '-done'} className="eco-card" style={{
                display: "flex", alignItems: "center", gap: 17, marginBottom: 10, background: "#d4ff99", color: "#202924"
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
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <button
                    className="btn"
                    style={{
                      background: "var(--accent-dark)",
                      color: "#202924",
                      fontWeight: 600,
                      fontSize: 13,
                      marginTop: 2,
                      padding: "3px 12px"
                    }}
                    title="Edit goal"
                    aria-label="Edit goal"
                    onClick={() => handleEditGoal(i)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn"
                    style={{
                      background: "#fff0e0",
                      color: "#633220",
                      fontWeight: 600,
                      fontSize: 13,
                      marginTop: 2,
                      padding: "3px 12px",
                      border: "1.1px solid var(--accent-dark)"
                    }}
                    title="Delete goal"
                    aria-label="Delete goal"
                    onClick={() => handleRemove(i)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          }
        })}
      </div>
      {/* Tips */}
      <div className="eco-highlight text-center">
        <div style={{fontWeight: 600, fontSize: 16}}>
          Set, update, edit and remove your climate action goals!
        </div>
        <div style={{fontSize:13, color:"var(--text-faint)"}}>
          Track your progress, mark achievements, remove or edit goals. All data is demo/mock and saved only in your session.
        </div>
      </div>
      <div className="mt-md" style={{fontSize:13, color:"var(--text-faint)", textAlign:"center"}}>
        Tip: Try adding, editing, or deleting a goal – or updating its progress!
      </div>
      {/* Confirmation dialog for destructive removal */}
      <ConfirmationModal
        open={!!removeConfirm}
        title="Delete Goal"
        message={`Are you sure you want to permanently delete the goal "${removeConfirm?.title}"? This cannot be undone.`}
        onCancel={cancelRemoveGoal}
        onConfirm={confirmRemoveGoal}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </div>
  );
}

export default GoalTracking;
