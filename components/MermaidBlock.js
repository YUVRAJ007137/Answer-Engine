"use client";

import { useLayoutEffect, useState, useId } from "react";

const MERMAID_ERROR_INDICATORS = [
  "Syntax error in text",
  "Diagram error",
  "error in text",
  "mermaid version",
];

function isMermaidErrorSvg(svgString) {
  if (!svgString || typeof svgString !== "string") return true;
  const lower = svgString.toLowerCase();
  return MERMAID_ERROR_INDICATORS.some((msg) => lower.includes(msg.toLowerCase()));
}

export default function MermaidBlock({ code }) {
  const id = useId().replace(/:/g, "");
  const [svg, setSvg] = useState("");
  const [err, setErr] = useState(null);

  useLayoutEffect(() => {
    let cancelled = false;
    setErr(null);
    setSvg("");

    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "neutral",
          securityLevel: "loose",
        });
        const uid = `mermaid-${id}-${Date.now()}`;
        const { svg: out } = await mermaid.render(uid, code.trim());
        if (cancelled) return;
        if (isMermaidErrorSvg(out)) {
          setErr("Diagram syntax error");
          return;
        }
        setSvg(out);
      } catch (e) {
        if (!cancelled) setErr(e.message || "Diagram failed to render");
      }
    }
    render();
    return () => { cancelled = true; };
  }, [code, id]);

  if (err) {
    return (
      <div className="my-3 p-3 rounded-lg text-sm overflow-x-auto" style={{ background: "var(--card-border)", color: "var(--muted)" }}>
        <pre className="m-0 whitespace-pre-wrap">{code}</pre>
        <p className="mt-2 text-xs">Mermaid error: {err}</p>
      </div>
    );
  }
  if (!svg) {
    return (
      <div className="my-3 flex items-center justify-center py-8 rounded-lg" style={{ background: "var(--card-border)" }}>
        <span className="text-sm" style={{ color: "var(--muted)" }}>Rendering diagram…</span>
      </div>
    );
  }
  return (
    <div
      className="my-3 flex justify-center overflow-x-auto rounded-lg p-3"
      style={{ background: "var(--card)" }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
