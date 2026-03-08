"use client";

import { useState } from "react";
import AnswerContent from "./AnswerContent";

export default function AnswerCard({ index, question, answer, error, isPending, onRegenerate, onRetry, isRegenerating }) {
  const [copied, setCopied] = useState(false);
  const canRegenerate = (answer || error) && !isPending && !isRegenerating;
  const hasQuestionNoAnswer = question && !answer && !error && !isPending && !isRegenerating;

  const handleCopy = async () => {
    if (!answer) return;
    try {
      await navigator.clipboard.writeText(answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  };

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
    >
      {/* Question header */}
      <div
        className="px-4 sm:px-5 py-3 flex items-center justify-between flex-wrap gap-2 border-b"
        style={{
          background: "var(--primary-light)",
          borderColor: "var(--card-border)",
        }}
      >
        <h3 className="font-semibold text-sm" style={{ color: "var(--primary)" }}>
          Question {index + 1}
        </h3>
        <div className="flex items-center gap-2">
          {isPending && (
            <span className="text-xs font-medium flex items-center gap-1.5" style={{ color: "var(--primary)" }}>
              <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Generating…
            </span>
          )}
          {isRegenerating && (
            <span className="text-xs font-medium flex items-center gap-1.5" style={{ color: "var(--primary)" }}>
              <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Regenerating…
            </span>
          )}
          {canRegenerate && onRegenerate && (
            <button
              onClick={() => onRegenerate(index)}
              className="text-xs px-2.5 py-1 rounded-md font-medium border transition-colors"
              style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
            >
              Regenerate
            </button>
          )}
          {hasQuestionNoAnswer && onRegenerate && (
            <button
              onClick={() => onRegenerate(index)}
              className="text-xs px-2.5 py-1 rounded-md font-medium transition-colors"
              style={{ background: "var(--primary)", color: "#fff" }}
            >
              Generate answer
            </button>
          )}
          {error && onRetry && (
            <button
              onClick={() => onRetry(index)}
              disabled={isRegenerating}
              className="text-xs px-2.5 py-1 rounded-md font-medium text-white transition-colors disabled:opacity-50"
              style={{ background: "var(--error)" }}
            >
              Retry
            </button>
          )}
          {answer && !isPending && !isRegenerating && (
            <button
              onClick={handleCopy}
              className="text-xs px-3 py-1 rounded-md font-medium transition-colors"
              style={{
                background: copied ? "var(--success)" : "var(--primary)",
                color: "#fff",
              }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          )}
        </div>
      </div>

      <div className="px-4 sm:px-5 py-4 space-y-3">
        <p
          className="text-sm font-medium leading-relaxed"
          style={{ color: "var(--foreground)" }}
        >
          {question || "…"}
        </p>

        {error ? (
          <div
            className="text-sm rounded-lg px-4 py-3"
            style={{ background: "var(--error)", color: "#fff" }}
          >
            {error}
          </div>
        ) : answer ? (
          <div
            className="text-sm leading-relaxed rounded-lg px-4 py-3"
            style={{ background: "var(--background)", color: "var(--foreground)" }}
          >
            <AnswerContent content={answer} />
          </div>
        ) : isPending ? (
          <div
            className="text-sm rounded-lg px-4 py-6 flex items-center justify-center gap-2"
            style={{ background: "var(--background)", color: "var(--muted)" }}
          >
            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Writing answer…</span>
          </div>
        ) : hasQuestionNoAnswer ? (
          <div
            className="text-sm rounded-lg px-4 py-4 flex items-center justify-center"
            style={{ background: "var(--background)", color: "var(--muted)" }}
          >
            <span>No answer yet. Use &quot;Generate answer&quot; above to get an answer.</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
