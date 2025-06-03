import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as api from "./api";

// PUBLIC_INTERFACE
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // On mount, restore session if token exists
  useEffect(() => {
    const storedUser = api.getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setAuthLoading(false);
  }, []);

  // PUBLIC_INTERFACE
  const login = useCallback(async (email, password) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const user = await api.login(email, password);
      setUser(api.getStoredUser());
      setAuthLoading(false);
      return { success: true };
    } catch (e) {
      setAuthError(e.message);
      setAuthLoading(false);
      return { success: false, error: e.message };
    }
  }, []);

  // PUBLIC_INTERFACE
  const register = useCallback(async (email, password) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const user = await api.register(email, password);
      setUser(api.getStoredUser());
      setAuthLoading(false);
      return { success: true };
    } catch (e) {
      setAuthError(e.message);
      setAuthLoading(false);
      return { success: false, error: e.message };
    }
  }, []);

  // PUBLIC_INTERFACE
  const logout = useCallback(() => {
    api.logout();
    setUser(null);
    setAuthLoading(false);
  }, []);

  // For debugging/development
  window.__ecoAuth = { user, login, logout, register };

  return (
    <AuthContext.Provider value={{
      user,
      authenticated: !!user,
      loading: authLoading,
      error: authError,
      login,
      register,
      logout,
      setAuthError
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
