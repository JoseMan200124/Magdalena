"use client";
import React from "react";

export default function Spinner({ label = "Cargando..." }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 14 }}>
      <div
        aria-hidden
        style={{
          width: 16,
          height: 16,
          borderRadius: 999,
          border: "2px solid rgba(15,23,42,.2)",
          borderTopColor: "rgba(20,229,115,.95)",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <span className="muted" style={{ fontWeight: 700 }}>{label}</span>
      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
