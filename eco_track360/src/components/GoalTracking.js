import React, { useState, useEffect } from 'react';
import UndoNotification from './UndoNotification';
import ConfirmationModal from './ConfirmationModal';
import LoadingSpinner from './LoadingSpinner';
import ErrorBanner from './ErrorBanner';
import { getGoals, addGoal, updateGoal, deleteGoal } from '../api';
import { useAuth } from '../AuthContext';

/**
 * PUBLIC_INTERFACE
 * GoalTracking allows users to persistently create, edit, complete, and remove personal climate goals using backend CRUD endpoints and requires authentication. UI reflects backend state, with loading/error feedback. Undo is optimistic (but syncs from server).
 */

const GOAL_ICONS = [
  "♻️", "🌱", "🚲", "🥦", "🏠", "💡", "🌲", "🦶", "🛍️", "🥕"
];

function GoalTracking() {
  const { authenticated } = useAuth();

  // State for backend goals
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  
  // Add/Edit Goal
  const [addMode, setAddMode] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', target: '', icon: GOAL_ICONS[0] });
  const [addErr, setAddErr] = useState('');
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editId, setEditId] = useState(null);   // goal.id or null
  const [editGoal, setEditGoal] = useState(null);
  const [editErr, setEditErr] = useState('');

  // Undo and dialog/feedback
  const [undoState, setUndoState] = useState(null); // {type, goal, id (goal.id)}
  const [removeConfirm, setRemoveConfirm] = useState(null); // { id, title }
  const [successMsg, setSuccessMsg] = useState('');
  const [actionError, setActionError] = useState('');

  // Fetch goals from backend
  useEffect(() => {
    if (!authenticated) return;
    setLoading(true);
    setLoadError('');
    getGoals()
      .then(gs => setGoals(Array.isArray(gs) ? gs : []))
      .catch(err => setLoadError(err?.message || "Failed to load goals."))
      .finally(() => setLoading(false));
  }, [authenticated]);

  // PUBLIC_INTERFACE: Add new goal via backend
  async function handleAddGoal(e) {
    e.preventDefault();
    setAddErr('');
    setActionError('');
    if (!newGoal.title.trim() || !newGoal.target.trim()) {
      setAddErr('Goal title and target required.');
      return;
    }
    if (newGoal.title.length > 120) {
      setAddErr('Title too long, must be under 120 characters.');
      return;
    }
    if (newGoal.target.length > 60) {
      setAddErr('Target too long, must be under 60 characters.');
      return;
    }
    setSaving(true);
    try {
      await addGoal({
        title: newGoal.title.trim(),
        target: newGoal.target.trim(),
        icon: newGoal.icon || GOAL_ICONS[0],
      });
      setNewGoal({ title: '', target: '', icon: GOAL_ICONS[0] });
      setAddMode(false);
      setSuccessMsg('Goal added!');
      // Reload from backend
      const gs = await getGoals();
      setGoals(Array.isArray(gs) ? gs : []);
    } catch (err) {
      setAddErr(err?.message || 'Failed to add goal.');
    } finally {
      setSaving(false);
    }
  }

  // PUBLIC_INTERFACE: Begin edit mode for a goal
  function handleEditGoal(goal) {
    setEditId(goal.id);
    setEditGoal({ ...goal });
    setEditErr('');
    setActionError('');
  }

  // PUBLIC_INTERFACE: Save edits to backend
  async function handleEditSubmit(e) {
    e.preventDefault();
    setEditErr('');
    setActionError('');
    if (!editGoal.title.trim() || !editGoal.target.trim()) {
      setEditErr('Goal title and target required.');
      return;
    }
    if (editGoal.title.length > 120) {
      setEditErr('Title too long, must be under 120 characters.');
      return;
    }
    if (editGoal.target.length > 60) {
      setEditErr('Target too long, must be under 60 characters.');
      return;
    }
    setSaving(true);
    try {
      await updateGoal(editId, {
        title: editGoal.title.trim(),
        target: editGoal.target.trim(),
        icon: editGoal.icon
      });
      setEditId(null);
      setEditGoal(null);
      setSuccessMsg('Goal updated!');
      // Reload latest from backend
      const gs = await getGoals();
      setGoals(Array.isArray(gs) ? gs : []);
    } catch (err) {
      setEditErr(err?.message || "Failed to update goal.");
    } finally {
      setSaving(false);
    }
  }
  function handleEditCancel() {
    setEditId(null);
    setEditGoal(null);
    setEditErr('');
  }

  // PUBLIC_INTERFACE: Mark goal as complete (progress 100)
  async function handleComplete(goal) {
    setSaving(true);
    setActionError('');
    try {
      await updateGoal(goal.id, { progress: 100, status: 'Achieved' });
      setSuccessMsg('Goal marked complete!');
      const gs = await getGoals();
      setGoals(Array.isArray(gs) ? gs : []);
    } catch (err) {
      setActionError(err?.message || "Failed to complete goal.");
    } finally {
      setSaving(false);
    }
  }
  // Increment progress by 10 up to 100, and update
  async function handleIncrement(goal) {
    if (goal.progress >= 100) return;
    const newProg = Math.min(100, (goal.progress || 0) + 10);
    const newStatus = newProg === 100 ? 'Achieved' : 'In Progress';
    setSaving(true);
    setActionError('');
    try {
      await updateGoal(goal.id, { progress: newProg, status: newStatus });
      setSuccessMsg('Progress updated!');
      const gs = await getGoals();
      setGoals(Array.isArray(gs) ? gs : []);
    } catch (err) {
      setActionError(err?.message || "Failed to update progress.");
    } finally {
      setSaving(false);
    }
  }

  // PUBLIC_INTERFACE: Delete (remove) goal (confirm)
  function handleRemove(goal) {
    setRemoveConfirm({ id: goal.id, title: goal.title });
    setActionError('');
  }
  async function confirmRemoveGoal() {
    if (!removeConfirm) return;
    setSaving(true);
    setActionError('');
    try {
      // Save a snapshot for optimistic undo
      const removedGoal = goals.find(g => g.id === removeConfirm.id);
      setUndoState({ type: 'remove', goal: removedGoal, id: removeConfirm.id });
      await deleteGoal(removeConfirm.id);
      setSuccessMsg('Goal deleted.');
      const gs = await getGoals();
      setGoals(Array.isArray(gs) ? gs : []);
    } catch (err) {
      setActionError(err?.message || "Failed to delete goal.");
    } finally {
      setSaving(false);
      setRemoveConfirm(null);
    }
  }
  function cancelRemoveGoal() {
    setRemoveConfirm(null);
  }

  // PUBLIC_INTERFACE: Undo (re-add removed or revert complete)
  async function handleUndo() {
    if (!undoState) return;
    setSaving(true);
    setActionError('');
    try {
      if (undoState.type === 'remove') {
        // Re-insert the removed goal as a new entry (may get new id)
        const { goal } = undoState;
        await addGoal({
          title: goal.title, target: goal.target, icon: goal.icon,
          progress: goal.progress, status: goal.status
        });
      }
      // (Could implement undo of Complete with updateGoal here if needed)
      setSuccessMsg('Undo successful');
      const gs = await getGoals();
      setGoals(Array.isArray(gs) ? gs : []);
    } catch (err) {
      setActionError('Undo failed: ' + (err?.message || ''));
    } finally {
      setSaving(false);
      setUndoState(null);
    }
  }
  function handleDismiss() {
    setUndoState(null);
    setSuccessMsg('');
    setActionError('');
  }

  // Hide UI if not authenticated
  if (!authenticated) {
    return (
      <div>
        <h2 className="mb-md">Goal Tracking</h2>
        <div className="eco-card" style={{
          color: "var(--accent-dark)",
          textAlign: "center",
          margin: "30px auto",
          maxWidth: 400,
          fontSize: 16,
        }}>
          You must be logged in to view or manage your goals.
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Undo feedback */}
      {undoState && (
        <UndoNotification
          message={
            undoState.type === 'remove'
              ? `Goal "${undoState.goal?.title}" removed.`
              : `Action undone.`
          }
          onUndo={handleUndo}
          onClose={handleDismiss}
        />
      )}

      {successMsg && (
        <div
          style={{
            background: "linear-gradient(90deg, #bbefc0 80%, #cdffe2 100%)",
            color: "#202924",
            fontWeight: 660,
            borderRadius: 9,
            padding: "12px 16px",
            margin: "11px 0 13px 0",
            textAlign: "center",
            fontSize: 15,
            border: "1.3px solid var(--primary)",
            boxShadow: "0 2px 16px #2e7d3234",
            maxWidth: 420,
            marginLeft: "auto', marginRight: 'auto"
          }}
          role="status"
          aria-live="polite"
        >
          {successMsg}
          <button
            style={{
              marginLeft: 16,
              background: "none",
              border: "none",
              fontWeight: 900,
              color: "#2e7d32",
              fontSize: 19,
              cursor: "pointer",
              verticalAlign: "middle",
            }}
            title="Dismiss"
            aria-label="Dismiss success notification"
            onClick={() => setSuccessMsg("")}
            tabIndex={0}
          >×</button>
        </div>
      )}

      {/* Global error or load error */}
      {(actionError || loadError) && (
        <ErrorBanner
          message={actionError || loadError}
          onClose={() => {
            setActionError('');
            setLoadError('');
          }}
        />
      )}

      {loading ? (
        <div style={{textAlign: "center", marginTop: 43}}>
          <LoadingSpinner />
          <div style={{ marginTop: 9, color: "var(--accent)" }}>Loading goals...</div>
        </div>
      ) : (
      <>
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
              disabled={saving}
            />
            <button
              className="btn"
              type="submit"
              style={{ fontWeight: 650, fontSize: 15, padding: "7px 16px" }}
              disabled={saving}
            >
              {saving ? "Saving..." : "Add"}
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
                setAddErr("");
              }}
              disabled={saving}
            >
              Cancel
            </button>
            {addErr && (
              <div style={{ color: "#c0392b", fontSize: 13, flexBasis: "100%", marginTop: 3 }}>
                {addErr}
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
              disabled={saving}
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

        {/* List ALL goals */}
        {goals.map((goal, i) => {
          const isCompleted = goal.progress === 100;
          // Edit mode for this goal
          if (editId === goal.id) {
            return (
              <form key={`goal-${goal.id}-edit`}
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
                  disabled={saving}
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
                  disabled={saving}
                />
                <button
                  className="btn"
                  type="submit"
                  style={{ fontWeight: 650, fontSize: 15, padding: "7px 15px" }}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
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
                  disabled={saving}
                >
                  Cancel
                </button>
                {editErr && (
                  <div style={{ color: "#c0392b", fontSize: 13, flexBasis: "100%", marginTop: 3 }}>
                    {editErr}
                  </div>
                )}
              </form>
            );
          }
          // View (non-edit) mode
          return (
            <div
              key={goal.id}
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
                {isCompleted ? "100%" : `${goal.progress || 0}%`}
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
                    onClick={() => handleIncrement(goal)}
                    disabled={goal.progress >= 100 || saving}
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
                    onClick={() => handleComplete(goal)}
                    disabled={goal.progress >= 100 || saving}
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
                  onClick={() => handleEditGoal(goal)}
                  disabled={saving}
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
                  onClick={() => handleRemove(goal)}
                  disabled={saving}
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
          Track your progress, mark achievements, remove or edit goals. All changes are securely saved to your account.
        </div>
      </div>
      <div className="mt-md" style={{ fontSize: 13, color: "var(--text-faint)", textAlign: "center" }}>
        Tip: Try adding, editing, deleting, or updating your goal progress!
      </div>
      <ConfirmationModal
        open={!!removeConfirm}
        title="Delete Goal"
        message={`Are you sure you want to permanently delete the goal "${removeConfirm?.title}"? This cannot be undone.`}
        onCancel={cancelRemoveGoal}
        onConfirm={confirmRemoveGoal}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
      </>
      )}
    </div>
  );
}

export default GoalTracking;

