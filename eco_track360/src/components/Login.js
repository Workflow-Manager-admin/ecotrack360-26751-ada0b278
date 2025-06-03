import React, { useState } from "react";
import { useAuth } from "../AuthContext";
import LoadingSpinner from "./LoadingSpinner";
import ErrorBanner from "./ErrorBanner";

// PUBLIC_INTERFACE
export default function Login({ onToggle }) {
  const { login, loading, error, setAuthError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  function validateEmail(val) {
    // Simple regex for email validation
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val.trim());
  }

  function validatePassword(val) {
    // Minimum 6 chars required for login (register is stricter)
    return val.length >= 6;
  }

  // PUBLIC_INTERFACE
  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError(null);
    let anyError = false;

    // Email validation
    if (!email.trim()) {
      setEmailError("Email required.");
      anyError = true;
    } else if (!validateEmail(email)) {
      setEmailError("Invalid email format.");
      anyError = true;
    } else {
      setEmailError(null);
    }
    // Password validation
    if (!password) {
      setPasswordError("Password required.");
      anyError = true;
    } else if (!validatePassword(password)) {
      setPasswordError("Password must be at least 6 characters.");
      anyError = true;
    } else {
      setPasswordError(null);
    }

    if (anyError) {
      setLocalError("Please fix the form errors to continue.");
      return;
    }
    await login(email.trim(), password);
  }

  return (
    <div style={{ maxWidth: 400, margin: "80px auto 0" }}>
      <h2 style={{ textAlign: "center", marginBottom: 22, color: "var(--primary)" }}>Sign In</h2>
      <form className="eco-card" onSubmit={handleSubmit} style={{ padding: 26 }}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 600 }}>
            Email:
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                display: "block", width: "100%", marginTop: 6, padding: "8px 13px",
                borderRadius: 6, border: "1.4px solid var(--card-border)",
                background: "var(--background)", color: "var(--text-color)", fontSize: 16
              }}
              required
            />
          </label>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 600 }}>
            Password:
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                display: "block", width: "100%", marginTop: 6, padding: "8px 13px",
                borderRadius: 6, border: "1.4px solid var(--card-border)",
                background: "var(--background)", color: "var(--text-color)", fontSize: 16
              }}
              required
            />
          </label>
        </div>
        {localError && <ErrorBanner message={localError} onClose={() => setLocalError(null)} />}
        {error && <ErrorBanner message={error} onClose={() => setAuthError(null)} />}
        <button
          className="btn"
          disabled={loading}
          type="submit"
          style={{ width: "100%", fontWeight: 700, fontSize: 17, marginTop: 6, marginBottom: 7 }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <div style={{ marginTop: 7, textAlign: "center", fontSize: 13, color: "var(--text-faint)" }}>
          No account yet?{" "}
          <button
            type="button"
            className="btn"
            style={{ background: "var(--accent-dark)", color: "#202924", fontWeight: 650, fontSize: 13, padding: 6 }}
            onClick={onToggle}
          >
            Register
          </button>
        </div>
      </form>
      {loading && <LoadingSpinner label="Authenticating..." />}
    </div>
  );
}
