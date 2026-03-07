"use client";

export default function TextInput({ value, onChange, disabled }) {
  return (
    <div className="space-y-3">
      <label
        htmlFor="question-text"
        className="block text-sm font-medium"
        style={{ color: "var(--foreground)" }}
      >
        Or paste your questions
      </label>
      <textarea
        id="question-text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={6}
        placeholder={`1. Explain DBMS\n2. What is normalization?\n3. Explain types of keys in DBMS`}
        className="w-full rounded-xl border px-4 py-3 text-sm resize-y
          focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent
          disabled:opacity-50 placeholder:text-[var(--muted)]"
        style={{
          background: "var(--card)",
          borderColor: "var(--card-border)",
          color: "var(--foreground)",
        }}
      />
    </div>
  );
}
