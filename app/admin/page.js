"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import BrandHeader from "../components/BrandHeader";
import Spinner from "../components/Spinner";
import UserAdmin from "../components/UserAdmin";
import { useAuth } from "../lib/auth";

export default function AdminPage() {
  const router = useRouter();
  const { user, booting, isAdmin } = useAuth();

  useEffect(() => {
    if (!booting && !user) router.replace("/login?next=/admin");
    if (!booting && user && !isAdmin) router.replace("/report");
  }, [booting, user, isAdmin, router]);

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

  if (!user || !isAdmin) return null;

  return (
    <>
      <BrandHeader />
      <main className="container page">
        <h1 className="h1">Admin de usuarios</h1>
        <p className="p" style={{ marginBottom: 14 }}>
          Añadir, actualizar y eliminar usuarios que pueden ingresar al portal.
        </p>
        <UserAdmin />
      </main>
    </>
  );
}
