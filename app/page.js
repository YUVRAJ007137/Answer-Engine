"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/chat/new");
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
      <p className="text-sm" style={{ color: "var(--muted)" }}>Redirecting…</p>
    </div>
  );
}
