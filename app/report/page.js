"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import BrandHeader from "../components/BrandHeader";
import Spinner from "../components/Spinner";
import { useAuth } from "../lib/auth";

const LOOKER_EMBED_SRC =
  "https://lookerstudio.google.com/embed/reporting/2d5fcdf6-93bf-4530-b07f-1fac5fbd917b/page/p_qtxxt6m00c";

export default function ReportPage() {
  const router = useRouter();
  const { user, booting } = useAuth();

  useEffect(() => {
    if (!booting && !user) router.replace("/login?next=/report");
  }, [booting, user, router]);

  if (booting) {
    return (
      <>
        <div className="topbar" />
        <main className="container page">
          <div className="card">
            <Spinner />
          </div>
        </main>
      </>
    );
  }

  if (!user) return null;

  return (
    <>
      <BrandHeader />
      <main className="container page" style={{ paddingTop: 12 }}>
        <div className="iframeWrap">
          <iframe
            className="iframe"
            src={LOOKER_EMBED_SRC}
            frameBorder="0"
            style={{ border: 0 }}
            allowFullScreen
            sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
      </main>

      <style jsx>{`
        .iframeWrap {
          width: 100%;
          border-radius: 16px;
          overflow: hidden;
          background: #0b0d1a;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.14);
        }

        .iframe {
          display: block;
          width: 100%;
          height: calc(100vh - 96px); /* header + paddings */
          min-height: 720px;
        }

        @media (max-width: 640px) {
          .iframe {
            height: calc(100vh - 86px);
            min-height: 640px;
          }
        }
      `}</style>
    </>
  );
}
