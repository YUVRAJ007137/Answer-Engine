"use client";

import { useState } from "react";
import Link from "next/link";
import ChatSidebar from "@/components/ChatSidebar";
import ThemeToggle from "@/components/ThemeToggle";

function MenuIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function InfoIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function ChatLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
      {/* Mobile overlay */}
      <button
        type="button"
        aria-label="Close menu"
        className="fixed inset-0 z-10 bg-black/50 md:hidden transition-opacity duration-200"
        style={{ opacity: sidebarOpen ? 1 : 0, pointerEvents: sidebarOpen ? "auto" : "none" }}
        onClick={() => setSidebarOpen(false)}
      />

      <ChatSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top bar with menu toggle (mobile) and theme toggle (right) */}
        <header
          className="shrink-0 flex items-center gap-3 px-4 py-3 border-b md:px-6"
          style={{ borderColor: "var(--card-border)", background: "var(--card)" }}
        >
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            className="p-2 rounded-lg md:hidden hover:opacity-80 transition-opacity"
            style={{ color: "var(--foreground)" }}
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          >
            <MenuIcon className="w-6 h-6" />
          </button>
          <div className="flex-1 min-w-0" />
          <Link
            href="/about"
            className="p-2 rounded-lg hover:opacity-80 transition-opacity"
            style={{ color: "var(--muted)" }}
            aria-label="About"
          >
            <InfoIcon className="w-5 h-5" />
          </Link>
          <ThemeToggle />
        </header>

        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
