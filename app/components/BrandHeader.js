"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../lib/auth";

function cx(...cls) {
  return cls.filter(Boolean).join(" ");
}

export default function BrandHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="brandHeader">
      <div className="container">
        <div className="brandRow">
          <div className="brandLeft">
            <img
              src="/magdalena-logo.png"
              alt="Magdalena"
              style={{ height: 26, width: "auto" }}
            />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
              <strong style={{ fontSize: 14, letterSpacing: 0.2 }}>Portal</strong>
              <span style={{ fontSize: 12, opacity: 0.85 }}>
                {user ? `Sesión: ${user.username}` : "Acceso"}
              </span>
            </div>
          </div>

          <nav className="nav">
            <Link className={cx(pathname === "/report" && "active")} href="/report">
              Reporte
            </Link>
            {isAdmin ? (
              <Link className={cx(pathname === "/admin" && "active")} href="/admin">
                Admin
              </Link>
            ) : null}
            {user && (
              <button
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
              >
                Cerrar sesión
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
