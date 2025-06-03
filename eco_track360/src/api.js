import { getAuthContextApi } from "./AuthContext";

/**
 * Helper for making authenticated API requests via JWT from localStorage.
 * Automatically adds Authorization header if JWT exists.
 * On 401 Unauthorized, calls the AuthContext global session-expiry/auto-logout handler,
 * clears JWT, and ensures users are notified to re-login.
 *
 * @param {string} url - The API endpoint URL.
 * @param {object} opts - Options: { method, body, headers, ... }
 * @returns {Promise<any>} Response JSON if successful.
 * @throws {object} error object with message and status properties.
 */
// PUBLIC_INTERFACE
export async function apiFetch(url, { method = "GET", body, headers = {}, ...opts } = {}) {
  // Attach JWT if present.
  const token = localStorage.getItem("jwt");
  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }
  let fetchOpts = {
    ...opts,
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers
    }
  };
  if (body !== undefined) {
    fetchOpts.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(url, fetchOpts);
  } catch (e) {
    // Network error/catch-all
    throw { message: e.message || "Network error", status: 0 };
  }

  if (!response.ok) {
    let error;
    try {
      error = await response.json();
    } catch {
      error = { message: response.statusText };
    }
    error.status = response.status;
    // Detect 401 Unauthorized—session expired/invalid token
    if (response.status === 401) {
      // Notify AuthContext global auto-logout/session expire
      const authApi = getAuthContextApi && getAuthContextApi();
      if (authApi && typeof authApi.forceLogoutDueToSession === "function") {
        authApi.forceLogoutDueToSession();
      } else {
        // fallback: clear JWT
        localStorage.removeItem("jwt");
      }
    }
    throw error;
  }
  return response.json();
}

// ==== Additional API endpoint implementations (exports required by components) ====

// PUBLIC_INTERFACE
export async function getGoals() {
  return apiFetch("/api/goals");
}

// PUBLIC_INTERFACE
export async function addGoal(goal) {
  return apiFetch("/api/goals", { method: "POST", body: goal });
}

// PUBLIC_INTERFACE
export async function updateGoal(id, updates) {
  return apiFetch(`/api/goals/${id}`, { method: "PUT", body: updates });
}

// PUBLIC_INTERFACE
export async function deleteGoal(id) {
  return apiFetch(`/api/goals/${id}`, { method: "DELETE" });
}

// PUBLIC_INTERFACE
export async function getProfile() {
  return apiFetch("/api/profile");
}

// PUBLIC_INTERFACE
export async function updateProfile(profile) {
  return apiFetch("/api/profile", { method: "PUT", body: profile });
}

// PUBLIC_INTERFACE
export async function getRewards() {
  return apiFetch("/api/rewards");
}

// PUBLIC_INTERFACE
export async function claimReward(label, credits) {
  return apiFetch("/api/rewards/claim", { method: "POST", body: { label, credits } });
}

// PUBLIC_INTERFACE
export async function redeemReward(rewardId) {
  return apiFetch(`/api/rewards/redeem`, { method: "POST", body: { rewardId } });
}
