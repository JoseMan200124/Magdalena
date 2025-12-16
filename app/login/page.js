"use client";

import React, { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../lib/auth";

const ALLOWED_NEXT = new Set(["/report", "/admin"]);

function safeNext(next) {
  const n = String(next || "").trim();
  return ALLOWED_NEXT.has(n) ? n : "/report";
}

function LoginScaffold({ children, active }) {
  return (
    <>
      <header className="loginTop">
        <div className="loginTopInner">
          <div className="loginTopSpacer" />

          <nav className="loginTopNav">
            <Link
              href="/login?next=/report"
              className={`tab ${active === "report" ? "tabActive" : ""}`}
            >
              Portal
            </Link>
            <Link
              href="/login?next=/admin"
              className={`tab ${active === "admin" ? "tabActive" : ""}`}
            >
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <main className="loginShell">
        {children}
      </main>

      <style jsx>{`
        .loginTop {
          height: 44px;
          background: var(--brand);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .loginTopInner {
          height: 44px;
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .loginTopSpacer {
          width: 1px;
          height: 1px;
        }
        .loginTopNav {
          display: flex;
          gap: 10px;
          align-items: center;
          justify-content: flex-end;
        }
        .tab {
          font-size: 13px;
          padding: 8px 12px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: rgba(255, 255, 255, 0.9);
          background: rgba(255, 255, 255, 0.06);
          text-decoration: none;
          transition: transform 140ms ease, background 140ms ease, border-color 140ms ease;
        }
        .tab:hover {
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.28);
        }
        .tabActive {
          background: rgba(255, 255, 255, 0.18);
          border-color: rgba(255, 255, 255, 0.38);
          color: #fff;
        }
      `}</style>
    </>
  );
}

function LoginCard({ title, subtitle, onSubmit, username, setUsername, password, setPassword, loading, error }) {
  return (
    <section className="card loginCard">
      <div className="cardBody">
        <div className="logoWrap">
          <img src="/magdalena-logo.png" alt="Magdalena" className="logoImg" />
        </div>

        <h1 className="h1 titleCenter">{title}</h1>
        <p className="p subtitleCenter">{subtitle}</p>

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

          <button className="btnPrimary btnMag" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>

      <style jsx>{`
        .logoWrap {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 2px;
          margin-bottom: 10px;
        }
        .logoImg {
          height: 84px;
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
          opacity: 0.92;
        }

        .btnMag {
          width: 100%;
          height: 46px;
          border-radius: 12px;
          font-weight: 900;
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
          opacity: 0.75;
          cursor: not-allowed;
          transform: none;
          filter: none;
        }
      `}</style>
    </section>
  );
}

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, error, setError } = useAuth();

  const next = useMemo(() => safeNext(searchParams.get("next") || "/report"), [searchParams]);
  const mode = next === "/admin" ? "admin" : "report";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError?.(null);
    setLoading(true);

    try {
      await login(username, password);
      router.replace(next);
    } catch (err) {
      setError?.(err?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  const title = mode === "admin" ? "Ingreso al administrador" : "Ingreso al portal";
  const subtitle =
    mode === "admin"
      ? "Ingresa con tu usuario y contraseña para administrar usuarios."
      : "Ingresa con tu usuario y contraseña para ver el reporte.";

  return (
    <LoginScaffold active={mode}>
      <LoginCard
        title={title}
        subtitle={subtitle}
        onSubmit={onSubmit}
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        loading={loading}
        error={error}
      />
    </LoginScaffold>
  );
}

export default function LoginPage() {
  // ✅ Fix de Vercel/Next: useSearchParams debe estar dentro de Suspense
  return (
    <Suspense
      fallback={
        <LoginScaffold active="report">
          <section className="card loginCard">
            <div className="cardBody">
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                <img
                  src="/magdalena-logo.png"
                  alt="Magdalena"
                  style={{ height: 84, width: "auto", objectFit: "contain" }}
                />
              </div>
              <h1 className="h1" style={{ textAlign: "center" }}>
                Cargando…
              </h1>
            </div>
          </section>
        </LoginScaffold>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
