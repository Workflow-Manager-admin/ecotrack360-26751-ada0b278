import React, { useState, useCallback } from "react";
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

  // Call this to fully reset all form state (including external/global error)
  const resetAll = useCallback(() => {
    setEmail("");
    setPassword("");
    setLocalError(null);
    setEmailError(null);
    setPasswordError(null);
    setAuthError && setAuthError(null); // clear AuthContext error if present
  }, [setAuthError]);

  function validateEmail(val) {
    // Simple regex for email validation
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val.trim());
  }

  function validatePassword(val) {
    // Minimum 6 chars required for login (register is stricter)
    return val.length >= 6;
  }

  // Ensure state always resets fully on mount/unmount of this component
  React.useEffect(() => {
    resetAll();
    // eslint-disable-next-line
  }, []);

  // PUBLIC_INTERFACE: Also reset if user clicks the "Register" link
  function handleSwitchToRegister() {
    resetAll();
    onToggle && onToggle();
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

  // We want backend error to show under password input in a distinct banner style, but inside the form
  return (
    <div style={{ maxWidth: 400, margin: "80px auto 0" }}>
      <h2 style={{
        textAlign: "center",
        marginBottom: 22,
        color: "var(--primary)",
        letterSpacing: ".01em"
      }}>
        Sign In
      </h2>
      <form className="eco-card" onSubmit={handleSubmit} style={{ padding: 26 }}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 600 }}>
            Email:
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                // Live validate on change
                if (!e.target.value.trim()) {
                  setEmailError("Email required.");
                } else if (!validateEmail(e.target.value)) {
                  setEmailError("Invalid email format.");
                } else {
                  setEmailError(null);
                }
                setLocalError(null);
                setAuthError && setAuthError(null);
              }}
              style={{
                display: "block",
                width: "100%",
                marginTop: 6,
                padding: "8px 13px",
                borderRadius: 6,
                border: `1.4px solid ${emailError ? "#b8002b" : "var(--card-border)"}`,
                background: "var(--background)",
                color: "var(--text-color)",
                fontSize: 16
              }}
              required
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? "login-email-error" : undefined}
            />
            {emailError && (
              <div
                id="login-email-error"
                style={{
                  color: "#b8002b",
                  fontSize: 13,
                  marginTop: 3,
                  marginLeft: 2,
                  letterSpacing: ".01em"
                }}
                role="alert"
              >
                {emailError}
              </div>
            )}
          </label>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 600 }}>
            Password:
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                if (!e.target.value) {
                  setPasswordError("Password required.");
                } else if (!validatePassword(e.target.value)) {
                  setPasswordError("Password must be at least 6 characters.");
                } else {
                  setPasswordError(null);
                }
                setLocalError(null);
                setAuthError && setAuthError(null);
              }}
              style={{
                display: "block",
                width: "100%",
                marginTop: 6,
                padding: "8px 13px",
                borderRadius: 6,
                border: `1.4px solid ${passwordError ? "#b8002b" : "var(--card-border)"}`,
                background: "var(--background)",
                color: "var(--text-color)",
                fontSize: 16
              }}
              required
              minLength={6}
              aria-invalid={Boolean(passwordError)}
              aria-describedby={passwordError ? "login-password-error" : (error ? "login-password-backend-error" : undefined)}
            />
            {passwordError && (
              <div
                id="login-password-error"
                style={{
                  color: "#b8002b",
                  fontSize: 13,
                  marginTop: 3,
                  marginLeft: 2,
                  letterSpacing: ".01em"
                }}
                role="alert"
              >
                {passwordError}
              </div>
            )}

            {/* Backend error for password (login failure, etc.): show directly below, very visible */}
            {error &&
              <div
                id="login-password-backend-error"
                style={{
                  color: "#fff",
                  background: "#b8002b",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  marginTop: 8,
                  marginLeft: 0,
                  fontSize: 14.3,
                  fontWeight: 600,
                  letterSpacing: ".01em",
                  boxShadow: "0 4px 24px #1a1a1a13"
                }}
                role="alert"
                aria-live="polite"
              >
                {error}
                <button
                  type="button"
                  onClick={() => setAuthError(null)}
                  style={{
                    marginLeft: 14,
                    color: "#fff",
                    background: "none",
                    border: "none",
                    fontSize: 17,
                    fontWeight: 900,
                    cursor: "pointer",
                    verticalAlign: "middle"
                  }}
                  aria-label="Dismiss error"
                >
                  ×
                </button>
              </div>
            }
          </label>
        </div>
        {/* Other client/local errors */}
        {localError && <ErrorBanner message={localError} onClose={() => setLocalError(null)} />}
        <button
          className="btn"
          disabled={loading}
          type="submit"
          style={{ width: "100%", fontWeight: 700, fontSize: 17, marginTop: 6, marginBottom: 7 }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <div style={{ marginTop: 17, textAlign: "center", fontSize: 15, color: "var(--text-faint)" }}>
          <span style={{ fontWeight: 400 }}>No account yet?</span>
          <button
            type="button"
            className="btn"
            style={{
              background: "var(--secondary)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              padding: "6px 24px",
              marginLeft: 12,
              borderRadius: 7,
              marginTop: -2,
              boxShadow: "0 1.5px 10px #1976d236"
            }}
            onClick={handleSwitchToRegister}
            aria-label="Switch to register"
            tabIndex={0}
          >
            Register
          </button>
        </div>
      </form>
      {loading && <LoadingSpinner label="Authenticating..." />}
    </div>
  );
}
