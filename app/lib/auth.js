"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "./api";

const AuthContext = createContext(null);

function userIsAdmin(u) {
  return String(u?.role || "").trim().toLowerCase() === "admin";
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // booting = “todavía estoy resolviendo sesión + /me”
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState(null);

  // 1) leer token del storage
  useEffect(() => {
    const t = window.localStorage.getItem("mag_token");
    setToken(t || null);
  }, []);

  // 2) cargar /me (y solo al final poner booting=false)
  useEffect(() => {
    let cancelled = false;

    async function loadMe() {
      if (!token) {
        if (!cancelled) {
          setUser(null);
          setBooting(false);
        }
        return;
      }

      if (!cancelled) setBooting(true);

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
      } finally {
        if (!cancelled) setBooting(false);
      }
    }

    loadMe();
    return () => {
      cancelled = true;
    };
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
    setBooting(false);
    return data.user;
  }

  function logout() {
    window.localStorage.removeItem("mag_token");
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
      () => ({
        token,
        user,
        booting,
        error,
        setError,
        login,
        logout,
        isAdmin: userIsAdmin(user),
      }),
      [token, user, booting, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
