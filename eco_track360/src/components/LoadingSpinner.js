import React from "react";

// PUBLIC_INTERFACE
export default function LoadingSpinner({ style = {}, label = "Loading..." }) {
  return (
    <div style={{
      display: "flex", justifyContent: "center", alignItems: "center",
      minHeight: 60, ...style
    }}>
      <span className="eco-spinner"
        style={{
          width: 29, height: 29, border: "4px solid var(--accent-dark)", borderTop: "4px solid var(--primary)",
          borderRadius: "50%", display: "inline-block", animation: "spin-eco 1s linear infinite", marginRight: 13
        }}
        aria-label="Loading spinner"
      ></span>
      <span style={{ color: "var(--accent)", fontWeight: 600, fontSize: 16 }}>{label}</span>
      <style>
        {`
        @keyframes spin-eco {to{transform: rotate(360deg);} }
        `}
      </style>
    </div>
  );
}
