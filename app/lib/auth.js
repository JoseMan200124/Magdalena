"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "./api";

const AuthContext = createContext(null);

// PoC: solo un admin fijo (mismo que en el backend).
const SINGLE_ADMIN_USERNAME = "jmcastellanos@conversionaventa.com";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const t = window.localStorage.getItem("mag_token");
    if (t) setToken(t);
    setBooting(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadMe() {
      if (!token) {
        setUser(null);
        return;
      }
      try {
        const data = await apiFetch("/api/me", { token });
        if (!cancelled) setUser(data.user);
      } catch (e) {
        console.warn("me failed:", e);
        if (!cancelled) {
          setUser(null);
          setToken(null);
          window.localStorage.removeItem("mag_token");
        }
      }
    }
    loadMe();
    return () => { cancelled = true; };
  }, [token]);

  async function login(username, password) {
    setError(null);
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: { username, password },
    });
    window.localStorage.setItem("mag_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    window.localStorage.removeItem("mag_token");
    setToken(null);
    setUser(null);
  }

  const value = useMemo(() => ({
    token, user, booting, error,
    setError,
    login,
    logout,
    isAdmin:
      String(user?.role || "").toLowerCase() === "admin" &&
      String(user?.username || "").trim().toLowerCase() === SINGLE_ADMIN_USERNAME.toLowerCase(),
  }), [token, user, booting, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
