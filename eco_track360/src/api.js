//
// API Utility for EcoTrack360 React Frontend
//
// Handles all REST requests to the backend, manages JWT storage/transmission/persistence,
// and provides user-facing errors for failed requests.
//
// Usage: import * as api from './api';
//

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4001/api';

function getToken() {
  try {
    return localStorage.getItem('jwt');
  } catch {
    return null;
  }
}
function setToken(token) {
  if (token)
    localStorage.setItem('jwt', token);
  else
    localStorage.removeItem('jwt');
}

// Helper to send a request with/without JWT as needed.
async function sendRequest(url, method = 'GET', data, isAuth = true) {
  let headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (isAuth && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  let options = { method, headers };
  if (data) {
    options.body = JSON.stringify(data);
  }
  let resp;
  try {
    resp = await fetch(API_BASE + url, options);
  } catch (err) {
    throw new Error('Network error. Please check your connection.');
  }
  let respBody = null;
  try {
    respBody = await resp.json();
  } catch (e) {
    // ignore body parse error (non-json)
  }
  if (!resp.ok) {
    throw new Error(respBody?.error || `API error (${resp.status})`);
  }
  return respBody;
}

// PUBLIC_INTERFACE
// Auth API (register, login, logout)
export async function register(email, password) {
  const resp = await sendRequest('/auth/register', 'POST', { email, password }, false);
  setToken(resp.token);
  return resp.user;
}
// PUBLIC_INTERFACE
export async function login(email, password) {
  const resp = await sendRequest('/auth/login', 'POST', { email, password }, false);
  setToken(resp.token);
  return resp.user;
}
// PUBLIC_INTERFACE
export function logout() {
  // Stateless JWT; remove from localStorage
  setToken(null);
  return Promise.resolve();
}

// PUBLIC_INTERFACE
export function getStoredUser() {
  const token = getToken();
  if (!token) return null;
  // JWT decode (lightweight)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
}

// Profile CRUD
// PUBLIC_INTERFACE
export function getProfile() {
  return sendRequest('/profile', 'GET');
}
// PUBLIC_INTERFACE
export function updateProfile(profileData) {
  return sendRequest('/profile', 'PUT', profileData);
}

// Carbon data
// PUBLIC_INTERFACE
export function getCarbonData() {
  return sendRequest('/carbon', 'GET');
}
export function addCarbonEntry(data) {
  return sendRequest('/carbon', 'POST', data);
}
export function deleteCarbonEntry(id) {
  return sendRequest(`/carbon/${id}`, 'DELETE');
}

// Goal APIs
// PUBLIC_INTERFACE
export function getGoals() {
  return sendRequest('/goals', 'GET');
}
export function addGoal(goal) {
  return sendRequest('/goals', 'POST', goal);
}
export function updateGoal(id, update) {
  return sendRequest(`/goals/${id}`, 'PUT', update);
}
export function deleteGoal(id) {
  return sendRequest(`/goals/${id}`, 'DELETE');
}

// Rewards APIs
// PUBLIC_INTERFACE
export function getRewards() {
  return sendRequest('/rewards', 'GET');
}
export function claimReward(label, credits) {
  return sendRequest('/rewards/claim', 'POST', { label, credits });
}
export function redeemReward(id) {
  return sendRequest(`/rewards/redeem/${id}`, 'POST');
}

// Integrations APIs
// PUBLIC_INTERFACE
export function getIntegrations() {
  return sendRequest('/integrations', 'GET');
}
export function connectIntegration(key) {
  return sendRequest(`/integrations/connect/${key}`, 'POST');
}
export function disconnectIntegration(key) {
  return sendRequest(`/integrations/disconnect/${key}`, 'POST');
}
export function getIntegrationData() {
  return sendRequest('/integrations/data', 'GET');
}
