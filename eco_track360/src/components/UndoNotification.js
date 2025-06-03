import React, { useEffect, useRef } from 'react';

/**
 * PUBLIC_INTERFACE
 * UndoNotification component.
 * Shows a message with an Undo button for a limited time (default 5s).
 * Calls onUndo if user clicks 'Undo', or onClose after timeout or dismissal.
 */
function UndoNotification({ message, onUndo, onClose, duration = 5000 }) {
  const timerRef = useRef();

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(timerRef.current);
  }, [onClose, duration]);

  function handleUndo() {
    clearTimeout(timerRef.current);
    onUndo?.();
    onClose?.();
  }

  return (
    <div
      className="eco-highlight text-center"
      style={{
        position: 'fixed',
        bottom: 32,
        left: 0,
        right: 0,
        margin: 'auto',
        maxWidth: 410,
        zIndex: 9999,
        background: 'var(--secondary)',
        color: '#fff',
        fontWeight: 700,
        fontSize: 15,
        boxShadow: '0 6px 24px 0 rgb(26 40 32 / 17%)',
        borderRadius: 11,
        padding: '12px 16px',
        display: 'flex',
        gap: 18,
        alignItems: 'center',
        justifyContent: 'center'
      }}
      role="region"
      aria-live="polite"
      tabIndex={0}
    >
      <span>{message}</span>
      <button
        className="btn"
        style={{
          background: 'var(--primary)',
          color: '#fff',
          marginLeft: 10,
          fontWeight: 800,
          fontSize: 15,
          padding: '4px 22px'
        }}
        onClick={handleUndo}
        tabIndex={0}
        aria-label="Undo action"
      >
        Undo
      </button>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: '#fff',
          fontWeight: 900,
          fontSize: 19,
          marginLeft: 7,
          cursor: 'pointer'
        }}
        aria-label="Dismiss undo notification"
        tabIndex={0}
      >×</button>
    </div>
  );
}

export default UndoNotification;
