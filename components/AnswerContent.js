"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MermaidBlock from "./MermaidBlock";

const components = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    const code = String(children).replace(/\n$/, "");
    if (!inline && match && match[1] === "mermaid") {
      return <MermaidBlock code={code} />;
    }
    return (
      <code
        className={inline ? "px-1.5 py-0.5 rounded text-sm" : "block p-3 rounded-lg my-2 overflow-x-auto text-sm"}
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
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
