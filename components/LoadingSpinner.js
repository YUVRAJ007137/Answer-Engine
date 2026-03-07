"use client";

export default function LoadingSpinner({ message = "Generating answers..." }) {
  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <div className="relative w-12 h-12">
        <div
          className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: "var(--card-border)", borderTopColor: "var(--primary)" }}
        />
      </div>
      <p className="text-sm font-medium animate-pulse" style={{ color: "var(--muted)" }}>
        {message}
      </p>
    </div>
  );
}
