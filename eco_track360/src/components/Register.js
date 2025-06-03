import React, { useState, useCallback } from "react";
import { useAuth } from "../AuthContext";
import LoadingSpinner from "./LoadingSpinner";
import ErrorBanner from "./ErrorBanner";

// PUBLIC_INTERFACE
export default function Register({ onToggle }) {
  const { register, loading, error, setAuthError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  // Helper for full reset
  const resetAll = useCallback(() => {
    setEmail("");
    setPassword("");
    setLocalError(null);
    setEmailError(null);
    setPasswordError(null);
    setAuthError && setAuthError(null); // clear AuthContext error on switch
  }, [setAuthError]);

  function validateEmail(val) {
    // Basic email regex
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val.trim());
  }
  function validatePassword(val) {
    // Minimum 8 chars, at least one letter, one number
    if (val.length < 8) return "Password must be at least 8 characters.";
    if (!/[a-zA-Z]/.test(val) || !/[0-9]/.test(val))
      return "Password must include both letters and numbers.";
    if (/^\s+$/.test(val)) return "Password cannot be blank spaces.";
    return null;
  }

  // Reset state on mount/unmount
  React.useEffect(() => {
    resetAll();
    // eslint-disable-next-line
  }, []);

  function handleSwitchToLogin() {
    resetAll();
    onToggle && onToggle();
  }

  // PUBLIC_INTERFACE
  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError(null);
    let anyError = false;

    // Validate email
    if (!email.trim()) {
      setEmailError("Email required.");
      anyError = true;
    } else if (!validateEmail(email)) {
      setEmailError("Invalid email format.");
      anyError = true;
    } else {
      setEmailError(null);
    }
    // Validate password strength
    const pwdErr = validatePassword(password);
    if (!password) {
      setPasswordError("Password required.");
      anyError = true;
    } else if (pwdErr) {
      setPasswordError(pwdErr);
      anyError = true;
    } else {
      setPasswordError(null);
    }

    if (anyError) {
      setLocalError("Please fix the form errors to continue.");
      return;
    }
    await register(email.trim(), password);
  }

  return (
    <div style={{ maxWidth: 400, margin: "80px auto 0" }}>
      <h2 style={{
        textAlign: "center",
        marginBottom: 22,
        color: "var(--primary)",
        letterSpacing: ".01em"
      }}>
        Register
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
              aria-describedby={emailError ? "register-email-error" : undefined}
            />
            {emailError && (
              <div
                id="register-email-error"
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
              autoComplete="new-password"
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                const val = e.target.value;
                if (!val) {
                  setPasswordError("Password required.");
                } else {
                  const valErr = validatePassword(val);
                  setPasswordError(valErr);
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
              minLength={8}
              aria-invalid={Boolean(passwordError)}
              aria-describedby={passwordError ? "register-password-error" : (error ? "register-password-backend-error" : "register-password-hint")}
            />
            {passwordError && (
              <div
                id="register-password-error"
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
            {/* Backend registration error, e.g. duplicate/conflict */}
            {error &&
              <div
                id="register-password-backend-error"
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
            {!passwordError && !error && (
              <div
                id="register-password-hint"
                style={{
                  color: "var(--text-faint)",
                  fontSize: 12,
                  marginTop: 3,
                  marginLeft: 2,
                  letterSpacing: ".01em"
                }}
              >
                Minimum 8 characters, include letters & numbers
              </div>
            )}
          </label>
        </div>
        {localError && <ErrorBanner message={localError} onClose={() => setLocalError(null)} />}
        <button
          className="btn"
          disabled={loading}
          type="submit"
          style={{ width: "100%", fontWeight: 700, fontSize: 17, marginTop: 6, marginBottom: 7 }}
        >
          {loading ? "Registering..." : "Register"}
        </button>
        <div style={{ marginTop: 17, textAlign: "center", fontSize: 15, color: "var(--text-faint)" }}>
          <span style={{ fontWeight: 400 }}>Already have an account?</span>
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
            onClick={handleSwitchToLogin}
            aria-label="Switch to log in"
            tabIndex={0}
          >
            Log in
          </button>
        </div>
      </form>
      {loading && <LoadingSpinner label="Registering..." />}
    </div>
  );
}
