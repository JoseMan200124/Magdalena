"use client";

import React, { useEffect, useMemo, useState } from "react";
import Spinner from "./Spinner";
import { apiFetch } from "../lib/api";
import { useAuth } from "../lib/auth";

function roleLabel(role) {
  const r = String(role || "").toLowerCase();
  return r === "admin" ? "Admin" : "Usuario";
}

function roleBadgeClass(role) {
  const r = String(role || "").toLowerCase();
  return r === "admin" ? "badge badgeGreen" : "badge";
}

export default function UserAdmin() {
  const { token, user: me } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [createdPassword, setCreatedPassword] = useState(null);

  // Create
  const [createOpen, setCreateOpen] = useState(false);
  const [createUsername, setCreateUsername] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createGenerate, setCreateGenerate] = useState(true);
  const [createIsAdmin, setCreateIsAdmin] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);

  // Edit
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editGenerate, setEditGenerate] = useState(false);
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [editBusy, setEditBusy] = useState(false);

  const adminCount = useMemo(
    () => items.filter((u) => String(u.role || "").toLowerCase() === "admin").length,
    [items]
  );

  async function reload() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/users", { token });
      setItems(res.items || []);
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) return;
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function openCreate() {
    setCreatedPassword(null);
    setCreateUsername("");
    setCreatePassword("");
    setCreateGenerate(true);
    setCreateIsAdmin(false);
    setCreateOpen(true);
  }

  function openEdit(u) {
    setCreatedPassword(null);
    setEditUser(u);
    setEditUsername(u?.username || "");
    setEditPassword("");
    setEditGenerate(false);
    setEditIsAdmin(String(u?.role || "").toLowerCase() === "admin");
    setEditOpen(true);
  }

  async function createUser() {
    setCreateBusy(true);
    setError(null);
    try {
      const body = {
        username: createUsername,
        generatePassword: createGenerate,
        ...(createGenerate ? {} : { password: createPassword }),
        role: createIsAdmin ? "admin" : "viewer",
      };
      const res = await apiFetch("/api/users", { method: "POST", body, token });
      setCreatedPassword(res.generatedPassword || null);
      setCreateOpen(false);
      await reload();
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setCreateBusy(false);
    }
  }

  async function saveUser() {
    if (!editUser) return;
    setEditBusy(true);
    setError(null);
    try {
      const body = {
        username: editUsername,
        generatePassword: editGenerate,
        role: editIsAdmin ? "admin" : "viewer",
      };
      if (!editGenerate && editPassword.trim()) body.password = editPassword;

      const res = await apiFetch(`/api/users/${editUser.id}`, { method: "PUT", body, token });
      setCreatedPassword(res.generatedPassword || null);
      setEditOpen(false);
      await reload();
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setEditBusy(false);
    }
  }

  async function deleteUser(u) {
    const ok = window.confirm(`¿Eliminar al usuario ${u.username}? Esta acción no se puede deshacer.`);
    if (!ok) return;
    setError(null);
    try {
      await apiFetch(`/api/users/${u.id}`, { method: "DELETE", token });
      await reload();
    } catch (e) {
      setError(e?.message || String(e));
    }
  }

  if (loading) {
    return (
      <div className="card">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="row between">
        <div>
          <h2 className="h2">Usuarios</h2>
          <p className="p">
            Admins: <b>{adminCount}</b> • Usuarios: <b>{items.length}</b>
          </p>
        </div>
        <button className="btn btnPrimary" onClick={openCreate}>
          + Crear usuario
        </button>
      </div>

      {createdPassword ? (
        <div className="card" style={{ borderColor: "rgba(25,229,122,0.35)" }}>
          <div className="cardBody">
            <div className="row between" style={{ alignItems: "center" }}>
              <div>
                <div className="h3" style={{ margin: 0 }}>Contraseña generada</div>
                <div className="p" style={{ marginTop: 6, marginBottom: 0 }}>
                  Copia esta contraseña ahora. Solo se muestra una vez.
                </div>
              </div>
              <button className="btn" onClick={() => setCreatedPassword(null)}>
                Cerrar
              </button>
            </div>
            <div
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 12,
                border: "1px dashed rgba(255,255,255,0.18)",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                fontSize: 14,
              }}
            >
              {createdPassword}
            </div>
          </div>
        </div>
      ) : null}

      {error ? <div className="error">{String(error)}</div> : null}

      <div className="card">
        <div className="cardBody" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Creado</th>
                <th style={{ width: 220 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => {
                const isMe = me?.id && String(me.id) === String(u.id);
                const isAdmin = String(u.role || "").toLowerCase() === "admin";
                const wouldBeLastAdmin = isAdmin && adminCount <= 1;
                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ fontWeight: 700 }}>{u.username}</div>
                        {isMe ? <span className="badge">tú</span> : null}
                      </div>
                    </td>
                    <td>
                      <span className={roleBadgeClass(u.role)}>{roleLabel(u.role)}</span>
                    </td>
                    <td>{u.createdAt ? new Date(u.createdAt).toLocaleString() : ""}</td>
                    <td>
                      <div className="row" style={{ gap: 8, justifyContent: "flex-end" }}>
                        <button className="btn" onClick={() => openEdit(u)}>
                          Editar
                        </button>
                        <button
                          className="btn"
                          disabled={isMe || wouldBeLastAdmin}
                          title={
                            isMe
                              ? "No puedes eliminar tu propia cuenta"
                              : wouldBeLastAdmin
                              ? "No puedes eliminar el último admin"
                              : ""
                          }
                          onClick={() => deleteUser(u)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create modal */}
      {createOpen ? (
        <div className="modalOverlay" onMouseDown={() => !createBusy && setCreateOpen(false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <div>
                <div className="h2" style={{ margin: 0 }}>Crear usuario</div>
                <div className="p" style={{ marginTop: 6, marginBottom: 0 }}>
                  Define si tendrá acceso al admin.
                </div>
              </div>
              <button className="btn" onClick={() => setCreateOpen(false)} disabled={createBusy}>
                ✕
              </button>
            </div>

            <div className="modalBody">
              <label className="label">
                Usuario
                <input
                  className="input"
                  value={createUsername}
                  onChange={(e) => setCreateUsername(e.target.value)}
                  placeholder="correo@dominio.com"
                  autoComplete="off"
                />
              </label>

              <label className="row" style={{ gap: 10, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={createIsAdmin}
                  onChange={(e) => setCreateIsAdmin(e.target.checked)}
                />
                <span style={{ fontWeight: 700 }}>Permiso para Admin</span>
              </label>

              <label className="row" style={{ gap: 10, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={createGenerate}
                  onChange={(e) => setCreateGenerate(e.target.checked)}
                />
                <span>Generar contraseña automática</span>
              </label>

              {!createGenerate ? (
                <label className="label">
                  Contraseña
                  <input
                    className="input"
                    type="password"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </label>
              ) : null}
            </div>

            <div className="modalFooter">
              <button className="btn" onClick={() => setCreateOpen(false)} disabled={createBusy}>
                Cancelar
              </button>
              <button
                className="btn btnPrimary"
                onClick={createUser}
                disabled={createBusy || !createUsername.trim() || (!createGenerate && !createPassword.trim())}
              >
                {createBusy ? "Creando…" : "Crear"}
              </button>
            </div>
          </div>

          <style jsx>{`
            .modalOverlay {
              position: fixed;
              inset: 0;
              background: rgba(0, 0, 0, 0.55);
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 18px;
              z-index: 50;
            }
            .modal {
              width: 100%;
              max-width: 520px;
              background: rgba(20, 26, 38, 0.98);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 18px;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
              overflow: hidden;
              color: rgba(255, 255, 255, 0.92);
            }

            /* Asegura buen contraste dentro del modal (texto + formularios) */
            .modal .h2 {
              color: rgba(255, 255, 255, 0.96);
            }
            .modal .p {
              color: rgba(226, 232, 240, 0.78);
            }
            .modal .label {
              color: rgba(226, 232, 240, 0.88);
            }
            .modal .input {
              background: rgba(255, 255, 255, 0.08);
              border-color: rgba(255, 255, 255, 0.14);
              color: rgba(255, 255, 255, 0.92);
            }
            .modal .input::placeholder {
              color: rgba(226, 232, 240, 0.55);
            }
            .modal .btn {
              background: rgba(255, 255, 255, 0.08);
              border-color: rgba(255, 255, 255, 0.12);
              color: rgba(255, 255, 255, 0.92);
            }
            .modal .btn:hover {
              background: rgba(255, 255, 255, 0.12);
            }
            .modalHeader {
              display: flex;
              align-items: flex-start;
              justify-content: space-between;
              gap: 12px;
              padding: 16px;
              border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            }
            .modalBody {
              padding: 16px;
              display: flex;
              flex-direction: column;
              gap: 12px;
            }
            .modalFooter {
              padding: 16px;
              border-top: 1px solid rgba(255, 255, 255, 0.08);
              display: flex;
              justify-content: flex-end;
              gap: 10px;
            }
          `}</style>
        </div>
      ) : null}

      {/* Edit modal */}
      {editOpen && editUser ? (
        <div className="modalOverlay" onMouseDown={() => !editBusy && setEditOpen(false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <div>
                <div className="h2" style={{ margin: 0 }}>Editar usuario</div>
                <div className="p" style={{ marginTop: 6, marginBottom: 0 }}>
                  Cambia rol, usuario o resetea contraseña.
                </div>
              </div>
              <button className="btn" onClick={() => setEditOpen(false)} disabled={editBusy}>
                ✕
              </button>
            </div>

            <div className="modalBody">
              <label className="label">
                Usuario
                <input
                  className="input"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  autoComplete="off"
                />
              </label>

              <label className="row" style={{ gap: 10, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={editIsAdmin}
                  onChange={(e) => setEditIsAdmin(e.target.checked)}
                  disabled={
                    String(editUser.role || "").toLowerCase() === "admin" && adminCount <= 1
                  }
                />
                <span style={{ fontWeight: 700 }}>Permiso para Admin</span>
                {String(editUser.role || "").toLowerCase() === "admin" && adminCount <= 1 ? (
                  <span className="badge" title="No puedes quitar el último admin">último admin</span>
                ) : null}
              </label>

              <label className="row" style={{ gap: 10, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={editGenerate}
                  onChange={(e) => setEditGenerate(e.target.checked)}
                />
                <span>Generar nueva contraseña automática</span>
              </label>

              {!editGenerate ? (
                <label className="label">
                  Nueva contraseña (opcional)
                  <input
                    className="input"
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Dejar vacío para no cambiar"
                  />
                </label>
              ) : null}
            </div>

            <div className="modalFooter">
              <button className="btn" onClick={() => setEditOpen(false)} disabled={editBusy}>
                Cancelar
              </button>
              <button
                className="btn btnPrimary"
                onClick={saveUser}
                disabled={editBusy || !editUsername.trim()}
              >
                {editBusy ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>

          <style jsx>{`
            .modalOverlay {
              position: fixed;
              inset: 0;
              background: rgba(0, 0, 0, 0.55);
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 18px;
              z-index: 50;
            }
            .modal {
              width: 100%;
              max-width: 520px;
              background: rgba(20, 26, 38, 0.98);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 18px;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
              overflow: hidden;
            }

            /* ✅ Asegura contraste en el modal (texto claro sobre fondo oscuro) */
            .modal .h2 {
              margin: 0;
              color: rgba(255, 255, 255, 0.96);
            }
            .modal .p {
              margin: 6px 0 0;
              color: rgba(226, 232, 240, 0.78);
              line-height: 1.35;
            }
            .modal .label {
              color: rgba(226, 232, 240, 0.88);
            }
            .modal .hint {
              color: rgba(226, 232, 240, 0.62);
            }
            .modal .input {
              background: rgba(255, 255, 255, 0.08);
              border-color: rgba(255, 255, 255, 0.14);
              color: rgba(255, 255, 255, 0.92);
            }
            .modal .input::placeholder {
              color: rgba(226, 232, 240, 0.55);
            }
            .modal .btn:not(.btnPrimary):not(.btnDanger) {
              background: rgba(255, 255, 255, 0.06);
              border-color: rgba(255, 255, 255, 0.12);
              color: rgba(255, 255, 255, 0.9);
            }
            .modal .btn:not(.btnPrimary):not(.btnDanger):hover {
              background: rgba(255, 255, 255, 0.1);
            }
            .modalHeader {
              display: flex;
              align-items: flex-start;
              justify-content: space-between;
              gap: 12px;
              padding: 16px;
              border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            }
            .modalBody {
              padding: 16px;
              display: flex;
              flex-direction: column;
              gap: 12px;
            }
            .modalFooter {
              padding: 16px;
              border-top: 1px solid rgba(255, 255, 255, 0.08);
              display: flex;
              justify-content: flex-end;
              gap: 10px;
            }
          `}</style>
        </div>
      ) : null}
    </div>
  );
}
