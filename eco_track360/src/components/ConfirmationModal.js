import React from 'react';

/**
 * PUBLIC_INTERFACE
 * ConfirmationModal provides a basic modal dialog for confirming destructive or one-way actions.
 */
function ConfirmationModal({ open, title, message, onConfirm, onCancel, confirmLabel = "Confirm", cancelLabel = "Cancel" }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(38, 64, 42, 0.55)",
        zIndex: 10002,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      tabIndex={-1}
    >
      <div
        className="eco-card"
        style={{
          minWidth: 310,
          maxWidth: 385,
          boxShadow: "0 2px 26px #0009",
          position: "relative",
          zIndex: 10003,
          background: "var(--surface)"
        }}
      >
        <div style={{
          fontWeight: 700,
          fontSize: 17,
          color: "var(--secondary)",
          marginBottom: 11
        }}
        id="confirm-modal-title"
        >
          {title}
        </div>
        <div style={{
          fontSize: 14.2,
          color: "var(--text-faint)",
          marginBottom: 21
        }}>
          {message}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button
            className="btn"
            style={{
              background: "var(--accent-dark)",
              color: "#202924",
              fontWeight: 700,
              fontSize: 14,
              padding: "8px 18px"
            }}
            onClick={onCancel}
            tabIndex={0}
          >
            {cancelLabel}
          </button>
          <button
            className="btn"
            style={{
              background: "var(--secondary)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              padding: "8px 18px"
            }}
            onClick={onConfirm}
            tabIndex={0}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
