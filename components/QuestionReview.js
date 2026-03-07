"use client";

import { useState } from "react";

const LENGTH_OPTIONS = [
  { value: "short", label: "Short (~150 words)" },
  { value: "standard", label: "Standard (250–300 words)" },
  { value: "detailed", label: "Detailed (400–500 words)" },
];
const STYLE_OPTIONS = [
  { value: "simple", label: "Simpler language" },
  { value: "technical", label: "More technical" },
];

export default function QuestionReview({ questions: initialQuestions, onGenerate, onBack, loading }) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [length, setLength] = useState("standard");
  const [style, setStyle] = useState("simple");

  const updateQuestion = (index, value) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const removeQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, ""]);
  };

  const handleGenerate = () => {
    const trimmed = questions.map((q) => q.trim()).filter(Boolean);
    if (trimmed.length === 0) return;
    onGenerate(trimmed, { length, style });
  };

  const validCount = questions.filter((q) => q.trim().length > 0).length;

  return (
    <section
      className="rounded-2xl border p-6 space-y-5"
      style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
          Review questions
        </h2>
        <span className="text-sm" style={{ color: "var(--muted)" }}>
          {validCount} question{validCount !== 1 ? "s" : ""}
        </span>
      </div>

      <p className="text-sm" style={{ color: "var(--muted)" }}>
        Edit, add, or remove questions below. Empty rows are ignored.
      </p>

      <div className="flex flex-wrap gap-4 p-3 rounded-xl" style={{ background: "var(--background)" }}>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Answer length</label>
          <select
            value={length}
            onChange={(e) => setLength(e.target.value)}
            disabled={loading}
            className="text-sm rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:opacity-50"
            style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
          >
            {LENGTH_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Language style</label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            disabled={loading}
            className="text-sm rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:opacity-50"
            style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
          >
            {STYLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3 max-h-[50vh] overflow-y-auto scrollbar-thin">
        {questions.map((q, i) => (
          <div key={i} className="flex gap-2 items-start">
            <span
              className="text-sm font-medium shrink-0 pt-2.5 w-6"
              style={{ color: "var(--muted)" }}
            >
              {i + 1}.
            </span>
            <textarea
              value={q}
              onChange={(e) => updateQuestion(i, e.target.value)}
              disabled={loading}
              rows={2}
              className="flex-1 rounded-lg border px-3 py-2 text-sm resize-y
                focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent
                disabled:opacity-50"
              style={{
                background: "var(--background)",
                borderColor: "var(--card-border)",
                color: "var(--foreground)",
              }}
              placeholder="Question text…"
            />
            <button
              type="button"
              onClick={() => removeQuestion(i)}
              disabled={loading || questions.length <= 1}
              className="shrink-0 p-2 rounded-lg text-sm font-medium opacity-70 hover:opacity-100 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ color: "var(--error)" }}
              title="Remove question"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={addQuestion}
          disabled={loading}
          className="text-sm font-medium px-4 py-2 rounded-lg border transition-colors disabled:opacity-50"
          style={{
            borderColor: "var(--card-border)",
            color: "var(--primary)",
          }}
        >
          + Add question
        </button>
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="text-sm font-medium px-4 py-2 rounded-lg border transition-colors disabled:opacity-50"
          style={{
            borderColor: "var(--card-border)",
            color: "var(--foreground)",
          }}
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || validCount === 0}
          className="text-sm font-semibold px-5 py-2 rounded-lg text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: validCount > 0 && !loading ? "var(--primary)" : "var(--muted)",
          }}
        >
          {loading ? "Generating…" : "Generate answers"}
        </button>
      </div>
    </section>
  );
}
