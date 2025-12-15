// En local, si no se define, intentamos usar el backend local por defecto.
// En producción (Vercel), define NEXT_PUBLIC_API_BASE_URL para apuntar a Render.
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

function joinUrl(base, path) {
  if (!base) throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
  if (base.endsWith("/") && path.startsWith("/")) return base.slice(0, -1) + path;
  if (!base.endsWith("/") && !path.startsWith("/")) return base + "/" + path;
  return base + path;
}

export async function apiFetch(path, { method = "GET", body, token } = {}) {
  const url = joinUrl(BASE, path);
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const msg = data?.error || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
