"use client";

import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import BrandHeader from "../components/BrandHeader";
import Spinner from "../components/Spinner";
import { useAuth } from "../lib/auth";

function toEmbedUrl(url) {
  if (!url) return "";
  // Convierte /reporting/ -> /embed/reporting/ para usar en iframe.
  if (url.includes("lookerstudio.google.com/reporting/")) {
    return url.replace("lookerstudio.google.com/reporting/", "lookerstudio.google.com/embed/reporting/");
  }
  return url;
}

export default function ReportPage() {
  const router = useRouter();
  const { user, booting } = useAuth();
  const src = useMemo(() => toEmbedUrl(process.env.NEXT_PUBLIC_REPORT_URL), []);

  useEffect(() => {
    if (!booting && !user) router.replace("/login?next=/report");
  }, [booting, user, router]);

  if (booting) {
    return (
      <>
        <div className="topbar" />
        <main className="container page">
          <div className="card"><Spinner /></div>
        </main>
      </>
    );
  }

  if (!user) return null;

  return (
    <>
      <BrandHeader />
      <main className="container page">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
          <div>
            <h1 className="h1">Reporte</h1>
            <p className="p">Looker Studio embebido. Si no carga, revisa permisos/compartición del reporte.</p>
          </div>
        </div>

        <div className="iframeWrap">
          <iframe className="iframe" src={src} allowFullScreen />
        </div>
      </main>
    </>
  );
}
