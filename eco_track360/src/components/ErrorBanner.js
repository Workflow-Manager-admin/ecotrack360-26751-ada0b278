import React from "react";

// PUBLIC_INTERFACE
export default function ErrorBanner({ message, onClose }) {
  if (!message) return null;
  return (
    <div
      className="eco-highlight text-center"
      style={{
        margin: "16px auto", maxWidth: 420, background: "#a21f1f",
        color: "#fff", fontWeight: 700, borderRadius: 12, fontSize: 15, padding: "13px 16px", position: "relative"
      }}
      role="alert"
    >
      <span>{message}</span>
      {onClose && (<button
        style={{
          position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)",
          background: "none", border: "none", color: "#fff", fontWeight: 900,
          fontSize: 18, cursor: "pointer"
        }}
        aria-label="Dismiss error"
        onClick={onClose}
        tabIndex={0}
      >×</button>)}
    </div>
  );
}
