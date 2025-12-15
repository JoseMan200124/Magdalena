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
              {/* Logo centrado y más grande */}
              <div className="logoWrap">
                <img
                    src="/magdalena-logo.png"
                    alt="Magdalena"
                    className="logoImg"
                />
              </div>

              <h1 className="h1 titleCenter">Ingreso al portal</h1>
              <p className="p subtitleCenter">
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

                {/* Botón más estético */}
                <button className="btnPrimary btnMag" disabled={loading}>
                  {loading ? "Ingresando..." : "Ingresar"}
                </button>

                <div className="hint">
                  Si es tu primera vez, usa el usuario admin inicial definido en el backend.
                </div>
              </form>
            </div>
          </section>

          {/* Estilos SOLO para esta página */}
          <style jsx>{`
          .logoWrap {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 4px;
            margin-bottom: 10px;
          }

          .logoImg {
            height: 64px; /* más grande */
            width: auto;
            object-fit: contain;
          }

          .titleCenter {
            text-align: center;
            margin-top: 4px;
            margin-bottom: 6px;
          }

          .subtitleCenter {
            text-align: center;
            margin-bottom: 14px;
            opacity: 0.9;
          }

          /* Botón mejorado (solo aquí) */
          .btnMag {
            width: 100%;
            height: 46px;
            border-radius: 12px;
            font-weight: 800;
            letter-spacing: 0.2px;
            border: 1px solid rgba(255, 255, 255, 0.12);
            background: linear-gradient(135deg, #19e57a 0%, #00c853 100%);
            color: #052012;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.18);
            transition: transform 160ms ease, box-shadow 160ms ease, filter 160ms ease;
          }

          .btnMag:hover {
            transform: translateY(-1px);
            box-shadow: 0 14px 26px rgba(0, 0, 0, 0.22);
            filter: brightness(1.02);
          }

          .btnMag:active {
            transform: translateY(0px);
            box-shadow: 0 10px 18px rgba(0, 0, 0, 0.18);
          }

          .btnMag:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
            filter: none;
          }
        `}</style>
        </main>
      </>
  );
}

export default function LoginPage() {
  // ✅ Mantiene el fix de Vercel para useSearchParams
  return (
      <Suspense
          fallback={
            <>
              <div className="topbar" />
              <main className="loginShell">
                <section className="card loginCard">
                  <div className="cardBody">
                    <div className="logoWrap">
                      <img
                          src="/magdalena-logo.png"
                          alt="Magdalena"
                          className="logoImg"
                      />
                    </div>
                    <h1 className="h1 titleCenter">Cargando…</h1>
                    <style jsx>{`
                  .logoWrap {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-top: 4px;
                    margin-bottom: 10px;
                  }
                  .logoImg {
                    height: 64px;
                    width: auto;
                    object-fit: contain;
                  }
                  .titleCenter {
                    text-align: center;
                    margin-top: 4px;
                  }
                `}</style>
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
