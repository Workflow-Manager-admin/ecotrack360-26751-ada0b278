import React, { useState } from "react";
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
      <h2 style={{ textAlign: "center", marginBottom: 22, color: "var(--primary)" }}>Register</h2>
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
              autoComplete="new-password"
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
          {loading ? "Registering..." : "Register"}
        </button>
        <div style={{ marginTop: 7, textAlign: "center", fontSize: 13, color: "var(--text-faint)" }}>
          Already have an account?{" "}
          <button
            type="button"
            className="btn"
            style={{ background: "var(--accent-dark)", color: "#202924", fontWeight: 650, fontSize: 13, padding: 6 }}
            onClick={onToggle}
          >
            Sign In
          </button>
        </div>
      </form>
      {loading && <LoadingSpinner label="Registering..." />}
    </div>
  );
}
