"use client";

import { useState } from "react";
import "katex/dist/katex.min.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import MermaidBlock from "./MermaidBlock";

function CodeBlockWithCopy({ code, lang, children }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };
  return (
    <div className="relative group my-2 rounded-lg overflow-hidden" style={{ background: "var(--card-border)" }}>
      <div className="flex items-center justify-between px-3 py-1.5 border-b text-xs" style={{ borderColor: "var(--card-border)", background: "var(--card-bg)", color: "var(--muted)" }}>
        {lang && <span>{lang}</span>}
        <button
          type="button"
          onClick={handleCopy}
          className="ml-auto px-2 py-1 rounded hover:opacity-90 transition-opacity"
          style={{ background: "var(--primary)", color: "var(--primary-inverse)" }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-sm m-0">
        <code style={{ color: "var(--foreground)" }}>{children}</code>
      </pre>
    </div>
  );
}

const components = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    const code = String(children).replace(/\n$/, "");
    if (!inline && match && match[1] === "mermaid") {
      return <MermaidBlock code={code} />;
    }
    if (!inline) {
      return (
        <CodeBlockWithCopy code={code} lang={match ? match[1] : null}>
          {children}
        </CodeBlockWithCopy>
      );
    }
    return (
      <code
        className="px-1.5 py-0.5 rounded text-sm"
        style={{
          background: "var(--card-border)",
          color: "var(--foreground)",
        }}
        {...props}
      >
        {children}
      </code>
    );
  },
  table({ children }) {
    return (
      <div className="my-3 overflow-x-auto rounded-lg border" style={{ borderColor: "var(--card-border)" }}>
        <table className="w-full text-sm border-collapse">{children}</table>
      </div>
    );
  },
  thead({ children }) {
    return (
      <thead style={{ background: "var(--primary-light)" }}>
        {children}
      </thead>
    );
  },
  th({ children }) {
    return (
      <th
        className="text-left px-3 py-2 font-semibold border-b"
        style={{ borderColor: "var(--card-border)", color: "var(--primary)" }}
      >
        {children}
      </th>
    );
  },
  td({ children }) {
    return (
      <td
        className="px-3 py-2 border-b"
        style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
      >
        {children}
      </td>
    );
  },
  tr({ children }) {
    return <tr>{children}</tr>;
  },
  tbody({ children }) {
    return <tbody>{children}</tbody>;
  },
  p({ children }) {
    return (
      <p className="my-2 leading-relaxed" style={{ color: "var(--foreground)" }}>
        {children}
      </p>
    );
  },
  strong({ children }) {
    return (
      <strong className="font-semibold" style={{ color: "var(--foreground)" }}>
        {children}
      </strong>
    );
  },
  ul({ children }) {
    return (
      <ul className="my-2 pl-5 list-disc space-y-1" style={{ color: "var(--foreground)" }}>
        {children}
      </ul>
    );
  },
  ol({ children }) {
    return (
      <ol className="my-2 pl-5 list-decimal space-y-1" style={{ color: "var(--foreground)" }}>
        {children}
      </ol>
    );
  },
};

export default function AnswerContent({ content }) {
  return (
    <div className="prose prose-sm max-w-none" style={{ color: "var(--foreground)" }}>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
