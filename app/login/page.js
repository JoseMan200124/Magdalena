"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../lib/auth";

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, error, setError } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError?.(null);
    setLoading(true);

    try {
      await login(username, password);

      const next = (searchParams.get("next") || "/report").toString();
      const allowed = new Set(["/report", "/admin"]);
      const target = allowed.has(next) ? next : "/report";

      router.replace(target);
    } catch (e) {
      setError?.(e?.message || "Error");
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
              <img
                  src="/magdalena-logo.png"
                  alt="Magdalena"
                  style={{ height: 38, width: "auto" }}
              />

              <h1 className="h1" style={{ marginTop: 14 }}>
                Ingreso al portal
              </h1>

              <p className="p">
                Ingresa con tu usuario y contraseña para ver el reporte.
              </p>

              <form className="form" onSubmit={onSubmit}>
                <label className="label">
                  Usuario
                  <input
                      className="input"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="correo@dominio.com"
                      autoComplete="username"
                      required
                  />
                </label>

                <label className="label">
                  Contraseña
                  <input
                      className="input"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                  />
                </label>

                {error ? <div className="error">{String(error)}</div> : null}

                <button className="btnPrimary" disabled={loading}>
                  {loading ? "Ingresando..." : "Ingresar"}
                </button>

                <div className="hint">
                  Si es tu primera vez, usa el usuario admin inicial definido en el backend.
                </div>
              </form>
            </div>
          </section>
        </main>
      </>
  );
}

export default function LoginPage() {
  // ✅ Esto arregla el build/prerender en Vercel
  return (
      <Suspense
          fallback={
            <>
              <div className="topbar" />
              <main className="loginShell">
                <section className="card loginCard">
                  <div className="cardBody">
                    <img
                        src="/magdalena-logo.png"
                        alt="Magdalena"
                        style={{ height: 38, width: "auto" }}
                    />
                    <h1 className="h1" style={{ marginTop: 14 }}>
                      Cargando…
                    </h1>
                  </div>
                </section>
              </main>
            </>
          }
      >
        <LoginInner />
      </Suspense>
  );
}
