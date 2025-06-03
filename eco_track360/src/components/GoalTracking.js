import React, { useState } from 'react';
import UndoNotification from './UndoNotification';
import ConfirmationModal from './ConfirmationModal';

/**
 * PUBLIC_INTERFACE
 * GoalTracking lets users create and fully manage climate goals (CRUD: add, edit, and delete), plus progress management, using controlled inputs, input validation, and local React state only.
 */

const GOAL_ICONS = [
  "♻️","🌱","🚲","🥦","🏠","💡","🌲","🦶","🛍️","🥕"
];

// Demo initial goals
const INITIAL_GOALS = [
  {
    title: "Reduce carbon output by 20% this month",
    progress: 64,
    icon: "♻️",
    target: "20% less (monthly)",
    status: "Active",
  },
  {
    title: "Walk/bike to work 3x per week",
    progress: 100,
    icon: "🚲",
    target: "9 trips/mo",
    status: "Achieved",
  },
  {
    title: "Eat 100% plant-based 2 days/week",
    progress: 47,
    icon: "🥦",
    target: "8 of 17 days",
    status: "In Progress",
  },
];

// PUBLIC_INTERFACE
function GoalTracking() {
  // All goals (active and complete)
  const [goals, setGoals] = useState(INITIAL_GOALS);

  // State for Add Goal form
  const [addMode, setAddMode] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', target: '', icon: GOAL_ICONS[0] });
  const [addError, setAddError] = useState('');

  // State for Edit Goal form
  const [editIdx, setEditIdx] = useState(null); // which goal is in edit mode (or null)
  const [editGoal, setEditGoal] = useState(null);
  const [editError, setEditError] = useState('');

  // Undo and confirmation modals
  const [undoState, setUndoState] = useState(null); // {type:'remove'|'complete', goal, index}
  const [removeConfirm, setRemoveConfirm] = useState(null); // { idx, title }

  // PUBLIC_INTERFACE: Handle Add
  function handleAddGoal(e) {
    e.preventDefault();
    if (!newGoal.title.trim() || !newGoal.target.trim()) {
      setAddError('Goal title and target required.');
      return;
    }
    if (newGoal.title.length > 120) {
      setAddError('Title too long, must be under 120 characters.');
      return;
    }
    if (newGoal.target.length > 60) {
      setAddError('Target too long, must be under 60 characters.');
      return;
    }
    setGoals(oldGoals => [
      {
        title: newGoal.title.trim(),
        progress: 0,
        icon: newGoal.icon,
        target: newGoal.target.trim(),
        status: "Active",
      },
      ...oldGoals,
    ]);
    setNewGoal({ title: '', target: '', icon: GOAL_ICONS[0] });
    setAddError('');
    setAddMode(false);
  }

  // PUBLIC_INTERFACE: Handle Edit 
  function handleEditGoal(idx) {
    setEditIdx(idx);
    setEditGoal({ ...goals[idx] });
    setEditError('');
  }
  function handleEditSubmit(e) {
    e.preventDefault();
    if (!editGoal.title.trim() || !editGoal.target.trim()) {
      setEditError('Goal title and target required.');
      return;
    }
    if (editGoal.title.length > 120) {
      setEditError('Title too long, must be under 120 characters.');
      return;
    }
    if (editGoal.target.length > 60) {
      setEditError('Target too long, must be under 60 characters.');
      return;
    }
    setGoals(goals => goals.map((g, i) =>
      i === editIdx 
        ? { ...g, title: editGoal.title.trim(), target: editGoal.target.trim(), icon: editGoal.icon }
        : g
    ));
    setEditIdx(null);
    setEditGoal(null);
    setEditError('');
  }
  function handleEditCancel() {
    setEditGoal(null);
    setEditIdx(null);
    setEditError('');
  }

  // PUBLIC_INTERFACE: Delete (remove) goal
  function handleRemove(idx) {
    // Open confirm modal
    setRemoveConfirm({ idx, title: goals[idx]?.title });
  }
  function confirmRemoveGoal() {
    if (removeConfirm) {
      const idx = removeConfirm.idx;
      const goal = goals[idx];
      setUndoState({
        type: 'remove',
        goal: { ...goal },
        index: idx,
      });
      setGoals(goals => goals.filter((g, i) => i !== idx));
    }
    setRemoveConfirm(null);
  }
  function cancelRemoveGoal() {
    setRemoveConfirm(null);
  }

  // PUBLIC_INTERFACE: Mark a goal as complete
  function handleComplete(idx) {
    const goal = goals[idx];
    if (!goal || goal.progress === 100) return;
    setUndoState({
      type: 'complete',
      goal: { ...goal },
      index: idx,
      prevStatus: goal.status,
      prevProgress: goal.progress,
    });
    setGoals(gs => gs.map((g, i) =>
      i === idx && g.progress < 100
        ? { ...g, progress: 100, status: 'Achieved' }
        : g
    ));
  }

  // PUBLIC_INTERFACE: Increment progress (by 10, max 100)
  function handleIncrement(idx) {
    setGoals(goals => goals.map((g, i) =>
      i === idx && g.progress < 100
        ? {
            ...g,
            progress: Math.min(100, g.progress + 10),
            status: Math.min(100, g.progress + 10) === 100 ? 'Achieved' : 'In Progress',
          }
        : g
    ));
  }

  // Undo actions
  function handleUndo() {
    if (!undoState) return;
    if (undoState.type === 'remove') {
      setGoals(prev =>
        [
          ...prev.slice(0, undoState.index),
          undoState.goal,
          ...prev.slice(undoState.index),
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

  // Section for displaying goals
  const activeGoals = goals.filter(g => g.progress < 100);
  // const completedGoals = goals.filter(g => g.progress === 100);

  return (
    <div>
      {/* Undo notification */}
      {undoState && (
        <UndoNotification
          message={
            undoState.type === "remove"
              ? `Goal "${undoState.goal.title}" removed.`
              : `Marked "${undoState.goal.title}" as complete.`
          }
          onUndo={handleUndo}
          onClose={handleDismiss}
        />
      )}

      <h2 className="mb-md">Goal Tracking</h2>
      <div className="mb-md">
        {/* Add Goal: controlled form */}
        {addMode ? (
          <form
            className="eco-card"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 13,
              marginBottom: 11,
              flexWrap: "wrap",
            }}
            onSubmit={handleAddGoal}
            autoComplete="off"
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
                  setNewGoal(g => ({ ...g, icon: e.target.value }))
                }
              >
                {GOAL_ICONS.map(icn => (
                  <option key={icn} value={icn}>{icn}</option>
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
                setNewGoal(g => ({ ...g, title: e.target.value }))
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
                setNewGoal(g => ({ ...g, target: e.target.value }))
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
                setAddMode(false);
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
              onClick={() => setAddMode(true)}
              aria-label="Add new goal"
            >
              + Add New Goal
            </button>
          </div>
        )}

        {/* Show all goals with CRUD controls */}
        {goals.length === 0 && (
          <div className="eco-card" style={{ color: "var(--text-faint)", textAlign: "center" }}>
            No goals yet! Add a new goal above.
          </div>
        )}

        {/* List out ALL goals */}
        {goals.map((goal, i) => {
          const isCompleted = goal.progress === 100;
          // Edit mode for this item
          if (editIdx === i) {
            return (
              <form key={`goal-${i}-edit`}
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
                    style={{
                      fontSize: "1.2em", border: "none", background: "transparent", color: "var(--primary)"
                    }}
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

          // View (non-edit) mode
          return (
            <div
              key={`goal-${i}-view`}
              className="eco-card"
              style={{
                display: "flex", alignItems: "center", gap: 17, marginBottom: 10,
                background: isCompleted ? "#d4ff99" : undefined, color: isCompleted ? "#202924" : undefined
              }}
            >
              <div style={{ fontSize: "2em", minWidth: 39 }}>{goal.icon}</div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{
                  fontWeight: 700, fontSize: 17, color: isCompleted ? "#223224" : "var(--primary)"
                }}>
                  {goal.title}
                </div>
                <div style={{
                  fontSize: 13, color: isCompleted ? "#537620" : "var(--text-faint)"
                }}>
                  {goal.target} – <em>{isCompleted ? "Achieved" : (goal.status || "Active")}</em>
                </div>
                {/* Progress indicator */}
                <div className="progress-bar-bg" style={{ height: 15, marginTop: 7 }}>
                  <div
                    className="progress-bar-fg"
                    style={{
                      width: isCompleted ? "100%" : `${goal.progress}%`,
                      background: isCompleted ? "#d4ff99" : "var(--primary)"
                    }}
                  />
                </div>
              </div>
              <div className="ml-sm" style={{
                fontWeight: 800,
                color: isCompleted ? "#537620" : "var(--secondary)",
                minWidth: 46,
                textAlign: "center",
                fontSize: 15
              }}>
                {isCompleted ? "100%" : `${goal.progress}%`}
              </div>
              {!isCompleted && (
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
              )}
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
        })}
      </div>
      {/* Tips */}
      <div className="eco-highlight text-center">
        <div style={{ fontWeight: 600, fontSize: 16 }}>
          Set, update, edit and remove your climate action goals!
        </div>
        <div style={{ fontSize: 13, color: "var(--text-faint)" }}>
          Track your progress, mark achievements, remove or edit goals. All data is demo/mock and saved only in your session.
        </div>
      </div>
      <div className="mt-md" style={{ fontSize: 13, color: "var(--text-faint)", textAlign: "center" }}>
        Tip: Try adding, editing, or deleting a goal – or updating its progress!
      </div>
      {/* Modal for delete confirmation */}
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
