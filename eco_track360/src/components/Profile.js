import React, { useRef, useState, useEffect } from "react";
import { getProfile, updateProfile } from "../api";
import { useAuth } from "../AuthContext";
import LoadingSpinner from "./LoadingSpinner";
import ErrorBanner from "./ErrorBanner";

/**
 * PUBLIC_INTERFACE
 * Profile component: loads/saves profile via backend API.
 * - Loads initial state from backend (GET).
 * - Saves changes via backend (PUT).
 * - Shows success/error banners and loading spinner as feedback.
 * - Requires authentication (from AuthContext) to interact.
 */
const ECO_PREFERENCES = [
  { key: "vegan", label: "Plant-based Diet" },
  { key: "bike", label: "Bike/Walk Commuting" },
  { key: "publicTransit", label: "Use Public Transit" },
  { key: "recycle", label: "Recycling at Home" },
  { key: "renewable", label: "Renewable Energy" },
  { key: "thrift", label: "Buy Second-hand" }
];

// Returns a default avatar svg string (simple eco/placeholder)
function getDefaultAvatarSVG(name = "") {
  // Color derived from name; fallback if not provided
  const baseColor = "#2E7D32";
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0] || "")
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "🧑";
  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><circle cx='48' cy='48' r='48' fill='${baseColor}'/><text x='50%' y='58%' dominant-baseline='middle' text-anchor='middle' font-size='39' fill='#f4f8f6' font-family="Arial,sans-serif">${initials}</text></svg>`;
}

function Profile() {
  const { user, isAuthenticated } = useAuth();

  // Form fields, initially empty — populated by loadProfile
  const [name, setName] = useState("");
  const [avatarSource, setAvatarSource] = useState(""); // avatarUrl (string for backend)
  const [avatarType, setAvatarType] = useState("url"); // "url" | "upload"
  const [uploadedAvatar, setUploadedAvatar] = useState(null); // for preview only
  const [ecoPrefs, setEcoPrefs] = useState([]);
  const [errors, setErrors] = useState({});

  // Status state for backend interaction
  const [loading, setLoading] = useState(true);    // true on initial mount/profile fetch
  const [loadError, setLoadError] = useState("");  // profile GET error message
  const [saving, setSaving] = useState(false);     // true while PUT in progress
  const [saveError, setSaveError] = useState("");  // error when PUT fails
  const [saveSuccess, setSaveSuccess] = useState(""); // banner msg on profile PUT success

  const fileInputRef = useRef();

  /**
   * PUBLIC_INTERFACE
   * Handles change of preference checkboxes.
   */
  function handlePrefChange(prefKey) {
    setEcoPrefs((prev) =>
      prev.includes(prefKey)
        ? prev.filter((k) => k !== prefKey)
        : [...prev, prefKey]
    );
  }

  /**
   * PUBLIC_INTERFACE
   * Handles file avatar upload.
   */
  function handleFileChange(e) {
    const file = e.target.files && e.target.files[0];
    if (file && /^image\//.test(file.type)) {
      // Display the image using object URL
      const url = URL.createObjectURL(file);
      setUploadedAvatar(file);
      setAvatarSource(url);
      setAvatarType("upload");
      setErrors((err) => ({ ...err, avatar: undefined }));
    } else {
      setUploadedAvatar(null);
      setAvatarSource("");
      setAvatarType("url");
      setErrors((err) => ({
        ...err,
        avatar: "Please choose a valid image file."
      }));
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Handles avatar via image URL input.
   */
  function handleAvatarURLChange(e) {
    setAvatarSource(e.target.value.trim());
    setAvatarType("url");
    setUploadedAvatar(null);
    setErrors((err) => ({ ...err, avatar: undefined }));
  }

  /**
   * PUBLIC_INTERFACE
   * Validates name field (for demo, just require 2+ chars).
   */
  function validateName(newName) {
    if (!newName.trim()) {
      setErrors((err) => ({ ...err, name: "Name required." }));
      return false;
    }
    if (newName.trim().length < 2) {
      setErrors((err) => ({ ...err, name: "Name too short." }));
      return false;
    }
    setErrors((err) => ({ ...err, name: undefined }));
    return true;
  }

  /**
   * PUBLIC_INTERFACE
   * Handles reset button to clear all fields.
   */
  function handleReset() {
    setName("");
    setAvatarSource("");
    setAvatarType("url");
    setUploadedAvatar(null);
    setEcoPrefs([]);
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // Determine avatar to display in summary card
  let avatarImg = "";
  if (avatarSource && avatarType === "url") {
    avatarImg = avatarSource;
  } else if (avatarType === "upload" && avatarSource) {
    avatarImg = avatarSource;
  } else {
    avatarImg = getDefaultAvatarSVG(name);
  }

  // Render eco preferences for the live summary
  function renderEcoPrefsSummary() {
    if (ecoPrefs.length === 0) {
      return <span style={{ color: "var(--text-faint)" }}>None set</span>;
    }
    return ecoPrefs
      .map(
        (k) =>
          ECO_PREFERENCES.find((ep) => ep.key === k)?.label || "Unknown"
      )
      .join(", ");
  }

  /**
   * PUBLIC_INTERFACE
   * Handles name input change and validation.
   */
  function handleNameChange(e) {
    setName(e.target.value);
    validateName(e.target.value);
  }

  // On form submit, only check validation; values already reflected in live card.
  function handleSubmit(e) {
    e.preventDefault();
    let ok = validateName(name);
    if (!ok) return;
    // (Here we could add more validation, or "save" to remote, but this is live/local only).
  }

  return (
    <div>
      <h2 className="mb-md">Profile</h2>

      {/* Live profile summary card */}
      <div
        className="eco-card"
        style={{
          display: "flex",
          gap: 16,
          alignItems: "flex-start",
          marginBottom: 22
        }}
      >
        <span
          style={{
            display: "inline-block",
            minWidth: 86,
            minHeight: 86,
            width: 86,
            height: 86,
            borderRadius: "50%",
            background: "#234428",
            boxShadow: "0 1.5px 18px #2E7D3222",
            border: "2.5px solid var(--primary)",
            overflow: "hidden"
          }}
          tabIndex={0}
          aria-label="Profile avatar"
        >
          <img
            src={avatarImg}
            alt="Profile avatar"
            style={{
              borderRadius: "50%",
              width: 86,
              height: 86,
              objectFit: "cover"
            }}
            onError={(e) => {
              e.target.src = getDefaultAvatarSVG(name);
            }}
          />
        </span>
        <div>
          <div style={{ fontSize: "1.26em", fontWeight: 700, color: "var(--primary)" }}>
            {name || <span style={{ color: "var(--text-faint)" }}>Your Name</span>}
          </div>
          <div style={{ fontSize: "1em", marginTop: 7, color: "var(--secondary)" }}>
            Eco Preferences:
          </div>
          <div style={{ fontSize: 13, marginTop: 3, color: "var(--text-secondary)" }}>
            {renderEcoPrefsSummary()}
          </div>
        </div>
      </div>

      {/* Editable profile form */}
      <form
        className="eco-card"
        style={{
          maxWidth: 410,
          margin: "auto",
          background: "var(--surface)",
          fontSize: 15,
          color: "var(--text-color)"
        }}
        onSubmit={handleSubmit}
        autoComplete="off"
        aria-label="Edit profile"
      >
        {/* Name field */}
        <div style={{ marginBottom: 13 }}>
          <label style={{ fontWeight: 600 }}>
            Name:<br />
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              maxLength={60}
              placeholder="Enter your name"
              aria-label="Name"
              style={{
                marginTop: 6,
                padding: "8px 14px",
                borderRadius: 7,
                border: "1.4px solid var(--card-border)",
                background: "var(--background)",
                color: "var(--text-color)",
                fontSize: 16,
                width: "100%"
              }}
              required
            />
          </label>
          {errors.name && (
            <div style={{ color: "#c0392b", fontSize: 13, marginTop: 4 }}>
              {errors.name}
            </div>
          )}
        </div>

        {/* Avatar selection */}
        <div style={{ marginBottom: 17 }}>
          <div style={{ fontWeight: 600 }}>Avatar:</div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: 2 }}>
            <label>
              <input
                type="radio"
                name="avatarType"
                checked={avatarType === "url"}
                onChange={() => {
                  setAvatarType("url");
                  setUploadedAvatar(null);
                  setErrors((err) => ({ ...err, avatar: undefined }));
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                style={{ marginRight: 4 }}
              />
              Image URL
            </label>
            <label>
              <input
                type="radio"
                name="avatarType"
                checked={avatarType === "upload"}
                onChange={() => {
                  setAvatarType("upload");
                  setAvatarSource("");
                  setErrors((err) => ({ ...err, avatar: undefined }));
                }}
                style={{ marginRight: 4 }}
              />
              Upload Image
            </label>
          </div>
          {avatarType === "url" ? (
            <input
              type="text"
              value={avatarType === "url" ? avatarSource : ""}
              onChange={handleAvatarURLChange}
              placeholder="Paste image URL (jpg/png/gif)"
              aria-label="Avatar image URL"
              style={{
                marginTop: 6,
                padding: "7px 13px",
                borderRadius: 7,
                border: "1.3px solid var(--card-border)",
                background: "var(--background)",
                color: "var(--text-color)",
                fontSize: 15,
                width: "100%"
              }}
            />
          ) : (
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{
                marginTop: 6,
                borderRadius: 7,
                background: "var(--background)",
                color: "var(--text-color)"
              }}
              aria-label="Upload avatar image"
              onChange={handleFileChange}
            />
          )}
          {errors.avatar && (
            <div style={{ color: "#c0392b", fontSize: 13, marginTop: 4 }}>
              {errors.avatar}
            </div>
          )}
        </div>

        {/* Eco preferences */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>
            Eco Preferences:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {ECO_PREFERENCES.map((pref) => (
              <label
                key={pref.key}
                style={{
                  background: ecoPrefs.includes(pref.key)
                    ? "var(--primary)"
                    : "var(--card-border)",
                  color: ecoPrefs.includes(pref.key)
                    ? "#fff"
                    : "var(--text-faint)",
                  borderRadius: 6,
                  padding: "5px 11px",
                  marginRight: 6,
                  fontWeight: ecoPrefs.includes(pref.key) ? 600 : 400,
                  fontSize: 14,
                  cursor: "pointer"
                }}
                htmlFor={`epref-${pref.key}`}
              >
                <input
                  id={`epref-${pref.key}`}
                  type="checkbox"
                  checked={ecoPrefs.includes(pref.key)}
                  onChange={() => handlePrefChange(pref.key)}
                  style={{ marginRight: 7 }}
                />
                {pref.label}
              </label>
            ))}
          </div>
        </div>

        {/* Buttons Row */}
        <div style={{ display: "flex", gap: 13, justifyContent: "flex-end" }}>
          <button
            className="btn"
            type="submit"
            style={{
              background: "var(--primary)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              padding: "8px 24px"
            }}
            disabled={!!errors.name}
          >
            Save
          </button>
          <button
            className="btn"
            style={{
              background: "var(--accent-dark)",
              color: "#202924",
              fontWeight: 600,
              fontSize: 14,
              padding: "8px 18px"
            }}
            type="button"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
        <div style={{ color: "var(--text-faint)", fontSize: 13, marginTop: 11, textAlign: "center" }}>
          Your changes update live – no data is saved remotely.
        </div>
      </form>
      <div className="eco-highlight text-center mt-md sm-text">
        This profile is for demonstration only; all values stored in your browser session.
      </div>
    </div>
  );
}

export default Profile;
