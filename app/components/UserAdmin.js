"use client";

import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import Spinner from "./Spinner";
import { useAuth } from "../lib/auth";

function genLocalPassword(len = 12) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@$%*?";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function BadgeRole({ role }) {
  const isAdmin = role === "admin";
  return (
    <span className={"badge " + (isAdmin ? "badgeAdmin" : "badgeViewer")}>
      {isAdmin ? "admin" : "viewer"}
    </span>
  );
}

const SINGLE_ADMIN_USERNAME = "jmcastellanos@conversionaventa.com";
const isFixedAdmin = (username) =>
  String(username || "").trim().toLowerCase() === SINGLE_ADMIN_USERNAME.toLowerCase();

export default function UserAdmin() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [err, setErr] = useState(null);

  const [newUser, setNewUser] = useState({ username: "", password: "" });
  const [useRandom, setUseRandom] = useState(true);

  const [modal, setModal] = useState(null); // {title, message}

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const data = await apiFetch("/api/users", { token });
      setItems(data.items || []);
    } catch (e) {
      setErr(e.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createUser() {
    setErr(null);
    try {
      const body = {
        username: newUser.username,
        generatePassword: useRandom,
        password: useRandom ? "" : newUser.password,
      };
      const data = await apiFetch("/api/users", { method: "POST", token, body });

      if (data?.generatedPassword) {
        setModal({
          title: "Contraseña generada",
          message: `Usuario: ${data.user.username}\nContraseña: ${data.generatedPassword}\n\nGuárdala, solo se muestra una vez.`,
        });
      }

      setNewUser({ username: "", password: "" });
      setUseRandom(true);
      await load();
    } catch (e) {
      setErr(e.message || "Error");
    }
  }

  async function updateUser(id, patch) {
    setErr(null);
    try {
      const data = await apiFetch(`/api/users/${id}`, { method: "PUT", token, body: patch });
      if (data?.generatedPassword) {
        setModal({
          title: "Contraseña regenerada",
          message: `Nueva contraseña: ${data.generatedPassword}\n\nGuárdala, solo se muestra una vez.`,
        });
      }
      await load();
    } catch (e) {
      setErr(e.message || "Error");
    }
  }

  async function deleteUser(id) {
    setErr(null);
    try {
      await apiFetch(`/api/users/${id}`, { method: "DELETE", token });
      await load();
    } catch (e) {
      setErr(e.message || "Error");
    }
  }

  if (loading) {
    return (
      <div className="card">
        <Spinner label="Cargando usuarios..." />
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {err && <div className="alert">{String(err)}</div>}

      {/* Crear usuario */}
      <div className="card">
        <div className="cardBody">
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>Crear usuario</h2>
          <p className="p" style={{ marginTop: 6 }}>
            Crea un usuario para ingresar al portal. Puedes generar una contraseña automática.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, marginTop: 14 }}>
            <div>
              <label className="label">Usuario</label>
              <input
                className="input"
                value={newUser.username}
                onChange={(e) => setNewUser((s) => ({ ...s, username: e.target.value }))}
                placeholder="correo@empresa.com"
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, marginTop: 12, alignItems: "end" }}>
            <div>
              <label className="label">Contraseña</label>
              <input
                className="input"
                value={newUser.password}
                onChange={(e) => setNewUser((s) => ({ ...s, password: e.target.value }))}
                placeholder={useRandom ? "(se generará automáticamente)" : "escribe una contraseña"}
                disabled={useRandom}
              />
              <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, color: "var(--mag-muted)" }}>
                  <input
                    type="checkbox"
                    checked={useRandom}
                    onChange={(e) => {
                      const v = e.target.checked;
                      setUseRandom(v);
                      if (!v && !newUser.password) {
                        setNewUser((s) => ({ ...s, password: genLocalPassword(12) }));
                      }
                    }}
                  />
                  Generar automáticamente
                </label>

                {!useRandom && (
                  <button
                    type="button"
                    className="btn btnGhost"
                    onClick={() => setNewUser((s) => ({ ...s, password: genLocalPassword(12) }))}
                  >
                    Generar aquí
                  </button>
                )}
              </div>
            </div>

            <button
              type="button"
              className="btn btnPrimary"
              onClick={createUser}
              disabled={!newUser.username.trim() || (!useRandom && !newUser.password)}
            >
              Crear
            </button>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="card">
        <div className="cardBody">
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>Usuarios</h2>
              <p className="p" style={{ marginTop: 6 }}>
                Lista de usuarios (sin mostrar contraseñas).
              </p>
            </div>
            <button type="button" className="btn btnGhost" onClick={load}>
              Refrescar
            </button>
          </div>

          <div style={{ overflowX: "auto", marginTop: 12 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Creado</th>
                  <th>Actualizado</th>
                  <th style={{ width: 320 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={5} className="muted">No hay usuarios.</td></tr>
                ) : (
                  items.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 900 }}>{u.username}</td>
                      <td><BadgeRole role={u.role} /></td>
                      <td className="muted">{u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}</td>
                      <td className="muted">{u.updatedAt ? new Date(u.updatedAt).toLocaleString() : "-"}</td>
                      <td>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button
                            className="btn btnGhost"
                            type="button"
                            onClick={() => updateUser(u.id, { generatePassword: true })}
                            disabled={isFixedAdmin(u.username)}
                          >
                            Regenerar contraseña
                          </button>

                          <button
                            className="btn btnDanger"
                            type="button"
                            disabled={isFixedAdmin(u.username)}
                            onClick={() => {
                              if (confirm(`¿Eliminar usuario "${u.username}"?`)) deleteUser(u.id);
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modalBackdrop" onClick={() => setModal(null)}>
          <div className={"card modal"} onClick={(e) => e.stopPropagation()}>
            <div className="cardBody" style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>{modal.title}</h3>
                <button className="btn btnGhost" onClick={() => setModal(null)}>Cerrar</button>
              </div>
              <pre style={{ margin: 0, whiteSpace: "pre-wrap", background: "rgba(15,23,42,.04)", borderRadius: 12, padding: 12, border: "1px solid rgba(15,23,42,.08)" }}>
                {modal.message}
              </pre>
              <button
                className="btn btnPrimary"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(modal.message);
                    setModal({ ...modal, title: modal.title + " (copiado)" });
                  } catch {}
                }}
              >
                Copiar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
