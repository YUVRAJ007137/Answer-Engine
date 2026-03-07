"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getChatIds, deleteChat } from "@/lib/chat-storage";

function CloseIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function ChatSidebar({ isOpen = false, onClose }) {
  const pathname = usePathname();
  const [chatIds, setChatIds] = useState([]);
  const [menuId, setMenuId] = useState(null);

  const refresh = () => setChatIds(getChatIds());

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("answer-engine-chat-saved", handler);
    return () => window.removeEventListener("answer-engine-chat-saved", handler);
  }, []);

  const currentId = pathname?.startsWith("/chat/") ? pathname.replace("/chat/", "").split("/")[0] : null;

  const handleLinkClick = () => {
    onClose?.();
  };

  return (
    <aside
      className={`
        w-64 shrink-0 flex flex-col border-r min-h-screen
        fixed md:relative inset-y-0 left-0 z-20
        transform transition-transform duration-200 ease-out
        md:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      style={{ borderColor: "var(--card-border)", background: "var(--card)" }}
    >
      <div className="p-3 border-b flex items-center justify-between gap-2" style={{ borderColor: "var(--card-border)" }}>
        <Link
          href="/chat/new"
          onClick={handleLinkClick}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex-1 min-w-0 justify-center"
          style={{
            background: "var(--primary)",
            color: "#fff",
          }}
        >
          <span>+</span>
          <span>New chat</span>
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg md:hidden shrink-0 hover:opacity-80 transition-opacity"
          style={{ color: "var(--foreground)" }}
          aria-label="Close menu"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
        <p className="text-xs font-medium px-2 py-1.5" style={{ color: "var(--muted)" }}>
          Chat history
        </p>
        {chatIds.length === 0 ? (
          <p className="text-xs px-2 py-4" style={{ color: "var(--muted)" }}>
            No chats yet
          </p>
        ) : (
          <ul className="space-y-0.5">
            {chatIds.map((entry) => (
              <li key={entry.id} className="relative group">
                <Link
                  href={`/chat/${entry.id}`}
                  onClick={handleLinkClick}
                  className={`block px-3 py-2.5 rounded-lg text-sm truncate pr-8 ${
                    currentId === entry.id ? "font-medium" : ""
                  }`}
                  style={{
                    background: currentId === entry.id ? "var(--primary-light)" : "transparent",
                    color: currentId === entry.id ? "var(--primary)" : "var(--foreground)",
                  }}
                >
                  {entry.title || "Untitled"}
                </Link>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setMenuId(menuId === entry.id ? null : entry.id);
                  }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                  style={{ color: "var(--muted)" }}
                  aria-label="Chat menu"
                >
                  ⋮
                </button>
                {menuId === entry.id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuId(null)}
                      aria-hidden
                    />
                    <div
                      className="absolute right-0 top-full mt-0.5 py-1 rounded-lg shadow-lg z-20 min-w-[120px]"
                      style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          deleteChat(entry.id);
                          setMenuId(null);
                          if (currentId === entry.id) window.location.href = "/chat/new";
                        }}
                        className="w-full text-left px-3 py-1.5 text-sm"
                        style={{ color: "var(--error)" }}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div
        className="p-3 border-t"
        style={{ borderColor: "var(--card-border)" }}
      >
        <Link
          href="/about"
          onClick={handleLinkClick}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors hover:opacity-80"
          style={{ color: "var(--muted)" }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>About</span>
        </Link>
      </div>
    </aside>
  );
}
