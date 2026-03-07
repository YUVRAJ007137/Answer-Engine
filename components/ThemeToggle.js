"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "answer-engine-theme";

export default function ThemeToggle() {
  const [theme, setThemeState] = useState("system");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      setThemeState(stored);
      applyTheme(stored);
    }
  }, []);

  function applyTheme(value) {
    const root = document.documentElement;
    if (value === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", value);
    }
  }

  function setTheme(value) {
    setThemeState(value);
    localStorage.setItem(STORAGE_KEY, value);
    applyTheme(value);
  }

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: "var(--card-border)" }}>
      {[
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
        { value: "system", label: "System" },
      ].map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setTheme(opt.value)}
          className="px-3 py-1.5 text-xs font-medium rounded-md transition-all"
          style={{
            background: theme === opt.value ? "var(--card)" : "transparent",
            color: theme === opt.value ? "var(--primary)" : "var(--muted)",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
