"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, error, setError } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      const next = (searchParams.get("next") || "/report").toString();
      const allowed = new Set(["/report", "/admin"]);
      const target = allowed.has(next) ? next : "/report";
      router.replace(target);
    } catch (e) {
      setError(e.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="topbar" />
      <main className="loginShell">
        <section className="card loginCard">
          <div className="cardBody">
            <img src="/magdalena-logo.png" alt="Magdalena" style={{ height: 34, width: "auto" }} />
            <h1 className="h1" style={{ marginTop: 14 }}>
              Ingreso al portal
            </h1>
            <p className="p">
              Ingresa con tu usuario y contraseña para ver el reporte.
            </p>

            <form onSubmit={onSubmit} style={{ marginTop: 18, display: "grid", gap: 12 }}>
              <div>
                <label className="label">Usuario</label>
                <input
                  className="input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="correo@empresa.com"
                  autoComplete="username"
                  required
                />
              </div>

              <div>
                <label className="label">Contraseña</label>
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>

              {error && <div className="alert">{String(error)}</div>}

              <button className="btn btnPrimary" type="submit" disabled={loading}>
                {loading ? "Ingresando..." : "Ingresar"}
              </button>

              <p className="p" style={{ fontSize: 13 }}>
                Si no tienes acceso, solicita a un administrador que cree tu usuario.
              </p>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
