import React, { createContext, useContext, useState, useEffect, useRef } from "react";

// Utility: parse JWT for minimal info
function parseJwt(token) {
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

// --- AuthContext creation ---
const AuthContext = createContext();

// Global handle for API use—set on mount
let _authContextApi = null;

// PUBLIC_INTERFACE
export function getAuthContextApi() {
  return _authContextApi;
}

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  // Auth state
  const [authenticated, setAuthenticated] = useState(!!localStorage.getItem("jwt"));
  const [user, setUser] = useState(null);  // Parsed claims, not fetched profile
  const [errorMessage, setErrorMessage] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);

  // This ref prevents duplicate expiry banners/timeouts
  const sessionExpireTimeout = useRef();

  // PUBLIC_INTERFACE
  // Called by api.js on 401 to force user signout, clear JWT and present session expired UI notification
  function forceLogoutDueToSession() {
    localStorage.removeItem("jwt");
    setAuthenticated(false);
    setUser(null);
    setSessionExpired(true);
    setErrorMessage("");
    if (sessionExpireTimeout.current) clearTimeout(sessionExpireTimeout.current);
    sessionExpireTimeout.current = setTimeout(() => setSessionExpired(false), 7000);
  }

  // Error feedback for UI banners
  const setAuthError = (errMsg) => {
    setErrorMessage(errMsg);
    setTimeout(() => setErrorMessage(""), 4000);
  };
  const resetSessionError = () => setSessionExpired(false);

  // On mount: check for valid JWT, expire if needed; also install global API pointer for api.js
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    let claims = parseJwt(token);
    if (token && claims && claims.exp && claims.exp * 1000 < Date.now()) {
      localStorage.removeItem("jwt");
      setSessionExpired(true);
      setAuthenticated(false);
      setUser(null);
    } else if (token && claims) {
      setAuthenticated(true);
      setUser(claims);
    } else {
      setAuthenticated(false);
      setUser(null);
    }
    _authContextApi = {
      forceLogoutDueToSession,
      isAuthenticated: !!token,
      logout,
      login,
      setAuthError,
      getAuthenticatedUser: () => user,
    };
    return () => {
      if (sessionExpireTimeout.current) clearTimeout(sessionExpireTimeout.current);
      _authContextApi = null;
    };
    // eslint-disable-next-line
  }, []); // only on mount

  // PUBLIC_INTERFACE
  const login = (jwt) => {
    localStorage.setItem("jwt", jwt);
    setAuthenticated(true);
    const claims = parseJwt(jwt);
    setUser(claims);
    setErrorMessage("");
    setSessionExpired(false);
  };
  // PUBLIC_INTERFACE
  const logout = () => {
    localStorage.removeItem("jwt");
    setAuthenticated(false);
    setUser(null);
    setSessionExpired(false);
  };

  // Provide AuthContext to app
  return (
    <AuthContext.Provider
      value={{
        authenticated,
        user,
        errorMessage,
        login,
        logout,
        setAuthError,
        sessionExpired,
        resetSessionError,
        isAuthenticated: authenticated,
        forceLogoutDueToSession, // expose for components if needed
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useAuth() {
  return useContext(AuthContext);
}
